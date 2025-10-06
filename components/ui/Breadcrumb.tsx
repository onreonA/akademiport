'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumb from pathname if no items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Admin Panel
    if (pathSegments[0] === 'admin') {
      breadcrumbs.push({
        label: 'Admin Panel',
        href: '/admin',
        icon: 'ri-dashboard-line',
      });
    }

    // Project Management
    if (pathSegments[1] === 'proje-yonetimi') {
      breadcrumbs.push({
        label: 'Proje Yönetimi',
        href: '/admin/proje-yonetimi',
        icon: 'ri-folder-line',
      });
    }

    // Dashboard
    if (pathSegments[2] === 'dashboard') {
      breadcrumbs.push({
        label: 'Dashboard',
        href: '/admin/proje-yonetimi/dashboard',
        icon: 'ri-bar-chart-line',
      });
    }

    // Project Detail
    if (pathSegments[2] && pathSegments[2] !== 'dashboard') {
      breadcrumbs.push({
        label: 'Proje Detayı',
        icon: 'ri-file-text-line',
      });
    }

    // Sub-projects
    if (pathSegments[3] === 'alt-projeler') {
      breadcrumbs.push({
        label: 'Alt Projeler',
        href: `/admin/proje-yonetimi/${pathSegments[2]}/alt-projeler`,
        icon: 'ri-folder-open-line',
      });
    }

    // Sub-project Detail
    if (pathSegments[4]) {
      breadcrumbs.push({
        label: 'Alt Proje Detayı',
        icon: 'ri-file-list-line',
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav
      className={`flex items-center space-x-2 text-sm ${className}`}
      aria-label='Breadcrumb'
    >
      <ol className='flex items-center space-x-2'>
        {breadcrumbs.map((item, index) => (
          <li key={index} className='flex items-center'>
            {index > 0 && (
              <i className='ri-arrow-right-s-line text-gray-400 mx-2'></i>
            )}

            {item.href ? (
              <Link
                href={item.href}
                className='flex items-center text-gray-600 hover:text-blue-600 transition-colors'
              >
                {item.icon && <i className={`${item.icon} mr-1.5 text-sm`}></i>}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className='flex items-center text-gray-900 font-medium'>
                {item.icon && <i className={`${item.icon} mr-1.5 text-sm`}></i>}
                <span>{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
