# 🚀 Quick Start Guide

## Step 1: Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 2: Test User Flow

1. **Click "User Login"** on the home page
2. **Enter any credentials** (e.g., `user@example.com` / `password`)
3. **Click Login** - You'll be redirected to `/user/dashboard`

### Explore User Features:

- **Dashboard** - View stats and quick actions
- **Mock Prep** - Practice interviews
- **AI Agents** - Access AI tools:
  - AI Communication Coach
  - AI Mock Interview
  - AI Career Coach
- **Courses** - Browse and take courses
  - Click a course → View content → Take test

## Step 3: Test Admin Flow

1. **Logout** from user account
2. **Click "Admin Login"** on the home page
3. **Enter any credentials** (e.g., `admin@example.com` / `password`)
4. **Click Login** - You'll be redirected to `/admin/dashboard`

### Explore Admin Features:

- **Dashboard** - View admin stats
- **Manage Users** - CRUD operations for users
  - Add new user
  - Edit user
  - Delete user
- **Manage Jobs** - CRUD operations for jobs
  - Post new job
  - Edit job
  - Delete job
- **Assessments** - Manage assessments
  - Create assessment
  - View all assessments
  - Delete assessment

## 🎯 Key Features to Test

### ✅ Authentication
- [x] User login redirects to `/user/dashboard`
- [x] Admin login redirects to `/admin/dashboard`
- [x] Logout clears session and redirects to home
- [x] Protected routes require authentication

### ✅ Role-Based Access
- [x] Users cannot access admin routes
- [x] Admins cannot access user routes
- [x] Unauthorized access redirects to appropriate dashboard

### ✅ Navigation
- [x] All navigation links work
- [x] Back buttons work correctly
- [x] Dynamic routes work (e.g., `/user/content/:courseId`)

### ✅ Data Fetching (TanStack Query)
- [x] Dashboard loads stats
- [x] Courses load on courses page
- [x] Mock interviews load
- [x] Admin data loads (users, jobs, assessments)

### ✅ CRUD Operations (Admin)
- [x] Create new user/job/assessment
- [x] Edit existing items
- [x] Delete items
- [x] Data updates reflect immediately

## 🔧 Troubleshooting

### Issue: Page not loading
**Solution:** Make sure the dev server is running (`npm run dev`)

### Issue: Routes not working
**Solution:** Clear browser cache and reload

### Issue: Login not working
**Solution:** Check browser console for errors. This is a demo with mock authentication.

## 📝 Demo Credentials

**Any email/password combination works!** This is a demo with mock authentication.

Examples:
- User: `user@example.com` / `password123`
- Admin: `admin@example.com` / `admin123`

## 🎨 UI Features

- **Responsive Design** - Works on mobile, tablet, and desktop
- **Dark Theme** - Modern dark gradient background
- **Smooth Animations** - Hover effects and transitions
- **Loading States** - Shows loading indicators
- **Error Handling** - Graceful error messages

## 📊 Mock Data

All data is currently mocked for development. To connect to a real API:

1. Update `NEXT_PUBLIC_API_URL` in `.env.local`
2. Replace mock returns in `src/api/user.ts` and `src/api/admin.ts`
3. Implement real authentication in `src/context/AuthContext.tsx`

## 🎉 You're All Set!

Your app is now running with:
- ✅ React Router for navigation
- ✅ TanStack Query for data fetching
- ✅ Role-based authentication
- ✅ Complete User and Admin flows
- ✅ CRUD operations
- ✅ TailwindCSS styling

**Enjoy building! 🚀**
