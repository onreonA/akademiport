/**
 * AI Services Integration Test
 *
 * Gerçek API çağrıları ile integration test
 * NOT: Bu dosya sadece manuel test için. API key'ler gerekli.
 *
 * Çalıştırma:
 * npx tsx src/5-shared/services/ai/__test-integration__.ts
 */

import { OpenAIService } from './openai.service';
import { ClaudeService } from './claude.service';
import { AIRouterService } from './ai-router.service';
import { AIUseCase } from '@/3-domain/enums/AIEnums';

async function testAIServices() {
  console.log('🧪 AI Services Integration Test\n');
  console.log("⚠️  Bu test gerçek API çağrıları yapar. API key'ler gerekli!\n");

  const results = {
    openai: false,
    claude: false,
    router: false,
  };

  // Test 1: OpenAI
  console.log('1️⃣ Testing OpenAI Service...');
  try {
    const openai = new OpenAIService();
    const openaiResult = await openai.complete("Türkiye'nin başkenti nedir? Kısaca cevapla.");

    if (openaiResult.isSuccess) {
      console.log('✅ OpenAI Success!');
      console.log(`   Response: ${openaiResult.value.text.substring(0, 100)}...`);
      console.log(`   Tokens: ${openaiResult.value.totalTokens}`);
      console.log(`   Cost: $${openaiResult.value.costUsd.toFixed(6)}`);
      console.log(`   Duration: ${openaiResult.value.durationMs}ms`);
      results.openai = true;
    } else {
      console.log('❌ OpenAI Failed:', openaiResult.error);
    }
  } catch (error: any) {
    console.log('❌ OpenAI Error:', error.message);
    if (error.message.includes('API_KEY')) {
      console.log('   💡 OPENAI_API_KEY environment variable eksik!');
    }
  }

  console.log('');

  // Test 2: Claude
  console.log('2️⃣ Testing Claude Service...');
  try {
    const claude = new ClaudeService();
    const claudeResult = await claude.complete('E-ihracat nedir? Kısaca açıkla.');

    if (claudeResult.isSuccess) {
      console.log('✅ Claude Success!');
      console.log(`   Response: ${claudeResult.value.text.substring(0, 100)}...`);
      console.log(`   Tokens: ${claudeResult.value.totalTokens}`);
      console.log(`   Cost: $${claudeResult.value.costUsd.toFixed(6)}`);
      console.log(`   Duration: ${claudeResult.value.durationMs}ms`);
      results.claude = true;
    } else {
      console.log('❌ Claude Failed:', claudeResult.error);
    }
  } catch (error: any) {
    console.log('❌ Claude Error:', error.message);
    if (error.message.includes('API_KEY')) {
      console.log('   💡 ANTHROPIC_API_KEY environment variable eksik!');
    }
  }

  console.log('');

  // Test 3: AI Router
  console.log('3️⃣ Testing AI Router...');
  try {
    const router = new AIRouterService();
    const routerResult = await router.complete(
      AIUseCase.TASK_DESCRIPTION,
      "Alibaba.com'da mağaza açma görevi için detaylı bir açıklama oluştur."
    );

    if (routerResult.isSuccess) {
      console.log('✅ AI Router Success!');
      console.log(`   Provider: ${routerResult.value.provider}`);
      console.log(`   Model: ${routerResult.value.model}`);
      console.log(`   Response: ${routerResult.value.text.substring(0, 150)}...`);
      console.log(`   Tokens: ${routerResult.value.totalTokens}`);
      console.log(`   Cost: $${routerResult.value.costUsd.toFixed(6)}`);
      results.router = true;
    } else {
      console.log('❌ AI Router Failed:', routerResult.error);
    }
  } catch (error: any) {
    console.log('❌ AI Router Error:', error.message);
  }

  console.log('\n📊 Test Sonuçları:');
  console.log(`   OpenAI: ${results.openai ? '✅' : '❌'}`);
  console.log(`   Claude: ${results.claude ? '✅' : '❌'}`);
  console.log(`   Router: ${results.router ? '✅' : '❌'}`);

  const allPassed = Object.values(results).every((r) => r === true);
  console.log(
    `\n${allPassed ? '✅ Tüm testler başarılı!' : "⚠️  Bazı testler başarısız. API key'leri kontrol edin."}`
  );

  process.exit(allPassed ? 0 : 1);
}

// Run tests
testAIServices().catch((error) => {
  console.error('❌ Test hatası:', error);
  process.exit(1);
});
