import { NextRequest, NextResponse } from 'next/server';
import { AppointmentRepository } from '@/infrastructure/database/repositories/AppointmentRepository';
import { ApproveAppointmentUseCase } from '@/application/use-cases/appointment';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { logger } from '@/shared/utils/logger';
import { ApproveAppointmentDtoSchema } from '@/application/dto/appointment';
import { UserRole } from '@/domain/enums/UserRole';

const appointmentRepository = new AppointmentRepository();

/**
 * POST /api/appointments/[id]/approve
 * Approve an appointment (Consultant only)
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only Consultant can approve appointments
    if (user.role !== UserRole.CONSULTANT) {
      return NextResponse.json(
        { error: 'Sadece danışmanlar randevu onaylayabilir' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if appointment exists and belongs to this consultant
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (appointment.consultantId !== user.id) {
      return NextResponse.json({ error: 'Bu randevuyu onaylama yetkiniz yok' }, { status: 403 });
    }

    // Parse request body (optional - notes field)
    let body = {};
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch (error) {
      // Body is optional, continue with empty object
    }

    // Validate request body
    const validationResult = ApproveAppointmentDtoSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const approveAppointmentUseCase = new ApproveAppointmentUseCase(appointmentRepository);
    const result = await approveAppointmentUseCase.execute(
      id,
      user.id,
      validationResult.data?.notes || undefined
    );

    if (result.isFailure) {
      const error = result.error as any;
      return NextResponse.json(
        { error: error?.message || 'Randevu onaylanamadı' },
        { status: error?.statusCode || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment approved successfully',
      ...result.value,
    });
  } catch (error) {
    logger.error('Error in POST /api/appointments/[id]/approve:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
