/**
 * POST /api/admin/cache/clear
 * Clear cache (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { cacheManager } from '@/5-shared/cache/cache-manager';
import { withApiHandler } from '@/5-shared/middleware/api-wrapper';

export const POST = withApiHandler(
  async (request: NextRequest, user) => {
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Check if user is admin
    if (user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const pattern = body.pattern;

    try {
      if (pattern) {
        await cacheManager.deletePattern(pattern);
        return NextResponse.json({
          message: `Cache cleared for pattern: ${pattern}`,
        });
      } else {
        await cacheManager.clear();
        return NextResponse.json({
          message: 'All cache cleared',
        });
      }
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Cache clear failed',
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  },
  {
    requireAuth: true,
    allowedRoles: ['master_admin'],
    rateLimitType: 'authenticated',
  }
);
