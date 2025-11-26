// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
}

// Auth types
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'user' | 'admin') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Dashboard types
export interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  upcomingInterviews: number;
  skillScore: number;
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  progress: number;
  thumbnail: string;
}

// Mock Interview types
export interface MockInterview {
  id: string;
  title: string;
  type: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  scheduledAt?: string;
}

// Assessment types
export interface Assessment {
  id: string;
  title: string;
  description: string;
  duration: number;
  questions: number;
  createdAt: string;
  status: 'draft' | 'published' | 'archived';
  jobId?: string;
  jobTitle?: string;
  questionTypes?: Array<{ type: string; count: number }>;
}

// Job types
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
export type JobStatus = 'draft' | 'published' | 'active' | 'closed' | 'archived';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  salary: string;
  postedAt: string;
  status: JobStatus;
  competencies?: string[];
}

// Admin User Management types
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive';
  joinedAt: string;
  lastActive: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
