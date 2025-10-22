# Elevate Career - React Router Implementation

## 🎉 Implementation Complete!

Your React + TypeScript project has been successfully set up with React Router, TanStack Query, and role-based routing.

## 📁 Project Structure

```
src/
├── api/
│   ├── axiosInstance.ts      # Axios configuration with interceptors
│   ├── user.ts                # User API functions
│   └── admin.ts               # Admin API functions
├── routes/
│   ├── ProtectedRoute.tsx     # Route guard component
│   ├── UserRoutes.tsx         # User route definitions
│   └── AdminRoutes.tsx        # Admin route definitions
├── pages/
│   ├── Home/
│   │   └── Home.tsx           # Landing page with login
│   ├── User/
│   │   ├── Dashboard.tsx      # User dashboard
│   │   ├── MockPrep.tsx       # Mock interview prep
│   │   ├── Agents.tsx         # AI agents hub
│   │   ├── AICommunication.tsx
│   │   ├── AIMockInterview.tsx
│   │   ├── AICareerCoach.tsx
│   │   ├── Courses.tsx        # Course listing
│   │   ├── Content.tsx        # Course content viewer
│   │   └── Test.tsx           # Course tests
│   └── Admin/
│       ├── Dashboard.tsx      # Admin dashboard
│       ├── ManageUsers.tsx    # User management (CRUD)
│       ├── Jobs.tsx           # Job management (CRUD)
│       ├── CreateAssessment.tsx
│       └── AssessmentList.tsx
├── context/
│   └── AuthContext.tsx        # Authentication context
├── types/
│   └── index.ts               # TypeScript type definitions
├── App.tsx                    # Main app with routing
├── index.tsx                  # Entry point
└── globals.css                # Global styles
```

## 🚀 Getting Started

### 1. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 2. Login

**User Login:**
- Click "User Login" button
- Enter any email/password (demo mode)
- You'll be redirected to `/user/dashboard`

**Admin Login:**
- Click "Admin Login" button
- Enter any email/password (demo mode)
- You'll be redirected to `/admin/dashboard`

## 🔐 Authentication Flow

1. **Home Page** (`/`) - Landing page with login options
2. **Login** - Mock authentication (stores user in localStorage)
3. **Role-based Redirect**:
   - User role → `/user/dashboard`
   - Admin role → `/admin/dashboard`
4. **Protected Routes** - All routes require authentication
5. **Role Guards** - Users can't access admin routes and vice versa

## 🎯 User Flow

```
Home → User Login → Dashboard
                      ├── Mock Prep → Practice Interviews
                      ├── Agents → AI Communication
                      │          → AI Mock Interview
                      │          → AI Career Coach
                      └── Courses → Content → Test
```

## 👨‍💼 Admin Flow

```
Home → Admin Login → Dashboard
                       ├── Manage Users (CRUD)
                       ├── Jobs (CRUD)
                       └── Assessments → Create Assessment
```

## 🔧 Key Features Implemented

### ✅ React Router v6
- Nested routing
- Protected routes
- Role-based access control
- Dynamic route parameters

### ✅ TanStack Query v5
- Data fetching with caching
- Mutations for CRUD operations
- Automatic refetching
- Loading and error states

### ✅ Authentication
- AuthContext with React Context API
- localStorage persistence
- Role-based routing
- Protected route guards

### ✅ API Integration
- Axios instance with interceptors
- Mock data for development
- Separate user and admin APIs
- Error handling

### ✅ UI/UX
- TailwindCSS styling
- Responsive design
- Loading states
- Modal dialogs
- Form validation

## 📝 API Integration

Currently using **mock data** for development. To integrate with your backend:

### 1. Update API Base URL

In `src/api/axiosInstance.ts`:

```typescript
const axiosInstance = axios.create({
  baseURL: 'https://your-api-url.com/api', // Update this
  // ...
});
```

### 2. Replace Mock Functions

In `src/api/user.ts` and `src/api/admin.ts`, replace the mock data returns with actual API calls.

Example:
```typescript
// Current (mock)
export const getUserDashboard = async (): Promise<DashboardStats> => {
  try {
    const response = await axiosInstance.get('/user/dashboard');
    return response.data.data;
  } catch (error) {
    return mockDashboardStats; // Remove this
  }
};

// Production (real API)
export const getUserDashboard = async (): Promise<DashboardStats> => {
  const response = await axiosInstance.get('/user/dashboard');
  return response.data.data;
};
```

## 🔑 Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://your-api-url.com/api
```

## 📊 Available Routes

### Public Routes
- `/` - Home/Landing page

### User Routes (requires user role)
- `/user/dashboard` - User dashboard
- `/user/mock-prep` - Mock interview preparation
- `/user/agents` - AI agents hub
- `/user/ai-communication` - AI Communication Coach
- `/user/ai-mock-interview` - AI Mock Interview
- `/user/ai-career-coach` - AI Career Coach
- `/user/courses` - Course listing
- `/user/content/:courseId` - Course content
- `/user/test/:courseId` - Course test

### Admin Routes (requires admin role)
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/jobs` - Job management
- `/admin/assessments` - Assessment list
- `/admin/create-assessment` - Create new assessment

## 🎨 Customization

### Adding New Routes

1. **Create the page component** in `src/pages/User/` or `src/pages/Admin/`
2. **Add the route** in `src/routes/UserRoutes.tsx` or `AdminRoutes.tsx`
3. **Add API functions** in `src/api/user.ts` or `admin.ts`
4. **Update types** in `src/types/index.ts` if needed

### Example: Adding a new user page

```typescript
// 1. Create src/pages/User/NewPage.tsx
const NewPage = () => { /* ... */ };

// 2. Add route in src/routes/UserRoutes.tsx
<Route
  path="/new-page"
  element={
    <ProtectedRoute requiredRole="user">
      <NewPage />
    </ProtectedRoute>
  }
/>

// 3. Add API function in src/api/user.ts
export const getNewPageData = async () => {
  const response = await axiosInstance.get('/user/new-page');
  return response.data;
};
```

## 🐛 Troubleshooting

### Issue: Routes not working
- Make sure you're using the correct path format
- Check that BrowserRouter is wrapping your app
- Verify protected routes have proper authentication

### Issue: API calls failing
- Check the API base URL in axiosInstance.ts
- Verify CORS settings on your backend
- Check browser console for error messages

### Issue: Authentication not persisting
- Check localStorage in browser DevTools
- Verify AuthContext is wrapping the app
- Check token expiration logic

## 📚 Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router v6** - Routing
- **TanStack Query v5** - Data fetching
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **Next.js 14** - Framework (for development server)

## 🚀 Next Steps

1. **Connect to Real API** - Replace mock data with actual API calls
2. **Add Authentication** - Implement JWT or OAuth
3. **Add Error Boundaries** - Better error handling
4. **Add Loading Skeletons** - Improve UX
5. **Add Tests** - Unit and integration tests
6. **Add Analytics** - Track user behavior
7. **Optimize Performance** - Code splitting, lazy loading

## 📞 Support

For issues or questions, refer to the documentation:
- [React Router](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [TailwindCSS](https://tailwindcss.com/)

---

**Happy Coding! 🎉**
