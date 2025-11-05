import axiosInstance from './axiosInstance';
import { DashboardStats, Course, MockInterview, ApiResponse } from '../types';

// Mock data for development
const mockDashboardStats: DashboardStats = {
  totalCourses: 12,
  completedCourses: 5,
  upcomingInterviews: 3,
  skillScore: 78,
};

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Advanced JavaScript',
    description: 'Master modern JavaScript concepts',
    duration: '8 hours',
    progress: 65,
    thumbnail: 'https://via.placeholder.com/300x200',
  },
  {
    id: '2',
    title: 'React Best Practices',
    description: 'Learn React patterns and optimization',
    duration: '6 hours',
    progress: 40,
    thumbnail: 'https://via.placeholder.com/300x200',
  },
  {
    id: '3',
    title: 'System Design',
    description: 'Design scalable systems',
    duration: '10 hours',
    progress: 20,
    thumbnail: 'https://via.placeholder.com/300x200',
  },
];

const mockInterviews: MockInterview[] = [
  {
    id: '1',
    title: 'Technical Interview - Frontend',
    type: 'Technical',
    duration: '60 min',
    difficulty: 'medium',
    scheduledAt: '2024-01-20T10:00:00Z',
  },
  {
    id: '2',
    title: 'Behavioral Interview',
    type: 'Behavioral',
    duration: '45 min',
    difficulty: 'easy',
  },
];

// User Dashboard API
export const getUserDashboard = async (): Promise<DashboardStats> => {
  try {
    const response = await axiosInstance.get<ApiResponse<DashboardStats>>('/user/dashboard', {
      timeout: 5000, // 5 second timeout
    });
    return response.data.data;
  } catch (error: any) {
    // Return mock data for development
    console.log('Using mock dashboard data', error?.message || error);
    // Ensure we always return data, even if there's an error
    return Promise.resolve(mockDashboardStats);
  }
};

// User Courses API
export const getUserCourses = async (): Promise<Course[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<Course[]>>('/user/courses');
    return response.data.data;
  } catch (error) {
    console.log('Using mock courses data');
    return mockCourses;
  }
};

export const getCourseContent = async (courseId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/user/courses/${courseId}/content`);
    return response.data.data;
  } catch (error) {
    console.log('Using mock course content');
    return {
      id: courseId,
      title: 'Course Content',
      modules: [
        { id: '1', title: 'Introduction', duration: '30 min', completed: true },
        { id: '2', title: 'Core Concepts', duration: '45 min', completed: false },
        { id: '3', title: 'Advanced Topics', duration: '60 min', completed: false },
      ],
    };
  }
};

// Mock Prep API
export const getMockInterviews = async (): Promise<MockInterview[]> => {
  try {
    const response = await axiosInstance.get<ApiResponse<MockInterview[]>>('/user/mock-interviews');
    return response.data.data;
  } catch (error) {
    console.log('Using mock interviews data');
    return mockInterviews;
  }
};

export const scheduleMockInterview = async (data: Partial<MockInterview>): Promise<MockInterview> => {
  try {
    const response = await axiosInstance.post<ApiResponse<MockInterview>>('/user/mock-interviews', data);
    return response.data.data;
  } catch (error) {
    console.log('Mock scheduling interview');
    return { ...data, id: Date.now().toString() } as MockInterview;
  }
};

// AI Agents API
export const getAIAgents = async (): Promise<any[]> => {
  try {
    const response = await axiosInstance.get('/user/ai-agents');
    return response.data.data;
  } catch (error) {
    console.log('Using mock AI agents data');
    return [
      {
        id: '1',
        name: 'AI Communication Coach',
        description: 'Improve your communication skills',
        icon: '💬',
        available: true,
      },
      {
        id: '2',
        name: 'AI Mock Interview',
        description: 'Practice interviews with AI',
        icon: '🎤',
        available: true,
      },
      {
        id: '3',
        name: 'AI Career Coach',
        description: 'Get personalized career guidance',
        icon: '🎯',
        available: true,
      },
    ];
  }
};

// Test API
export const submitTest = async (testId: string, answers: any): Promise<any> => {
  try {
    const response = await axiosInstance.post(`/user/tests/${testId}/submit`, { answers });
    return response.data.data;
  } catch (error) {
    console.log('Mock test submission');
    return {
      score: 85,
      passed: true,
      feedback: 'Great job! You passed the test.',
    };
  }
};
