import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase"; // ajuste o caminho se necessário
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  roles: any[];
  displayName: string | null;
  isLoading: boolean;
  isStaff: boolean;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Busca os roles do usuário na sua tabela customizada
  const fetchRoles = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles") // ajuste para o nome da sua tabela de roles
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      setRoles(data ?? []);
    } catch (err) {
      console.error("Erro ao buscar roles:", err);
      setRoles([]);
    }
  }, []);

  // Busca o perfil/nome do usuário
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles") // ajuste para o nome da sua tabela de perfis
        .select("display_name, nome") // ajuste os campos conforme sua tabela
        .eq("id", userId)
        .single();

      if (error) throw error;
      setDisplayName(data?.display_name ?? data?.nome ?? null);
    } catch (err) {
      console.error("Erro ao buscar perfil:", err);
      setDisplayName(null);
    }
  }, []);

  const refreshRoles = useCallback(async () => {
    if (user) await fetchRoles(user.id);
  }, [user, fetchRoles]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRoles([]);
    setDisplayName(null);
  }, []);

  useEffect(() => {
    // Carrega sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        Promise.all([
          fetchRoles(session.user.id),
          fetchProfile(session.user.id),
        ]).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // Escuta mudanças de auth (login, logout, refresh de token)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        Promise.all([
          fetchRoles(session.user.id),
          fetchProfile(session.user.id),
        ]);
      } else {
        setRoles([]);
        setDisplayName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchRoles, fetchProfile]);

  const isStaff = roles.some((r) => r.role === "staff" || r.role === "admin"); // ajuste conforme seus valores de role

  const value: AuthContextValue = {
    session,
    user,
    roles,
    displayName,
    isLoading,
    isStaff,
    signOut,
    refreshRoles,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
