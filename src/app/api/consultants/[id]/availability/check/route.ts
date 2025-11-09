/**
 * Check Consultant Availability API Route
 * GET /api/consultants/[id]/availability/check
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/4-infrastructure/api/helpers/auth';
import { AvailabilityRepository } from '@/4-infrastructure/database/repositories/AvailabilityRepository';
import { CheckAvailabilityUseCase } from '@/application/use-cases/availability';
import { logger } from '@/shared/utils/logger';

const availabilityRepository = new AvailabilityRepository();
const checkAvailabilityUseCase = new CheckAvailabilityUseCase(availabilityRepository);

/**
 * GET /api/consultants/[id]/availability/check
 * Check if consultant is available for a given time slot
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: consultantId } = await params;
    await requireAuth(request); // Any authenticated user can check availability

    const searchParams = request.nextUrl.searchParams;
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const programId = searchParams.get('programId') || undefined;

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: 'startTime ve endTime parametreleri zorunludur' },
        { status: 400 }
      );
    }

    const result = await checkAvailabilityUseCase.execute({
      consultantId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      programId: programId === 'null' ? null : programId || null,
    });

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.value,
    });
  } catch (error) {
    logger.error('Error in GET /api/consultants/[id]/availability/check:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
