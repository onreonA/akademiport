/**
 * API Route Wrapper
 *
 * Rate limiting, authentication ve error handling için wrapper
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/4-infrastructure/database/supabase-server';
import { rateLimitMiddleware, getRateLimitConfig } from './rate-limiter';
import { csrfProtection, initializeCsrfToken } from './csrf';
import { logger } from '@/5-shared/utils/logger';

export interface ApiHandlerOptions {
  requireAuth?: boolean;
  allowedRoles?: string[];
  rateLimitType?: 'public' | 'authenticated' | 'write' | 'ai';
}

export type ApiHandler = (
  request: NextRequest,
  user?: { id: string; email: string; role: string; companyId?: string }
) => Promise<NextResponse>;

/**
 * API route wrapper with rate limiting and authentication
 */
export function withApiHandler(
  handler: ApiHandler,
  options: ApiHandlerOptions = {}
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    try {
      // CSRF Protection (for state-changing methods)
      const csrfCheck = await csrfProtection(request);
      if (!csrfCheck.valid) {
        return csrfCheck.response!;
      }

      // Rate limiting
      const endpoint = request.nextUrl.pathname;
      const method = request.method;
      const rateLimitType = options.rateLimitType || getRateLimitConfig(endpoint, method);

      // Check rate limit (before auth to prevent auth bypass)
      const rateLimitResponse = rateLimitMiddleware(request, rateLimitType);
      if (rateLimitResponse) {
        return rateLimitResponse;
      }

      // Initialize CSRF token if needed (for GET requests)
      let response: NextResponse | null = null;
      if (method === 'GET') {
        response = NextResponse.next();
        await initializeCsrfToken(request, response);
      }

      // Authentication
      let user: { id: string; email: string; role: string; companyId?: string } | undefined;

      if (options.requireAuth !== false) {
        const supabase = await createClient();
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
        }

        // Get user role and company from database
        const { data: userData } = await supabase
          .from('users')
          .select('role, company_id')
          .eq('id', authUser.id)
          .single();

        user = {
          id: authUser.id,
          email: authUser.email!,
          role: userData?.role || 'company_user',
          companyId: userData?.company_id,
        };

        // Role-based authorization
        if (options.allowedRoles && !options.allowedRoles.includes(user.role)) {
          return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
        }

        // Update rate limit with user ID for better tracking
        const userRateLimitResponse = rateLimitMiddleware(request, rateLimitType, user.id);
        if (userRateLimitResponse) {
          return userRateLimitResponse;
        }
      }

      // Execute handler
      const handlerResponse = await handler(request, user);

      // Initialize CSRF token in response if not already set
      if (method === 'GET' && response) {
        // Copy CSRF cookie from response if set
        const csrfCookie = response.cookies.get('csrf-token');
        if (csrfCookie) {
          handlerResponse.cookies.set('csrf-token', csrfCookie.value, csrfCookie);
        }
      } else if (method === 'GET') {
        // Initialize CSRF token for GET requests
        await initializeCsrfToken(request, handlerResponse);
      }

      return handlerResponse;
    } catch (error) {
      logger.error('API handler error:', error);

      // Don't expose internal errors in production
      const message =
        process.env.NODE_ENV === 'production'
          ? 'Bir hata oluştu'
          : error instanceof Error
            ? error.message
            : 'Bilinmeyen hata';

      return NextResponse.json({ error: message }, { status: 500 });
    }
  };
}
