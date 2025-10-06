import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
export function createClient(userAgent?: string) {
  const cookieStore = cookies();
  // Opera için özel ayarlar
  const isOpera = userAgent?.includes('OPR/');
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'https://frylotuwbjhqybcxvvzs.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWxvdHV3YmpocXliY3h2dnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NzgxODgsImV4cCI6MjA3MTI1NDE4OH0.sz1HL_Amw4ndS0czezgYzYnpHnGjC02wjRbhSLSiPdc',
    {
      auth: {
        autoRefreshToken: !isOpera, // Opera'da otomatik refresh'i kapat
        persistSession: !isOpera, // Opera'da session persist'i kapat
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'X-Client-Info': isOpera
            ? 'supabase-js-web-opera'
            : 'supabase-js-web',
        },
      },
    }
  );
}
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
      'https://frylotuwbjhqybcxvvzs.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWxvdHV3YmpocXliY3h2dnpzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3ODE4OCwiZXhwIjoyMDcxMjU0MTg4fQ.kvHMECvHePaa07whhElHb11tFArkv85UwAGNPZ3qGNY',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
