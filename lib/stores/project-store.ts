// =====================================================
// PROJECT STORE - ZUSTAND
// =====================================================
// Proje yönetimi için özel state management
'use client';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
// Types
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
  progress: number;
  start_date: string;
  end_date: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  budget?: number;
  actual_cost?: number;
  estimated_hours?: number;
  actual_hours?: number;
  tags?: string[];
  is_template: boolean;
  template_id?: string;
  completed_at?: string;
  completed_tasks: number;
  total_tasks: number;
  deadline_reminder_sent: boolean;
  is_archived: boolean;
  company_id: string;
  consultant_id?: string;
  admin_note?: string;
  created_at: string;
  updated_at: string;
}
export interface SubProject {
  id: string;
  project_id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
  progress: number;
  start_date?: string;
  end_date?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimated_hours?: number;
  actual_hours?: number;
  completed_tasks: number;
  total_tasks: number;
  completed_at?: string;
  deadline_reminder_sent: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}
export interface Task {
  id: string;
  project_id: string;
  sub_project_id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  start_date?: string;
  end_date?: string;
  due_date?: string;
  assigned_to?: string;
  progress: number;
  estimated_hours?: number;
  actual_hours?: number;
  completed_at?: string;
  notes?: string;
  tags?: string[];
  deadline_reminder_sent: boolean;
  is_archived: boolean;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}
export interface ProjectComment {
  id: string;
  project_id: string;
  sub_project_id?: string;
  task_id?: string;
  user_id: string;
  content: string;
  parent_id?: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}
export interface ProjectFile {
  id: string;
  project_id: string;
  sub_project_id?: string;
  task_id?: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_category: 'general' | 'document' | 'image' | 'video' | 'archive';
  uploaded_by: string;
  is_public: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
}
export interface ProjectMilestone {
  id: string;
  project_id: string;
  sub_project_id?: string;
  title: string;
  description?: string;
  due_date: string;
  completed_at?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_by: string;
  created_at: string;
  updated_at: string;
}
export interface ProjectNotification {
  id: string;
  project_id: string;
  sub_project_id?: string;
  task_id?: string;
  user_id: string;
  type:
    | 'task_assigned'
    | 'task_completed'
    | 'task_approved'
    | 'task_rejected'
    | 'project_updated'
    | 'deadline_approaching'
    | 'comment_added'
    | 'file_uploaded'
    | 'milestone_reached';
  title: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}
