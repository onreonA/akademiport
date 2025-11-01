/**
 * API Route: Users
 *
 * GET /api/users - List users (with filters and pagination)
 * POST /api/users - Create new user
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/4-infrastructure/database/repositories/UserRepository';
import { CreateUserUseCase, ListUsersUseCase } from '@/application/use-cases/user';
import { UserRole } from '@/domain/enums/UserRole';
import { requireAuth } from '@/4-infrastructure/api/helpers/auth';
import { createUserFilterFromQuery } from '@/application/dto/user';

const userRepository = new UserRepository();
const createUserUseCase = new CreateUserUseCase(userRepository);
const listUsersUseCase = new ListUsersUseCase(userRepository);

/**
 * GET /api/users
 * List users with filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get authenticated user from session (Sprint 5 - Faz H)

    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;

    // Parse query parameters
    const { searchParams } = request.nextUrl;
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const filters = createUserFilterFromQuery(queryParams);

    // Execute use case
    const result = await listUsersUseCase.execute({
      ...filters,
      userId,
      userRole,
    });

    if (result.isFailure) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.value?.users,
        pagination: {
          total: result.value?.total,
          page: result.value?.page,
          limit: result.value?.limit,
          totalPages: result.value?.totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Kullanıcılar alınamadı',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔵 [API] POST /api/users - Request body:', JSON.stringify(body, null, 2));

    // TODO: Get authenticated user from session (Sprint 5 - Faz H)

    const user = await requireAuth(request);
    const userId = user.id;
    const userRole = user.role as UserRole;
    console.log('🔵 [API] Authenticated user:', { userId, userRole });

    // Execute use case
    console.log('🔵 [API] Calling CreateUserUseCase with:', {
      ...body,
      createdBy: userId,
      userRole,
    });
    const result = await createUserUseCase.execute({
      ...body,
      createdBy: userId,
      userRole,
    });
    console.log('🔵 [API] Use case result:', {
      isSuccess: result.isSuccess,
      isFailure: result.isFailure,
      error: result.error?.message || result.error?.toString(),
    });

    if (result.isFailure) {
      console.error('🔴 Create user failed - Full error:', result.error);
      console.error('🔴 Error type:', typeof result.error);
      console.error('🔴 Error message:', result.error?.message);
      console.error('🔴 Error toString:', result.error?.toString());
      console.error('🔴 Error JSON:', JSON.stringify(result.error, null, 2));
      const errorMessage =
        result.error?.message || result.error?.toString() || 'Kullanıcı oluşturulamadı';
      console.error('🔴 Returning error message:', errorMessage);
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          errorDetails: result.error, // Include full error details for debugging
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.value,
        message: 'Kullanıcı başarıyla oluşturuldu',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Kullanıcı oluşturulamadı',
      },
      { status: 500 }
    );
  }
}
