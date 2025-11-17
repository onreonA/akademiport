/**
 * Environment Variables Checker
 *
 * AI servisleri için gerekli environment variable'ları kontrol eder
 *
 * Çalıştırma:
 * npx tsx src/5-shared/services/ai/check-env.ts
 */

function checkEnvironmentVariables() {
  console.log('🔍 AI Services Environment Variables Check\n');

  const required = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  };

  let allPresent = true;

  for (const [key, value] of Object.entries(required)) {
    if (value) {
      const masked = value.substring(0, 7) + '...' + value.substring(value.length - 4);
      console.log(`✅ ${key}: ${masked}`);
    } else {
      console.log(`❌ ${key}: EKSIK`);
      allPresent = false;
    }
  }

  console.log('');

  if (allPresent) {
    console.log("✅ Tüm environment variable'lar mevcut!");
    console.log('💡 AI servisleri kullanılabilir.');
  } else {
    console.log("⚠️  Bazı environment variable'lar eksik!");
    console.log('💡 .env.local dosyasına ekleyin:');
    console.log('');
    console.log('   OPENAI_API_KEY=sk-proj-...');
    console.log('   ANTHROPIC_API_KEY=sk-ant-...');
    console.log('');
    console.log('📖 Daha fazla bilgi: src/5-shared/services/ai/README.md');
  }

  return allPresent;
}

const success = checkEnvironmentVariables();
process.exit(success ? 0 : 1);
