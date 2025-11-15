/**
 * Repository Test Helpers
 * Utilities for testing repositories with Supabase
 */

import { getSupabaseAdminClient } from '@/4-infrastructure/database/supabase-server';
import { NewsCategory, NewsStatus } from '@/3-domain/enums/NewsEnums';
import type { News } from '@/3-domain/entities/News';

/**
 * Create test program
 */
export async function createTestProgram(name: string = 'Test Program') {
  const adminClient = getSupabaseAdminClient();
  const { data, error } = await adminClient
    .from('programs')
    .insert({
      name,
      slug: `test-${Date.now()}`,
      description: 'Test program',
      status: 'in_progress',
      max_companies: 10,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test program: ${error.message}`);
  }

  return data;
}

/**
 * Create test user
 */
export async function createTestUser(
  email: string = `test-${Date.now()}@example.com`,
  role: string = 'master_admin'
) {
  const adminClient = getSupabaseAdminClient();

  // Create auth user
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: 'test123456',
    email_confirm: true,
  });

  if (authError) {
    throw new Error(`Failed to create auth user: ${authError.message}`);
  }

  // Create user record
  const { data, error } = await adminClient
    .from('users')
    .insert({
      id: authData.user.id,
      email,
      full_name: 'Test User',
      role,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return data;
}

/**
 * Create test company
 */
export async function createTestCompany(programId: string, name: string = 'Test Company') {
  const adminClient = getSupabaseAdminClient();
  const { data, error } = await adminClient
    .from('companies')
    .insert({
      name,
      program_id: programId,
      tax_number: `TEST-${Date.now()}`,
      slug: `test-company-${Date.now()}`,
      is_active: true,
      max_users: 5,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test company: ${error.message}`);
  }

  return data;
}

/**
 * Create test news
 */
export async function createTestNews(
  programId: string,
  authorId: string,
  overrides?: Partial<News>
): Promise<News> {
  const adminClient = getSupabaseAdminClient();

  const newsData = {
    program_id: programId,
    author_id: authorId,
    title: overrides?.title || 'Test News',
    slug: `test-news-${Date.now()}`,
    summary: overrides?.summary || 'Test summary',
    content: overrides?.content || 'Test content',
    category: overrides?.category || NewsCategory.GENERAL,
    status: overrides?.status || NewsStatus.DRAFT,
    image_url: overrides?.imageUrl || null,
    image_alt: overrides?.imageAlt || null,
    meta_description: overrides?.metaDescription || null,
    meta_keywords: overrides?.metaKeywords || null,
    is_featured: overrides?.isFeatured || false,
    is_pinned: overrides?.isPinned || false,
    reading_time: overrides?.readingTime || 1,
    view_count: overrides?.viewCount || 0,
    like_count: overrides?.likeCount || 0,
    comment_count: overrides?.commentCount || 0,
    published_at: overrides?.publishedAt?.toISOString() || null,
    archived_at: overrides?.archivedAt?.toISOString() || null,
    created_by: authorId,
    updated_by: authorId,
  };

  const { data, error } = await adminClient.from('news').insert(newsData).select().single();

  if (error) {
    throw new Error(`Failed to create test news: ${error.message}`);
  }

  return {
    id: data.id,
    programId: data.program_id,
    authorId: data.author_id,
    title: data.title,
    slug: data.slug,
    summary: data.summary,
    content: data.content,
    category: data.category,
    status: data.status,
    imageUrl: data.image_url,
    imageAlt: data.image_alt,
    metaDescription: data.meta_description,
    metaKeywords: data.meta_keywords,
    isFeatured: data.is_featured,
    isPinned: data.is_pinned,
    readingTime: data.reading_time,
    viewCount: data.view_count,
    likeCount: data.like_count,
    commentCount: data.comment_count,
    publishedAt: data.published_at ? new Date(data.published_at) : null,
    archivedAt: data.archived_at ? new Date(data.archived_at) : null,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    createdBy: data.created_by,
    updatedBy: data.updated_by,
  };
}

/**
 * Cleanup test data
 */
export async function cleanupTestData(ids: {
  programIds?: string[];
  userIds?: string[];
  companyIds?: string[];
  newsIds?: string[];
}) {
  const adminClient = getSupabaseAdminClient();

  try {
    // Delete news
    if (ids.newsIds && ids.newsIds.length > 0) {
      await adminClient.from('news').delete().in('id', ids.newsIds);
    }

    // Delete companies
    if (ids.companyIds && ids.companyIds.length > 0) {
      await adminClient.from('companies').delete().in('id', ids.companyIds);
    }

    // Delete users (and auth users)
    if (ids.userIds && ids.userIds.length > 0) {
      // Delete user records
      await adminClient.from('users').delete().in('id', ids.userIds);
      // Delete auth users
      for (const userId of ids.userIds) {
        await adminClient.auth.admin.deleteUser(userId);
      }
    }

    // Delete programs
    if (ids.programIds && ids.programIds.length > 0) {
      await adminClient.from('programs').delete().in('id', ids.programIds);
    }
  } catch (error) {
    console.error('Cleanup error:', error);
    // Don't throw - cleanup errors shouldn't fail tests
  }
}
