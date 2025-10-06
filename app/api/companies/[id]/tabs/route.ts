import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
// PUT /api/companies/[id]/tabs - Update tab data
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;
    const body = await request.json();
    const { tab, data } = body;
    if (!tab || !data) {
      return NextResponse.json(
        { error: 'Tab and data are required' },
        { status: 400 }
      );
    }
    let result;
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };
    switch (tab) {
      case 'general':
        // First check if record exists
        const { data: existingGenerals, error: checkGeneralsError } =
          await supabase
            .from('company_general_info')
            .select('id')
            .eq('company_id', id);
        if (existingGenerals && existingGenerals.length > 0) {
          // Update existing record (use first one)
          result = await supabase
            .from('company_general_info')
            .update(updateData)
            .eq('id', existingGenerals[0].id)
            .select()
            .single();
        } else {
          // Insert new record
          result = await supabase
            .from('company_general_info')
            .insert({ company_id: id, ...updateData })
            .select()
            .single();
        }
        // Also update companies table with email if it exists
        if (data.email) {
          const { error: companiesUpdateError } = await supabase
            .from('companies')
            .update({
              email: data.email,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id);
          if (companiesUpdateError) {
          } else {
            // Verify the update by fetching the company data
            const { data: verifyData, error: verifyError } = await supabase
              .from('companies')
              .select('email')
              .eq('id', id)
              .single();
            if (verifyError) {
            } else {
            }
          }
        }
        break;
      case 'markets':
        // First check if record exists
        const { data: existingMarkets, error: checkError } = await supabase
          .from('company_markets')
          .select('id')
          .eq('company_id', id);
        if (existingMarkets && existingMarkets.length > 0) {
          // Update existing record (use first one)
          result = await supabase
            .from('company_markets')
            .update(updateData)
            .eq('id', existingMarkets[0].id)
            .select()
            .single();
        } else {
          // Insert new record
          result = await supabase
            .from('company_markets')
            .insert({ company_id: id, ...updateData })
            .select()
            .single();
        }
        break;
      case 'products':
        // First check if record exists
        const { data: existingProducts, error: checkProductsError } =
          await supabase
            .from('company_products')
            .select('id')
            .eq('company_id', id);
        if (existingProducts && existingProducts.length > 0) {
          // Update existing record (use first one)
          result = await supabase
            .from('company_products')
            .update(updateData)
            .eq('id', existingProducts[0].id)
            .select()
            .single();
        } else {
          // Insert new record
          result = await supabase
            .from('company_products')
            .insert({ company_id: id, ...updateData })
            .select()
            .single();
        }
        break;
      case 'competitors':
        // First check if record exists
        const { data: existingCompetitors, error: checkCompetitorsError } =
          await supabase
            .from('company_competitors')
            .select('id')
            .eq('company_id', id);
        if (existingCompetitors && existingCompetitors.length > 0) {
          // Update existing record (use first one)
          result = await supabase
            .from('company_competitors')
            .update(updateData)
            .eq('id', existingCompetitors[0].id)
            .select()
            .single();
        } else {
          // Insert new record
          result = await supabase
            .from('company_competitors')
            .insert({ company_id: id, ...updateData })
            .select()
            .single();
        }
        break;
      case 'production':
        // First check if record exists
        const { data: existingProductions, error: checkProductionsError } =
          await supabase
            .from('company_production')
            .select('id')
            .eq('company_id', id);
        if (existingProductions && existingProductions.length > 0) {
          // Update existing record (use first one)
          result = await supabase
            .from('company_production')
            .update(updateData)
            .eq('id', existingProductions[0].id)
            .select()
            .single();
        } else {
          // Insert new record
          result = await supabase
            .from('company_production')
            .insert({ company_id: id, ...updateData })
            .select()
            .single();
        }
        break;
      case 'digital':
        // First check if record exists
        const { data: existingDigitals, error: checkDigitalsError } =
          await supabase
            .from('company_digital')
            .select('id')
            .eq('company_id', id);
        if (existingDigitals && existingDigitals.length > 0) {
          // Update existing record (use first one)
          result = await supabase
            .from('company_digital')
            .update(updateData)
            .eq('id', existingDigitals[0].id)
            .select()
            .single();
        } else {
          // Insert new record
          result = await supabase
            .from('company_digital')
            .insert({ company_id: id, ...updateData })
            .select()
            .single();
        }
        break;
      case 'sales':
        // First check if record exists
        const { data: existingSalesList, error: checkSalesError } =
          await supabase
            .from('company_sales')
            .select('id')
            .eq('company_id', id);
        if (existingSalesList && existingSalesList.length > 0) {
          // Update existing record (use first one)
          result = await supabase
            .from('company_sales')
            .update(updateData)
            .eq('id', existingSalesList[0].id)
            .select()
            .single();
        } else {
          // Insert new record
          result = await supabase
            .from('company_sales')
            .insert({ company_id: id, ...updateData })
            .select()
            .single();
        }
        break;
      case 'content':
        // First check if record exists
        const { data: existingContents, error: checkContentsError } =
          await supabase
            .from('company_content')
            .select('id')
            .eq('company_id', id);
        if (existingContents && existingContents.length > 0) {
          // Update existing record (use first one)
          result = await supabase
            .from('company_content')
            .update(updateData)
            .eq('id', existingContents[0].id)
            .select()
            .single();
        } else {
          // Insert new record
          result = await supabase
            .from('company_content')
            .insert({ company_id: id, ...updateData })
            .select()
            .single();
        }
        break;
      case 'certification':
        // First check if record exists
        const {
          data: existingCertifications,
          error: checkCertificationsError,
        } = await supabase
          .from('company_certification')
          .select('id')
          .eq('company_id', id);
        if (existingCertifications && existingCertifications.length > 0) {
          // Update existing record (use first one)
          result = await supabase
            .from('company_certification')
            .update(updateData)
            .eq('id', existingCertifications[0].id)
            .select()
            .single();
        } else {
          // Insert new record
          result = await supabase
            .from('company_certification')
            .insert({ company_id: id, ...updateData })
            .select()
            .single();
        }
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid tab name' },
          { status: 400 }
        );
    }
    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }
    // Add activity history
    await supabase.from('company_activity_history').insert({
      company_id: id,
      type: 'update',
      title: `${tab.charAt(0).toUpperCase() + tab.slice(1)} Tab'ı Güncellendi`,
      description: `${tab} tab'ındaki veriler güncellendi`,
      details: `Tab: ${tab}, Güncelleme zamanı: ${new Date().toLocaleString('tr-TR')}`,
      user_id: null, // TODO: Add real user ID
    });
    return NextResponse.json({
      message: 'Tab data updated successfully',
      data: result.data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// POST /api/companies/[id]/tabs - Add activity note
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient();
    const { id } = await params;
    const body = await request.json();
    const { title, description, details } = body;
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }
    const result = await supabase
      .from('company_activity_history')
      .insert({
        company_id: id,
        type: 'note',
        title,
        description,
        details: details || 'Manuel olarak eklenen not',
        user_id: null, // TODO: Add real user ID
      })
      .select()
      .single();
    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 400 }
      );
    }
    return NextResponse.json({
      message: 'Activity note added successfully',
      data: result.data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
