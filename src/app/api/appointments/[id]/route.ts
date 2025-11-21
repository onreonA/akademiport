import { NextRequest, NextResponse } from 'next/server';
import { AppointmentRepository } from '@/infrastructure/database/repositories/AppointmentRepository';
import {
  GetAppointmentUseCase,
  UpdateAppointmentUseCase,
  DeleteAppointmentUseCase,
} from '@/application/use-cases/appointment';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { logger } from '@/shared/utils/logger';
import {
  UpdateAppointmentDtoSchema,
  type AppointmentResponseDto,
  type UpdateAppointmentDto,
} from '@/application/dto/appointment';
import { UserRole } from '@/domain/enums/UserRole';
import { AppError } from '@/6-core/errors/AppError';

const appointmentRepository = new AppointmentRepository();

/**
 * GET /api/appointments/[id]
 * Get a single appointment
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const getAppointmentUseCase = new GetAppointmentUseCase(appointmentRepository);
    const result = await getAppointmentUseCase.execute(id);

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    const appointment = result.value;

    // Authorization: Check if user has access to this appointment
    if (user.role === UserRole.CONSULTANT) {
      if (appointment.consultantId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_USER) {
      if (appointment.companyId !== user.companyId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    // Admin and Program Manager can see all appointments

    // Map Appointment entity to AppointmentResponseDto
    const appointmentResponse: AppointmentResponseDto = {
      ...appointment,
      consultantNotes: appointment.notes, // Map notes to consultantNotes
      startTime: appointment.startTime.toISOString(),
      endTime: appointment.endTime.toISOString(),
      requestedAt: appointment.requestedAt.toISOString(),
      approvedAt: appointment.approvedAt?.toISOString() || null,
      rejectedAt: appointment.rejectedAt?.toISOString() || null,
      rescheduledAt: appointment.rescheduledAt?.toISOString() || null,
      attendedAt: appointment.attendedAt?.toISOString() || null,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      appointment: appointmentResponse,
    });
  } catch (error) {
    logger.error('Error in GET /api/appointments/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/appointments/[id]
 * Update an appointment
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if appointment exists and user has access
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Authorization
    if (user.role === UserRole.CONSULTANT) {
      if (appointment.consultantId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_USER) {
      if (appointment.companyId !== user.companyId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      // Company users can only update companyNotes
      const body = await request.json();
      if (Object.keys(body).some((key) => key !== 'companyNotes')) {
        return NextResponse.json(
          { error: 'Firma kullanıcıları sadece notlarını güncelleyebilir' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();

    // Validate request body
    const validationResult = UpdateAppointmentDtoSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const updateData: Partial<UpdateAppointmentDto & { startTime?: Date; endTime?: Date }> = {
      ...validationResult.data,
    };

    // Convert date strings to Date objects
    if (updateData.startTime && typeof updateData.startTime === 'string') {
      updateData.startTime = new Date(updateData.startTime);
    }
    if (updateData.endTime && typeof updateData.endTime === 'string') {
      updateData.endTime = new Date(updateData.endTime);
    }

    const updateAppointmentUseCase = new UpdateAppointmentUseCase(appointmentRepository);
    const result = await updateAppointmentUseCase.execute(id, updateData);

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    // Map Appointment entity to AppointmentResponseDto
    const updatedAppointment = result.value;
    const appointmentResponse: AppointmentResponseDto = {
      ...updatedAppointment,
      consultantNotes: updatedAppointment.notes, // Map notes to consultantNotes
      startTime: updatedAppointment.startTime.toISOString(),
      endTime: updatedAppointment.endTime.toISOString(),
      requestedAt: updatedAppointment.requestedAt.toISOString(),
      approvedAt: updatedAppointment.approvedAt?.toISOString() || null,
      rejectedAt: updatedAppointment.rejectedAt?.toISOString() || null,
      rescheduledAt: updatedAppointment.rescheduledAt?.toISOString() || null,
      attendedAt: updatedAppointment.attendedAt?.toISOString() || null,
      createdAt: updatedAppointment.createdAt.toISOString(),
      updatedAt: updatedAppointment.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      appointment: appointmentResponse,
    });
  } catch (error) {
    logger.error('Error in PATCH /api/appointments/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/appointments/[id]
 * Delete an appointment (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if appointment exists and user has access
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Authorization: Only Consultant, Company (owner), Admin can delete
    if (user.role === UserRole.CONSULTANT) {
      if (appointment.consultantId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_USER) {
      if (appointment.companyId !== user.companyId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      // Company can only delete pending appointments
      if (appointment.status !== 'pending') {
        return NextResponse.json(
          { error: 'Sadece beklemedeki randevular iptal edilebilir' },
          { status: 403 }
        );
      }
    }

    const deleteAppointmentUseCase = new DeleteAppointmentUseCase(appointmentRepository);
    const result = await deleteAppointmentUseCase.execute(id);

    if (result.isFailure) {
      const error =
        result.error instanceof AppError ? result.error : new AppError('Unknown error', 500);
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment deleted successfully',
    });
  } catch (error) {
    logger.error('Error in DELETE /api/appointments/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
