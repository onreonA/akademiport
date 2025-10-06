import { createClient as createSupabaseClient } from '@supabase/supabase-js';
let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;
export function createClient() {
  // Use singleton pattern to prevent multiple instances
  if (supabaseClient) {
    return supabaseClient;
  }
  supabaseClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'implicit',
        storageKey: 'ia-supabase-auth', // Unique storage key to prevent conflicts
      },
    }
  );
  return supabaseClient;
}
