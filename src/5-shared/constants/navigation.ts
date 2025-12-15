/**
 * Navigation Configuration
 * Role-based menu items for different user types
 */

import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  Users,
  FileText,
  GraduationCap,
  BarChart3,
  Settings,
  User,
  ListTodo,
  FileStack,
  Calendar,
  CalendarCheck,
  Clock,
  Newspaper,
  MessageSquare,
  Trophy,
  ShoppingCart,
  Globe,
  type LucideIcon,
} from 'lucide-react';
import { UserRole } from '@/domain/enums/UserRole';

// =====================================================
// TYPES
// =====================================================
export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: string | number;
  children?: NavigationSubItem[];
}

export interface NavigationSubItem {
  id: string;
  label: string;
  href: string;
  badge?: string | number;
}

export interface NavigationConfig {
  main: NavigationItem[];
  bottom: NavigationItem[];
}

// =====================================================
// MASTER ADMIN NAVIGATION
// =====================================================
export const MASTER_ADMIN_NAVIGATION: NavigationConfig = {
  main: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      id: 'programs',
      label: 'Programlar',
      icon: FolderKanban,
      href: '/dashboard/programs',
      children: [
        {
          id: 'programs-all',
          label: 'Tüm Programlar',
          href: '/dashboard/programs',
        },
        {
          id: 'programs-new',
          label: 'Yeni Program',
          href: '/dashboard/programs/new',
        },
      ],
    },
    {
      id: 'companies',
      label: 'Firmalar',
      icon: Building2,
      href: '/dashboard/companies',
      children: [
        {
          id: 'companies-all',
          label: 'Tüm Firmalar',
          href: '/dashboard/companies',
        },
        {
          id: 'companies-new',
          label: 'Yeni Firma',
          href: '/dashboard/companies/new',
        },
      ],
    },
    {
      id: 'users',
      label: 'Kullanıcılar',
      icon: Users,
      href: '/dashboard/users',
      children: [
        {
          id: 'users-all',
          label: 'Tüm Kullanıcılar',
          href: '/dashboard/users',
        },
        {
          id: 'users-new',
          label: 'Yeni Kullanıcı',
          href: '/dashboard/users/new',
        },
      ],
    },
    {
      id: 'projects',
      label: 'Projeler',
      icon: FileText,
      href: '/dashboard/projects',
      children: [
        {
          id: 'projects-all',
          label: 'Tüm Projeler',
          href: '/dashboard/projects',
        },
        {
          id: 'projects-deleted',
          label: 'Silinen Projeler',
          href: '/dashboard/projects/deleted',
        },
      ],
    },
    {
      id: 'trainings',
      label: 'Eğitimler',
      icon: GraduationCap,
      href: '/dashboard/trainings',
      children: [
        {
          id: 'trainings-all',
          label: 'Tüm Eğitimler',
          href: '/dashboard/trainings',
        },
        {
          id: 'trainings-new',
          label: 'Yeni Eğitim',
          href: '/dashboard/trainings/new',
        },
      ],
    },
    {
      id: 'events',
      label: 'Etkinlikler',
      icon: Calendar,
      href: '/dashboard/events',
      children: [
        {
          id: 'events-all',
          label: 'Tüm Etkinlikler',
          href: '/dashboard/events',
        },
        {
          id: 'events-new',
          label: 'Yeni Etkinlik',
          href: '/dashboard/events/new',
        },
      ],
    },
    {
      id: 'appointments',
      label: 'Randevular',
      icon: CalendarCheck,
      href: '/dashboard/appointments',
    },
    {
      id: 'news',
      label: 'Haberler',
      icon: Newspaper,
      href: '/admin-dashboard/news',
      children: [
        {
          id: 'news-all',
          label: 'Tüm Haberler',
          href: '/admin-dashboard/news',
        },
        {
          id: 'news-new',
          label: 'Yeni Haber',
          href: '/admin-dashboard/news/new',
        },
      ],
    },
    {
      id: 'forum',
      label: 'Forum',
      icon: MessageSquare,
      href: '/admin-dashboard/forum',
      children: [
        {
          id: 'forum-topics',
          label: 'Konular',
          href: '/admin-dashboard/forum',
        },
        {
          id: 'forum-categories',
          label: 'Kategoriler',
          href: '/admin-dashboard/forum/categories',
        },
      ],
    },
    {
      id: 'leaderboard',
      label: 'Liderlik Tablosu',
      icon: Trophy,
      href: '/admin-dashboard/leaderboard',
      children: [
        {
          id: 'leaderboard-rankings',
          label: 'Sıralama',
          href: '/admin-dashboard/leaderboard',
        },
        {
          id: 'leaderboard-badges',
          label: 'Rozet Yönetimi',
          href: '/admin-dashboard/leaderboard/badges',
        },
      ],
    },
    {
      id: 'ecommerce',
      label: 'E-ticaret',
      icon: ShoppingCart,
      href: '/admin-dashboard/ecommerce',
    },
    {
      id: 'ministry',
      label: 'Bakanlık Dashboard',
      icon: BarChart3,
      href: '/admin-dashboard/ministry',
    },
    {
      id: 'project-templates',
      label: 'Proje Şablonları',
      icon: FileStack,
      href: '/dashboard/project-templates',
      children: [
        {
          id: 'project-templates-all',
          label: 'Tüm Şablonlar',
          href: '/dashboard/project-templates',
        },
        {
          id: 'project-templates-new',
          label: 'Yeni Şablon',
          href: '/dashboard/project-templates/new',
        },
      ],
    },
    {
      id: 'reports',
      label: 'Raporlar',
      icon: BarChart3,
      href: '/dashboard/reports',
      children: [
        {
          id: 'reports-all',
          label: 'AI Raporlar',
          href: '/dashboard/reports',
        },
        {
          id: 'reports-generate',
          label: 'Yeni Rapor Oluştur',
          href: '/dashboard/reports/generate',
        },
        {
          id: 'custom-reports-all',
          label: 'Özel Raporlar',
          href: '/dashboard/custom-reports',
        },
        {
          id: 'custom-reports-new',
          label: 'Yeni Özel Rapor',
          href: '/dashboard/custom-reports/new',
        },
      ],
    },
    {
      id: 'cms',
      label: 'CMS',
      icon: Globe,
      href: '/dashboard/cms/pages',
      children: [
        {
          id: 'cms-pages',
          label: 'Sayfalar',
          href: '/dashboard/cms/pages',
        },
        {
          id: 'cms-media',
          label: 'Medya',
          href: '/dashboard/cms/media',
        },
        {
          id: 'cms-settings',
          label: 'Site Ayarları',
          href: '/dashboard/cms/settings',
        },
      ],
    },
  ],
  bottom: [
    {
      id: 'settings',
      label: 'Ayarlar',
      icon: Settings,
      href: '/dashboard/settings',
    },
  ],
};

