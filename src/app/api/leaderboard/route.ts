import { NextRequest, NextResponse } from 'next/server';
import { SupabaseLeaderboardRepository } from '@/4-infrastructure/database/repositories/SupabaseLeaderboardRepository';
import { GetLeaderboardUseCase } from '@/2-application/use-cases/leaderboard';
import { LeaderboardFilterDtoSchema } from '@/2-application/dtos/leaderboard';
import { withApiHandler } from '@/5-shared/middleware/api-wrapper';

/**
 * GET /api/leaderboard
 * Get leaderboard rankings
 */
export const GET = withApiHandler(
  async (request: NextRequest, user) => {
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams;

    // Parse pagination parameters
    const { page, limit, offset } = parsePaginationParams(searchParams, {
      page: 1,
      limit: 50,
      maxLimit: 100,
    });

    const filterData = {
      programId: searchParams.get('programId') || undefined,
      companyId: searchParams.get('companyId') || undefined,
      limit,
      offset,
    };

    const filterResult = LeaderboardFilterDtoSchema.safeParse(filterData);
    if (!filterResult.success) {
      return NextResponse.json(
        { error: 'Geçersiz filtre parametreleri', details: filterResult.error.issues },
        { status: 400 }
      );
    }

    const repository = new SupabaseLeaderboardRepository();
    const useCase = new GetLeaderboardUseCase(repository);
    const result = await useCase.execute(filterResult.data);

    if (result.isFailure) {
      return NextResponse.json({ error: result.error?.message || result.error }, { status: 400 });
    }

    // Apply field selection if requested
    const fieldsParam = searchParams.get('fields');
    const rankings = fieldsParam
      ? applyFieldSelection(result.value, fieldsParam, {
          defaultFields: ['rank', 'companyName', 'totalScore'],
          requiredFields: ['rank', 'companyId'],
        })
      : result.value;

    // Return paginated response
    return NextResponse.json(createPaginatedResponse(rankings, rankings.length, page, limit));
  },
  {
    requireAuth: true,
    rateLimitType: 'authenticated',
  }
);
