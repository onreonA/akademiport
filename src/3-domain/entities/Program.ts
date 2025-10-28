/**
 * Program Entity
 */

import { ProgramStatus } from '../enums/ProgramStatus';

export interface Program {
  id: string;
  name: string;
  description?: string;
  slug: string;
  city?: string;
  region?: string;
  programType?: string;
  startDate: Date;
  endDate: Date;
  durationMonths?: number;
  maxCompanies: number;
  currentCompanies: number;
  status: ProgramStatus;
  sponsor?: string;
  budget?: number;
  programManagerId?: string;
  settings?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}
