export interface UpdateCategoryDto {
  name?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  orderIndex?: number;
  isActive?: boolean;
  requireApproval?: boolean;
}

