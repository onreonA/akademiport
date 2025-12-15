/**
 * Script to refresh ecommerce_performance view
 * Run this script to refresh the materialized view and check companies
 *
 * Usage: npx tsx scripts/refresh-ecommerce-performance.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function refreshEcommercePerformance() {
  console.log('🔄 Refreshing ecommerce_performance view...');

  try {
    // Refresh the view
    const { error: refreshError } = await supabase.rpc('refresh_ecommerce_performance');

    if (refreshError) {
      console.error('❌ Error refreshing view:', refreshError);
      return;
    }

    console.log('✅ View refreshed successfully');

    // Check companies count
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, program_id, is_active')
      .eq('is_active', true);

    if (companiesError) {
      console.error('❌ Error fetching companies:', companiesError);
      return;
    }

    // Check companies in view
    const { data: viewCompanies, error: viewError } = await supabase
      .from('ecommerce_performance')
      .select('company_id, company_name, program_id');

    if (viewError) {
      console.error('❌ Error fetching view companies:', viewError);
      return;
    }

    const kayseriProgramIdOld = '10000000-0000-0000-0000-000000000001';
    const kayseriProgramIdNew = '0560190a-9b8f-4c39-8c2b-c12bf81c46a6';

    const kayseriCompaniesOld =
      companies?.filter((c) => c.program_id === kayseriProgramIdOld) || [];
    const kayseriCompaniesNew =
      companies?.filter((c) => c.program_id === kayseriProgramIdNew) || [];

    console.log('\n📊 Statistics:');
    console.log(`Total active companies: ${companies?.length || 0}`);
    console.log(`Companies in view: ${viewCompanies?.length || 0}`);
    console.log(`Companies with old Kayseri program ID: ${kayseriCompaniesOld.length}`);
    console.log(`Companies with new Kayseri program ID: ${kayseriCompaniesNew.length}`);
    console.log(
      `\nAll program IDs:`,
      Array.from(new Set(companies?.map((c) => c.program_id) || []))
    );

    if (kayseriCompaniesOld.length > 0) {
      console.log('\n⚠️  Companies with old Kayseri program ID:');
      kayseriCompaniesOld.forEach((c) => {
        console.log(`  - ${c.name} (${c.id})`);
      });
    }

    if (kayseriCompaniesNew.length > 0) {
      console.log('\n✅ Companies with new Kayseri program ID:');
      kayseriCompaniesNew.forEach((c) => {
        console.log(`  - ${c.name} (${c.id})`);
      });
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

refreshEcommercePerformance();
