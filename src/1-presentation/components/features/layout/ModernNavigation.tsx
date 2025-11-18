/**
 * Modern Navigation Component
 * Public website navigation bar
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, LogIn, Globe } from 'lucide-react';
import { Button } from '@/1-presentation/components/ui/atoms/button';
import { cn } from '@/1-presentation/lib/utils';

export function ModernNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Anasayfa' },
    { href: '/program-hakkinda', label: 'Program Hakkında' },
    { href: '/destekler', label: 'Destekler' },
    { href: '/platform-ozellikleri', label: 'Platform Özellikleri' },
    { href: '/basari-hikayeleri', label: 'Başarı Hikayeleri' },
    { href: '/sss', label: 'SSS' },
    { href: '/iletisim-basvuru', label: 'İletişim & Başvuru' },
    { href: '/kariyer', label: 'Kariyer' },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
              <Globe className="text-white w-6 h-6" />
            </div>
            <div>
              <span className="font-black text-xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent tracking-tight">
                AKADEMİ PORT
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg whitespace-nowrap',
                    isActive
                      ? 'text-blue-900 bg-blue-50'
                      : 'text-gray-800 hover:text-blue-900 hover:bg-blue-50'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="flex items-center space-x-4">
            <Button
              asChild
              size="icon"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl"
            >
              <Link href="/login" title="Giriş Yap">
                <LogIn className="w-5 h-5" />
              </Link>
            </Button>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      'px-4 py-2 text-sm font-medium transition-colors rounded-lg',
                      isActive
                        ? 'text-blue-900 bg-blue-50'
                        : 'text-gray-800 hover:text-blue-900 hover:bg-blue-50'
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
