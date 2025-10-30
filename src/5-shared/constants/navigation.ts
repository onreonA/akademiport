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
  Plus,
  ListTodo,
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
      id: 'reports',
      label: 'Raporlar',
      icon: BarChart3,
      href: '/dashboard/reports',
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
