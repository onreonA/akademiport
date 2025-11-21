import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/infrastructure/api/helpers/auth';
import { AppError } from '@/6-core/errors/AppError';
import { TaskRepository } from '@/infrastructure/database/repositories/TaskRepository';
import { CompanyProjectAssignmentRepository } from '@/infrastructure/database/repositories/CompanyProjectAssignmentRepository';
import { CompanyTaskDateRepository } from '@/infrastructure/database/repositories/CompanyTaskDateRepository';
import { CompanyRepository } from '@/infrastructure/database/repositories/CompanyRepository';
import { UserRole } from '@/domain/enums/UserRole';
import { logger } from '@/shared/utils/logger';

const taskRepository = new TaskRepository();
const assignmentRepository = new CompanyProjectAssignmentRepository();
const companyTaskDateRepository = new CompanyTaskDateRepository();
const companyRepository = new CompanyRepository();

/**
 * GET /api/tasks/[id]/companies
 * Göreve atanmış firmaları ve tarih atamalarını getirir
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== UserRole.MASTER_ADMIN && user.role !== UserRole.CONSULTANT) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id: taskId } = await params;

    // Görevi bul
    const task = await taskRepository.findById(taskId);
    if (!task) {
      return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 });
    }

    // Alt projeye atanmış firmaları bul
    const assignments = await assignmentRepository.findBySubProject(task.subProjectId);
    const companyIds = Array.from(new Set(assignments.map((a) => a.companyId)));

    // Firmaları getir
    const companies = [];
    for (const companyId of companyIds) {
      const companyResult = await companyRepository.findById(companyId);
      if (companyResult.isSuccess && companyResult.value) {
        companies.push({
          id: companyResult.value.id,
          name: companyResult.value.name,
          city: companyResult.value.city ?? null,
          sector: companyResult.value.sector ?? null,
        });
      }
    }

    // Görev tarih atamalarını getir
    const taskDates = await companyTaskDateRepository.findByTask(taskId);
    const datesMap = new Map(
      taskDates.map((td) => [
        td.companyId,
        {
          startDate: td.startDate ? td.startDate.toISOString().split('T')[0] : null,
          endDate: td.endDate ? td.endDate.toISOString().split('T')[0] : null,
        },
      ])
    );

    // Firmaları tarih atamalarıyla birleştir
    const companiesWithDates = companies.map((company) => ({
      ...company,
      assigned: true, // Alt projeye atanmış firmalar
      startDate: datesMap.get(company.id)?.startDate ?? null,
      endDate: datesMap.get(company.id)?.endDate ?? null,
    }));

    return NextResponse.json({
      task: {
        id: task.id,
        title: task.title,
        subProjectId: task.subProjectId,
      },
      companies: companiesWithDates,
    });
  } catch (error) {
    logger.error('Error in GET /api/tasks/[id]/companies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
