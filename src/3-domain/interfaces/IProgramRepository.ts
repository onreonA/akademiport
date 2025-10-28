/**
 * Program Repository Interface
 */

import { Result } from '@/core/result/Result';
import { Program, CreateProgramDto, UpdateProgramDto } from '../entities/Program';

export interface IProgramRepository {
  findById(id: string): Promise<Result<Program | null>>;
  findAll(): Promise<Result<Program[]>>;
  findByStatus(status: string): Promise<Result<Program[]>>;
  findByCity(city: string): Promise<Result<Program[]>>;
  create(dto: CreateProgramDto): Promise<Result<Program>>;
  update(id: string, dto: UpdateProgramDto): Promise<Result<Program>>;
  delete(id: string): Promise<Result<void>>;
}
