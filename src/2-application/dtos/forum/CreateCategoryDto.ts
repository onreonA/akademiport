export interface CreateCategoryDto {
  programId: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  orderIndex?: number;
  requireApproval?: boolean;
}

