/**
 * Supabase Configuration
 *
 * Supabase client konfigürasyonu ve helper fonksiyonları
 */

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
} as const;

// Environment variable validation
if (!supabaseConfig.url) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseConfig.anonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

/**
 * Supabase Project Info
 */
export const supabaseProjectInfo = {
  projectId: 'wkorllmsuhwtrxpjtgwk',
  projectName: 'Akademi Port',
  region: 'eu-central-1',
} as const;
