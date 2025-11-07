'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getAdminDashboard } from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: getAdminDashboard,
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'jobs', label: 'Manage Jobs', path: '/admin/assessment-list', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 'assessments', label: 'Assessments', path: '/admin/assessment-list', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'candidates', label: 'Candidates', path: '/admin/candidates', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'results', label: 'Results', path: '/admin/assessment-list?section=completed', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Mock data for charts
  const userGrowthData = [45, 52, 48, 61, 55, 67, 72, 68, 75, 82, 78, 85];
  const jobPostingsData = [12, 15, 18, 14, 22, 20, 25, 23, 28, 30, 27, 32];
  const assessmentData = [8, 10, 12, 9, 15, 14, 18, 16, 20, 22, 19, 24];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className="bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.jpg" 
                alt="Logo" 
                className="w-10 h-10 object-contain rounded-lg"
              />
              <span className="text-xl font-bold">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all"
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Navigation Menu */}
          <nav className="flex space-x-2 overflow-x-auto pb-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  router.push(item.path);
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeNav === item.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">AI Assessment - Admin Analytics</h1>
          <p className="text-gray-400">Futuristic analytics for assessments, candidates, and AI performance.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400">Total Users</h3>
              <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</p>
            <div className="mt-4 w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-cyan-500 to-teal-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400">Active Users</h3>
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.activeUsers || 0}</p>
            <div className="mt-4 w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '68%' }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400">Total Jobs</h3>
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalJobs || 0}</p>
            <div className="mt-4 w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '82%' }}
                transition={{ duration: 1, delay: 0.4 }}
              />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400">Assessments</h3>
              <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.totalAssessments || 0}</p>
            <div className="mt-4 w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '90%' }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push('/admin/jobs')}
            className="bg-gradient-to-br from-orange-600 to-red-800 rounded-xl p-8 text-left hover:scale-105 transition-all"
          >
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-2xl font-bold mb-2">Create & Manage Jobs</h3>
            <p className="text-orange-200">Post jobs with AI-powered descriptions</p>
          </button>

          <button
            onClick={() => router.push('/admin/assessment-list')}
            className="bg-gradient-to-br from-purple-600 to-pink-800 rounded-xl p-8 text-left hover:scale-105 transition-all"
          >
            <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-2xl font-bold mb-2">Assessments</h3>
            <p className="text-purple-200">Create and manage assessments</p>
          </button>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart - Bar Chart with Orange Bars */}
          <motion.div 
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-4 text-white">User Growth</h3>
            <div className="h-64 relative flex items-end justify-around gap-2 px-4">
              {userGrowthData.map((val, i) => {
                const maxVal = Math.max(...userGrowthData);
                const barHeight = (val / maxVal) * 100;
                return (
                  <motion.div
                    key={i}
                    className="flex flex-col items-center flex-1"
                    initial={{ height: 0 }}
                    animate={{ height: `${barHeight}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  >
                    <div
                      className="w-full bg-gradient-to-t from-orange-600 to-orange-500 rounded-t-lg"
                      style={{ height: '100%' }}
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Job Postings Chart - Radial/Donut Chart with Teal */}
          <motion.div 
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-2 text-white">Job Postings</h3>
            <p className="text-sm text-gray-400 mb-4">Performance overview</p>
            <div className="h-64 relative flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg className="transform -rotate-90" width="192" height="192">
                  <circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="16"
                    fill="none"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="80"
                    stroke="url(#tealGradient)"
                    strokeWidth="16"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 80}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 80 * 0.35 }}
                    transition={{ duration: 1.5 }}
                  />
                  <defs>
                    <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#14b8a6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{Math.round(jobPostingsData.reduce((a, b) => a + b, 0) / jobPostingsData.length)}</div>
                    <div className="text-xs text-gray-400">Avg Postings</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Assessment Activity Chart - Bar Chart with Orange Bars */}
        <motion.div 
          className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-bold mb-4 text-white">Assessment Activity</h3>
          <div className="h-64 relative flex items-end justify-around gap-3 px-4">
            {assessmentData.map((val, i) => {
              const maxVal = Math.max(...assessmentData);
              const barHeight = (val / maxVal) * 100;
              const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return (
                <motion.div
                  key={i}
                  className="flex flex-col items-center flex-1"
                  initial={{ height: 0 }}
                  animate={{ height: `${barHeight}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                >
                  <div
                    className="w-full bg-gradient-to-t from-orange-600 to-orange-500 rounded-t-lg"
                    style={{ height: '100%' }}
                  />
                  <span className="text-xs text-gray-400 mt-2">{labels[i] || i + 1}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-2 text-white">Recent Activity</h3>
          <p className="text-sm text-gray-400 mb-4">Latest events</p>
          <div className="space-y-3">
            {stats?.recentActivity?.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-white">{activity.message}</span>
                </div>
                <span className="text-sm text-gray-400">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
            )) || (
              <div className="text-gray-400 text-center py-8">No recent activity</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
