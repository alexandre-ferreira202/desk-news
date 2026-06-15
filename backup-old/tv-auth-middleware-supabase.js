// ============================================================================
// MIDDLEWARE DE AUTENTICAÇÃO - ADAPTADO PARA SUPABASE (PostgreSQL)
// ============================================================================
// Substitui mysql2 pelo @supabase/supabase-js
// ============================================================================

const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Inicializa o client Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY  // chave SERVICE (não anon!) para bypass de RLS
);

// ============================================================================
// MIDDLEWARE 1: VERIFICAR TOKEN JWT
// ============================================================================
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token não fornecido', code: 'NO_TOKEN' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_secret_aqui');

    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, login, role_id, roles(slug)')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .limit(1);

    if (error || !users || users.length === 0) {
      return res.status(401).json({ success: false, message: 'Usuário não encontrado ou inativo', code: 'INVALID_USER' });
    }

    const user = users[0];
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      login: user.login,
      roleId: user.role_id,
      role: user.roles?.slug
    };
    req.clientIp = req.ip || req.connection.remoteAddress;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expirado', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Token inválido', code: 'INVALID_TOKEN' });
  }
};

// ============================================================================
// MIDDLEWARE 2: VERIFICAR ROLE
// ============================================================================
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Não autenticado', code: 'NOT_AUTHENTICATED' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      logAction(req.user.id, `Acesso negado: ${req.method} ${req.path}`, 'system', null, { denied_roles: allowedRoles }, req.clientIp, 'denied');
      return res.status(403).json({
        success: false,
        message: `Acesso negado. Roles permitidas: ${allowedRoles.join(', ')}`,
        code: 'ACCESS_DENIED',
        required_roles: allowedRoles,
        user_role: req.user.role
      });
    }
    next();
  };
};

// ============================================================================
// MIDDLEWARE 3: VERIFICAR PERMISSÃO ESPECÍFICA
// ============================================================================
const checkPermission = (permissionSlug) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Não autenticado', code: 'NOT_AUTHENTICATED' });
      }

      const { data, error } = await supabase.rpc('check_permission', {
        p_user_id: req.user.id,
        p_permission_slug: permissionSlug
      });

      if (error || !data) {
        logAction(req.user.id, `Acesso negado: ${permissionSlug}`, 'permission', null, { permission: permissionSlug }, req.clientIp, 'denied');
        return res.status(403).json({
          success: false,
          message: `Permissão negada: ${permissionSlug}`,
          code: 'PERMISSION_DENIED'
        });
      }

      next();
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      res.status(500).json({ success: false, message: 'Erro ao verificar permissão' });
    }
  };
};

// ============================================================================
// FUNÇÃO: LOG DE AUDITORIA
// ============================================================================
const logAction = async (userId, action, entityType, entityId, details, ipAddress, status = 'success') => {
  try {
    await supabase.rpc('log_action', {
      p_user_id: userId,
      p_action: action,
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_details: details || {},
      p_ip_address: ipAddress,
      p_status: status
    });
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
};

// ============================================================================
// FUNÇÃO: GERAR TOKEN JWT
// ============================================================================
const generateToken = (userId, userRole, expiresIn = '24h') => {
  return jwt.sign(
    { userId, role: userRole, timestamp: Date.now() },
    process.env.JWT_SECRET || 'seu_secret_aqui',
    { expiresIn }
  );
};

// ============================================================================
// FUNÇÃO: ATUALIZAR ÚLTIMO LOGIN
// ============================================================================
const updateLastLogin = async (userId, ipAddress) => {
  await supabase
    .from('users')
    .update({ last_login: new Date().toISOString(), ip_address: ipAddress })
    .eq('id', userId);
};

// ============================================================================
// MIDDLEWARE 4: RATE LIMITING (em memória)
// ============================================================================
const rateLimitMiddleware = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    if (!attempts.has(ip)) attempts.set(ip, []);
    const recent = attempts.get(ip).filter(t => now - t < windowMs);
    if (recent.length >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Muitas tentativas. Tente novamente em alguns minutos.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((recent[0] + windowMs - now) / 1000)
      });
    }
    recent.push(now);
    attempts.set(ip, recent);
    next();
  };
};

// ============================================================================
// FUNÇÃO: OBTER PERMISSÕES DO USUÁRIO
// ============================================================================
const getUserPermissions = async (userId) => {
  const { data, error } = await supabase
    .from('role_permissions')
    .select('permissions(slug, name, category)')
    .eq('role_id', supabase.from('users').select('role_id').eq('id', userId).single());

  // Query simplificada via join
  const { data: perms } = await supabase
    .from('users')
    .select('roles(role_permissions(permissions(slug, name, category)))')
    .eq('id', userId)
    .single();

  try {
    return perms?.roles?.role_permissions?.map(rp => rp.permissions) || [];
  } catch {
    return [];
  }
};

// Versão alternativa mais robusta com SQL direto
const getUserPermissionsSQL = async (userId) => {
  const { data, error } = await supabase.rpc('get_user_permissions', { p_user_id: userId });
  return data || [];
};

// ============================================================================
// FUNÇÃO: OBTER PERMISSÕES POR ROLE
// ============================================================================
const getRolePermissions = async (roleSlug) => {
  const { data, error } = await supabase
    .from('roles')
    .select('role_permissions(permissions(id, name, slug, category))')
    .eq('slug', roleSlug)
    .single();

  if (error || !data) return [];
  return data.role_permissions?.map(rp => rp.permissions) || [];
};

// ============================================================================
// FUNÇÃO: OBTER LOGS DE AUDITORIA
// ============================================================================
const getAuditLog = async (filters = {}) => {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (filters.userId)    query = query.eq('user_id', filters.userId);
  if (filters.action)    query = query.ilike('action', `%${filters.action}%`);
  if (filters.status)    query = query.eq('status', filters.status);
  if (filters.startDate) query = query.gte('created_at', filters.startDate);
  if (filters.endDate)   query = query.lte('created_at', filters.endDate);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

// ============================================================================
// EXPORTS
// ============================================================================
module.exports = {
  authMiddleware,
  checkRole,
  checkPermission,
  rateLimitMiddleware,
  generateToken,
  updateLastLogin,
  logAction,
  getAuditLog,
  getUserPermissions: getUserPermissionsSQL,
  getRolePermissions,
  supabase
};