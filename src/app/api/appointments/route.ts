import { NextRequest, NextResponse } from 'next/server';
import { AppointmentRepository } from '@/infrastructure/database/repositories/AppointmentRepository';
import {
  CreateAppointmentUseCase,
  ListAppointmentsUseCase,
} from '@/application/use-cases/appointment';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { logger } from '@/shared/utils/logger';
import {
  CreateAppointmentDtoSchema,
  AppointmentFilterDtoSchema,
} from '@/application/dto/appointment';
import { UserRole } from '@/domain/enums/UserRole';

const appointmentRepository = new AppointmentRepository();

/**
 * GET /api/appointments
 * List all appointments with filters
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const consultantId = searchParams.get('consultantId') || undefined;
    const companyId = searchParams.get('companyId') || undefined;
    const programId = searchParams.get('programId') || undefined;
    const status = searchParams.get('status') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Authorization: Role-based filtering
    let finalConsultantId = consultantId;
    let finalCompanyId = companyId;

    if (user.role === UserRole.CONSULTANT) {
      // Consultant can only see their own appointments
      finalConsultantId = user.id;
    } else if (user.role === UserRole.COMPANY_ADMIN || user.role === UserRole.COMPANY_USER) {
      // Company users can only see their company's appointments
      if (!user.companyId) {
        return NextResponse.json({ error: 'Firma bilgisi bulunamadı' }, { status: 403 });
      }
      finalCompanyId = user.companyId;
    }
    // Admin and Program Manager can see all appointments

    // Parse dates
    const filters: any = {
      consultantId: finalConsultantId || null,
      companyId: finalCompanyId || null,
      programId: programId || null,
      status,
      startDate: startDate || null,
      endDate: endDate || null,
      search,
      page,
      limit,
    };

    // Validate filters
    const validationResult = AppointmentFilterDtoSchema.safeParse(filters);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid filters', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const listAppointmentsUseCase = new ListAppointmentsUseCase(appointmentRepository);
    const result = await listAppointmentsUseCase.execute(validationResult.data);

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
    }

    const totalPages = Math.ceil(result.value.total / limit);

    return NextResponse.json({
      success: true,
      appointments: result.value.data,
      pagination: {
        page,
        limit,
        total: result.value.total,
        totalPages,
      },
    });
  } catch (error) {
    logger.error('Error in GET /api/appointments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/appointments
 * Create a new appointment (Company users only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only Company users can create appointments
    if (user.role !== UserRole.COMPANY_ADMIN && user.role !== UserRole.COMPANY_USER) {
      return NextResponse.json(
        { error: 'Sadece firma kullanıcıları randevu oluşturabilir' },
        { status: 403 }
      );
    }

    if (!user.companyId) {
      return NextResponse.json({ error: 'Firma bilgisi bulunamadı' }, { status: 403 });
    }

    const body = await request.json();

    console.log('📥 [POST /api/appointments] Request body:', body);
    console.log('📥 [POST /api/appointments] User:', {
      id: user.id,
      companyId: user.companyId,
      role: user.role,
    });

    // Prepare data for validation
    // Convert empty strings to null for optional nullable fields
    const validationData = {
      ...body,
      companyId: user.companyId, // Force company ID from authenticated user
      requestedBy: user.id, // Force requestedBy from authenticated user
      programId: body.programId || null,
      description: body.description && body.description.trim() !== '' ? body.description : null,
      companyNotes: body.companyNotes && body.companyNotes.trim() !== '' ? body.companyNotes : null,
    };

    console.log('📥 [POST /api/appointments] Validation data:', validationData);

    // Validate request body
    const validationResult = CreateAppointmentDtoSchema.safeParse(validationData);

    if (!validationResult.success) {
      console.error(
        '❌ [POST /api/appointments] Validation failed:',
        validationResult.error.errors
      );
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
          message: validationResult.error.errors
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join(', '),
        },
        { status: 400 }
      );
    }

    console.log('✅ [POST /api/appointments] Validation passed');

    const createAppointmentUseCase = new CreateAppointmentUseCase(appointmentRepository);
    const result = await createAppointmentUseCase.execute({
      ...validationResult.data,
      startTime: new Date(validationResult.data.startTime),
      endTime: new Date(validationResult.data.endTime),
      requestedBy: validationResult.data.requestedBy,
    });

    if (result.isFailure) {
      return NextResponse.json(
        { error: result.error.message },
        { status: result.error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: true,
        ...result.value,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Error in POST /api/appointments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
