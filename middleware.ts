// =====================================================
// OPTIMIZED ROUTE PROTECTION MIDDLEWARE
// =====================================================
// Next.js middleware for route protection - PERFORMANCE OPTIMIZED
import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
// Pre-compiled route patterns for better performance
const PROTECTED_ROUTE_PATTERN = /^\/(admin|firma|api\/(projects|companies|v2))/;
const ADMIN_ROUTE_PATTERN = /^\/(admin|api\/admin)/;
const COMPANY_ROUTE_PATTERN = /^\/(firma|api\/firma)/;
const PUBLIC_ROUTE_PATTERN =
  /^\/(giris|kayit|sss|iletisim|program-hakkinda|platform-ozellikleri|destekler|basari-hikayeleri|kariyer|test-components|test-softui)$/;
const STATIC_PATTERN =
  /^\/(_next|static|favicon|api\/(auth|debug|upload|socket))/;
// Role-based access control - STANDARDIZED
const ADMIN_ROLES = new Set(['admin', 'master_admin', 'danisman']);
const COMPANY_ROLES = new Set(['firma_admin', 'firma_kullanici']);
const OBSERVER_ROLES = new Set(['gozlemci']);
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Fast path: Skip middleware for static files and public API routes
  if (STATIC_PATTERN.test(pathname)) {
    return NextResponse.next();
  }
  // Fast path: Check public routes first (most common case)
  if (pathname === '/' || PUBLIC_ROUTE_PATTERN.test(pathname)) {
    return NextResponse.next();
  }
  // Fast path: Check if route is protected
  if (!PROTECTED_ROUTE_PATTERN.test(pathname)) {
    return NextResponse.next();
  }

  // Auto-login token bypass removed for security

  // JWT token authentication
  const authToken = request.cookies.get('auth-token')?.value;
  
  // Fast path: No authentication
  if (!authToken) {
    return handleUnauthenticated(request, pathname);
  }

  // JWT token doğrula
  let userEmail: string | null = null;
  let userRole: string | null = null;
  
  try {
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET || 'your-secret-key-change-in-production') as any;
    userEmail = decoded.email;
    userRole = decoded.role;
  } catch (error) {
    // Token geçersiz - çıkış yap
    const response = NextResponse.redirect(new URL('/giris', request.url));
    response.cookies.delete('auth-token');
    return response;
  }
  // Fast path: Admin routes
  if (ADMIN_ROUTE_PATTERN.test(pathname)) {
    return handleAdminRoute(request, pathname, userRole);
  }
  // Fast path: Company routes
  if (COMPANY_ROUTE_PATTERN.test(pathname)) {
    return handleCompanyRoute(request, pathname, userRole);
  }
  // Default: Allow access
  return NextResponse.next();
}
// Optimized handlers
function handleUnauthenticated(request: NextRequest, pathname: string) {
  if (pathname.startsWith('/admin') || pathname.startsWith('/firma')) {
    const loginUrl = new URL('/giris', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  return NextResponse.next();
}
function handleAdminRoute(
  request: NextRequest,
  pathname: string,
  userRole: string | undefined
) {
  // Debug logging
  // Admin route access attempt
  if (!ADMIN_ROLES.has(userRole || '')) {
    // Unauthorized admin access blocked
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    // Redirect non-admin users to their appropriate dashboard
    if (COMPANY_ROLES.has(userRole || '')) {
      return NextResponse.redirect(new URL('/firma', request.url));
    }
    return NextResponse.redirect(new URL('/giris', request.url));
  }
  return NextResponse.next();
}
function handleCompanyRoute(
  request: NextRequest,
  pathname: string,
  userRole: string | undefined
) {
  if (!COMPANY_ROLES.has(userRole || '')) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Company access required' },
        { status: 403 }
      );
    }
    return NextResponse.redirect(new URL('/giris', request.url));
  }
  return NextResponse.next();
}
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
