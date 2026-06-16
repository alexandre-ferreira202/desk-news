import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const noopChannel: any = {
  on: () => noopChannel,
  subscribe: () => noopChannel,
  send: () => Promise.resolve(),
  unsubscribe: () => noopChannel,
};

const noopQuery: any = new Proxy({}, {
  get: (_target, prop) => {
    if (prop === 'then') return undefined;
    if (prop === Symbol.iterator) return undefined;
    return (..._args: any[]) => noopQuery;
  }
});

const noopQueryWithPromise: any = new Proxy(
  Promise.resolve({ data: null, error: null }),
  {
    get: (target, prop) => {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        return target[prop as keyof typeof target].bind(target);
      }
      return (..._args: any[]) => noopQueryWithPromise;
    }
  }
);

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
      from: (_table: string) => noopQueryWithPromise,
      channel: (_name: string) => noopChannel,
      removeChannel: () => {},
    } as any;
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    realtime: { params: { eventsPerSecond: 10 } },
  });
}

export const supabase = createSupabaseClient();