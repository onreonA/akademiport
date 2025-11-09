import { NextRequest, NextResponse } from 'next/server';
import { AppointmentRepository } from '@/infrastructure/database/repositories/AppointmentRepository';
import { RescheduleAppointmentUseCase } from '@/application/use-cases/appointment';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { logger } from '@/shared/utils/logger';
import { RescheduleAppointmentDtoSchema } from '@/application/dto/appointment';
import { UserRole } from '@/domain/enums/UserRole';

const appointmentRepository = new AppointmentRepository();

/**
 * POST /api/appointments/[id]/reschedule
 * Reschedule an appointment (Consultant or Company)
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if appointment exists
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Authorization: Consultant or Company (owner) can reschedule
    if (user.role === UserRole.CONSULTANT) {
      if (appointment.consultantId !== user.id) {
        return NextResponse.json(
          { error: 'Bu randevuyu revize etme yetkiniz yok' },
          { status: 403 }
        );
      }
    } else if (user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_USER) {
      if (appointment.companyId !== user.companyId) {
        return NextResponse.json(
          { error: 'Bu randevuyu revize etme yetkiniz yok' },
          { status: 403 }
        );
      }
    } else if (user.role !== UserRole.MASTER_ADMIN && user.role !== UserRole.PROGRAM_MANAGER) {
      return NextResponse.json({ error: 'Randevu revize etme yetkiniz yok' }, { status: 403 });
    }

    const body = await request.json();

    // Validate request body
    const validationResult = RescheduleAppointmentDtoSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const newStartTime = new Date(validationResult.data.newStartTime);
    const newEndTime = new Date(validationResult.data.newEndTime);

    const rescheduleAppointmentUseCase = new RescheduleAppointmentUseCase(appointmentRepository);
    const result = await rescheduleAppointmentUseCase.execute(
      id,
      newStartTime,
      newEndTime,
      user.id
    );

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      ...result.value,
    });
  } catch (error) {
    logger.error('Error in POST /api/appointments/[id]/reschedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
