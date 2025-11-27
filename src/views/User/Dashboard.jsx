'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getUserDashboard } from '../../api/user';
import { useAuth } from '../../context/AuthContext';
import { FiBell, FiClock, FiBook, FiVideo, FiTrendingUp, FiCheckCircle, FiActivity, FiSettings, FiSearch, FiChevronDown, FiHome, FiEye } from 'react-icons/fi';

const UserDashboard = () => {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('3m');
  const [hoveredTimeline, setHoveredTimeline] = useState(null);
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
    
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timeInterval);
    };
  }, []);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['userDashboard'],
    queryFn: getUserDashboard,
    enabled: mounted,
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const navigationItems = {
    main: [
      { id: 'dashboard', label: 'Dashboard', path: '/user/dashboard', icon: FiHome, active: true },
      { id: 'overview', label: 'Overview', path: '/user/overview', icon: FiEye, active: false },
    ],
    workspace: [
      { id: 'learning', label: 'Learning', path: '/user/courses', icon: FiBook, active: false },
      { id: 'activities', label: 'Activities', path: '/user/dashboard', icon: FiActivity, active: false },
    ],
    system: [
      { id: 'settings', label: 'Settings', path: '/user/settings', icon: FiSettings, active: false },
    ]
  };

  const quickActions = [
    {
      title: 'Mock Prep',
      description: 'Practice interviews and assessments',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      action: () => router.push('/user/mock-prep'),
      stats: '12 sessions',
      color: 'blue'
    },
    {
      title: 'AI Agents',
      description: 'Access AI coaching tools',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      action: () => router.push('/user/agents'),
      stats: '5 active',
      color: 'orange'
    },
    {
      title: 'Courses',
      description: 'Browse learning materials',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      action: () => router.push('/user/courses'),
      stats: '8 enrolled',
      color: 'green'
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'interview',
      title: 'Completed Mock Interview',
      description: 'Software Engineer - Google',
      time: '2 hours ago',
      status: 'completed',
      icon: '🎯'
    },
    {
      id: 2,
      type: 'course',
      title: 'Started New Course',
      description: 'Advanced React Patterns',
      time: '1 day ago',
      status: 'in-progress',
      icon: '📚'
    },
    {
      id: 3,
      type: 'assessment',
      title: 'Assessment Completed',
      description: 'JavaScript Fundamentals',
      time: '3 days ago',
      status: 'completed',
      icon: '✅'
    },
    {
      id: 4,
      type: 'ai-session',
      title: 'AI Coaching Session',
      description: 'Communication Skills',
      time: '1 week ago',
      status: 'completed',
      icon: '🤖'
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Mock Interview - Senior Developer',
      time: 'Tomorrow, 2:00 PM',
      type: 'interview',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Course Deadline - React Advanced',
      time: 'In 3 days',
      type: 'course',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'AI Communication Session',
      time: 'Next Monday, 10:00 AM',
      type: 'ai-session',
      priority: 'low'
    }
  ];

  const skillProgress = useMemo(() => [
    { name: 'JavaScript', progress: 85, previous: 80, level: 'Expert', color: 'green' },
    { name: 'React', progress: 78, previous: 70, level: 'Advanced', color: 'orange' },
    { name: 'Node.js', progress: 65, previous: 60, level: 'Advanced', color: 'orange' },
    { name: 'Python', progress: 45, previous: 50, level: 'Intermediate', color: 'yellow' },
    { name: 'Communication', progress: 92, previous: 90, level: 'Expert', color: 'green' }
  ], []);

  // Generate timeline data - aggregate by days for more detail
  const timelineData = useMemo(() => {
    const daysToShow = timeRange === '1m' ? 30 : timeRange === '3m' ? 90 : timeRange === '6m' ? 180 : 365;
    const data = [];
    const labels = [];
    const now = new Date();
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Generate daily activity data
      const baseActivity = 10 + Math.sin(i / 7) * 5; // Weekly pattern
      const variation = Math.random() * 3 - 1.5;
      data.push(Math.max(0, baseActivity + variation));
    }
    
    return { data, labels };
  }, [timeRange]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#060202' }}>
        <div className="text-center space-y-6">
          <div className="flex gap-2 justify-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white flex" style={{ backgroundColor: '#060202' }}>
      {/* Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/5 sticky top-0 h-screen" style={{ backgroundColor: '#060202' }}>
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-start">
            <img 
              src="/logo.jpg" 
              alt="Elevate Logo" 
              className="w-2/5 h-auto max-h-6 object-contain"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* Main Section */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-3">Main</h3>
            <div className="space-y-1">
              {navigationItems.main.map((item) => {
                const Icon = item.icon;
                if (!Icon) return null;
                return (
                  <button
                    key={item.id}
                    onClick={() => router.push(item.path)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm font-semibold ${
                      item.active
                        ? 'bg-orange-500/20 text-white border border-orange-500/30'
                        : 'text-white/60 hover:text-white hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-orange-500" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workspace Section */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-3">Workspace</h3>
            <div className="space-y-1">
              {navigationItems.workspace.map((item) => {
                const Icon = item.icon;
                if (!Icon) return null;
                return (
                  <button
                    key={item.id}
                    onClick={() => router.push(item.path)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm font-semibold ${
                      item.active
                        ? 'bg-orange-500/20 text-white border border-orange-500/30'
                        : 'text-white/60 hover:text-white hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-orange-500" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* System Section */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-3">System</h3>
            <div className="space-y-1">
              {navigationItems.system.map((item) => {
                const Icon = item.icon;
                if (!Icon) return null;
                return (
                  <button
                    key={item.id}
                    onClick={() => router.push(item.path)}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm font-semibold ${
                      item.active
                        ? 'bg-orange-500/20 text-white border border-orange-500/30'
                        : 'text-white/60 hover:text-white hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-orange-500" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-all text-sm font-semibold text-red-400 hover:text-red-300 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="border-b border-white/5 sticky top-0 z-50" style={{ backgroundColor: '#060202' }}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left: Title and Date */}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white">Dashboard</h1>
                  <span className="text-white/40">•</span>
                  <span className="text-sm text-white/60">{formatDate(currentTime)}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <motion.div 
              className="rounded-lg p-6 border border-white/10 relative overflow-hidden mb-6" 
              style={{ 
                backgroundColor: '#000000',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                transformStyle: 'preserve-3d'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h2>
                <p className="text-white/60">Ready to continue your learning journey? Let's make today productive.</p>
              </div>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div 
                className="rounded-lg p-6 border border-white/10 relative overflow-hidden"
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
                    <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">Total Courses</h3>
                    <FiBook className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-4xl font-bold text-white mb-1">{stats?.totalCourses || 12}</p>
                  <p className="text-sm text-green-500">+2 this week</p>
                </div>
              </motion.div>

              <motion.div 
                className="rounded-lg p-6 border border-white/10 relative overflow-hidden"
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
                    <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">Completed</h3>
                    <FiCheckCircle className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-4xl font-bold text-white mb-1">{stats?.completedCourses || 5}</p>
                  <p className="text-sm text-green-500">67% completion rate</p>
                </div>
              </motion.div>

              <motion.div 
                className="rounded-lg p-6 border border-white/10 relative overflow-hidden"
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
                    <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">Interviews</h3>
                    <FiVideo className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-4xl font-bold text-white mb-1">{stats?.upcomingInterviews || 3}</p>
                  <p className="text-sm text-green-500">Next: Tomorrow</p>
                </div>
              </motion.div>

              <motion.div 
                className="rounded-lg p-6 border border-white/10 relative overflow-hidden"
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
                    <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">Skill Score</h3>
                    <FiTrendingUp className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-4xl font-bold text-white mb-1">{stats?.skillScore || 78}%</p>
                  <p className="text-sm text-green-500">+5 this month</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Middle Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Workspace - Quick Actions */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white mb-1">Workspace</h2>
                <p className="text-sm text-gray-400">Quick actions</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action, idx) => (
                  <motion.button
                    key={idx}
                    onClick={action.action}
                    className="group rounded-lg p-5 text-left hover:scale-105 transition-all duration-300 relative overflow-hidden border border-white/10"
                    style={{ 
                      backgroundColor: '#000000',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                      transformStyle: 'preserve-3d'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none"></div>
                    <div className="relative z-10">
                      <div className="mb-4 text-orange-500">
                        {action.icon}
                      </div>
                      <h3 className="text-base font-bold mb-1 text-white">{action.title}</h3>
                      <p className="text-sm text-white/60 mb-3">{action.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-green-500">{action.stats}</span>
                        <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">Start →</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white mb-1">Upcoming Events</h2>
                <p className="text-sm text-gray-400">Your schedule</p>
              </div>
              <div className="space-y-3">
                {upcomingEvents.map((event, idx) => (
                  <motion.div 
                    key={event.id} 
                    className="rounded-lg p-4 hover:scale-105 transition-all duration-300 border border-white/10 relative overflow-hidden"
                    style={{ 
                      backgroundColor: '#000000',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                      transformStyle: 'preserve-3d'
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none"></div>
                    <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-sm text-white leading-tight">{event.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        event.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        event.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        'bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}>
                        {event.priority}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 mb-2">{event.time}</p>
                    <span className="text-xs text-white/40 uppercase tracking-wide font-semibold">{event.type.replace('-', ' ')}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline - Advanced Activity Chart */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Timeline</h2>
                  <p className="text-sm text-white/60">Activity over time</p>
                </div>
                {/* Time Range Selector */}
                <div className="flex items-center gap-1">
                  {['1m', '3m', '6m', '1y'].map((range) => (
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
              </div>
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
                  {/* Advanced Line Chart with Area - Spread Out */}
                  <div className="h-64 relative mb-4 overflow-x-auto">
                    <svg className="w-full h-full min-w-full" viewBox={`0 0 ${Math.max(timelineData.data.length * 8, 800)} 200`} preserveAspectRatio="none" style={{ minWidth: `${timelineData.data.length * 8}px` }}>
                      <defs>
                        <linearGradient id="timelineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                          <stop offset="50%" stopColor="#f97316" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Grid lines */}
                      {[0, 25, 50, 75, 100].map((y) => (
                        <line
                          key={y}
                          x1="0"
                          y1={200 - (y * 2)}
                          x2={Math.max(timelineData.data.length * 8, 800)}
                          y2={200 - (y * 2)}
                          stroke="rgba(255,255,255,0.05)"
                          strokeWidth="1"
                        />
                      ))}
                      {/* Area fill */}
                      <motion.path
                        d={`M 0,200 ${timelineData.data.map((val, i) => {
                          const maxVal = Math.max(...timelineData.data);
                          const y = 200 - (val / maxVal) * 200;
                          return `L ${i * 8 + 4},${y}`;
                        }).join(' ')} L ${(timelineData.data.length - 1) * 8 + 4},200 Z`}
                        fill="url(#timelineGradient)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.2 }}
                      />
                      {/* Smooth line */}
                      <motion.polyline
                        points={timelineData.data.map((val, i) => {
                          const maxVal = Math.max(...timelineData.data);
                          const y = 200 - (val / maxVal) * 200;
                          return `${i * 8 + 4},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                      />
                      {/* Data points */}
                      {timelineData.data.map((val, i) => {
                        if (i % Math.ceil(timelineData.data.length / 15) !== 0 && i !== timelineData.data.length - 1) return null;
                        const maxVal = Math.max(...timelineData.data);
                        const y = 200 - (val / maxVal) * 200;
                        const isHovered = hoveredTimeline === i;
                        return (
                          <g key={i}>
                            <motion.circle
                              cx={i * 8 + 4}
                              cy={y}
                              r={isHovered ? 7 : 5}
                              fill="#f97316"
                              stroke="#000"
                              strokeWidth="2"
                              onMouseEnter={() => setHoveredTimeline(i)}
                              onMouseLeave={() => setHoveredTimeline(null)}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.01, type: "spring" }}
                            />
                            {isHovered && (
                              <motion.g
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                <rect
                                  x={i * 8 + 4 - 40}
                                  y={y - 45}
                                  width="80"
                                  height="40"
                                  fill="rgba(0,0,0,0.95)"
                                  rx="6"
                                  stroke="rgba(255,255,255,0.2)"
                                />
                                <text
                                  x={i * 8 + 4}
                                  y={y - 28}
                                  textAnchor="middle"
                                  fill="#fff"
                                  fontSize="11"
                                  fontWeight="bold"
                                >
                                  {Math.round(val)} activities
                                </text>
                                <text
                                  x={i * 8 + 4}
                                  y={y - 14}
                                  textAnchor="middle"
                                  fill="#fff"
                                  fontSize="9"
                                  opacity="0.7"
                                >
                                  {timelineData.labels[i]}
                                </text>
                              </motion.g>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
                    <div>
                      <p className="text-xs text-white/60 mb-1">Total</p>
                      <p className="text-lg font-bold text-green-500">{Math.round(timelineData.data.reduce((a, b) => a + b, 0))}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Daily Avg</p>
                      <p className="text-lg font-bold text-green-500">{Math.round(timelineData.data.reduce((a, b) => a + b, 0) / timelineData.data.length)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Peak Day</p>
                      <p className="text-lg font-bold text-green-500">{Math.round(Math.max(...timelineData.data))}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Skill Progress - Enhanced Visualization */}
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white mb-1">Skill Progress</h2>
                <p className="text-sm text-white/60">Track your development</p>
              </div>
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
                <div className="relative z-10 space-y-5">
                  {skillProgress.map((skill, index) => {
                    const getColorClasses = (color) => {
                      const colors = {
                        green: { gradient: 'from-green-500 to-green-600', bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', badge: 'bg-green-500/20 text-green-400 border-green-500/30' },
                        orange: { gradient: 'from-orange-500 to-orange-600', bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
                        yellow: { gradient: 'from-yellow-500 to-yellow-600', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
                        blue: { gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
                      };
                      return colors[color] || colors.blue;
                    };
                    
                    const color = getColorClasses(skill.color);
                    const change = skill.progress - skill.previous;
                    const changePercent = skill.previous > 0 ? ((change / skill.previous) * 100).toFixed(1) : 0;
                    
                    return (
                      <motion.div 
                        key={index} 
                        className="group relative"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-sm text-white">{skill.name}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${color.badge}`}>
                              {skill.level}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {change !== 0 && (
                              <span className={`text-xs font-bold flex items-center gap-1 ${change > 0 ? 'text-green-500' : 'text-red-400'}`}>
                                {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
                              </span>
                            )}
                            <span className="text-sm font-bold text-white">{skill.progress}%</span>
                          </div>
                        </div>
                        {/* Previous progress indicator */}
                        <div className="relative w-full h-4 rounded-full overflow-hidden border border-white/5 mb-1">
                          <div 
                            className="absolute inset-0 bg-white/5"
                            style={{ width: `${skill.previous}%` }}
                          />
                          {/* Current progress bar */}
                          <motion.div 
                            className={`h-full bg-gradient-to-r ${color.gradient} rounded-full relative`}
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.progress}%` }}
                            transition={{ duration: 1, delay: 1 + index * 0.1 }}
                            style={{
                              boxShadow: '0 0 10px rgba(249, 115, 22, 0.3)',
                            }}
                          />
                        </div>
                        {/* Growth indicator */}
                        {change > 0 && (
                          <motion.div
                            className="absolute -right-2 -top-2 w-3 h-3 bg-green-500 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                    );
                  })}
                  {/* Overall Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/5">
                    <div>
                      <p className="text-xs text-white/60 mb-1">Avg Progress</p>
                      <p className="text-lg font-bold text-green-500">
                        {Math.round(skillProgress.reduce((a, b) => a + b.progress, 0) / skillProgress.length)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Total Growth</p>
                      <p className="text-lg font-bold text-green-500">
                        +{skillProgress.reduce((a, b) => a + (b.progress - b.previous), 0)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60 mb-1">Skills Tracked</p>
                      <p className="text-lg font-bold text-green-500">{skillProgress.length}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
