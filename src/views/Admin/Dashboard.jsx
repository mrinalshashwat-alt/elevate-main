'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getAdminDashboard } from '../../api/admin';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/AdminLayout';

const AdminDashboard = () => {
  const router = useRouter();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: getAdminDashboard,
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-6">
            <div className="flex gap-2 justify-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Mock data for charts
  const userGrowthData = [45, 52, 48, 61, 55, 67, 72, 68, 75, 82, 78, 85];
  const jobPostingsData = [12, 15, 18, 14, 22, 20, 25, 23, 28, 30, 27, 32];
  const assessmentData = [8, 10, 12, 9, 15, 14, 18, 16, 20, 22, 19, 24];

  return (
    <AdminLayout title="Dashboard" stats={stats}>
        {/* Hero Section */}
        <div className="mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white via-orange-200 to-white bg-clip-text text-transparent">Analytics Dashboard</h1>
            <p className="text-base text-gray-400">Overview of your platform metrics and performance</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div 
            className="group gradient-card-blue card-glow-blue rounded-3xl p-8 premium-card-content relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Total Users</h3>
                <div className="p-4 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-2xl border border-blue-500/40 shadow-lg shadow-blue-500/20">
                  <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-5xl font-extrabold text-white mb-3 tracking-tight">{stats?.totalUsers || 0}</p>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-sm font-bold text-blue-300">+12%</span>
                </div>
                <span className="text-sm text-blue-300/70 font-medium">from last month</span>
              </div>
              <div className="w-full bg-blue-500/10 rounded-full h-3 overflow-hidden border border-blue-500/30 shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 rounded-full shadow-lg shadow-blue-500/50"
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="group gradient-card-green card-glow-green rounded-3xl p-8 premium-card-content relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest">Active Users</h3>
                <div className="p-4 bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-2xl border border-green-500/40 shadow-lg shadow-green-500/20">
                  <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-5xl font-extrabold text-white mb-3 tracking-tight">{stats?.activeUsers || 0}</p>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-sm font-bold text-green-300">+8%</span>
                </div>
                <span className="text-sm text-green-300/70 font-medium">from last month</span>
              </div>
              <div className="w-full bg-green-500/10 rounded-full h-3 overflow-hidden border border-green-500/30 shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 via-green-400 to-green-500 rounded-full shadow-lg shadow-green-500/50"
                  initial={{ width: 0 }}
                  animate={{ width: '68%' }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="group gradient-card-orange card-glow-orange rounded-3xl p-8 premium-card-content relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest">Total Jobs</h3>
                <div className="p-4 bg-gradient-to-br from-orange-500/30 to-orange-600/20 rounded-2xl border border-orange-500/40 shadow-lg shadow-orange-500/20">
                  <svg className="w-6 h-6 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-5xl font-extrabold text-white mb-3 tracking-tight">{stats?.totalJobs || 0}</p>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 rounded-full border border-orange-500/30">
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-sm font-bold text-orange-300">+15%</span>
                </div>
                <span className="text-sm text-orange-300/70 font-medium">from last month</span>
              </div>
              <div className="w-full bg-orange-500/10 rounded-full h-3 overflow-hidden border border-orange-500/30 shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 rounded-full shadow-lg shadow-orange-500/50"
                  initial={{ width: 0 }}
                  animate={{ width: '82%' }}
                  transition={{ duration: 1, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="group gradient-card-blue card-glow-blue rounded-3xl p-8 premium-card-content relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest">Assessments</h3>
                <div className="p-4 bg-gradient-to-br from-purple-500/30 to-purple-600/20 rounded-2xl border border-purple-500/40 shadow-lg shadow-purple-500/20">
                  <svg className="w-6 h-6 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <p className="text-5xl font-extrabold text-white mb-3 tracking-tight">{stats?.totalAssessments || 0}</p>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-sm font-bold text-purple-300">+22%</span>
                </div>
                <span className="text-sm text-purple-300/70 font-medium">from last month</span>
              </div>
              <div className="w-full bg-purple-500/10 rounded-full h-3 overflow-hidden border border-purple-500/30 shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 via-purple-400 to-purple-500 rounded-full shadow-lg shadow-purple-500/50"
                  initial={{ width: 0 }}
                  animate={{ width: '90%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.button
            onClick={() => router.push('/admin/assessment-list?tab=jobs')}
            className="group premium-glass rounded-2xl p-6 text-left hover:scale-105 transition-all duration-300 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-orange-500/0 to-orange-500/10 group-hover:from-orange-500/10 group-hover:via-orange-500/5 group-hover:to-transparent transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-500/30">
                  <svg className="w-6 h-6 text-orange-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-orange-400 group-hover:text-orange-300 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white group-hover:text-orange-300 transition-colors">Create & Manage Jobs</h3>
              <p className="text-sm text-gray-400">Post jobs with AI-powered descriptions</p>
            </div>
          </motion.button>

          <motion.button
            onClick={() => router.push('/admin/assessment-list?tab=assessments')}
            className="group premium-glass rounded-2xl p-6 text-left hover:scale-105 transition-all duration-300 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-purple-500/10 group-hover:from-purple-500/10 group-hover:via-purple-500/5 group-hover:to-transparent transition-all duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
                  <svg className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <svg className="w-5 h-5 text-purple-400 group-hover:text-purple-300 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-white group-hover:text-purple-300 transition-colors">Assessments</h3>
              <p className="text-sm text-gray-400">Create and manage assessments</p>
            </div>
          </motion.button>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart - Bar Chart with Orange Bars */}
          <motion.div 
            className="premium-glass rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold mb-1 text-white">User Growth</h3>
                <p className="text-sm text-gray-400">Monthly user acquisition</p>
              </div>
              <div className="px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-lg text-sm font-bold text-orange-400">
                +18%
              </div>
            </div>
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
            className="premium-glass rounded-2xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold mb-1 text-white">Job Postings</h3>
                <p className="text-sm text-gray-400">Performance overview</p>
              </div>
              <div className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm font-bold text-blue-400">
                Active
              </div>
            </div>
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
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="16"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 80}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 80 * 0.35 }}
                    transition={{ duration: 1.5 }}
                  />
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
          className="premium-glass rounded-2xl p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold mb-1 text-white">Assessment Activity</h3>
              <p className="text-sm text-gray-400">Monthly assessment completions</p>
            </div>
            <div className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm font-bold text-purple-400">
              +25%
            </div>
          </div>
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
                    className="w-full bg-white/20 rounded-t"
                    style={{ height: '100%' }}
                  />
                  <span className="text-xs text-gray-400 mt-2">{labels[i] || i + 1}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <div className="premium-glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold mb-1 text-white">Recent Activity</h3>
              <p className="text-sm text-gray-400">Latest system events</p>
            </div>
            <div className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-sm font-bold text-green-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live
            </div>
          </div>
          <div className="space-y-3">
            {stats?.recentActivity?.map((activity, idx) => (
              <motion.div 
                key={activity.id} 
                className="flex items-center justify-between p-4 premium-glass rounded-xl hover:scale-105 transition-all duration-300 group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + idx * 0.1 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-white group-hover:text-orange-300 transition-colors">{activity.message}</span>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </motion.div>
            )) || (
              <div className="text-gray-400 text-center py-16">
                <svg className="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-semibold mb-2">No recent activity</p>
                <p className="text-sm">Activity will appear here as users interact with the system</p>
              </div>
            )}
          </div>
        </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
