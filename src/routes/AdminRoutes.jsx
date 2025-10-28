'use client';

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Admin Pages
import AdminDashboard from '../pages/Admin/Dashboard';
import ManageUsers from '../pages/Admin/ManageUsers';
import Jobs from '../pages/Admin/Jobs';
import CreateAssessment from '../pages/Admin/CreateAssessment';
import AssessmentList from '../pages/Admin/AssessmentList';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requiredRole="admin">
            <ManageUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute requiredRole="admin">
            <Jobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-assessment"
        element={
          <ProtectedRoute requiredRole="admin">
            <CreateAssessment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assessments"
        element={
          <ProtectedRoute requiredRole="admin">
            <AssessmentList />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AdminRoutes;
