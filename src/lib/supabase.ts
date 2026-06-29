/**
 * src/lib/supabase.ts
 * Re-exporta o db do Neon como `supabase` para compatibilidade com
 * todos os arquivos que fazem: import { supabase } from "@/lib/supabase"
 */
export { db as supabase } from "@/lib/db";
