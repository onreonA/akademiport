/**
 * useRecentPages Hook
 * Track and retrieve recently visited pages
 */

'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const MAX_RECENT_PAGES = 5;
const STORAGE_KEY = 'recent-pages';

export interface RecentPage {
  path: string;
  title: string;
  timestamp: number;
}

export function useRecentPages() {
  const [recentPages, setRecentPages] = useState<RecentPage[]>([]);
  const pathname = usePathname();

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecentPages(JSON.parse(stored));
      } catch {
        setRecentPages([]);
      }
    }
  }, []);

  // Add current page to recent pages
  useEffect(() => {
    if (!pathname || pathname === '/login' || pathname === '/') return;

    const title = getPageTitle(pathname);
    const newPage: RecentPage = {
      path: pathname,
      title,
      timestamp: Date.now(),
    };

    setRecentPages((prev) => {
      // Remove if already exists
      const filtered = prev.filter((p) => p.path !== pathname);
      // Add to beginning
      const updated = [newPage, ...filtered].slice(0, MAX_RECENT_PAGES);
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [pathname]);

  return recentPages;
}

// Helper to generate page title from pathname
function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length === 0) return 'Ana Sayfa';
  
  const lastSegment = segments[segments.length - 1];
  
  // Special cases
  const titleMap: Record<string, string> = {
    'dashboard': 'Dashboard',
    'programs': 'Programlar',
    'companies': 'Firmalar',
    'users': 'Kullanıcılar',
    'tasks': 'Görevler',
    'trainings': 'Eğitimler',
    'reports': 'Raporlar',
    'settings': 'Ayarlar',
    'profile': 'Profil',
    'new': 'Yeni Kayıt',
    'edit': 'Düzenle',
    'consultant-dashboard': 'Danışman Paneli',
    'company-dashboard': 'Firma Paneli',
  };

  return titleMap[lastSegment] || capitalize(lastSegment);
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

