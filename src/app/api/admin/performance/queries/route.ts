/**
 * GET /api/admin/performance/queries
 * Get slow query statistics (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryPerformanceTracker } from '@/5-shared/middleware/query-performance';
import { withApiHandler } from '@/5-shared/middleware/api-wrapper';

export const GET = withApiHandler(
  async (request: NextRequest, user) => {
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Check if user is admin
    if (user.role !== 'master_admin') {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const slowQueries = queryPerformanceTracker.getSlowQueries(limit);
    const statistics = queryPerformanceTracker.getStatistics();

    return NextResponse.json({
      slowQueries,
      statistics,
    });
  },
  {
    requireAuth: true,
    allowedRoles: ['master_admin'],
    rateLimitType: 'authenticated',
  }
);
