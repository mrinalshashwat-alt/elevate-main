'use client';

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// User Pages
import UserDashboard from '../pages/User/Dashboard';
import MockPrep from '../pages/User/MockPrep';
import Agents from '../pages/User/Agents';
import AICommunication from '../pages/User/AICommunication';
import AIMockInterview from '../pages/User/AIMockInterview';
import AICareerCoach from '../pages/User/AICareerCoach';
import Courses from '../pages/User/Courses';
import Content from '../pages/User/Content';
import Test from '../pages/User/Test';
import SystemCheck from '../pages/User/SystemCheck';
import Assessment from '../pages/User/Assessment';

const UserRoutes = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mock-prep"
        element={
          <ProtectedRoute requiredRole="user">
            <MockPrep />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agents"
        element={
          <ProtectedRoute requiredRole="user">
            <Agents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-communication"
        element={
          <ProtectedRoute requiredRole="user">
            <AICommunication />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-mock-interview"
        element={
          <ProtectedRoute requiredRole="user">
            <AIMockInterview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-career-coach"
        element={
          <ProtectedRoute requiredRole="user">
            <AICareerCoach />
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <ProtectedRoute requiredRole="user">
            <Courses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content/:courseId"
        element={
          <ProtectedRoute requiredRole="user">
            <Content />
          </ProtectedRoute>
        }
      />
      <Route
        path="/test/:courseId"
        element={
          <ProtectedRoute requiredRole="user">
            <Test />
          </ProtectedRoute>
        }
      />
      <Route
        path="/system-check"
        element={<SystemCheck />}
      />
      <Route
        path="/assessment"
        element={<Assessment />}
      />
    </Routes>
  );
};

export default UserRoutes;
