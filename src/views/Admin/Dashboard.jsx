'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getAdminDashboard } from '../../api/admin';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/AdminLayout';

const AdminDashboard = () => {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('6m');
  const [hoveredDay, setHoveredDay] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: getAdminDashboard,
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Mock data for charts
  const userGrowthData = [45, 52, 48, 61, 55, 67, 72, 68, 75, 82, 78, 85];
  const jobPostingsData = [12, 15, 18, 14, 22, 20, 25, 23, 28, 30, 27, 32];
  const assessmentData = [8, 10, 12, 9, 15, 14, 18, 16, 20, 22, 19, 24];

  // Generate daily data for the contribution graph
  const generateDailyData = (baseValue, days) => {
    const data = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      
      let activity = baseValue + Math.sin(i / 10) * 5; // Base activity with some wave
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Less activity on weekends
        activity = Math.max(0, activity - Math.random() * 5);
      }
      data.push({ date, count: Math.round(Math.max(0, activity + Math.random() * 5 - 2.5)) });
    }
    return data;
  };

  const assessmentDailyData = useMemo(() => {
    const daysToShow = timeRange === '3m' ? 90 : timeRange === '6m' ? 180 : timeRange === '12m' ? 365 : 730;
    return generateDailyData(10, daysToShow);
  }, [timeRange]);

  // Group daily data into weeks
  const weeks = useMemo(() => {
    const weeksArray = [];
    let currentWeek = [];
    assessmentDailyData.forEach((day, index) => {
      const dayOfWeek = day.date.getDay(); // 0 = Sunday, 6 = Saturday
      if (currentWeek.length === 0 && dayOfWeek !== 1) { // Fill leading empty days if week doesn't start on Monday
        for (let i = 1; i < dayOfWeek; i++) {
          currentWeek.push(null); // Placeholder for empty days
        }
      }
      currentWeek.push(day);
      if (dayOfWeek === 0 || index === assessmentDailyData.length - 1) { // End of week (Sunday) or last day
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    });
    return weeksArray;
  }, [assessmentDailyData]);

  // Calculate max count for color intensity
  const maxCount = useMemo(() => {
    return Math.max(...assessmentDailyData.map(d => d.count), 1);
  }, [assessmentDailyData]);

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

  const getColorIntensity = (count) => {
    if (count === 0) return 'bg-white/5';
    const intensity = count / maxCount;
    if (intensity < 0.25) return 'bg-orange-500/30';
    if (intensity < 0.5) return 'bg-orange-500/50';
    if (intensity < 0.75) return 'bg-orange-500/70';
    return 'bg-orange-500';
  };

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
            className="group rounded-lg p-6 border border-white/10 relative overflow-hidden"
            style={{ 
              backgroundColor: '#000000',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              transformStyle: 'preserve-3d'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">Total Users</h3>
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-4xl font-extrabold text-white mb-3 tracking-tight">{stats?.totalUsers || 0}</p>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-sm font-bold text-green-500">+12%</span>
                </div>
                <span className="text-sm text-white/60 font-medium">from last month</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="group rounded-lg p-6 border border-white/10 relative overflow-hidden"
            style={{ 
              backgroundColor: '#000000',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              transformStyle: 'preserve-3d'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">Active Users</h3>
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-4xl font-extrabold text-white mb-3 tracking-tight">{stats?.activeUsers || 0}</p>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-sm font-bold text-green-500">+8%</span>
                </div>
                <span className="text-sm text-white/60 font-medium">from last month</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="group rounded-lg p-6 border border-white/10 relative overflow-hidden"
            style={{ 
              backgroundColor: '#000000',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              transformStyle: 'preserve-3d'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">Total Jobs</h3>
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
              </div>
              <p className="text-4xl font-extrabold text-white mb-3 tracking-tight">{stats?.totalJobs || 0}</p>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-sm font-bold text-green-500">+15%</span>
                </div>
                <span className="text-sm text-white/60 font-medium">from last month</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="group rounded-lg p-6 border border-white/10 relative overflow-hidden"
            style={{ 
              backgroundColor: '#000000',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              transformStyle: 'preserve-3d'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">Assessments</h3>
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-4xl font-extrabold text-white mb-3 tracking-tight">{stats?.totalAssessments || 0}</p>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-sm font-bold text-green-500">+22%</span>
                </div>
                <span className="text-sm text-white/60 font-medium">from last month</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.button
            onClick={() => router.push('/admin/assessment-list?tab=jobs')}
            className="group rounded-lg p-6 text-left hover:scale-105 transition-all duration-300 relative overflow-hidden border border-white/10"
            style={{ 
              backgroundColor: '#000000',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              transformStyle: 'preserve-3d'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-500/30">
                  <svg className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className="group rounded-lg p-6 text-left hover:scale-105 transition-all duration-300 relative overflow-hidden border border-white/10"
            style={{ 
              backgroundColor: '#000000',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              transformStyle: 'preserve-3d'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-500/30">
                  <svg className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            className="rounded-lg p-6 border border-white/10 relative overflow-hidden"
            style={{ 
              backgroundColor: '#000000',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              transformStyle: 'preserve-3d'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold mb-1 text-white">User Growth</h3>
                  <p className="text-sm text-white/60">Monthly user acquisition</p>
                </div>
                <div className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-sm font-bold text-green-500">
                  +18%
                </div>
              </div>
              <div className="h-64 relative flex items-end justify-around gap-2 px-4">
                {userGrowthData.map((val, i) => {
                  const maxVal = Math.max(...userGrowthData);
                  const barHeight = (val / maxVal) * 100;
                  const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  return (
                    <div key={`user-${i}`} className="flex flex-col items-center flex-1 relative group">
                      <motion.div
                        className="flex flex-col items-center w-full h-full justify-end"
                        initial={{ height: 0 }}
                        animate={{ height: `${barHeight}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                      >
                        <div
                          className="w-full bg-gradient-to-t from-orange-600 to-orange-500 rounded-t-lg hover:from-orange-500 hover:to-orange-400 transition-all cursor-pointer relative"
                          style={{ minHeight: '20px', height: '100%' }}
                          onMouseEnter={() => setHoveredBar(i)}
                          onMouseLeave={() => setHoveredBar(null)}
                        />
                        {hoveredBar === i && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/95 border border-white/20 rounded-lg text-xs whitespace-nowrap z-20">
                            <div className="font-bold text-white">{val} users</div>
                            <div className="text-white/60">{labels[i] || `Month ${i + 1}`}</div>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-black/95 border-r border-b border-white/20 rotate-45"></div>
                          </div>
                        )}
                      </motion.div>
                      <span className="text-xs text-white/60 mt-2">{labels[i] || i + 1}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Job Postings Chart - Line Chart with Area Fill */}
          <motion.div 
            className="rounded-lg p-6 border border-white/10 relative overflow-hidden"
            style={{ 
              backgroundColor: '#000000',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              transformStyle: 'preserve-3d'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold mb-1 text-white">Job Postings</h3>
                  <p className="text-sm text-white/60">Monthly job postings trend</p>
                </div>
                <div className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-sm font-bold text-green-500">
                  +15%
                </div>
              </div>
              <div className="h-64 relative">
                <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="jobGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={200 - (y * 2)}
                      x2="400"
                      y2={200 - (y * 2)}
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="1"
                    />
                  ))}
                  {/* Area fill */}
                  <motion.path
                    d={`M 0,200 ${jobPostingsData.map((val, i) => {
                      const maxVal = Math.max(...jobPostingsData);
                      const y = 200 - (val / maxVal) * 200;
                      const x = (i / (jobPostingsData.length - 1)) * 400;
                      return `L ${x},${y}`;
                    }).join(' ')} L 400,200 Z`}
                    fill="url(#jobGradient)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2 }}
                  />
                  {/* Smooth line */}
                  <motion.polyline
                    points={jobPostingsData.map((val, i) => {
                      const maxVal = Math.max(...jobPostingsData);
                      const y = 200 - (val / maxVal) * 200;
                      const x = (i / (jobPostingsData.length - 1)) * 400;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                  {/* Data points */}
                  {jobPostingsData.map((val, i) => {
                    const maxVal = Math.max(...jobPostingsData);
                    const y = 200 - (val / maxVal) * 200;
                    const x = (i / (jobPostingsData.length - 1)) * 400;
                    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    return (
                      <g key={i}>
                        <motion.circle
                          cx={x}
                          cy={y}
                          r="4"
                          fill="#3b82f6"
                          stroke="#000"
                          strokeWidth="2"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.1, type: "spring" }}
                        />
                        <text
                          x={x}
                          y="195"
                          textAnchor="middle"
                          fill="rgba(255,255,255,0.6)"
                          fontSize="10"
                        >
                          {labels[i] || i + 1}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                {/* Summary Stats */}
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between text-xs text-white/60 px-2">
                  <div>
                    <span className="text-green-500 font-bold">{Math.min(...jobPostingsData)}</span> min
                  </div>
                  <div>
                    <span className="text-green-500 font-bold">{Math.round(jobPostingsData.reduce((a, b) => a + b, 0) / jobPostingsData.length)}</span> avg
                  </div>
                  <div>
                    <span className="text-green-500 font-bold">{Math.max(...jobPostingsData)}</span> max
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Assessment Activity Chart - GitHub-style Contribution Graph */}
        <motion.div 
          className="rounded-lg p-6 mb-8 border border-white/10 relative overflow-hidden"
          style={{ 
            backgroundColor: '#000000',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            transformStyle: 'preserve-3d'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold mb-1 text-white">Assessment Activity</h3>
                <p className="text-sm text-white/60">Daily assessment completions</p>
              </div>
              <div className="flex items-center gap-3">
                {/* Time Range Selector */}
                <div className="flex items-center gap-1">
                  {['3m', '6m', '12m', '2y'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                        timeRange === range
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
                <div className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-sm font-bold text-green-500">
                  +25%
                </div>
              </div>
            </div>
            
            {/* GitHub-style Contribution Graph */}
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-1 items-start" style={{ minWidth: 'max-content' }}>
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => {
                      if (!day) {
                        return <div key={dayIndex} className="w-3 h-3" />; // Empty placeholder
                      }
                      const isHovered = hoveredDay === `${weekIndex}-${dayIndex}`;
                      return (
                        <motion.div
                          key={dayIndex}
                          className={`w-3 h-3 rounded-sm border border-white/10 cursor-pointer transition-all ${
                            getColorIntensity(day.count)
                          } ${isHovered ? 'scale-125 z-10 ring-2 ring-orange-500' : ''}`}
                          onMouseEnter={() => setHoveredDay(`${weekIndex}-${dayIndex}`)}
                          onMouseLeave={() => setHoveredDay(null)}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: (weekIndex * 7 + dayIndex) * 0.01 }}
                        >
                          {isHovered && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/95 border border-white/20 rounded-lg text-xs whitespace-nowrap z-20">
                              <div className="font-bold text-white">{day.count} assessments</div>
                              <div className="text-white/60">{day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-black/95 border-r border-b border-white/20 rotate-45"></div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-white/5 border border-white/10"></div>
                  <div className="w-3 h-3 rounded-sm bg-orange-500/30 border border-white/10"></div>
                  <div className="w-3 h-3 rounded-sm bg-orange-500/50 border border-white/10"></div>
                  <div className="w-3 h-3 rounded-sm bg-orange-500/70 border border-white/10"></div>
                  <div className="w-3 h-3 rounded-sm bg-orange-500 border border-white/10"></div>
                </div>
                <span>More</span>
              </div>
              <div className="text-xs text-white/60">
                Total: <span className="text-green-500 font-bold">{assessmentDailyData.reduce((sum, d) => sum + d.count, 0)}</span> assessments
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <div className="rounded-lg p-6 border border-white/10 relative overflow-hidden" style={{ 
          backgroundColor: '#000000',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          transformStyle: 'preserve-3d'
        }}>
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold mb-1 text-white">Recent Activity</h3>
                <p className="text-sm text-white/60">Latest system events</p>
              </div>
              <div className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-sm font-bold text-green-500 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live
              </div>
            </div>
            <div className="space-y-3">
              {stats?.recentActivity?.map((activity, idx) => (
                <motion.div 
                  key={activity.id} 
                  className="flex items-center justify-between p-4 rounded-lg border border-white/10 hover:scale-105 transition-all duration-300 group"
                  style={{ backgroundColor: '#000000' }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + idx * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-white group-hover:text-orange-300 transition-colors">{activity.message}</span>
                  </div>
                  <span className="text-xs text-white/60 font-medium">
                    {new Date(activity.timestamp).toLocaleString()}
                  </span>
                </motion.div>
              )) || (
                <div className="text-white/60 text-center py-16">
                  <svg className="w-20 h-20 mx-auto mb-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-semibold mb-2">No recent activity</p>
                  <p className="text-sm">Activity will appear here as users interact with the system</p>
                </div>
              )}
            </div>
          </div>
        </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
