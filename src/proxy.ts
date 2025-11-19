/**
 * Proxy (Next.js 16+)
 *
 * Route protection ve authentication kontrolü
 * Not: middleware.ts yerine proxy.ts kullanılıyor (Next.js 16 standardı)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Security headers ekle
 */
function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Content Security Policy (CSP)
  // Not: CSP çok katı olabilir, production'da test edilmeli
  if (process.env.NODE_ENV === 'production') {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://cdn.mixpanel.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com https://api.mixpanel.com https://*.supabase.co",
      "frame-src 'self' https://www.google.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      'upgrade-insecure-requests',
    ].join('; ');
    response.headers.set('Content-Security-Policy', csp);
  }
}

export async function proxy(request: NextRequest) {
  // Public pages - authentication gerektirmez
  const isPublicPage =
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname.startsWith('/components-demo') ||
    request.nextUrl.pathname.startsWith('/public') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/public') ||
    request.nextUrl.pathname.startsWith('/api/auth'); // Auth endpoints public

  // Public page ise direkt geç
  if (isPublicPage) {
    const response = NextResponse.next();
    // Security headers ekle
    addSecurityHeaders(response);
    return response;
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Security headers ekle
  addSecurityHeaders(response);

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Get user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isAuthPage =
      request.nextUrl.pathname.startsWith('/auth') ||
      request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/register' ||
      request.nextUrl.pathname.startsWith('/forgot-password') ||
      request.nextUrl.pathname.startsWith('/reset-password') ||
      request.nextUrl.pathname.startsWith('/verify-email');

    // Redirect authenticated users away from auth pages
    if (user && isAuthPage) {
      // Get user role to redirect to appropriate dashboard
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = userData?.role || 'company_user';

      if (role === 'master_admin' || role === 'program_manager') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else if (role === 'consultant') {
        return NextResponse.redirect(new URL('/consultant-dashboard', request.url));
      } else if (role === 'company_user') {
        return NextResponse.redirect(new URL('/company-dashboard', request.url));
      }

      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Redirect unauthenticated users to login (except public pages)
    if (!user && !isAuthPage) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Role-based access control
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = userData?.role || 'company_user';
      const pathname = request.nextUrl.pathname;

      // Master Admin and Program Manager can access /dashboard
      if (pathname.startsWith('/dashboard')) {
        if (role !== 'master_admin' && role !== 'program_manager') {
          // Redirect to appropriate dashboard
          if (role === 'consultant') {
            return NextResponse.redirect(new URL('/consultant-dashboard', request.url));
          } else if (role === 'company_user') {
            return NextResponse.redirect(new URL('/company-dashboard', request.url));
          }
        }
      }

      // Consultant can only access /consultant-dashboard
      if (pathname.startsWith('/consultant-dashboard')) {
        if (role !== 'consultant') {
          if (role === 'master_admin' || role === 'program_manager') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
          } else if (role === 'company_user') {
            return NextResponse.redirect(new URL('/company-dashboard', request.url));
          }
        }
      }

      // Company User can only access /company-dashboard
      if (pathname.startsWith('/company-dashboard')) {
        if (role !== 'company_user') {
          if (role === 'master_admin' || role === 'program_manager') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
          } else if (role === 'consultant') {
            return NextResponse.redirect(new URL('/consultant-dashboard', request.url));
          }
        }
      }
    }

    return response;
  } catch (error) {
    console.error('Proxy error:', error);
    // Hata durumunda public page'lere izin ver
    if (isPublicPage) {
      return NextResponse.next();
    }
    // Diğer sayfalarda login'e yönlendir
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
