# Elevate Career Platform - Frontend Documentation

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Architecture Overview](#architecture-overview)
- [API Integration](#api-integration)
- [Authentication & Authorization](#authentication--authorization)
- [Routing Structure](#routing-structure)
- [Key Components](#key-components)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
- [Backend Integration Points](#backend-integration-points)
- [Common Patterns & Best Practices](#common-patterns--best-practices)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**Elevate Career Platform** is a Next.js-based frontend application that provides an AI-powered career development platform. The application offers features including:

- **User Dashboard**: Course tracking, skill scores, and progress monitoring
- **AI Features**: Career coaching, mock interviews, and communication training
- **Assessment System**: Take and review technical assessments
- **Admin Panel**: User management, job postings, and assessment creation
- **Course Management**: Browse and complete courses with progress tracking

The frontend communicates with a Django REST Framework backend API for all data operations.

---

## 🛠 Technology Stack

### Core Framework
- **Next.js 14.2.0** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript** - Type safety (partial implementation)

### State Management & Data Fetching
- **@tanstack/react-query** - Server state management and caching
- **React Context API** - Global state (authentication)

### UI & Styling
- **Tailwind CSS 3.4.3** - Utility-first CSS framework
- **Material-UI (MUI) 7.3.4** - Component library
- **Framer Motion 12.23.24** - Animation library
- **React Icons 5.5.0** - Icon library

### Authentication
- **Firebase Authentication** - User authentication and token management

### HTTP Client
- **Axios 1.12.2** - HTTP client with interceptors

### Code Editor
- **@monaco-editor/react 4.7.0** - Code editor for assessments

### Proctoring & Media
- **@mediapipe** - Face detection, hand tracking, and pose estimation for proctoring

### Other Libraries
- **PDF.js** - PDF rendering
- **React Router DOM** - Client-side routing (legacy, being migrated to Next.js routing)

---

## 📁 Project Structure

```
elevate react/
├── app/                          # Next.js App Router pages
│   ├── admin/                    # Admin routes
│   │   ├── dashboard/
│   │   ├── manage-users/
│   │   ├── jobs/
│   │   ├── create-assessment/
│   │   ├── assessment-list/
│   │   ├── assessment-view/
│   │   ├── candidates/
│   │   └── results/
│   ├── user/                     # User routes
│   │   ├── dashboard/
│   │   ├── courses/
│   │   ├── assessment/
│   │   ├── assessment-start/
│   │   ├── assessment-end/
│   │   ├── assessment-summary/
│   │   ├── ai-career-coach/
│   │   ├── ai-mock-interview/
│   │   ├── ai-communication/
│   │   └── ...
│   ├── signup/                   # Registration page
│   ├── layout.jsx                # Root layout
│   ├── page.jsx                  # Home page
│   └── globals.css               # Global styles
│
├── src/                          # Source code
│   ├── api/                      # API client functions
│   │   ├── axiosInstance.ts      # Axios configuration
│   │   ├── user.ts               # User API endpoints
│   │   └── admin.ts              # Admin API endpoints
│   │
│   ├── components/               # Reusable components
│   │   ├── AppProviders.jsx      # Context providers wrapper
│   │   └── AdminLayout.jsx       # Admin layout component
│   │
│   ├── context/                  # React Context providers
│   │   └── AuthContext.jsx       # Authentication context
│   │
│   ├── lib/                      # Utility libraries
│   │   ├── firebase.js           # Firebase configuration
│   │   ├── judge0.js             # Judge0 integration
│   │   ├── mediapipeProctoring.js # Proctoring utilities
│   │   └── ...
│   │
│   ├── pages/                    # Page components (legacy)
│   │   ├── Home/
│   │   ├── User/
│   │   ├── Admin/
│   │   └── Auth/
│   │
│   ├── routes/                   # Route protection
│   │   ├── ProtectedRoute.jsx    # Route guard component
│   │   ├── UserRoutes.jsx        # User route definitions
│   │   └── AdminRoutes.jsx       # Admin route definitions
│   │
│   └── types/                    # TypeScript type definitions
│       └── index.ts              # Shared types
│
├── public/                       # Static assets
│   ├── *.mp4                     # Video files
│   ├── *.png, *.jpg              # Images
│   └── index.html                # Legacy HTML
│
├── package.json                  # Dependencies and scripts
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── postcss.config.js             # PostCSS configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Firebase project** (for authentication)

### Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd "elevate react"
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   # ... other Firebase config if needed
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

### Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

---

## 🏗 Architecture Overview

### Application Flow

```
User Request
    ↓
Next.js App Router (app/)
    ↓
ProtectedRoute (checks authentication)
    ↓
Page Component (app/*/page.jsx)
    ↓
Actual Component (src/pages/)
    ↓
API Call (src/api/)
    ↓
Backend API (Django REST Framework)
```

### Key Architectural Patterns

1. **App Router Pattern**: Next.js 14 App Router for file-based routing
2. **Component Composition**: Pages in `app/` wrap components from `src/pages/`
3. **API Abstraction**: All backend calls go through `src/api/` functions
4. **Context for Global State**: Authentication state managed via React Context
5. **Protected Routes**: Route-level authentication checks

---

## 🔌 API Integration

### Axios Configuration

The application uses a centralized Axios instance configured in `src/api/axiosInstance.ts`:

**Key Features:**
- Base URL: `process.env.NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`)
- Automatic token injection from `localStorage`
- 401 error handling (auto-logout on unauthorized)
- 5-second timeout for requests

**Example:**
```typescript
import axiosInstance from './axiosInstance';

// GET request
const response = await axiosInstance.get('/api/v1/user/dashboard');

// POST request
const response = await axiosInstance.post('/api/v1/user/courses', data);
```

### API Response Format

The backend is expected to return responses in this format:

```typescript
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

// For paginated responses
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

### API Client Files

#### `src/api/user.ts`
Contains all user-facing API endpoints:
- `getUserDashboard()` - Fetch user dashboard stats
- `getUserCourses()` - Get user's courses
- `getCourseContent(courseId)` - Get course details
- `getMockInterviews()` - List mock interviews
- `scheduleMockInterview(data)` - Schedule interview
- `getAIAgents()` - Get available AI agents
- `submitTest(testId, answers)` - Submit assessment

#### `src/api/admin.ts`
Contains all admin-facing API endpoints:
- `getAdminDashboard()` - Admin dashboard stats
- `getUsers(page, pageSize)` - List users (paginated)
- `createUser(userData)` - Create new user
- `updateUser(userId, userData)` - Update user
- `deleteUser(userId)` - Delete user
- `getJobs(page, pageSize)` - List jobs
- `createJob(jobData)` - Create job
- `getAssessments(page, pageSize)` - List assessments
- `createAssessment(assessmentData)` - Create assessment

### Error Handling

All API functions include fallback to mock data if the backend is unavailable:

```typescript
export const getUserDashboard = async (): Promise<DashboardStats> => {
  try {
    const response = await axiosInstance.get('/user/dashboard');
    return response.data.data;
  } catch (error) {
    console.log('Using mock dashboard data', error?.message);
    return Promise.resolve(mockDashboardStats);
  }
};
```

**Note for Backend Developers**: The frontend gracefully handles backend unavailability by using mock data. This allows frontend development to continue even when the backend is down.

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. **User Registration/Login**
   - Uses Firebase Authentication
   - On successful auth, Firebase ID token is stored in `localStorage`
   - User profile is stored in `localStorage` as JSON

2. **Token Management**
   - Token stored in `localStorage.getItem('token')`
   - Automatically attached to all API requests via Axios interceptor
   - Token refreshed automatically by Firebase

3. **Authentication Context**
   - `AuthContext` (`src/context/AuthContext.jsx`) provides:
     - `user` - Current user object
     - `isAuthenticated` - Boolean flag
     - `isLoading` - Loading state
     - `login(email, password, role)` - Login function
     - `register(name, email, password)` - Registration function
     - `logout()` - Logout function

### Protected Routes

Routes are protected using the `ProtectedRoute` component:

```jsx
// Example: app/user/dashboard/page.jsx
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

export default function UserDashboardPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <UserDashboard />
    </ProtectedRoute>
  );
}
```

**Protection Levels:**
- `requiredRole="user"` - Requires authenticated user
- `requiredRole="admin"` - Requires admin role (currently bypassed, see code)
- No `requiredRole` - Public route

### User Roles

- **`user`** - Regular user (default)
- **`admin`** - Administrator

Role is stored in:
- `localStorage.getItem('userRole')`
- User object: `user.role`

---

## 🗺 Routing Structure

### Next.js App Router

The application uses Next.js 14 App Router with file-based routing:

```
app/
├── page.jsx                    → / (Home page)
├── signup/page.jsx             → /signup
├── user/
│   ├── dashboard/page.jsx      → /user/dashboard
│   ├── courses/page.jsx        → /user/courses
│   ├── assessment/page.jsx     → /user/assessment
│   └── ...
└── admin/
    ├── dashboard/page.jsx      → /admin/dashboard
    ├── manage-users/page.jsx   → /admin/manage-users
    └── ...
```

### Route Protection Pattern

Each protected route follows this pattern:

```jsx
'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '../../../src/routes/ProtectedRoute';

const ComponentName = dynamic(() => import('../../../src/pages/User/ComponentName'), { 
  ssr: false 
});

export default function PageName() {
  return (
    <ProtectedRoute requiredRole="user">
      <ComponentName />
    </ProtectedRoute>
  );
}
```

**Note**: `ssr: false` is used for client-side only components that rely on browser APIs.

---

## 🧩 Key Components

### 1. AppProviders (`src/components/AppProviders.jsx`)

Wraps the entire application with necessary providers:
- `AuthProvider` - Authentication context
- `QueryClientProvider` - React Query for data fetching

Used in `app/layout.jsx`:

```jsx
<AppProviders>
  {children}
</AppProviders>
```

### 2. ProtectedRoute (`src/routes/ProtectedRoute.jsx`)

Route guard component that:
- Checks authentication status
- Verifies user role
- Redirects unauthenticated users to home
- Shows loading state during auth check

### 3. AuthContext (`src/context/AuthContext.jsx`)

Manages global authentication state:
- Firebase authentication integration
- Token management
- User profile management
- Auto-logout on 401 errors

### 4. AdminLayout (`src/components/AdminLayout.jsx`)

Layout wrapper for admin pages (if exists) providing:
- Navigation
- Sidebar
- Header

---

## 🔧 Environment Variables

### Required Variables

Create a `.env.local` file:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Firebase Configuration (if not hardcoded)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put sensitive keys here.

### Current Configuration

- **API URL**: Defaults to `http://localhost:8000` if `NEXT_PUBLIC_API_URL` is not set
- **Firebase**: Currently hardcoded in `src/lib/firebase.js` (should be moved to env vars)

---

## 💻 Development Workflow

### Adding a New Page

1. **Create route file** in `app/`:
   ```jsx
   // app/user/new-feature/page.jsx
   'use client';
   import dynamic from 'next/dynamic';
   import ProtectedRoute from '../../../src/routes/ProtectedRoute';
   
   const NewFeature = dynamic(() => import('../../../src/pages/User/NewFeature'), { 
     ssr: false 
   });
   
   export default function NewFeaturePage() {
     return (
       <ProtectedRoute requiredRole="user">
         <NewFeature />
       </ProtectedRoute>
     );
   }
   ```

2. **Create component** in `src/pages/User/NewFeature.jsx`

3. **Add API function** in `src/api/user.ts` (if needed)

### Adding a New API Endpoint

1. **Add function** to appropriate API file (`src/api/user.ts` or `src/api/admin.ts`):
   ```typescript
   export const getNewFeature = async (): Promise<NewFeatureData> => {
     try {
       const response = await axiosInstance.get<ApiResponse<NewFeatureData>>('/user/new-feature');
       return response.data.data;
     } catch (error) {
       console.log('Using mock data');
       return mockData;
     }
   };
   ```

2. **Use in component**:
   ```jsx
   import { getNewFeature } from '../../api/user';
   
   const data = await getNewFeature();
   ```

### Styling Guidelines

- **Primary**: Use Tailwind CSS utility classes
- **Components**: Use Material-UI components when needed
- **Animations**: Use Framer Motion for complex animations
- **Custom Styles**: Add to `app/globals.css` or component-level CSS modules

---

## 🔗 Backend Integration Points

### Expected Backend Endpoints

#### User Endpoints (`/api/v1/user/` or `/user/`)

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/user/dashboard` | GET | Get dashboard stats | - | `DashboardStats` |
| `/user/courses` | GET | List user courses | - | `Course[]` |
| `/user/courses/:id/content` | GET | Get course content | - | Course content |
| `/user/mock-interviews` | GET | List mock interviews | - | `MockInterview[]` |
| `/user/mock-interviews` | POST | Schedule interview | Interview data | `MockInterview` |
| `/user/ai-agents` | GET | List AI agents | - | AI agent list |
| `/user/tests/:id/submit` | POST | Submit test | `{ answers }` | Test results |

#### Admin Endpoints (`/api/v1/admin/` or `/admin/`)

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/admin/dashboard` | GET | Admin dashboard stats | - | Dashboard data |
| `/admin/users` | GET | List users (paginated) | Query: `page`, `pageSize` | `PaginatedResponse<AdminUser>` |
| `/admin/users` | POST | Create user | User data | `AdminUser` |
| `/admin/users/:id` | PUT | Update user | User data | `AdminUser` |
| `/admin/users/:id` | DELETE | Delete user | - | - |
| `/admin/jobs` | GET | List jobs (paginated) | Query: `page`, `pageSize` | `PaginatedResponse<Job>` |
| `/admin/jobs` | POST | Create job | Job data | `Job` |
| `/admin/jobs/:id` | PUT | Update job | Job data | `Job` |
| `/admin/jobs/:id` | DELETE | Delete job | - | - |
| `/admin/assessments` | GET | List assessments (paginated) | Query: `page`, `pageSize` | `PaginatedResponse<Assessment>` |
| `/admin/assessments` | POST | Create assessment | Assessment data | `Assessment` |
| `/admin/assessments/:id` | PUT | Update assessment | Assessment data | `Assessment` |
| `/admin/assessments/:id` | DELETE | Delete assessment | - | - |

### Authentication Headers

All authenticated requests include:
```
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

### Error Responses

The frontend expects error responses in this format:
```json
{
  "error": "Error message",
  "status": 400
}
```

On 401 (Unauthorized), the frontend automatically:
1. Removes token from localStorage
2. Removes user from localStorage
3. Redirects to home page (`/`)

---

## 📝 Common Patterns & Best Practices

### 1. Data Fetching Pattern

```jsx
'use client';
import { useState, useEffect } from 'react';
import { getUserDashboard } from '../../api/user';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getUserDashboard();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{/* Render data */}</div>;
}
```

### 2. Using React Query (Recommended)

```jsx
'use client';
import { useQuery } from '@tanstack/react-query';
import { getUserDashboard } from '../../api/user';

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getUserDashboard,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{/* Render data */}</div>;
}
```

### 3. Form Submission Pattern

```jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const result = await createUser(formData);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

### 4. Navigation Pattern

```jsx
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/user/dashboard');
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. API Calls Failing

**Problem**: API requests return errors or time out.

**Solutions**:
- Check `NEXT_PUBLIC_API_URL` is set correctly
- Verify backend is running on the expected port
- Check CORS settings on backend
- Verify authentication token is valid

#### 2. Authentication Not Working

**Problem**: User can't login or gets logged out immediately.

**Solutions**:
- Check Firebase configuration in `src/lib/firebase.js`
- Verify Firebase project settings
- Check browser console for Firebase errors
- Clear localStorage and try again

#### 3. Route Protection Not Working

**Problem**: Protected routes are accessible without authentication.

**Solutions**:
- Verify `ProtectedRoute` wrapper is present
- Check `AuthContext` is properly provided
- Ensure `requiredRole` prop is set correctly

#### 4. Build Errors

**Problem**: `npm run build` fails.

**Solutions**:
- Check for TypeScript errors: `npm run lint`
- Verify all environment variables are set
- Check for missing dependencies
- Clear `.next` folder and rebuild

#### 5. Styling Issues

**Problem**: Tailwind classes not applying.

**Solutions**:
- Verify `tailwind.config.js` includes correct content paths
- Restart dev server after config changes
- Check for conflicting CSS imports

### Debugging Tips

1. **Check Browser Console**: Look for errors, warnings, or network failures
2. **Check Network Tab**: Verify API requests are being made correctly
3. **Check localStorage**: Inspect stored token and user data
4. **Use React DevTools**: Inspect component state and props
5. **Check Backend Logs**: Verify backend is receiving and processing requests

---

## 📚 Additional Resources

### Documentation Links

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Material-UI Documentation](https://mui.com)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

### Project-Specific Files

- **Backend API Docs**: See `elevate-backend/docs/API.md`
- **Backend Summary**: See `elevate-backend/BACKEND_SUMMARY.md`
- **Type Definitions**: See `src/types/index.ts`

---

## 🤝 Integration Checklist for Backend Developers

When integrating with the frontend, ensure:

- [ ] CORS is configured to allow requests from `http://localhost:3000`
- [ ] API endpoints match the expected paths (see [Backend Integration Points](#backend-integration-points))
- [ ] Response format matches `ApiResponse<T>` structure
- [ ] Authentication accepts Firebase ID tokens in `Authorization: Bearer <token>` header
- [ ] Error responses include proper status codes (401 for unauthorized)
- [ ] Pagination endpoints support `page` and `pageSize` query parameters
- [ ] All endpoints return JSON with `Content-Type: application/json`

---

## 📞 Support

For questions or issues:
1. Check this README first
2. Review backend documentation in `elevate-backend/docs/`
3. Check browser console and network tab for errors
4. Verify environment variables are set correctly

---

**Last Updated**: 2024
**Frontend Version**: 1.0.0
**Next.js Version**: 14.2.0

