import * as React from 'react';
import { cn } from '@/presentation/lib/utils';

export interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  logo?: React.ReactNode;
  footer?: React.ReactNode;
  backgroundImage?: string;
  className?: string;
}

const AuthLayout = React.forwardRef<HTMLDivElement, AuthLayoutProps>(
  (
    {
      children,
      title = 'Akademi Port',
      description = 'E-İhracat Dönüşüm Platformu',
      logo,
      footer,
      backgroundImage,
      className,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('min-h-screen flex items-center justify-center p-4', className)}
        style={
          backgroundImage
            ? {
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      >
        {/* Background overlay */}
        {backgroundImage && <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />}

        {/* Content */}
        <div className="relative w-full max-w-md">
          <div className="bg-background border rounded-lg shadow-lg p-8">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              {logo || (
                <div className="mb-4">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {title}
                  </h1>
                </div>
              )}
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>

            {/* Form Content */}
            <div>{children}</div>

            {/* Footer */}
            {footer && (
              <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);
AuthLayout.displayName = 'AuthLayout';

export { AuthLayout };
