/**
 * Prompt Templates Checker
 *
 * AI prompt template'lerinin database'de olup olmadığını kontrol eder
 *
 * Çalıştırma:
 * npx tsx src/5-shared/services/ai/__test-prompt-check__.ts
 */

import { createClient } from '@/4-infrastructure/database/supabase-server';
import { AIUseCase } from '@/3-domain/enums/AIEnums';

async function checkPrompts() {
  console.log('🔍 AI Prompt Templates Check\n');

  try {
    const supabase = await createClient();

    const useCases = [
      AIUseCase.TASK_DESCRIPTION,
      AIUseCase.DOCUMENT_SUMMARY,
      AIUseCase.RISK_ANALYSIS,
      AIUseCase.SUCCESS_PREDICTION,
      AIUseCase.TREND_ANALYSIS,
      AIUseCase.REPORT_GENERATION,
    ];

    const results: Array<{ useCase: string; exists: boolean; name?: string }> = [];

    for (const useCase of useCases) {
      const { data, error } = await supabase
        .from('ai_prompts')
        .select('name, version, is_active')
        .eq('use_case', useCase)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log(`❌ ${useCase}: Error - ${error.message}`);
        results.push({ useCase, exists: false });
      } else if (data) {
        console.log(`✅ ${useCase}: ${data.name} (v${data.version})`);
        results.push({ useCase, exists: true, name: data.name });
      } else {
        console.log(`⚠️  ${useCase}: Aktif prompt bulunamadı`);
        results.push({ useCase, exists: false });
      }
    }

    console.log('\n📊 Özet:');
    const existing = results.filter((r) => r.exists).length;
    const missing = results.filter((r) => !r.exists).length;
    console.log(`   ✅ Mevcut: ${existing}/${useCases.length}`);
    console.log(`   ⚠️  Eksik: ${missing}/${useCases.length}`);

    if (missing > 0) {
      console.log("\n⚠️  Eksik prompt'lar:");
      results
        .filter((r) => !r.exists)
        .forEach((r) => {
          console.log(`   - ${r.useCase}`);
        });
      console.log("\n💡 Migration dosyasını Supabase'e uygulayın:");
      console.log('   src/4-infrastructure/database/migrations/037_create_ai_tables.sql');
    } else {
      console.log("\n✅ Tüm prompt template'ler mevcut!");
    }

    return missing === 0;
  } catch (error: any) {
    console.error('❌ Prompt check failed:', error.message);
    return false;
  }
}

checkPrompts()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
