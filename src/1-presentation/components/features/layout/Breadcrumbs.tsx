/**
 * Breadcrumbs Component
 * Dynamic breadcrumb navigation based on current path
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

// =====================================================
// TYPES
// =====================================================
interface BreadcrumbItem {
  label: string;
  href: string;
}

// =====================================================
// COMPONENT
// =====================================================
export function Breadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = generateBreadcrumbs(pathname);

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
      <Link
        href="/"
        className="flex items-center hover:text-gray-900 dark:hover:text-white transition-colors rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
        title="Ana Sayfa"
      >
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <React.Fragment key={crumb.href}>
            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            {isLast ? (
              <span className="font-medium text-gray-900 dark:text-white">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-gray-900 dark:hover:text-white transition-colors rounded-md px-1.5 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

// =====================================================
// HELPERS
// =====================================================
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  if (!pathname || pathname === '/') return [];

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = '';

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;

    // Skip UUIDs and 'new'/'edit' segments for cleaner breadcrumbs
    if (isUUID(segment)) {
      // For detail pages, show a generic label
      const prevSegment = segments[index - 1];
      breadcrumbs.push({
        label: getDetailLabel(prevSegment),
        href: currentPath,
      });
    } else {
      breadcrumbs.push({
        label: getSegmentLabel(segment),
        href: currentPath,
      });
    }
  });

  return breadcrumbs;
}

function getSegmentLabel(segment: string): string {
  const labelMap: Record<string, string> = {
    dashboard: 'Dashboard',
    programs: 'Programlar',
    companies: 'Firmalar',
    users: 'Kullanıcılar',
    tasks: 'Görevler',
    trainings: 'Eğitimler',
    reports: 'Raporlar',
    settings: 'Ayarlar',
    profile: 'Profil',
    new: 'Yeni',
    edit: 'Düzenle',
    'consultant-dashboard': 'Danışman Paneli',
    'company-dashboard': 'Firma Paneli',
  };

  return labelMap[segment] || capitalize(segment);
}

function getDetailLabel(parentSegment: string): string {
  const labelMap: Record<string, string> = {
    programs: 'Program Detayı',
    companies: 'Firma Detayı',
    users: 'Kullanıcı Detayı',
  };

  return labelMap[parentSegment] || 'Detay';
}

function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
