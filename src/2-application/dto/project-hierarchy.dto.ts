/**
 * Project Hierarchy DTOs
 * Sprint 8 Extension: Accordion-based project management
 */

import { ProjectStatus, ProjectPriority } from '@/domain/entities/Project';

export interface TaskDTO {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  orderIndex: number;
  dueDate?: string;
  assignedTo?: string;
  assignedToName?: string;
  subProjectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubProjectWithTasksDTO {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress: number;
  orderIndex: number;
  tasks: TaskDTO[];
  stats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDTO {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  startDate?: string;
  endDate?: string;
  companyId?: string;
  companyName?: string;
  consultantId?: string;
  consultantName?: string;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectHierarchyDTO {
  project: ProjectDTO;
  subProjects: SubProjectWithTasksDTO[];
  stats: {
    totalSubProjects: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    overallProgress: number;
  };
}