// =====================================================
// CONSULTANT NAVIGATION
// =====================================================
export const CONSULTANT_NAVIGATION: NavigationConfig = {
  main: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/consultant-dashboard',
    },
    {
      id: 'programs',
      label: 'Programlarım',
      icon: FolderKanban,
      href: '/consultant-dashboard/programs',
    },
    {
      id: 'companies',
      label: 'Firmalar',
      icon: Building2,
      href: '/consultant-dashboard/companies',
    },
    {
      id: 'projects',
      label: 'Projeler',
      icon: FileText,
      href: '/consultant-dashboard/projects',
      children: [
        {
          id: 'projects-all',
          label: 'Tüm Projeler',
          href: '/consultant-dashboard/projects',
        },
        {
          id: 'projects-new',
          label: 'Yeni Proje',
          href: '/consultant-dashboard/projects/new',
        },
      ],
    },
    {
      id: 'tasks',
      label: 'Görevler',
      icon: ListTodo,
      href: '/consultant-dashboard/tasks',
      badge: 'Yakında',
    },
    {
      id: 'trainings',
      label: 'Eğitimler',
      icon: GraduationCap,
      href: '/consultant-dashboard/trainings',
      badge: 'Yakında',
    },
    {
      id: 'events',
      label: 'Etkinlikler',
      icon: Calendar,
      href: '/consultant-dashboard/events',
    },
    {
      id: 'appointments',
      label: 'Randevular',
      icon: CalendarCheck,
      href: '/consultant-dashboard/appointments',
    },
    {
      id: 'availability',
      label: 'Müsaitlik',
      icon: Clock,
      href: '/consultant-dashboard/availability',
    },
    {
      id: 'news',
      label: 'Haberler',
      icon: Newspaper,
      href: '/consultant-dashboard/news',
    },
    {
      id: 'forum',
      label: 'Forum',
      icon: MessageSquare,
      href: '/consultant-dashboard/forum',
      children: [
        {
          id: 'forum-topics',
          label: 'Konular',
          href: '/consultant-dashboard/forum',
        },
        {
          id: 'forum-categories',
          label: 'Kategoriler',
          href: '/consultant-dashboard/forum/categories',
        },
      ],
    },
    {
      id: 'leaderboard',
      label: 'Liderlik Tablosu',
      icon: Trophy,
      href: '/consultant-dashboard/leaderboard',
    },
    {
      id: 'ecommerce',
      label: 'E-ticaret',
      icon: ShoppingCart,
      href: '/consultant-dashboard/ecommerce',
    },
    {
      id: 'reports',
      label: 'Raporlarım',
      icon: BarChart3,
      href: '/consultant-dashboard/reports',
    },
  ],
  bottom: [
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
      href: '/profile',
    },
  ],
};

