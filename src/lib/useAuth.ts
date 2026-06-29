/**
 * src/lib/useAuth.ts
 * Hook para acessar sessão atual em qualquer componente.
 */
import { useState, useEffect } from "react";
import { getSession, type SessionUser } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    setUser(session);
    setLoading(false);

    // Sincroniza entre abas
    const onStorage = (e: StorageEvent) => {
      if (e.key === "desknews-session") {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { user, loading };
}
