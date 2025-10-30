/**
 * List Programs Use Case
 *
 * Business logic for listing and filtering programs
 */

import { Result } from '@/core/result/Result';
import { Program } from '@/domain/entities/Program';
import { ProgramFilterDto } from '@/application/dto/program';
import { IProgramRepository } from '@/domain/interfaces/IProgramRepository';
import { UserRole } from '@/domain/enums/UserRole';

export interface ListProgramsInput extends ProgramFilterDto {
  userId?: string;
  userRole: UserRole;
}

export interface ListProgramsOutput {
  programs: Program[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ListProgramsUseCase {
  constructor(private readonly programRepository: IProgramRepository) {}

  async execute(input: ListProgramsInput): Promise<Result<ListProgramsOutput>> {
    try {
      // 1. Get programs based on filters
      let programsResult: Result<Program[]>;

      // If user is PROGRAM_MANAGER, filter by their managed programs
      if (input.userRole === UserRole.PROGRAM_MANAGER && input.userId) {
        programsResult = await this.programRepository.findByManagerId(input.userId);
      } else if (input.status) {
        // Filter by status
        programsResult = await this.programRepository.findByStatus(input.status);
      } else if (input.city) {
        // Filter by city
        programsResult = await this.programRepository.findByCity(input.city);
      } else {
        // Get all programs
        programsResult = await this.programRepository.findAll();
      }

      if (programsResult.isFailure) {
        return Result.fail(programsResult.error || 'Programlar alınamadı');
      }

      let programs = programsResult.value || [];

      // 2. Apply search filter if provided
      if (input.search && input.search.trim().length > 0) {
        const searchLower = input.search.toLowerCase().trim();
        programs = programs.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description?.toLowerCase().includes(searchLower) ||
            p.city?.toLowerCase().includes(searchLower)
        );
      }

      // 3. Apply manager filter if provided
      if (input.managerId) {
        programs = programs.filter((p) => p.programManagerId === input.managerId);
      }

      // 4. Apply region filter if provided
      if (input.region) {
        programs = programs.filter((p) => p.region === input.region);
      }

      // 5. Sort programs
      const sortBy = input.sortBy || 'createdAt';
      const sortOrder = input.sortOrder || 'desc';

      programs = this.sortPrograms(programs, sortBy, sortOrder);

      // 6. Calculate pagination
      const page = input.page || 1;
      const limit = input.limit || 20;
      const total = programs.length;
      const totalPages = Math.ceil(total / limit);

      // 7. Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPrograms = programs.slice(startIndex, endIndex);

      // 8. Return result
      return Result.ok({
        programs: paginatedPrograms,
        total,
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error.message : 'Programlar listelenirken bir hata oluştu'
      );
    }
  }

  private sortPrograms(programs: Program[], sortBy: string, sortOrder: 'asc' | 'desc'): Program[] {
    return programs.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'startDate':
          aValue = a.startDate.getTime();
          bValue = b.startDate.getTime();
          break;
        case 'endDate':
          aValue = a.endDate.getTime();
          bValue = b.endDate.getTime();
          break;
        case 'createdAt':
        default:
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
      }

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
}
