import { NextRequest, NextResponse } from 'next/server';
import { AppointmentRepository } from '@/infrastructure/database/repositories/AppointmentRepository';
import { RejectAppointmentUseCase } from '@/application/use-cases/appointment';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { logger } from '@/shared/utils/logger';
import { RejectAppointmentDtoSchema } from '@/application/dto/appointment';
import { UserRole } from '@/domain/enums/UserRole';

const appointmentRepository = new AppointmentRepository();

/**
 * POST /api/appointments/[id]/reject
 * Reject an appointment (Consultant only)
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only Consultant can reject appointments
    if (user.role !== UserRole.CONSULTANT) {
      return NextResponse.json(
        { error: 'Sadece danışmanlar randevu reddedebilir' },
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
      return NextResponse.json({ error: 'Bu randevuyu reddetme yetkiniz yok' }, { status: 403 });
    }

    const body = await request.json();

    // Validate request body
    const validationResult = RejectAppointmentDtoSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const rejectAppointmentUseCase = new RejectAppointmentUseCase(appointmentRepository);
    const result = await rejectAppointmentUseCase.execute(
      id,
      user.id,
      validationResult.data.reason
    );

    if (result.isFailure) {
      return NextResponse.json(
        { error: (result.error as any)?.message || 'Unknown error' },
        { status: (result.error as any)?.statusCode || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment rejected successfully',
      ...result.value,
    });
  } catch (error) {
    logger.error('Error in POST /api/appointments/[id]/reject:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
