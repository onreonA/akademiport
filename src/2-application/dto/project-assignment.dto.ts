/**
 * Project Assignment DTOs
 * Sprint 8 Extension: Bulk assignment & matrix views
 */

export interface AssignmentCompanyDTO {
  id: string;
  name: string;
  programName?: string;
  city?: string | null;
  sector?: string | null;
  isActive?: boolean;
}

export interface AssignmentSubProjectDTO {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  orderIndex: number;
}

export interface AssignmentCellDTO {
  companyId: string;
  projectId: string;
  subProjectId: string | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
}

export interface ProjectAssignmentMatrixDTO {
  project: {
    id: string;
    name: string;
    consultantId?: string | null;
    consultantName?: string | null;
    programId?: string | null;
    programName?: string | null;
  };
  companies: AssignmentCompanyDTO[];
  subProjects: AssignmentSubProjectDTO[];
  assignments: AssignmentCellDTO[];
}

export interface BulkAssignmentRequestDTO {
  projectId: string;
  assignments: Array<{
    companyId: string;
    subProjectIds: string[];
  }>;
}

export interface BulkAssignmentResultDTO {
  successCount: number;
  removeCount: number;
  errors: Array<{
    companyId: string;
    subProjectId?: string | null;
    message: string;
  }>;
}

export interface BulkDateUpdateRequestDTO {
  projectId: string;
  subProjectId: string;
  dates: Array<{
    companyId: string;
    startDate?: string | null;
    endDate?: string | null;
  }>;
}

export interface BulkDateUpdateResultDTO {
  updatedCount: number;
  errors: Array<{
    companyId: string;
    message: string;
  }>;
}

export interface CompanyAssignmentSummaryDTO {
  companyId: string;
  companyName: string;
  assignedSubProjects: string[];
  hasDatesConfigured: boolean;
}
