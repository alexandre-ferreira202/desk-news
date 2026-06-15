// ============================================================================
// SERVIDOR EXPRESS - SISTEMA 7 ROLES - ADAPTADO PARA SUPABASE
// ============================================================================
// npm install express @supabase/supabase-js bcrypt jsonwebtoken cors dotenv joi
// node tv-server-supabase.js
// ============================================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const {
  authMiddleware,
  checkRole,
  checkPermission,
  rateLimitMiddleware,
  generateToken,
  updateLastLogin,
  getAuditLog,
  getUserPermissions,
  getRolePermissions,
  logAction,
  supabase
} = require('./tv-auth-middleware-supabase');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// ============================================================================
// SCHEMAS DE VALIDAÇÃO
// ============================================================================
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const userCreateSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  login: Joi.string().alphanum().min(3).required(),
  password: Joi.string().min(8).required(),
  role_id: Joi.number().integer().min(1).required()
});

const contentCreateSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(''),
  category: Joi.string().allow(''),
  duration: Joi.number(),
  status: Joi.string().valid('draft', 'pending', 'approved', 'published').default('draft')
});

// ============================================================================
// AUTENTICAÇÃO
// ============================================================================

// POST /api/auth/login
app.post('/api/auth/login', rateLimitMiddleware(5, 15 * 60 * 1000), async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: 'Validação falhou', errors: error.details });

    const { data: users, error: dbError } = await supabase
      .from('users')
      .select('*, roles(slug)')
      .eq('email', value.email)
      .eq('is_active', true)
      .limit(1);

    if (dbError || !users || users.length === 0) {
      return res.status(401).json({ success: false, message: 'Email ou senha incorretos', code: 'INVALID_CREDENTIALS' });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(value.password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Email ou senha incorretos', code: 'INVALID_CREDENTIALS' });
    }

    const token = generateToken(user.id, user.roles?.slug);
    await updateLastLogin(user.id, req.ip);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, login: user.login, role: user.roles?.slug, roleId: user.role_id },
        expiresIn: '24h'
      }
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Logout realizado com sucesso' });
});

// GET /api/auth/me
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const permissions = await getUserPermissions(req.user.id);
    res.json({ success: true, data: { user: req.user, permissions } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao obter dados do usuário' });
  }
});

// GET /api/auth/permissions
app.get('/api/auth/permissions', authMiddleware, async (req, res) => {
  try {
    const permissions = await getUserPermissions(req.user.id);
    const grouped = {};
    permissions.forEach(p => {
      if (!grouped[p.category]) grouped[p.category] = [];
      grouped[p.category].push(p);
    });
    res.json({ success: true, data: { total: permissions.length, permissions: grouped } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao obter permissões' });
  }
});

// ============================================================================
// USUÁRIOS (Admin)
// ============================================================================

// GET /api/users
app.get('/api/users', authMiddleware, checkRole('admin'), async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, login, is_active, last_login, created_at, roles(name, slug)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: { total: users.length, users } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao listar usuários' });
  }
});