// Store State
interface ProjectStoreState {
  // Data
  projects: Project[];
  currentProject: Project | null;
  subProjects: SubProject[];
  tasks: Task[];
  comments: ProjectComment[];
  files: ProjectFile[];
  milestones: ProjectMilestone[];
  notifications: ProjectNotification[];
  // UI State
  loading: boolean;
  error: string | null;
  // Filters
  projectFilters: {
    status?: string;
    priority?: string;
    company_id?: string;
    consultant_id?: string;
    search?: string;
  };
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
// Store Actions
interface ProjectStoreActions {
  // Projects
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (
    project: Omit<Project, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  // Sub-projects
  fetchSubProjects: (projectId: string) => Promise<void>;
  createSubProject: (
    projectId: string,
    subProject: Omit<
      SubProject,
      'id' | 'project_id' | 'created_at' | 'updated_at'
    >
  ) => Promise<void>;
  updateSubProject: (
    id: string,
    subProject: Partial<SubProject>
  ) => Promise<void>;
  deleteSubProject: (id: string) => Promise<void>;
  // Tasks
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (
    subProjectId: string,
    task: Omit<
      Task,
      'id' | 'project_id' | 'sub_project_id' | 'created_at' | 'updated_at'
    >
  ) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  // Comments
  fetchComments: (projectId: string) => Promise<void>;
  createComment: (
    comment: Omit<ProjectComment, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<void>;
  updateComment: (
    id: string,
    comment: Partial<ProjectComment>
  ) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  // Files
  fetchFiles: (projectId: string) => Promise<void>;
  uploadFile: (
    file: Omit<ProjectFile, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  // Milestones
  fetchMilestones: (projectId: string) => Promise<void>;
  createMilestone: (
    milestone: Omit<ProjectMilestone, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<void>;
  updateMilestone: (
    id: string,
    milestone: Partial<ProjectMilestone>
  ) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  // Notifications
  fetchNotifications: (projectId: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: (projectId: string) => Promise<void>;
  // Filters
  setProjectFilters: (
    filters: Partial<ProjectStoreState['projectFilters']>
  ) => void;
  clearProjectFilters: () => void;
  // Pagination
  setPagination: (pagination: Partial<ProjectStoreState['pagination']>) => void;
  // Utilities
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}
// Store Type
export type ProjectStore = ProjectStoreState & ProjectStoreActions;
// Create Store
export const useProjectStore = create<ProjectStore>()(
  immer((set, get) => ({
    // Initial State
    projects: [],
    currentProject: null,
    subProjects: [],
    tasks: [],
    comments: [],
    files: [],
    milestones: [],
    notifications: [],
    loading: false,
    error: null,
    projectFilters: {},
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    // Projects Actions
    fetchProjects: async () => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch('/api/projects', {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        set(state => {
          // Yeni API'den gelen projeleri işle
          const processedProjects = (data.projects || []).map(
            (project: any) => ({
              ...project,
              // Eski API formatından yeni format'a dönüştür
              name: project.title || project.name,
              progress: project.progress_percentage || project.progress || 0,
              start_date: project.start_date || project.startDate,
              end_date: project.end_date || project.endDate,
              admin_note: project.admin_note || project.adminNote,
              // Assignment bilgilerini ekle
              assignment: project.assignment || null,
              // Progress bilgilerini ekle
              companyProgress: project.assignment?.progress || null,
            })
          );
          state.projects = processedProjects;
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    fetchProject: async (id: string) => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch(`/api/projects/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        const data = await response.json();
        set(state => {
          state.currentProject = data.project;
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    createProject: async projectData => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectData),
        });
        if (!response.ok) {
          throw new Error('Failed to create project');
        }
        const data = await response.json();
        set(state => {
          state.projects.push(data.project);
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    updateProject: async (id: string, projectData) => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch(`/api/projects/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(projectData),
        });
        if (!response.ok) {
          throw new Error('Failed to update project');
        }
        const data = await response.json();
        set(state => {
          const index = state.projects.findIndex(p => p.id === id);
          if (index !== -1) {
            state.projects[index] = {
              ...state.projects[index],
              ...data.project,
            };
          }
          if (state.currentProject?.id === id) {
            state.currentProject = { ...state.currentProject, ...data.project };
          }
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    deleteProject: async (id: string) => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch(`/api/projects/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete project');
        }
        set(state => {
          state.projects = state.projects.filter(p => p.id !== id);
          if (state.currentProject?.id === id) {
            state.currentProject = null;
          }
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    // Sub-projects Actions
    fetchSubProjects: async (projectId: string) => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch(`/api/projects/${projectId}/sub-projects`);
        if (!response.ok) {
          throw new Error('Failed to fetch sub-projects');
        }
        const data = await response.json();
        set(state => {
          state.subProjects = data.sub_projects || [];
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    createSubProject: async (projectId: string, subProjectData) => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch(
          `/api/projects/${projectId}/sub-projects`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subProjectData),
          }
        );
        if (!response.ok) {
          throw new Error('Failed to create sub-project');
        }
        const data = await response.json();
        set(state => {
          state.subProjects.push(data.sub_project);
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    updateSubProject: async (id: string, subProjectData) => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch(`/api/sub-projects/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subProjectData),
        });
        if (!response.ok) {
          throw new Error('Failed to update sub-project');
        }
        const data = await response.json();
        set(state => {
          const index = state.subProjects.findIndex(sp => sp.id === id);
          if (index !== -1) {
            state.subProjects[index] = {
              ...state.subProjects[index],
              ...data.sub_project,
            };
          }
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    deleteSubProject: async (id: string) => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch(`/api/sub-projects/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete sub-project');
        }
        set(state => {
          state.subProjects = state.subProjects.filter(sp => sp.id !== id);
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    // Tasks Actions
    fetchTasks: async (projectId: string) => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch(`/api/projects/${projectId}/tasks`);
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        set(state => {
          state.tasks = data.tasks || [];
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    createTask: async (subProjectId: string, taskData) => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch(
          `/api/sub-projects/${subProjectId}/tasks`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData),
          }
        );
        if (!response.ok) {
          throw new Error('Failed to create task');
        }
        const data = await response.json();
        set(state => {
          state.tasks.push(data.task);
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    updateTask: async (id: string, taskData) => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch(`/api/tasks/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        });
        if (!response.ok) {
          throw new Error('Failed to update task');
        }
        const data = await response.json();
        set(state => {
          const index = state.tasks.findIndex(t => t.id === id);
          if (index !== -1) {
            state.tasks[index] = { ...state.tasks[index], ...data.task };
          }
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    deleteTask: async (id: string) => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch(`/api/tasks/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete task');
        }
        set(state => {
          state.tasks = state.tasks.filter(t => t.id !== id);
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    // Comments Actions
    fetchComments: async (projectId: string) => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch(`/api/projects/${projectId}/comments`);
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        const data = await response.json();
        set(state => {
          state.comments = data.comments || [];
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    createComment: async commentData => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch('/api/project-comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(commentData),
        });
        if (!response.ok) {
          throw new Error('Failed to create comment');
        }
        const data = await response.json();
        set(state => {
          state.comments.push(data.comment);
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    updateComment: async (id: string, commentData) => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch(`/api/project-comments/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(commentData),
        });
        if (!response.ok) {
          throw new Error('Failed to update comment');
        }
        const data = await response.json();
        set(state => {
          const index = state.comments.findIndex(c => c.id === id);
          if (index !== -1) {
            state.comments[index] = {
              ...state.comments[index],
              ...data.comment,
            };
          }
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    deleteComment: async (id: string) => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch(`/api/project-comments/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete comment');
        }
        set(state => {
          state.comments = state.comments.filter(c => c.id !== id);
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    // Files Actions
    fetchFiles: async (projectId: string) => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch(`/api/projects/${projectId}/files`);
        if (!response.ok) {
          throw new Error('Failed to fetch files');
        }
        const data = await response.json();
        set(state => {
          state.files = data.files || [];
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    uploadFile: async fileData => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch('/api/project-files', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fileData),
        });
        if (!response.ok) {
          throw new Error('Failed to upload file');
        }
        const data = await response.json();
        set(state => {
          state.files.push(data.file);
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    deleteFile: async (id: string) => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch(`/api/project-files/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete file');
        }
        set(state => {
          state.files = state.files.filter(f => f.id !== id);
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    // Milestones Actions
    fetchMilestones: async (projectId: string) => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch(`/api/projects/${projectId}/milestones`);
        if (!response.ok) {
          throw new Error('Failed to fetch milestones');
        }
        const data = await response.json();
        set(state => {
          state.milestones = data.milestones || [];
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    createMilestone: async milestoneData => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch('/api/project-milestones', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(milestoneData),
        });
        if (!response.ok) {
          throw new Error('Failed to create milestone');
        }
        const data = await response.json();
        set(state => {
          state.milestones.push(data.milestone);
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    updateMilestone: async (id: string, milestoneData) => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch(`/api/project-milestones/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(milestoneData),
        });
        if (!response.ok) {
          throw new Error('Failed to update milestone');
        }
        const data = await response.json();
        set(state => {
          const index = state.milestones.findIndex(m => m.id === id);
          if (index !== -1) {
            state.milestones[index] = {
              ...state.milestones[index],
              ...data.milestone,
            };
          }
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    deleteMilestone: async (id: string) => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch(`/api/project-milestones/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete milestone');
        }
        set(state => {
          state.milestones = state.milestones.filter(m => m.id !== id);
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    // Notifications Actions
    fetchNotifications: async (projectId: string) => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch(
          `/api/projects/${projectId}/notifications`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        const data = await response.json();
        set(state => {
          state.notifications = data.notifications || [];
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    markNotificationAsRead: async (id: string) => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch(`/api/project-notifications/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_read: true }),
        });
        if (!response.ok) {
          throw new Error('Failed to mark notification as read');
        }
        set(state => {
          const index = state.notifications.findIndex(n => n.id === id);
          if (index !== -1) {
            state.notifications[index].is_read = true;
            state.notifications[index].read_at = new Date().toISOString();
          }
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    markAllNotificationsAsRead: async (projectId: string) => {
      set(state => {
        state.loading = true;
        state.error = null;
      });
      try {
        const response = await fetch(
          `/api/projects/${projectId}/notifications/mark-all-read`,
          {
            method: 'PATCH',
          }
        );
        if (!response.ok) {
          throw new Error('Failed to mark all notifications as read');
        }
        set(state => {
          state.notifications.forEach(notification => {
            if (notification.project_id === projectId) {
              notification.is_read = true;
              notification.read_at = new Date().toISOString();
            }
          });
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error =
            error instanceof Error ? error.message : 'Unknown error';
          state.loading = false;
        });
      }
    },
    // Filters Actions
    setProjectFilters: filters => {
      set(state => {
        state.projectFilters = { ...state.projectFilters, ...filters };
      });
    },
    clearProjectFilters: () => {
      set(state => {
        state.projectFilters = {};
      });
    },
    // Pagination Actions
    setPagination: pagination => {
      set(state => {
        state.pagination = { ...state.pagination, ...pagination };
      });
    },
    // Utilities
    setLoading: loading => {
      set(state => {
        state.loading = loading;
      });
    },
    setError: error => {
      set(state => {
        state.error = error;
      });
    },
    clearError: () => {
      set(state => {
        state.error = null;
      });
    },
  }))
);
