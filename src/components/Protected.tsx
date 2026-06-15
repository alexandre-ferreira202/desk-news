import { Navigate } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { useRBAC } from "@/lib/rbac";
import { AppShell } from "./AppShell";

export function Protected({ children }: { children: ReactNode }) {
  const { role, loading } = useRBAC();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        <div className="flex flex-col items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Autenticando acesso...</span>
        </div>
      </div>
    );
  }

  if (!role) {
    return <Navigate to="/login" />;
  }

  return <AppShell>{children}</AppShell>;
}
