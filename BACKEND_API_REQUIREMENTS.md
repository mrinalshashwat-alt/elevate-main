# Backend API Requirements - Complete List

This document lists all places in the codebase where data is fetched from the backend and the purpose of each API call.

## Base Configuration

**File:** `src/api/axiosInstance.ts`
- **Base URL:** `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'`
- **Purpose:** Centralized axios instance with authentication interceptors
- **Features:**
  - Automatically adds Bearer token from localStorage to requests
  - Handles 401 unauthorized responses (redirects to login)
  - 5-second timeout

---

## Admin API Calls

### 1. Admin Dashboard Statistics
**File:** `src/pages/Admin/Dashboard.jsx`  
**API Function:** `getAdminDashboard()` from `src/api/admin.ts`  
**Endpoint:** `GET /admin/dashboard`  
**Purpose:** Fetch admin dashboard statistics including:
- Total users count
- Active users count
- Total jobs count
- Total assessments count
- Recent activity feed

**Used For:** Displaying overview metrics on admin dashboard page

---

### 2. User Management
**File:** `src/pages/Admin/ManageUsers.jsx`  
**API Functions:** 
- `getUsers(page, pageSize)` - `GET /admin/users?page={page}&pageSize={pageSize}`
- `createUser(userData)` - `POST /admin/users`
- `updateUser(userId, userData)` - `PUT /admin/users/{userId}`
- `deleteUser(userId)` - `DELETE /admin/users/{userId}`

**Purpose:** 
- **GET:** Fetch paginated list of all users for admin management
- **POST:** Create new user accounts
- **PUT:** Update existing user information (name, email, role, status)
- **DELETE:** Remove user accounts

**Used For:** User management interface where admins can view, create, edit, and delete users

---

### 3. Job Management
**File:** `src/pages/Admin/Jobs.jsx` and `src/pages/Admin/AssessmentList.jsx`  
**API Functions:**
- `getJobs(page, pageSize)` - `GET /admin/jobs?page={page}&pageSize={pageSize}`
- `createJob(jobData)` - `POST /admin/jobs`
- `updateJob(jobId, jobData)` - `PUT /admin/jobs/{jobId}`
- `deleteJob(jobId)` - `DELETE /admin/jobs/{jobId}`

**Purpose:**
- **GET:** Fetch paginated list of all job postings
- **POST:** Create new job postings (title, description, company, location, salary, etc.)
- **PUT:** Update existing job information
- **DELETE:** Remove job postings

**Used For:** 
- Job management interface
- Creating jobs before creating assessments
- Linking assessments to specific job positions

---

### 4. Assessment Management
**Files:** 
- `src/pages/Admin/AssessmentList.jsx`
- `src/pages/Admin/CreateAssessment.jsx`

**API Functions:**
- `getAssessments(page, pageSize)` - `GET /admin/assessments?page={page}&pageSize={pageSize}`
- `createAssessment(assessmentData)` - `POST /admin/assessments`
- `updateAssessment(assessmentId, assessmentData)` - `PUT /admin/assessments/{assessmentId}`
- `deleteAssessment(assessmentId)` - `DELETE /admin/assessments/{assessmentId}`

**Purpose:**
- **GET:** Fetch paginated list of all assessments
- **POST:** Create new assessments with questions, duration, job association
- **PUT:** Update existing assessment details
- **DELETE:** Remove assessments

**Used For:**
- Assessment listing and management
- Creating assessments linked to jobs
- Managing assessment questions (coding, MCQ, video types)

---

## User API Calls

### 5. User Dashboard Statistics
**File:** `src/pages/User/Dashboard.jsx`  
**API Function:** `getUserDashboard()` from `src/api/user.ts`  
**Endpoint:** `GET /user/dashboard`  
**Purpose:** Fetch user-specific dashboard statistics:
- Total courses enrolled
- Completed courses count
- Upcoming interviews count
- Overall skill score

**Used For:** Displaying personalized metrics on user dashboard

---

### 6. User Courses
**File:** `src/pages/User/Courses.jsx` (referenced but not fully shown)  
**API Function:** `getUserCourses()` from `src/api/user.ts`  
**Endpoint:** `GET /user/courses`  
**Purpose:** Fetch list of courses available to the user

**Used For:** Displaying course catalog and enrolled courses

---

### 7. Course Content
**File:** `src/pages/User/ContentMUI.jsx`  
**API Function:** `getCourseContent(courseId)` from `src/api/user.ts`  
**Endpoint:** `GET /user/courses/{courseId}/content`  
**Purpose:** Fetch detailed content for a specific course:
- Course modules
- Module completion status
- Module duration
- Course materials

