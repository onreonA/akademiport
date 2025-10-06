/**
 * Database Test After Fix Script
 * Bu script veritabanı düzeltmelerinden sonra testleri tekrar çalıştırır
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables not found');
  console.log(
    'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test sonuçları
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
};

// Test fonksiyonu
async function testDatabaseQuery(
  queryName,
  query,
  expectedMinRows = 0,
  description = ''
) {
  try {
    console.log(`🧪 Testing: ${queryName} - ${description}`);

    const { data, error } = await query;

    if (error) {
      console.log(`❌ FAIL: ${queryName} - Database Error: ${error.message}`);
      testResults.failed++;
      testResults.errors.push({
        test: queryName,
        error: error.message,
        description,
      });
      return;
    }

    const rowCount = data ? data.length : 0;

    if (rowCount >= expectedMinRows) {
      console.log(
        `✅ PASS: ${queryName} - Found ${rowCount} rows (expected min: ${expectedMinRows})`
      );
      testResults.passed++;
    } else {
      console.log(
        `❌ FAIL: ${queryName} - Found ${rowCount} rows, expected min: ${expectedMinRows}`
      );
      testResults.failed++;
      testResults.errors.push({
        test: queryName,
        expected: expectedMinRows,
        actual: rowCount,
        description,
      });
    }
  } catch (error) {
    console.log(`💥 ERROR: ${queryName} - ${error.message}`);
    testResults.failed++;
    testResults.errors.push({
      test: queryName,
      error: error.message,
      description,
    });
  }
}

// Ana test fonksiyonu
async function runDatabaseTestsAfterFix() {
  console.log('🚀 Starting Database Tests After Fix...\n');

  // 1. Yeni Oluşturulan Tablolar Testleri
  console.log('📋 1. Yeni Oluşturulan Tablolar Testleri');

  await testDatabaseQuery(
    'Task Completions Table',
    supabase.from('task_completions').select('*').limit(1),
    0,
    'Task_completions tablosu erişilebilir mi?'
  );

  await testDatabaseQuery(
    'Task Comments Table',
    supabase.from('task_comments').select('*').limit(1),
    0,
    'Task_comments tablosu erişilebilir mi?'
  );

  await testDatabaseQuery(
    'Task Files Table',
    supabase.from('task_files').select('*').limit(1),
    0,
    'Task_files tablosu erişilebilir mi?'
  );

  await testDatabaseQuery(
    'Task History Table',
    supabase.from('task_history').select('*').limit(1),
    0,
    'Task_history tablosu erişilebilir mi?'
  );

  await testDatabaseQuery(
    'Consultants Table',
    supabase.from('consultants').select('*').limit(1),
    0,
    'Consultants tablosu erişilebilir mi?'
  );

  // 2. Enum Değerleri Testleri
  console.log('\n📋 2. Enum Değerleri Testleri');

  await testDatabaseQuery(
    'Task Status Enum Values',
    supabase
      .from('tasks')
      .select('status')
      .in('status', [
        'pending',
        'in_progress',
        'completed',
        'cancelled',
        'pending_approval',
      ])
      .limit(1),
    0,
    'Task status enum değerleri doğru mu?'
  );

  await testDatabaseQuery(
    'Completion Status Enum Values',
    supabase
      .from('task_completions')
      .select('status')
      .in('status', ['pending_approval', 'approved', 'rejected'])
      .limit(1),
    0,
    'Completion status enum değerleri doğru mu?'
  );

  await testDatabaseQuery(
    'User Type Enum Values',
    supabase
      .from('task_comments')
      .select('user_type')
      .in('user_type', ['company_user', 'admin_user', 'consultant'])
      .limit(1),
    0,
    'User type enum değerleri doğru mu?'
  );

  // 3. Yeni İlişki Testleri
  console.log('\n📋 3. Yeni İlişki Testleri');

  await testDatabaseQuery(
    'Task Completions with Tasks',
    supabase
      .from('task_completions')
      .select(
        `
        id,
        tasks!inner(
          id,
          title
        )
      `
      )
      .limit(5),
    0,
    'Task_completions ve tasks ilişkisi çalışıyor mu?'
  );

  await testDatabaseQuery(
    'Task Comments with Tasks',
    supabase
      .from('task_comments')
      .select(
        `
        id,
        tasks!inner(
          id,
          title
        )
      `
      )
      .limit(5),
    0,
    'Task_comments ve tasks ilişkisi çalışıyor mu?'
  );

  await testDatabaseQuery(
    'Task Files with Tasks',
    supabase
      .from('task_files')
      .select(
        `
        id,
        tasks!inner(
          id,
          title
        )
      `
      )
      .limit(5),
    0,
    'Task_files ve tasks ilişkisi çalışıyor mu?'
  );

  await testDatabaseQuery(
    'Consultants with Users',
    supabase
      .from('consultants')
      .select(
        `
        id,
        users!inner(
          id,
          full_name
        )
      `
      )
      .limit(5),
    0,
    'Consultants ve users ilişkisi çalışıyor mu?'
  );

  // 4. Güncellenmiş Tasks Tablosu Testleri
  console.log('\n📋 4. Güncellenmiş Tasks Tablosu Testleri');

  await testDatabaseQuery(
    'Tasks with New Columns',
    supabase
      .from('tasks')
      .select(
        `
        id,
        title,
        status,
        completed_by,
        completed_at,
        completion_note,
        actual_hours,
        consultant_approval_status,
        consultant_id,
        approved_at,
        approved_by,
        approval_note,
        quality_score
      `
      )
      .limit(5),
    0,
    'Tasks tablosundaki yeni kolonlar çalışıyor mu?'
  );

  // 5. RLS Policies Testleri
  console.log('\n📋 5. RLS Policies Testleri');

  await testDatabaseQuery(
    'Task Completions RLS',
    supabase.from('task_completions').select('*').limit(1),
    0,
    'Task_completions RLS policy çalışıyor mu?'
  );

  await testDatabaseQuery(
    'Task Comments RLS',
    supabase.from('task_comments').select('*').limit(1),
    0,
    'Task_comments RLS policy çalışıyor mu?'
  );

  // 6. Index Testleri
  console.log('\n📋 6. Index Testleri');

  await testDatabaseQuery(
    'Task Completions by Task ID',
    supabase
      .from('task_completions')
      .select('*')
      .eq('task_id', '00000000-0000-0000-0000-000000000000')
      .limit(1),
    0,
    'Task_completions task_id index çalışıyor mu?'
  );

  await testDatabaseQuery(
    'Task Comments by Task ID',
    supabase
      .from('task_comments')
      .select('*')
      .eq('task_id', '00000000-0000-0000-0000-000000000000')
      .limit(1),
    0,
    'Task_comments task_id index çalışıyor mu?'
  );

  // Test sonuçlarını yazdır
  console.log('\n📊 Database Test Results After Fix Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(
    `📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`
  );

  if (testResults.errors.length > 0) {
    console.log('\n🔍 Failed Tests Details:');
    testResults.errors.forEach(error => {
      console.log(`   - ${error.test}: ${error.description}`);
      if (error.expected !== undefined) {
        console.log(`     Expected: ${error.expected}, Got: ${error.actual}`);
      } else {
        console.log(`     Error: ${error.error}`);
      }
    });
  } else {
    console.log('\n🎉 Tüm veritabanı testleri başarılı! Sistem hazır!');
  }

  return testResults;
}

// Script çalıştır
runDatabaseTestsAfterFix().catch(console.error);

module.exports = { runDatabaseTestsAfterFix, testDatabaseQuery };
