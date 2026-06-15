/**
 * rbac.ts — re-exporta o módulo principal.
 * ✅ FIX: aponta explicitamente para rbac.tsx, evitando importação circular
 */
export { useRBAC, rbac, RequiresPermission } from "./rbac.tsx";
export type { UserRole } from "./rbac.tsx";
