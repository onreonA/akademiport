/**
 * Supabase Client (Server)
 *
 * Server-side Supabase client.
 * Bu client server'da çalışır ve API routes'larda kullanılır.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseConfig } from '@/infrastructure/config/supabase.config';

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(supabaseConfig.url, supabaseConfig.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // Cookie setting can fail in middleware
          // This is expected and can be ignored
        }
      },
    },
  });
};

/**
 * Admin Client (Service Role)
 *
 * Bu client service role key kullanır ve RLS bypass eder.
 * Sadece admin işlemleri için kullanılmalıdır!
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const getSupabaseAdminClient = () => {
  if (!supabaseConfig.serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createSupabaseClient(supabaseConfig.url, supabaseConfig.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
