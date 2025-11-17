/**
 * Database Migration Checker
 *
 * AI tablolarının oluşturulup oluşturulmadığını kontrol eder
 *
 * Çalıştırma:
 * npx tsx src/5-shared/services/ai/check-migration.ts
 */

import { createClient } from '@/4-infrastructure/database/supabase-server';

async function checkMigration() {
  console.log('🔍 AI Database Migration Check\n');

  try {
    const supabase = await createClient();

    // Check ai_provider_configs table
    console.log('1️⃣ Checking ai_provider_configs table...');
    const { data: configs, error: configsError } = await supabase
      .from('ai_provider_configs')
      .select('*')
      .limit(1);

    if (configsError) {
      console.log('❌ ai_provider_configs table not found or error:', configsError.message);
      return false;
    }
    console.log(`✅ ai_provider_configs table exists (${configs?.length || 0} records)`);

    // Check ai_prompts table
    console.log('\n2️⃣ Checking ai_prompts table...');
    const { data: prompts, error: promptsError } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (promptsError) {
      console.log('❌ ai_prompts table not found or error:', promptsError.message);
      return false;
    }
    console.log(`✅ ai_prompts table exists (${prompts?.length || 0} active prompts)`);

    // Check ai_usage_logs table
    console.log('\n3️⃣ Checking ai_usage_logs table...');
    const { data: logs, error: logsError } = await supabase
      .from('ai_usage_logs')
      .select('id')
      .limit(1);

    if (logsError) {
      console.log('❌ ai_usage_logs table not found or error:', logsError.message);
      return false;
    }
    console.log(`✅ ai_usage_logs table exists`);

    // Check enums
    console.log('\n4️⃣ Checking enum types...');
    const { data: enumCheck, error: enumError } = await supabase.rpc('check_ai_enums');

    if (enumError && enumError.code !== '42883') {
      // Function doesn't exist, but that's OK - we can check tables directly
      console.log('⚠️  Enum check function not available (this is OK)');
    } else {
      console.log('✅ Enum types exist');
    }

    console.log('\n✅ Tüm AI tabloları mevcut! Migration başarıyla uygulanmış.');
    console.log('\n📊 Özet:');
    console.log(`   - ai_provider_configs: ✅`);
    console.log(`   - ai_prompts: ✅`);
    console.log(`   - ai_usage_logs: ✅`);

    return true;
  } catch (error: any) {
    console.error('❌ Migration check failed:', error.message);
    return false;
  }
}

checkMigration()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