// POST /api/users
app.post('/api/users', authMiddleware, checkRole('admin'), async (req, res) => {
  try {
    const { error: valError, value } = userCreateSchema.validate(req.body);
    if (valError) return res.status(400).json({ success: false, message: 'Validação falhou', errors: valError.details });

    // Verificar duplicata
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${value.email},login.eq.${value.login}`)
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email ou login já cadastrado', code: 'DUPLICATE_USER' });
    }

    const hashedPassword = await bcrypt.hash(value.password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert({ name: value.name, email: value.email, login: value.login, password: hashedPassword, role_id: value.role_id, is_active: true })
      .select('id')
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, message: 'Usuário criado com sucesso', data: { id: data.id, ...value, password: undefined } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erro ao criar usuário' });
  }
});

// PUT /api/users/:id
app.put('/api/users/:id', authMiddleware, checkRole('admin'), async (req, res) => {
  try {
    const { name, email, role_id, is_active } = req.body;
    const { error } = await supabase
      .from('users')
      .update({ name, email, role_id, is_active, updated_at: new Date().toISOString() })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Usuário atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar usuário' });
  }
});

// DELETE /api/users/:id
app.delete('/api/users/:id', authMiddleware, checkRole('admin'), async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Você não pode deletar sua própria conta' });
    }
    const { error, count } = await supabase.from('users').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Usuário deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao deletar usuário' });
  }
});

// ============================================================================
// CONTEÚDO
// ============================================================================

// GET /api/content
app.get('/api/content', authMiddleware, checkPermission('content.view'), async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase.from('content').select('*').order('created_at', { ascending: false }).limit(100);
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data: { total: data.length, content: data } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao listar conteúdo' });
  }
});

// POST /api/content
app.post('/api/content', authMiddleware, checkPermission('content.create'), async (req, res) => {
  try {
    const { error: valError, value } = contentCreateSchema.validate(req.body);
    if (valError) return res.status(400).json({ success: false, message: 'Validação falhou', errors: valError.details });

    const { data, error } = await supabase
      .from('content')
      .insert({ ...value, created_by: req.user.id })
      .select('id')
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Conteúdo criado com sucesso', data: { id: data.id, ...value } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao criar conteúdo' });
  }
});

// PUT /api/content/:id
app.put('/api/content/:id', authMiddleware, checkPermission('content.edit'), async (req, res) => {
  try {
    const { title, description, category, duration, status } = req.body;
    const { error } = await supabase
      .from('content')
      .update({ title, description, category, duration, status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Conteúdo atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar conteúdo' });
  }
});

// POST /api/content/:id/approve
app.post('/api/content/:id/approve', authMiddleware, checkRole('admin', 'editor-chefe'), checkPermission('content.approve'), async (req, res) => {
  try {
    const { error } = await supabase
      .from('content')
      .update({ status: 'approved', approved_by: req.user.id, approved_at: new Date().toISOString() })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Conteúdo aprovado com sucesso' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao aprovar conteúdo' });
  }
});

// POST /api/content/:id/publish
app.post('/api/content/:id/publish', authMiddleware, checkRole('admin', 'editor-chefe', 'produtor'), checkPermission('content.publish'), async (req, res) => {
  try {
    const { error } = await supabase
      .from('content')
      .update({ status: 'published', published_by: req.user.id, published_at: new Date().toISOString() })
      .eq('id', req.params.id);

    if (error) throw error;
    res.json({ success: true, message: 'Conteúdo publicado com sucesso' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao publicar conteúdo' });
  }
});

// ============================================================================
// AUDITORIA
// ============================================================================

// GET /api/audit/logs
app.get('/api/audit/logs', authMiddleware, checkRole('admin'), async (req, res) => {
  try {
    const { userId, action, status, startDate, endDate } = req.query;
    const filters = {};
    if (userId) filters.userId = userId;
    if (action) filters.action = action;
    if (status) filters.status = status;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const logs = await getAuditLog(filters);
    res.json({ success: true, data: { total: logs.length, logs } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao obter auditoria' });
  }
});

// GET /api/audit/user-activity/:userId
app.get('/api/audit/user-activity/:userId', authMiddleware, checkRole('admin'), async (req, res) => {
  try {
    const logs = await getAuditLog({ userId: req.params.userId });
    res.json({ success: true, data: { total: logs.length, logs } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao obter atividade' });
  }
});

// ============================================================================
// ROLES E PERMISSÕES
// ============================================================================

// GET /api/roles
app.get('/api/roles', authMiddleware, async (req, res) => {
  try {
    const { data: roles, error } = await supabase.from('roles').select('*').order('id');
    if (error) throw error;

    const rolesWithPerms = await Promise.all(
      roles.map(async (role) => {
        const permissions = await getRolePermissions(role.slug);
        return { ...role, permissions, permissionsCount: permissions.length };
      })
    );

    res.json({ success: true, data: { total: rolesWithPerms.length, roles: rolesWithPerms } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao listar roles' });
  }
});

// GET /api/roles/:roleSlug/permissions
app.get('/api/roles/:roleSlug/permissions', authMiddleware, async (req, res) => {
  try {
    const permissions = await getRolePermissions(req.params.roleSlug);
    const grouped = {};
    permissions.forEach(p => {
      if (!grouped[p.category]) grouped[p.category] = [];
      grouped[p.category].push(p);
    });
    res.json({ success: true, data: { role: req.params.roleSlug, total: permissions.length, permissions: grouped } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao obter permissões' });
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', async (req, res) => {
  try {
    const { error } = await supabase.from('roles').select('id').limit(1);
    if (error) throw error;
    res.json({ success: true, message: 'API está funcionando', status: 'healthy', database: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ success: false, message: 'API com problemas', status: 'unhealthy', database: 'disconnected' });
  }
});

app.get('/api/status', authMiddleware, (req, res) => {
  res.json({ success: true, data: { api: 'online', version: '1.0.0', environment: process.env.NODE_ENV || 'development', timestamp: new Date().toISOString() } });
});

// ============================================================================
// ROTA DE CRIAR ADMIN INICIAL (desative após o primeiro uso!)
// ============================================================================
app.post('/api/setup/admin', async (req, res) => {
  if (process.env.SETUP_ENABLED !== 'true') {
    return res.status(403).json({ success: false, message: 'Setup desativado. Defina SETUP_ENABLED=true no .env para ativar.' });
  }
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert({ name, email, login: email.split('@')[0], password: hashedPassword, role_id: 1, is_active: true })
      .select('id, name, email')
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, message: 'Admin criado! Desative SETUP_ENABLED no .env agora.', data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao criar admin: ' + err.message });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada', path: req.path });
});

// ============================================================================
// INICIAR
// ============================================================================
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║  🚀 SERVIDOR SUPABASE INICIADO              ║
╠══════════════════════════════════════════════╣
║  Porta:    ${PORT}                               ║
║  Banco:    Supabase (PostgreSQL)             ║
║  URL:      http://localhost:${PORT}              ║
╠══════════════════════════════════════════════╣
║  1º uso: POST /api/setup/admin              ║
║  (com SETUP_ENABLED=true no .env)           ║
╚══════════════════════════════════════════════╝
  `);
});

process.on('unhandledRejection', (reason) => console.error('Rejeitada:', reason));
process.on('uncaughtException', (err) => { console.error('Exceção:', err); process.exit(1); });

module.exports = app;



// ... Outras rotas e middlewares anteriores do seu servidor

// ============================================================================
// ROTA AMIGÁVEL NA RAIZ (Opcional, para evitar o erro ao abrir no navegador)
// ============================================================================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "DeskNews API Server está online!",
    version: "1.0.0"
  });
});

// ============================================================================
// MIDDLWARE DE 404 - CAPTURA ROTAS NÃO ENCONTRADAS (Coloque aqui)
// ============================================================================
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada', path: req.path });
});

// ============================================================================
// INICIAR O SERVIDOR (Sempre o último bloco do ficheiro)
// ============================================================================
app.listen(PORT, () => {
  console.log(`\n🚀 SERVIDOR SUPABASE INICIADO EM http://localhost:${PORT}\n`);
});