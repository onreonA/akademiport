/**
 * Dynamic CMS Page Route
 * Sprint 23: CMS
 *
 * Renders CMS pages dynamically based on slug
 */

import { notFound } from 'next/navigation';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { SupabaseCMSPageRepository } from '@/4-infrastructure/database/repositories/SupabaseCMSPageRepository';
import { GetPageUseCase } from '@/2-application/use-cases/cms';
import { PageRenderer } from '@/1-presentation/components/features/cms/PageRenderer';
import { ModernNavigation } from '@/1-presentation/components/features/layout/ModernNavigation';
import { ModernFooter } from '@/1-presentation/components/features/layout/ModernFooter';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const repository = new SupabaseCMSPageRepository();
  const useCase = new GetPageUseCase(repository);
  const result = await useCase.executeBySlug(slug, false);

  if (result.isFailure || !result.value || result.value.status !== 'published') {
    return {
      title: 'Sayfa Bulunamadı',
    };
  }

  const page = result.value;

  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription,
    keywords: page.metaKeywords,
    openGraph: {
      title: page.ogTitle || page.metaTitle || page.title,
      description: page.ogDescription || page.metaDescription,
      images: page.ogImageUrl ? [page.ogImageUrl] : [],
    },
    alternates: {
      canonical: page.canonicalUrl || `/${slug}`,
    },
  };
}

export default async function CMSPage({ params }: PageProps) {
  const { slug } = await params;

  // Skip CMS routing for known static routes
  const staticRoutes = [
    'admin-dashboard',
    'company-dashboard',
    'consultant-dashboard',
    'dashboard',
    'login',
    'api',
    'program-hakkinda',
    'platform-ozellikleri',
    'basari-hikayeleri',
    'sss',
    'iletisim-basvuru',
    'destekler',
    'kariyer',
  ];

  if (staticRoutes.includes(slug)) {
    notFound();
  }

  const repository = new SupabaseCMSPageRepository();
  const useCase = new GetPageUseCase(repository);
  const result = await useCase.executeBySlug(slug, false);

  if (result.isFailure || !result.value) {
    notFound();
  }

  const page = result.value;

  // Only show published pages
  if (page.status !== 'published') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <ModernNavigation />
      <main>
        <PageRenderer page={page} />
      </main>
      <ModernFooter />
    </div>
  );
}
