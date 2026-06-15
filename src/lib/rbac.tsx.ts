/**
 * RBAC Module - Role-Based Access Control
 * Gerencia permissões e controla acesso baseado em funções
 */

import { supabase } from "./supabase";

export type UserRole = "reporter" | "editor" | "chefe_redacao" | "admin";

interface Permission {
  action: string;
  resource: string;
  description: string;
}

interface RoleDefinition {
  name: UserRole;
  permissions: Permission[];
  description: string;
}

// Definir permissões por role
const ROLE_PERMISSIONS: Record<UserRole, RoleDefinition> = {
  reporter: {
    name: "reporter",
    description: "Repórter de redação",
    permissions: [
      { action: "create", resource: "pauta", description: "Criar pautas" },
      { action: "read", resource: "pauta", description: "Ler pautas" },
      { action: "update", resource: "pauta", description: "Editar suas próprias pautas" },
      { action: "read", resource: "redacao", description: "Acessar redação" },
      { action: "create", resource: "redacao", description: "Escrever matérias" },
      { action: "read", resource: "metrics", description: "Ver métricas públicas" },
    ],
  },
  editor: {
    name: "editor",
    description: "Editor de conteúdo",
    permissions: [
      { action: "create", resource: "pauta", description: "Criar pautas" },
      { action: "read", resource: "pauta", description: "Ler todas as pautas" },
      { action: "update", resource: "pauta", description: "Editar todas as pautas" },
      { action: "delete", resource: "pauta", description: "Deletar pautas" },
      { action: "read", resource: "redacao", description: "Acessar redação" },
      { action: "update", resource: "redacao", description: "Editar matérias" },
      { action: "publish", resource: "redacao", description: "Publicar matérias" },
      { action: "read", resource: "espelho", description: "Acessar espelho" },
      { action: "update", resource: "espelho", description: "Editar espelho" },
      { action: "read", resource: "metrics", description: "Ver todas as métricas" },
    ],
  },
  chefe_redacao: {
    name: "chefe_redacao",
    description: "Editor-chefe/Chefe de Redação",
    permissions: [
      { action: "create", resource: "pauta", description: "Criar pautas" },
      { action: "read", resource: "pauta", description: "Ler todas as pautas" },
      { action: "update", resource: "pauta", description: "Editar todas as pautas" },
      { action: "delete", resource: "pauta", description: "Deletar pautas" },
      { action: "read", resource: "redacao", description: "Acessar redação" },
      { action: "update", resource: "redacao", description: "Editar matérias" },
      { action: "delete", resource: "redacao", description: "Deletar matérias" },
      { action: "publish", resource: "redacao", description: "Publicar matérias" },
      { action: "read", resource: "espelho", description: "Acessar espelho" },
      { action: "update", resource: "espelho", description: "Editar espelho" },
      { action: "delete", resource: "espelho", description: "Deletar espelho" },
      { action: "read", resource: "metrics", description: "Ver todas as métricas" },
      { action: "read", resource: "reports", description: "Ver relatórios" },
      { action: "manage", resource: "users", description: "Gerenciar usuários" },
    ],
  },
  admin: {
    name: "admin",
    description: "Administrador do sistema",
    permissions: [
      { action: "*", resource: "*", description: "Acesso total ao sistema" },
    ],
  },
};

class RBACManager {
  private userRole: UserRole | null = null;

  async initUser(): Promise<UserRole | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      this.userRole = (user.user_metadata?.role as UserRole) || "reporter";
      return this.userRole;
    } catch (error) {
      console.error("Erro ao inicializar usuário RBAC:", error);
      return null;
    }
  }

  getCurrentRole(): UserRole | null {
    return this.userRole;
  }

  canAccess(action: string, resource: string): boolean {
    if (!this.userRole) return false;

    const roleDef = ROLE_PERMISSIONS[this.userRole];
    if (!roleDef) return false;

    return roleDef.permissions.some(
      (perm) =>
        (perm.action === "*" || perm.action === action) &&
        (perm.resource === "*" || perm.resource === resource)
    );
  }

  canEdit(resource: string, ownerId?: string): boolean {
    if (!this.userRole) return false;

    // Se tem ID de proprietário, verificar se é o dono ou tem role elevada
    if (ownerId) {
      const { data: { user } } = supabase.auth.getUser();
      const isOwner = user?.id === ownerId;
      
      if (isOwner && this.canAccess("update", resource)) {
        return true;
      }
    }

    return this.canAccess("update", resource);
  }

  canDelete(resource: string, ownerId?: string): boolean {
    if (!this.userRole) return false;

    // Apenas editors e chefes podem deletar
    if (!["editor", "chefe_redacao", "admin"].includes(this.userRole)) {
      return false;
    }

    // Se tem ID de proprietário, verificar role
    if (ownerId && this.userRole === "editor") {
      return false; // Editors não podem deletar de outros
    }

    return this.canAccess("delete", resource);
  }

  getPermissions(): Permission[] {
    if (!this.userRole) return [];
    return ROLE_PERMISSIONS[this.userRole]?.permissions || [];
  }

  getRoleDescription(): string {
    if (!this.userRole) return "";
    return ROLE_PERMISSIONS[this.userRole]?.description || "";
  }

  // Validar no servidor antes de operações críticas
  async validateServerAccess(action: string, resource: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc("check_user_permission", {
        p_action: action,
        p_resource: resource,
      });

      if (error) {
        console.error("Erro ao validar acesso no servidor:", error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error("Erro ao chamar RPC de validação:", error);
      return false;
    }
  }
}

// Singleton
export const rbac = new RBACManager();

// Hook para React
export function useRBAC() {
  const [role, setRole] = React.useState<UserRole | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      const userRole = await rbac.initUser();
      setRole(userRole);
      setLoading(false);
    })();
  }, []);

  return {
    role,
    loading,
    can: (action: string, resource: string) => rbac.canAccess(action, resource),
    canEdit: (resource: string, ownerId?: string) => rbac.canEdit(resource, ownerId),
    canDelete: (resource: string, ownerId?: string) => rbac.canDelete(resource, ownerId),
    permissions: rbac.getPermissions(),
  };
}

// Componente para proteger elementos por permissão
export function RequiresPermission({
  action,
  resource,
  fallback = null,
  children,
}: {
  action: string;
  resource: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { can } = useRBAC();

  if (!can(action, resource)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

import React from "react";
