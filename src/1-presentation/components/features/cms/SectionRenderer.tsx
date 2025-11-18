/**
 * CMS Section Renderer Component
 * Sprint 23: CMS
 *
 * Renders individual CMS sections based on type
 */

'use client';

import { CMSSection, CMSSectionType } from '@/3-domain/entities/CMSPage';
import { cn } from '@/presentation/lib/utils';

interface SectionRendererProps {
  section: CMSSection;
}

export function SectionRenderer({ section }: SectionRendererProps) {
  const { type, content, settings } = section;

  // Get background and padding from settings
  const backgroundColor = settings?.backgroundColor || 'bg-white';
  const padding = settings?.padding || 'py-12';
  const textColor = settings?.textColor || 'text-gray-900';

  const baseClasses = cn('w-full', backgroundColor, padding, textColor);

  switch (type) {
    case 'hero':
      return (
        <section className={baseClasses}>
          <div className="container mx-auto px-4">
            <HeroSection content={content} />
          </div>
        </section>
      );

    case 'text':
      return (
        <section className={baseClasses}>
          <div className="container mx-auto px-4">
            <TextSection content={content} />
          </div>
        </section>
      );

    case 'image':
      return (
        <section className={baseClasses}>
          <div className="container mx-auto px-4">
            <ImageSection content={content} />
          </div>
        </section>
      );

    case 'features':
      return (
        <section className={baseClasses}>
          <div className="container mx-auto px-4">
            <FeaturesSection content={content} />
          </div>
        </section>
      );

    case 'testimonials':
      return (
        <section className={baseClasses}>
          <div className="container mx-auto px-4">
            <TestimonialsSection content={content} />
          </div>
        </section>
      );

    case 'cta':
      return (
        <section className={baseClasses}>
          <div className="container mx-auto px-4">
            <CTASection content={content} />
          </div>
        </section>
      );

    case 'stats':
      return (
        <section className={baseClasses}>
          <div className="container mx-auto px-4">
            <StatsSection content={content} />
          </div>
        </section>
      );

    default:
      // Fallback: render as HTML content
      return (
        <section className={baseClasses}>
          <div className="container mx-auto px-4">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: content?.html || '' }}
            />
          </div>
        </section>
      );
  }
}

// Hero Section Component
function HeroSection({ content }: { content: any }) {
  return (
    <div className="text-center">
      {content?.title && <h1 className="text-4xl md:text-5xl font-bold mb-4">{content.title}</h1>}
      {content?.subtitle && (
        <p className="text-xl md:text-2xl text-gray-600 mb-6">{content.subtitle}</p>
      )}
      {content?.description && <p className="text-lg text-gray-500 mb-8">{content.description}</p>}
      {content?.ctaButtons && (
        <div className="flex flex-wrap justify-center gap-4">
          {content.ctaButtons.map((button: any, index: number) => (
            <a
              key={index}
              href={button.url}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {button.text}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// Text Section Component
function TextSection({ content }: { content: any }) {
  return (
    <div className="prose prose-lg max-w-none">
      {content?.html && <div dangerouslySetInnerHTML={{ __html: content.html }} />}
      {content?.text && <p className="text-lg">{content.text}</p>}
    </div>
  );
}

// Image Section Component
function ImageSection({ content }: { content: any }) {
  if (content?.images && Array.isArray(content.images)) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {content.images.map((image: any, index: number) => (
          <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
            <img src={image.url} alt={image.alt || ''} className="w-full h-full object-cover" />
            {image.caption && (
              <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
                {image.caption}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (content?.image) {
    return (
      <div className="text-center">
        <img
          src={content.image.url}
          alt={content.image.alt || ''}
          className="mx-auto rounded-lg max-w-full"
        />
        {content.image.caption && <p className="mt-4 text-gray-600">{content.image.caption}</p>}
      </div>
    );
  }

  return null;
}

// Features Section Component
function FeaturesSection({ content }: { content: any }) {
  if (!content?.features || !Array.isArray(content.features)) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {content.features.map((feature: any, index: number) => (
        <div key={index} className="text-center">
          {feature.icon && <div className="text-4xl mb-4">{feature.icon}</div>}
          {feature.title && <h3 className="text-xl font-bold mb-2">{feature.title}</h3>}
          {feature.description && <p className="text-gray-600">{feature.description}</p>}
        </div>
      ))}
    </div>
  );
}

// Testimonials Section Component
function TestimonialsSection({ content }: { content: any }) {
  if (!content?.testimonials || !Array.isArray(content.testimonials)) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {content.testimonials.map((testimonial: any, index: number) => (
        <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          {testimonial.quote && (
            <p className="text-gray-700 dark:text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
          )}
          {testimonial.author && <p className="font-semibold">{testimonial.author}</p>}
          {testimonial.role && <p className="text-sm text-gray-600">{testimonial.role}</p>}
        </div>
      ))}
    </div>
  );
}

// CTA Section Component
function CTASection({ content }: { content: any }) {
  return (
    <div className="text-center bg-blue-600 text-white py-12 px-4 rounded-lg">
      {content?.title && <h2 className="text-3xl font-bold mb-4">{content.title}</h2>}
      {content?.description && <p className="text-lg mb-6">{content.description}</p>}
      {content?.buttons && (
        <div className="flex flex-wrap justify-center gap-4">
          {content.buttons.map((button: any, index: number) => (
            <a
              key={index}
              href={button.url}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {button.text}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// Stats Section Component
function StatsSection({ content }: { content: any }) {
  if (!content?.stats || !Array.isArray(content.stats)) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {content.stats.map((stat: any, index: number) => (
        <div key={index} className="text-center">
          {stat.number && (
            <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
          )}
          {stat.label && <p className="text-gray-600">{stat.label}</p>}
        </div>
      ))}
    </div>
  );
}
