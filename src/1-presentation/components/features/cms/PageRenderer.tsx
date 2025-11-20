/**
 * CMS Page Renderer Component
 * Sprint 23: CMS
 *
 * Renders CMS page content with sections
 */

'use client';

import { CMSPage, CMSSection } from '@/3-domain/entities/CMSPage';
import { SectionRenderer } from './SectionRenderer';

interface PageRendererProps {
  page: CMSPage;
}

export function PageRenderer({ page }: PageRendererProps) {
  // Get active sections sorted by order_index
  const activeSections = page.content
    .filter((section) => section.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="w-full">
      {/* Page Title */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold">{page.title}</h1>
        </div>
      </div>

      {/* Page Content - Sections */}
      <div className="w-full">
        {activeSections.length === 0 ? (
          <div className="container mx-auto px-4 py-12">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content as any }}
            />
          </div>
        ) : (
          activeSections.map((section, index) => (
            <SectionRenderer key={section.id || `section-${index}`} section={section} />
          ))
        )}
      </div>
    </div>
  );
}
