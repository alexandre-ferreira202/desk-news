import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const noopChannel: any = {
  on: () => noopChannel,
  subscribe: () => noopChannel,
  send: () => Promise.resolve(),
  unsubscribe: () => noopChannel,
};

function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
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
      channel: (_name: string) => noopChannel,
      removeChannel: () => {},
    } as any;
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    realtime: { params: { eventsPerSecond: 10 } },
  });
}

export const supabase = createSupabaseClient();