**Used For:** Displaying course content when user accesses a specific course

---

### 8. Mock Interviews
**Files:** 
- `src/pages/User/MockPrep.jsx`
- `src/pages/User/MockPrepMUI.jsx`

**API Function:** `getMockInterviews()` from `src/api/user.ts`  
**Endpoint:** `GET /user/mock-interviews`  
**Purpose:** Fetch available mock interview sessions:
- Interview titles
- Interview types (Technical, Behavioral)
- Difficulty levels
- Duration
- Scheduled times

**Used For:** Displaying available mock interview options for practice

---

### 9. Schedule Mock Interview
**File:** Referenced in `src/api/user.ts`  
**API Function:** `scheduleMockInterview(data)` from `src/api/user.ts`  
**Endpoint:** `POST /user/mock-interviews`  
**Purpose:** Schedule a new mock interview session

**Used For:** Allowing users to book mock interview sessions

---

### 10. AI Agents
**File:** `src/pages/User/Agents.jsx` (referenced)  
**API Function:** `getAIAgents()` from `src/api/user.ts`  
**Endpoint:** `GET /user/ai-agents`  
**Purpose:** Fetch available AI agent tools:
- AI Communication Coach
- AI Mock Interview
- AI Career Coach

**Used For:** Displaying available AI-powered coaching tools

---

### 11. Submit Test
**File:** `src/pages/User/Test.jsx`  
**API Function:** `submitTest(testId, answers)` from `src/api/user.ts`  
**Endpoint:** `POST /user/tests/{testId}/submit`  
**Purpose:** Submit test answers and receive results:
- Test score
- Pass/fail status
- Feedback

**Used For:** Processing course test submissions and displaying results

---

## Authentication (Firebase)

**File:** `src/context/AuthContext.jsx`  
**Service:** Firebase Authentication  
**Note:** This is not a traditional REST API but uses Firebase SDK

**Operations:**
- `signInWithEmailAndPassword()` - User login
- `createUserWithEmailAndPassword()` - User registration
- `signOut()` - User logout
- `onAuthStateChanged()` - Monitor authentication state
- `getIdToken()` - Get Firebase ID token for backend authentication

**Purpose:** 
- User authentication and authorization
- Token management for API requests
- Session persistence

---

## API Response Format

All API responses should follow this structure:

```typescript
{
  data: T,  // The actual response data
  message?: string,
  error?: string
}
```

For paginated responses:

```typescript
{
  data: T[],
  total: number,
  page: number,
  pageSize: number
}
```

---

## Current Implementation Status

**Note:** Currently, all API functions have fallback mock data implementations. The codebase is designed to:
1. Try to call the backend API
2. Fall back to mock data if the API call fails
3. Log errors for debugging

This allows the frontend to work independently while the backend is being developed.

---

## Required Backend Endpoints Summary

### Admin Endpoints
1. `GET /admin/dashboard` - Dashboard statistics
2. `GET /admin/users` - List users (paginated)
3. `POST /admin/users` - Create user
4. `PUT /admin/users/:id` - Update user
5. `DELETE /admin/users/:id` - Delete user
6. `GET /admin/jobs` - List jobs (paginated)
7. `POST /admin/jobs` - Create job
8. `PUT /admin/jobs/:id` - Update job
9. `DELETE /admin/jobs/:id` - Delete job
10. `GET /admin/assessments` - List assessments (paginated)
11. `POST /admin/assessments` - Create assessment
12. `PUT /admin/assessments/:id` - Update assessment
13. `DELETE /admin/assessments/:id` - Delete assessment

### User Endpoints
1. `GET /user/dashboard` - User dashboard statistics
2. `GET /user/courses` - List user courses
3. `GET /user/courses/:id/content` - Get course content
4. `GET /user/mock-interviews` - List mock interviews
5. `POST /user/mock-interviews` - Schedule mock interview
6. `GET /user/ai-agents` - List AI agents
7. `POST /user/tests/:id/submit` - Submit test

---

## Authentication Requirements

All API endpoints (except authentication endpoints) require:
- **Authorization Header:** `Bearer {token}`
- Token is obtained from Firebase authentication
- Token is stored in localStorage and automatically added by axios interceptor
- 401 responses trigger automatic logout and redirect to login

---

## Environment Variables

Required environment variable:
- `NEXT_PUBLIC_API_URL` - Base URL for the backend API (defaults to `http://localhost:3000/api`)


