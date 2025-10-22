import axiosInstance from './axiosInstance';
import { AdminUser, Job, Assessment, ApiResponse, PaginatedResponse } from '../types';

// Mock data for development
const mockUsers: AdminUser[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    status: 'active',
    joinedAt: '2024-01-01',
    lastActive: '2024-01-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    status: 'active',
    joinedAt: '2024-01-05',
    lastActive: '2024-01-14',
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    status: 'active',
    joinedAt: '2023-12-01',
    lastActive: '2024-01-15',
  },
];

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'Tech Corp',
    location: 'Remote',
    type: 'full-time',
    salary: '$120k - $150k',
    postedAt: '2024-01-10',
    status: 'active',
  },
  {
    id: '2',
    title: 'Backend Engineer',
    company: 'StartupXYZ',
    location: 'San Francisco, CA',
    type: 'full-time',
    salary: '$130k - $160k',
    postedAt: '2024-01-12',
    status: 'active',
  },
];

const mockAssessments: Assessment[] = [
  {
    id: '1',
    title: 'JavaScript Fundamentals',
    description: 'Test your JavaScript knowledge',
    duration: 60,
    questions: 20,
    createdAt: '2024-01-01',
    status: 'published',
  },
  {
    id: '2',
    title: 'React Advanced Concepts',
    description: 'Advanced React patterns and hooks',
    duration: 90,
    questions: 25,
    createdAt: '2024-01-05',
    status: 'published',
  },
];

// Admin Dashboard API
export const getAdminDashboard = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get<ApiResponse<any>>('/admin/dashboard');
    return response.data.data;
  } catch (error) {
    console.log('Using mock admin dashboard data');
    return {
      totalUsers: 1250,
      activeUsers: 890,
      totalJobs: 45,
      totalAssessments: 32,
      recentActivity: [
        { id: '1', type: 'user_joined', message: 'New user registered', timestamp: '2024-01-15T10:30:00Z' },
        { id: '2', type: 'job_posted', message: 'New job posted', timestamp: '2024-01-15T09:15:00Z' },
      ],
    };
  }
};

// User Management API
export const getUsers = async (page = 1, pageSize = 10): Promise<PaginatedResponse<AdminUser>> => {
  try {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<AdminUser>>>(
      `/admin/users?page=${page}&pageSize=${pageSize}`
    );
    return response.data.data;
  } catch (error) {
    console.log('Using mock users data');
    return {
      data: mockUsers,
      total: mockUsers.length,
      page,
      pageSize,
    };
  }
};

export const createUser = async (userData: Partial<AdminUser>): Promise<AdminUser> => {
  try {
    const response = await axiosInstance.post<ApiResponse<AdminUser>>('/admin/users', userData);
    return response.data.data;
  } catch (error) {
    console.log('Mock creating user');
    return { ...userData, id: Date.now().toString() } as AdminUser;
  }
};

export const updateUser = async (userId: string, userData: Partial<AdminUser>): Promise<AdminUser> => {
  try {
    const response = await axiosInstance.put<ApiResponse<AdminUser>>(`/admin/users/${userId}`, userData);
    return response.data.data;
  } catch (error) {
    console.log('Mock updating user');
    return { ...userData, id: userId } as AdminUser;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/admin/users/${userId}`);
  } catch (error) {
    console.log('Mock deleting user');
  }
};

// Job Management API
export const getJobs = async (page = 1, pageSize = 10): Promise<PaginatedResponse<Job>> => {
  try {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Job>>>(
      `/admin/jobs?page=${page}&pageSize=${pageSize}`
    );
    return response.data.data;
  } catch (error) {
    console.log('Using mock jobs data');
    return {
      data: mockJobs,
      total: mockJobs.length,
      page,
      pageSize,
    };
  }
};

export const createJob = async (jobData: Partial<Job>): Promise<Job> => {
  try {
    const response = await axiosInstance.post<ApiResponse<Job>>('/admin/jobs', jobData);
    return response.data.data;
  } catch (error) {
    console.log('Mock creating job');
    return { ...jobData, id: Date.now().toString() } as Job;
  }
};

export const updateJob = async (jobId: string, jobData: Partial<Job>): Promise<Job> => {
  try {
    const response = await axiosInstance.put<ApiResponse<Job>>(`/admin/jobs/${jobId}`, jobData);
    return response.data.data;
  } catch (error) {
    console.log('Mock updating job');
    return { ...jobData, id: jobId } as Job;
  }
};

export const deleteJob = async (jobId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/admin/jobs/${jobId}`);
  } catch (error) {
    console.log('Mock deleting job');
  }
};

// Assessment Management API
export const getAssessments = async (page = 1, pageSize = 10): Promise<PaginatedResponse<Assessment>> => {
  try {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<Assessment>>>(
      `/admin/assessments?page=${page}&pageSize=${pageSize}`
    );
    return response.data.data;
  } catch (error) {
    console.log('Using mock assessments data');
    return {
      data: mockAssessments,
      total: mockAssessments.length,
      page,
      pageSize,
    };
  }
};

export const createAssessment = async (assessmentData: Partial<Assessment>): Promise<Assessment> => {
  try {
    const response = await axiosInstance.post<ApiResponse<Assessment>>('/admin/assessments', assessmentData);
    return response.data.data;
  } catch (error) {
    console.log('Mock creating assessment');
    return { ...assessmentData, id: Date.now().toString() } as Assessment;
  }
};

export const updateAssessment = async (assessmentId: string, assessmentData: Partial<Assessment>): Promise<Assessment> => {
  try {
    const response = await axiosInstance.put<ApiResponse<Assessment>>(`/admin/assessments/${assessmentId}`, assessmentData);
    return response.data.data;
  } catch (error) {
    console.log('Mock updating assessment');
    return { ...assessmentData, id: assessmentId } as Assessment;
  }
};

export const deleteAssessment = async (assessmentId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/admin/assessments/${assessmentId}`);
  } catch (error) {
    console.log('Mock deleting assessment');
  }
};
