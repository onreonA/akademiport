import { Project } from '@/domain/entities/Project';
import { SubProject } from '@/domain/entities/SubProject';
import { Task } from '@/domain/entities/Task';
import { TaskComment } from '@/domain/entities/TaskComment';

// Mock Projects
export const mockProject: Project = {
  id: 'project-1',
  programId: 'program-1',
  companyId: 'company-1',
  consultantId: 'consultant-1',
  name: 'Test Project',
  description: 'Test project description',
  status: 'in_progress',
  priority: 'high',
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-12-31'),
  progress: 50,
  isTemplate: false,
  templateId: null,
  deletedAt: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const mockTemplate: Project = {
  id: 'template-1',
  programId: 'program-1',
  companyId: null,
  consultantId: 'consultant-1',
  name: 'Project Template',
  description: 'Template description',
  status: 'todo',
  priority: 'medium',
  startDate: null,
  endDate: null,
  progress: 0,
  isTemplate: true,
  templateId: null,
  deletedAt: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

// Mock SubProjects
export const mockSubProject: SubProject = {
  id: 'subproject-1',
  projectId: 'project-1',
  name: 'Test SubProject',
  description: 'SubProject description',
  status: 'in_progress',
  orderIndex: 1,
  progress: 30,
  deletedAt: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

// Mock Tasks
export const mockTask: Task = {
  id: 'task-1',
  subProjectId: 'subproject-1',
  assignedTo: 'user-1',
  title: 'Test Task',
  description: 'Task description',
  status: 'todo',
  priority: 'high',
  dueDate: new Date('2025-02-01'),
  completedAt: null,
  approvedAt: null,
  approvedBy: null,
  orderIndex: 1,
  deletedAt: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const mockCompletedTask: Task = {
  ...mockTask,
  id: 'task-2',
  status: 'done',
  completedAt: new Date('2025-01-15'),
};

export const mockApprovedTask: Task = {
  ...mockTask,
  id: 'task-3',
  status: 'review',
  completedAt: new Date('2025-01-15'),
  approvedAt: new Date('2025-01-16'),
  approvedBy: 'consultant-1',
};

// Mock TaskComments
export const mockTaskComment: TaskComment = {
  id: 'comment-1',
  taskId: 'task-1',
  userId: 'user-1',
  comment: 'This is a test comment',
  isQuestion: false,
  createdAt: new Date('2025-01-01'),
};

export const mockTaskQuestion: TaskComment = {
  id: 'comment-2',
  taskId: 'task-1',
  userId: 'user-1',
  comment: 'This is a test question?',
  isQuestion: true,
  createdAt: new Date('2025-01-02'),
};

// Mock Users
export const mockAdmin = {
  id: 'admin-1',
  email: 'admin@test.com',
  role: 'admin',
  firstName: 'Admin',
  lastName: 'User',
};

export const mockConsultant = {
  id: 'consultant-1',
  email: 'consultant@test.com',
  role: 'consultant',
  firstName: 'Consultant',
  lastName: 'User',
};

export const mockCompanyUser = {
  id: 'user-1',
  email: 'user@test.com',
  role: 'company',
  companyId: 'company-1',
  firstName: 'Company',
  lastName: 'User',
};

// Mock API Responses
export const mockSuccessResponse = {
  data: { success: true },
  error: null,
};

export const mockErrorResponse = {
  data: null,
  error: { message: 'Test error', status: 400 },
};
