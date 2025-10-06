// User Types - UPDATED: Proper role separation
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role:
    | 'master_admin'
    | 'admin'
    | 'consultant'
    | 'user'
    | 'operator'
    | 'manager'
    | 'observer';
  company_id?: string;
  created_at: string;
  updated_at: string;
}
// Company Types
export interface Company {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large';
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}
// Project Types
export interface Project {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
  start_date?: string;
  end_date?: string;
  progress: number;
  consultant_id?: string;
  created_at: string;
  updated_at: string;
}
// Task Types
export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}
// Education Types
export interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  video_url?: string;
  duration?: number;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}
// Event Types
export interface Event {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  type: 'webinar' | 'workshop' | 'meeting' | 'training';
  max_participants?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: 'registered' | 'attended' | 'cancelled';
  created_at: string;
}
// Forum Types
export interface ForumTopic {
  id: string;
  title: string;
  content: string;
  author_id: string;
  category: string;
  tags?: string[];
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  created_at: string;
  updated_at: string;
}
export interface ForumReply {
  id: string;
  topic_id: string;
  content: string;
  author_id: string;
  is_solution: boolean;
  created_at: string;
  updated_at: string;
}
// News Types
export interface News {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  image_url?: string;
  author_id: string;
  category: string;
  tags?: string[];
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}
// Appointment Types
export interface Appointment {
  id: string;
  user_id: string;
  consultant_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  meeting_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
// Analytics Types
export interface Analytics {
  total_users: number;
  active_projects: number;
  completed_projects: number;
  total_revenue: number;
  monthly_growth: number;
  top_performing_companies: Company[];
  recent_activities: Activity[];
}
export interface Activity {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details?: Record<string, any>;
  created_at: string;
}
// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
// Consultant Management Types
export interface ConsultantProfile {
  id: string;
  user_id: string;
  phone?: string;
  specialization?: string[];
  experience_years: number;
  bio?: string;
  hourly_rate?: number;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}
export interface ConsultantPermission {
  id: string;
  consultant_id: string;
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  company_visibility: 'assigned' | 'all';
  created_at: string;
  updated_at: string;
}
export interface ConsultantAssignment {
  id: string;
  consultant_id: string;
  company_id: string;
  assigned_by?: string;
  assigned_at: string;
  is_active: boolean;
  notes?: string;
}
export interface ConsultantActivity {
  id: string;
  consultant_id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  company_id?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
export interface ConsultantReport {
  id: string;
  consultant_id: string;
  company_id: string;
  title: string;
  report_type?: string;
  content?: any;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submitted_at?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}
export interface ConsultantSession {
  id: string;
  consultant_id: string;
  session_token: string;
  ip_address?: string;
  user_agent?: string;
  login_at: string;
  logout_at?: string;
  is_active: boolean;
}
// Enhanced User type with consultant profile
export interface UserWithProfile extends User {
  consultant_profile?: ConsultantProfile;
  consultant_permissions?: ConsultantPermission[];
  consultant_assignments?: ConsultantAssignment[];
}
// Consultant Management API Types
export interface CreateConsultantRequest {
  email: string;
  full_name: string;
  phone?: string;
  specialization?: string[];
  experience_years?: number;
  bio?: string;
  hourly_rate?: number;
  initial_permissions?: Partial<ConsultantPermission>[];
}
export interface UpdateConsultantRequest {
  full_name?: string;
  phone?: string;
  specialization?: string[];
  experience_years?: number;
  bio?: string;
  hourly_rate?: number;
  is_active?: boolean;
}
export interface UpdateConsultantPermissionsRequest {
  consultant_id: string;
  permissions: Partial<ConsultantPermission>[];
}
export interface AssignCompanyRequest {
  consultant_id: string;
  company_id: string;
  notes?: string;
}
export interface ConsultantStats {
  total_consultants: number;
  active_consultants: number;
  total_assignments: number;
  total_reports: number;
  recent_activities: ConsultantActivity[];
}
