/**
 * Program Repository Interface
 */

import { Result } from '@/core/result/Result';
import { Program } from '../entities/Program';
import { User } from '../entities/User';
import { CreateProgramDto, UpdateProgramDto } from '@/application/dto/program';

export interface IProgramRepository {
  // Basic CRUD
  findById(id: string): Promise<Result<Program | null>>;
  findAll(): Promise<Result<Program[]>>;
  findByStatus(status: string): Promise<Result<Program[]>>;
  findByCity(city: string): Promise<Result<Program[]>>;
  create(dto: CreateProgramDto): Promise<Result<Program>>;
  update(id: string, dto: UpdateProgramDto): Promise<Result<Program>>;
  delete(id: string): Promise<Result<void>>;

  // Advanced queries
  findByManagerId(managerId: string): Promise<Result<Program[]>>;
  search(query: string): Promise<Result<Program[]>>;

  // Consultant management
  addConsultant(programId: string, consultantId: string): Promise<Result<void>>;
  removeConsultant(programId: string, consultantId: string): Promise<Result<void>>;
  getConsultants(programId: string): Promise<Result<User[]>>;
}
