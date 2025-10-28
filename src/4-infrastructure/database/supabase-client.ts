/**
 * Supabase Client (Browser)
 *
 * Client-side Supabase client.
 * Bu client browser'da çalışır ve kullanıcı authentication'ı için kullanılır.
 */

import { createBrowserClient } from '@supabase/ssr';
import { supabaseConfig } from '@/infrastructure/config/supabase.config';

export const createClient = () => {
  return createBrowserClient(supabaseConfig.url, supabaseConfig.anonKey);
};

/**
 * Singleton instance for browser
 */
let browserClient: ReturnType<typeof createClient> | null = null;

export const getSupabaseBrowserClient = () => {
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
};
