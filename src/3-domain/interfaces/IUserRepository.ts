/**
 * User Repository Interface
 *
 * Domain interface for user data access
 */

import { Result } from '@/core/result/Result';
import { User } from '../entities/User';
import { Program } from '../entities/Program';
import { CreateUserDto, UpdateUserDto, UserFilterDto } from '@/application/dto/user';

export interface IUserRepository {
  // Basic CRUD
  findById(id: string): Promise<Result<User | null>>;
  findAll(): Promise<Result<User[]>>;
  findByEmail(email: string): Promise<Result<User | null>>;
  create(dto: CreateUserDto): Promise<Result<User>>;
  update(id: string, dto: UpdateUserDto): Promise<Result<User>>;
  delete(id: string): Promise<Result<void>>;

  // Filtering & Search
  findByRole(role: string): Promise<Result<User[]>>;
  findByCompanyId(companyId: string): Promise<Result<User[]>>;
  findByProgramId(programId: string): Promise<Result<User[]>>;
  search(query: string): Promise<Result<User[]>>;
  findWithFilters(filters: UserFilterDto): Promise<
    Result<{
      users: User[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>
  >;

  // Program Management
  assignProgram(userId: string, programId: string, roleInProgram?: string): Promise<Result<void>>;
  removeProgram(userId: string, programId: string): Promise<Result<void>>;
  getPrograms(userId: string): Promise<Result<Program[]>>;
  isProgramAssigned(userId: string, programId: string): Promise<Result<boolean>>;

  // Password Management
  changePassword(userId: string, newPasswordHash: string): Promise<Result<void>>;

  // Status Management
  activate(userId: string): Promise<Result<void>>;
  deactivate(userId: string): Promise<Result<void>>;

  // Statistics
  countByRole(role: string): Promise<Result<number>>;
  countByCompany(companyId: string): Promise<Result<number>>;
  countByProgram(programId: string): Promise<Result<number>>;
}
