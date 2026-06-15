import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Stub seguro para SSR — retorna as estruturas exatas que o Supabase Auth espera,
    // evitando crashes ao desestruturar `.data.session` e `.data.subscription`.
    return {
      auth: {
        getSession: () =>
          Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: (_event: any, _callback: any) => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: (_table: string) => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
            then: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      }),
    } as any;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createSupabaseClient();
