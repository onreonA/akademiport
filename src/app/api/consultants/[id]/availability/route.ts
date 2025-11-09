/**
 * Consultant Availability API Route
 * GET, POST /api/consultants/[id]/availability
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/4-infrastructure/api/helpers/auth';
import { UserRole } from '@/domain/enums/UserRole';
import { AvailabilityRepository } from '@/4-infrastructure/database/repositories/AvailabilityRepository';
import { ManageAvailabilityUseCase } from '@/application/use-cases/availability';
import { logger } from '@/shared/utils/logger';

const availabilityRepository = new AvailabilityRepository();
const manageAvailabilityUseCase = new ManageAvailabilityUseCase(availabilityRepository);

/**
 * GET /api/consultants/[id]/availability
 * Get consultant availability rules
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: consultantId } = await params;
    const user = await requireAuth(request);
    const userRole = user.role as UserRole;

    // Authorization: Consultant can view their own, admins can view all
    if (userRole === UserRole.CONSULTANT && user.id !== consultantId) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const programId = searchParams.get('programId') || undefined;

    const result = await manageAvailabilityUseCase.getAvailabilityByConsultant(
      consultantId,
      programId === 'null' ? null : programId || null
    );

    if (result.isFailure) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.value || [],
    });
  } catch (error) {
    logger.error('Error in GET /api/consultants/[id]/availability:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/consultants/[id]/availability
 * Create new availability rule
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: consultantId } = await params;
    logger.info('POST /api/consultants/[id]/availability - consultantId:', consultantId);

    const user = await requireAuth(request);
    const userRole = user.role as UserRole;
    logger.info('POST /api/consultants/[id]/availability - user:', { id: user.id, role: userRole });

    // Authorization: Consultant can create their own, admins can create for any
    if (userRole === UserRole.CONSULTANT && user.id !== consultantId) {
      logger.warn('POST /api/consultants/[id]/availability - Unauthorized access attempt');
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const body = await request.json();
    logger.info('POST /api/consultants/[id]/availability - body:', body);

    const createData = {
      consultantId,
      dayOfWeek: body.dayOfWeek,
      startTime: body.startTime,
      endTime: body.endTime,
      validFrom: body.validFrom ? new Date(body.validFrom) : null,
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
      programId: body.programId || null,
    };
    logger.info('POST /api/consultants/[id]/availability - createData:', createData);

    const result = await manageAvailabilityUseCase.createAvailability(createData);
    logger.info('POST /api/consultants/[id]/availability - result:', {
      isSuccess: result.isSuccess,
      isFailure: result.isFailure,
      error: result.isFailure ? result.error : null,
    });

    if (result.isFailure) {
      const errorMessage = result.error?.message || 'Müsaitlik kuralı oluşturulamadı';
      logger.error('POST /api/consultants/[id]/availability - Error:', errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    logger.info('POST /api/consultants/[id]/availability - Success:', result.value);
    return NextResponse.json(
      {
        success: true,
        data: result.value,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error in POST /api/consultants/[id]/availability:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
