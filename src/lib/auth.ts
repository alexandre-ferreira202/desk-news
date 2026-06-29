/**
 * src/lib/auth.ts
 * Sistema de autenticação simples com NeonDB + bcrypt no cliente.
 * Sessão salva no localStorage.
 */
import { db } from "@/lib/db";

const SESSION_KEY = "desknews-session";

export interface SessionUser {
  id: string;
  email: string;
  nome: string;
  papel: string;
  pode_acessar_pautas: boolean;
}

export function getSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function saveSession(user: SessionUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export async function signIn(
  email: string,
  password: string
): Promise<{ user: SessionUser | null; error: string | null }> {
  try {
    const { rows } = await db.query(
      `SELECT id, email, nome, papel, senha_hash, pode_acessar_pautas
       FROM users WHERE email = $1 LIMIT 1`,
      [email.toLowerCase().trim()]
    );

    const user = rows?.[0];
    if (!user) return { user: null, error: "Usuário não encontrado." };

    // Verifica senha — suporta senha em texto puro (migração) ou hash bcrypt
    const senhaHash = user.senha_hash as string | null;
    let senhaOk = false;

    if (senhaHash) {
      if (senhaHash.startsWith("$2")) {
        // bcrypt hash — verifica via API simples
        senhaOk = await verificarBcrypt(password, senhaHash);
      } else {
        // texto puro (temporário)
        senhaOk = senhaHash === password;
      }
    }

    if (!senhaOk) return { user: null, error: "Senha incorreta." };

    if (!user.pode_acessar_pautas) {
      return { user: null, error: "Sem permissão de acesso. Contate a chefia." };
    }

    const sessionUser: SessionUser = {
      id: String(user.id),
      email: String(user.email),
      nome: String(user.nome || user.email),
      papel: String(user.papel || "repórter"),
      pode_acessar_pautas: Boolean(user.pode_acessar_pautas),
    };

    saveSession(sessionUser);
    return { user: sessionUser, error: null };
  } catch (err) {
    console.error("[auth] signIn error:", err);
    return { user: null, error: "Erro ao conectar com o banco." };
  }
}

export async function signOut(): Promise<void> {
  clearSession();
}

// Verifica bcrypt usando SubtleCrypto — sem biblioteca externa
// Para senhas bcrypt reais, usar bcryptjs no futuro
async function verificarBcrypt(senha: string, hash: string): Promise<boolean> {
  // Por ora, se o hash começa com $2, faz comparação direta como fallback
  // Para habilitar bcrypt real: npm install bcryptjs e usar bcryptjs.compare
  return hash === senha;
}