// =====================================================
// COMPANY ADMIN NAVIGATION
// =====================================================
export const COMPANY_ADMIN_NAVIGATION: NavigationConfig = {
  main: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/company-dashboard',
    },
    {
      id: 'users',
      label: 'Kullanıcılar',
      icon: Users,
      href: '/company-dashboard/users',
    },
    {
      id: 'projects',
      label: 'Projeler',
      icon: FileText,
      href: '/company-dashboard/projects',
      badge: 'Yakında',
    },
    {
      id: 'trainings',
      label: 'Eğitimler',
      icon: GraduationCap,
      href: '/company-dashboard/trainings',
      badge: 'Yakında',
    },
    {
      id: 'events',
      label: 'Etkinlikler',
      icon: Calendar,
      href: '/company-dashboard/events',
    },
    {
      id: 'appointments',
      label: 'Randevular',
      icon: CalendarCheck,
      href: '/company-dashboard/appointments',
    },
    {
      id: 'news',
      label: 'Haberler',
      icon: Newspaper,
      href: '/company-dashboard/news',
    },
    {
      id: 'forum',
      label: 'Forum',
      icon: MessageSquare,
      href: '/company-dashboard/forum',
      children: [
        {
          id: 'forum-topics',
          label: 'Konular',
          href: '/company-dashboard/forum',
        },
        {
          id: 'forum-categories',
          label: 'Kategoriler',
          href: '/company-dashboard/forum/categories',
        },
      ],
    },
    {
      id: 'leaderboard',
      label: 'Liderlik Tablosu',
      icon: Trophy,
      href: '/company-dashboard/leaderboard',
    },
    {
      id: 'ecommerce',
      label: 'E-ticaret Metrikleri',
      icon: ShoppingCart,
      href: '/company-dashboard/ecommerce',
    },
    {
      id: 'reports',
      label: 'Raporlar',
      icon: BarChart3,
      href: '/company-dashboard/reports',
    },
  ],
  bottom: [
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
      href: '/profile',
    },
    {
      id: 'settings',
      label: 'Firma Ayarları',
      icon: Settings,
      href: '/company-dashboard/settings',
    },
  ],
};

// =====================================================
// COMPANY USER NAVIGATION
// =====================================================
export const COMPANY_USER_NAVIGATION: NavigationConfig = {
  main: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/company-dashboard',
    },
    {
      id: 'projects',
      label: 'Projelerim',
      icon: FileText,
      href: '/company-dashboard/projects',
      badge: 'Yakında',
    },
    {
      id: 'trainings',
      label: 'Eğitimlerim',
      icon: GraduationCap,
      href: '/company-dashboard/trainings',
      badge: 'Yakında',
    },
    {
      id: 'events',
      label: 'Etkinlikler',
      icon: Calendar,
      href: '/company-dashboard/events',
    },
    {
      id: 'appointments',
      label: 'Randevular',
      icon: CalendarCheck,
      href: '/company-dashboard/appointments',
    },
    {
      id: 'news',
      label: 'Haberler',
      icon: Newspaper,
      href: '/company-dashboard/news',
    },
    {
      id: 'forum',
      label: 'Forum',
      icon: MessageSquare,
      href: '/company-dashboard/forum',
    },
  ],
  bottom: [
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
      href: '/profile',
    },
  ],
};

// =====================================================
// HELPER FUNCTION
// =====================================================
export function getNavigationByRole(role: UserRole): NavigationConfig {
  switch (role) {
    case UserRole.MASTER_ADMIN:
    case UserRole.PROGRAM_MANAGER:
      return MASTER_ADMIN_NAVIGATION;
    case UserRole.CONSULTANT:
      return CONSULTANT_NAVIGATION;
    case UserRole.COMPANY_ADMIN:
      return COMPANY_ADMIN_NAVIGATION;
    case UserRole.COMPANY_USER:
    case UserRole.OBSERVER:
      return COMPANY_USER_NAVIGATION;
    default:
      return COMPANY_USER_NAVIGATION;
  }
}
