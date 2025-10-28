import * as React from 'react';
import { cn } from '@/presentation/lib/utils';
import { Button } from '../atoms/button';

export interface PublicLayoutProps {
  children: React.ReactNode;
  logo?: React.ReactNode;
  navigation?: {
    label: string;
    href: string;
    active?: boolean;
  }[];
  onNavigationClick?: (href: string) => void;
  showCTA?: boolean;
  ctaLabel?: string;
  onCTAClick?: () => void;
  footer?: React.ReactNode;
  className?: string;
}

const PublicLayout = React.forwardRef<HTMLDivElement, PublicLayoutProps>(
  (
    {
      children,
      logo,
      navigation = [],
      onNavigationClick,
      showCTA = true,
      ctaLabel = 'Get Started',
      onCTAClick,
      footer,
      className,
    },
    ref
  ) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    return (
      <div ref={ref} className={cn('min-h-screen flex flex-col', className)}>
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              {logo || (
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Akademi Port
                </h1>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item, index) => (
                <button
                  key={index}
                  onClick={() => onNavigationClick?.(item.href)}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    item.active ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </button>
              ))}
              {showCTA && <Button onClick={onCTAClick}>{ctaLabel}</Button>}
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t">
              <nav className="container py-4 flex flex-col gap-4">
                {navigation.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onNavigationClick?.(item.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      'text-sm font-medium text-left transition-colors hover:text-primary',
                      item.active ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
                {showCTA && (
                  <Button onClick={onCTAClick} className="w-full">
                    {ctaLabel}
                  </Button>
                )}
              </nav>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        {footer && (
          <footer className="border-t bg-muted/50">
            <div className="container py-8">{footer}</div>
          </footer>
        )}
      </div>
    );
  }
);
PublicLayout.displayName = 'PublicLayout';

export { PublicLayout };
