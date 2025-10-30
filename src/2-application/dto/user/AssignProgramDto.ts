/**
 * Assign Program DTO
 *
 * Data Transfer Object for assigning a user to a program
 */

export interface AssignProgramDto {
  userId: string;
  programId: string;
  roleInProgram?: 'manager' | 'consultant' | 'participant';
  isActive?: boolean;
  assignedBy: string;
}

/**
 * Validation Rules:
 * - userId: Required, user must exist
 * - programId: Required, program must exist
 * - roleInProgram: Optional, defaults to user's global role
 * - isActive: Optional, defaults to true
 * - assignedBy: Required, user ID who made the assignment
 *
 * Assignment Rules:
 * - MASTER_ADMIN can assign anyone to any program
 * - PROGRAM_MANAGER can assign users to their own programs
 * - Cannot assign same user to same program twice
 * - User role must be compatible with program role
 */

/**
 * Helper function to determine program role from user role
 */
export function determineProgramRole(userRole: string): 'manager' | 'consultant' | 'participant' {
  switch (userRole) {
    case 'PROGRAM_MANAGER':
      return 'manager';
    case 'CONSULTANT':
      return 'consultant';
    default:
      return 'participant';
  }
}

/**
 * Remove Program DTO
 */
export interface RemoveProgramDto {
  userId: string;
  programId: string;
  reason?: string;
  removedBy: string;
}

/**
 * Validation Rules:
 * - userId: Required, user must exist
 * - programId: Required, program must exist
 * - reason: Optional, max 500 chars
 * - removedBy: Required, user ID who removed the assignment
 *
 * Removal Rules:
 * - MASTER_ADMIN can remove anyone from any program
 * - PROGRAM_MANAGER can remove users from their own programs
 * - Cannot remove if user has active tasks/projects in the program
 */
