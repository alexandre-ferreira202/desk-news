import { jsx, jsxs } from "react/jsx-runtime";
import { Navigate } from "@tanstack/react-router";
import React__default from "react";
import { d as db, A as AppShell } from "./router-NcdNWgek.js";
const ROLE_PERMISSIONS = {
  reporter: {
    name: "reporter",
    description: "Repórter de redação",
    permissions: [
      { action: "create", resource: "pauta", description: "Criar pautas" },
      { action: "read", resource: "pauta", description: "Ler pautas" },
      { action: "update", resource: "pauta", description: "Editar suas próprias pautas" },
      { action: "read", resource: "redacao", description: "Acessar redação" },
      { action: "create", resource: "redacao", description: "Escrever matérias" },
      { action: "read", resource: "metrics", description: "Ver métricas públicas" }
    ]
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
      { action: "read", resource: "metrics", description: "Ver todas as métricas" }
    ]
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
      { action: "manage", resource: "users", description: "Gerenciar usuários" }
    ]
  },
  admin: {
    name: "admin",
    description: "Administrador do sistema",
    permissions: [
      { action: "*", resource: "*", description: "Acesso total ao sistema" }
    ]
  }
};
class RBACManager {
  userRole = null;
  // ✅ FIX: cache do userId para uso síncrono em canEdit()
  userId = null;
  async initUser() {
    if (typeof window === "undefined") return null;
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.id) {
          this.userId = user.id;
          this.userRole = user.role || "reporter";
          return this.userRole;
        }
      } catch (e) {
        console.error("Erro ao processar usuário do localStorage", e);
      }
    }
    try {
      const { data, error } = await db.auth.getUser();
      if (data?.user) {
        this.userId = data.user.id;
        this.userRole = data.user.user_metadata?.role || "reporter";
        return this.userRole;
      }
      return null;
    } catch (error) {
      console.error("Erro ao inicializar usuário RBAC:", error);
      return null;
    }
  }
  getCurrentRole() {
    return this.userRole;
  }
  canAccess(action, resource) {
    if (!this.userRole) return false;
    const roleDef = ROLE_PERMISSIONS[this.userRole];
    if (!roleDef) return false;
    return roleDef.permissions.some(
      (perm) => (perm.action === "*" || perm.action === action) && (perm.resource === "*" || perm.resource === resource)
    );
  }
  canEdit(resource, ownerId) {
    if (!this.userRole) return false;
    if (ownerId) {
      const isOwner = this.userId === ownerId;
      if (isOwner && this.canAccess("update", resource)) {
        return true;
      }
    }
    return this.canAccess("update", resource);
  }
  canDelete(resource, ownerId) {
    if (!this.userRole) return false;
    if (!["editor", "chefe_redacao", "admin"].includes(this.userRole)) {
      return false;
    }
    if (ownerId && this.userRole === "editor") {
      return false;
    }
    return this.canAccess("delete", resource);
  }
  getPermissions() {
    if (!this.userRole) return [];
    return ROLE_PERMISSIONS[this.userRole]?.permissions || [];
  }
  getRoleDescription() {
    if (!this.userRole) return "";
    return ROLE_PERMISSIONS[this.userRole]?.description || "";
  }
  // Validar no servidor antes de operações críticas
  async validateServerAccess(action, resource) {
    try {
      const { data, error } = await db.rpc("check_user_permission", {
        p_action: action,
        p_resource: resource
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
const rbac = new RBACManager();
function useRBAC() {
  const [role, setRole] = React__default.useState(null);
  const [loading, setLoading] = React__default.useState(true);
  React__default.useEffect(() => {
    (async () => {
      const userRole = await rbac.initUser();
      setRole(userRole);
      setLoading(false);
    })();
  }, []);
  return {
    role,
    loading,
    can: (action, resource) => rbac.canAccess(action, resource),
    canEdit: (resource, ownerId) => rbac.canEdit(resource, ownerId),
    canDelete: (resource, ownerId) => rbac.canDelete(resource, ownerId),
    permissions: rbac.getPermissions()
  };
}
function Protected({ children }) {
  const { role, loading } = useRBAC();
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center text-muted-foreground text-sm", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" }),
      /* @__PURE__ */ jsx("span", { children: "Autenticando acesso..." })
    ] }) });
  }
  if (!role) {
    return /* @__PURE__ */ jsx(Navigate, { to: "/login" });
  }
  return /* @__PURE__ */ jsx(AppShell, { children });
}
export {
  Protected as P,
  useRBAC as u
};
