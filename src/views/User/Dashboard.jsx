'use client';

import React, { useEffect, useState } from 'react';
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
      { id: 'overview', label: 'Overview', path: '/user/dashboard', icon: FiEye, active: false },
    ],
    workspace: [
      { id: 'learning', label: 'Learning', path: '/user/courses', icon: FiBook, active: false },
      { id: 'activities', label: 'Activities', path: '/user/dashboard', icon: FiActivity, active: false },
    ],
    system: [
      { id: 'settings', label: 'Settings', path: '/user/dashboard', icon: FiSettings, active: false },
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

  const skillProgress = [
    { name: 'JavaScript', progress: 85, color: 'orange', level: 'Expert' },
    { name: 'React', progress: 78, color: 'blue', level: 'Advanced' },
    { name: 'Node.js', progress: 65, color: 'green', level: 'Advanced' },
    { name: 'Python', progress: 45, color: 'purple', level: 'Intermediate' },
    { name: 'Communication', progress: 92, color: 'orange', level: 'Expert' }
  ];

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex">
      {/* Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-black/40 backdrop-blur-xl border-r border-orange-500/20 sticky top-0 h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-orange-500/20">
          <button className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl text-white font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all">
            Elevate
          </button>
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
                        ? 'bg-blue-500/20 text-white border border-blue-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
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
                        ? 'bg-blue-500/20 text-white border border-blue-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
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
                        ? 'bg-blue-500/20 text-white border border-blue-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="p-4 border-t border-orange-500/20">
          <div className="premium-glass rounded-xl p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/30 to-purple-500/30 border-2 border-orange-500/30 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400/20 to-purple-400/20 flex items-center justify-center text-lg font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm text-white">{user?.name || 'User'}</div>
                <div className="text-xs text-orange-400 font-semibold">Premium Member</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-400 font-semibold">Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-black/80 backdrop-blur-xl border-b border-orange-500/20 sticky top-0 z-50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              {/* Left: Title and Date */}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white">Dashboard</h1>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-400">{formatDate(currentTime)}</span>
                </div>
              </div>

              {/* Center: Search Bar */}
              <div className="flex-1 max-w-2xl mx-8">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Q Search in dashboard..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center space-x-3">
                <button className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/30 transition-all relative">
                  <FiBell className="w-5 h-5 text-gray-300" />
                  <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                </button>
                <button className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/30 transition-all">
                  <FiSettings className="w-5 h-5 text-gray-300" />
                </button>
                <div className="flex items-center space-x-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                  <FiClock className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-semibold text-orange-400">{formatTime(currentTime)}</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-orange-500/30 transition-all cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500/30 to-purple-500/30 border-2 border-orange-500/30 flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400/20 to-purple-400/20 flex items-center justify-center text-xs font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-white">{user?.name || 'User'}</span>
                  <FiChevronDown className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="premium-glass rounded-2xl p-8 mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋</h2>
              <p className="text-gray-400">Ready to continue your learning journey? Let's make today productive.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div 
                className="premium-glass rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Courses</h3>
                  <FiBook className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-4xl font-bold text-white mb-1">{stats?.totalCourses || 12}</p>
                <p className="text-sm text-blue-300/80">+2 this week</p>
              </motion.div>

              <motion.div 
                className="premium-glass rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</h3>
                  <FiCheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-4xl font-bold text-white mb-1">{stats?.completedCourses || 5}</p>
                <p className="text-sm text-green-300/80">67% completion rate</p>
              </motion.div>

              <motion.div 
                className="premium-glass rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Interviews</h3>
                  <FiVideo className="w-5 h-5 text-orange-400" />
                </div>
                <p className="text-4xl font-bold text-white mb-1">{stats?.upcomingInterviews || 3}</p>
                <p className="text-sm text-orange-300/80">Next: Tomorrow</p>
              </motion.div>

              <motion.div 
                className="premium-glass rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Skill Score</h3>
                  <FiTrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <p className="text-4xl font-bold text-white mb-1">{stats?.skillScore || 78}%</p>
                <p className="text-sm text-purple-300/80">+5 this month</p>
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
                    className="group premium-glass rounded-xl p-5 text-left hover:scale-105 transition-all duration-300 relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                  >
                    <div className={`mb-4 ${action.color === 'blue' ? 'text-blue-400' : action.color === 'orange' ? 'text-orange-400' : 'text-green-400'}`}>
                      {action.icon}
                    </div>
                    <h3 className="text-base font-bold mb-1 text-white">{action.title}</h3>
                    <p className="text-sm text-gray-400 mb-3">{action.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${action.color === 'blue' ? 'text-blue-300' : action.color === 'orange' ? 'text-orange-300' : 'text-green-300'}`}>{action.stats}</span>
                      <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">Start →</span>
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
                    className="premium-glass rounded-xl p-4 hover:scale-105 transition-all duration-300"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                  >
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
                    <p className="text-sm text-gray-400 mb-2">{event.time}</p>
                    <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{event.type.replace('-', ' ')}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline - Recent Activities */}
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white mb-1">Timeline</h2>
                <p className="text-sm text-gray-400">Recent activities</p>
              </div>
              <div className="premium-glass rounded-2xl p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity, idx) => (
                    <motion.div 
                      key={activity.id} 
                      className="flex items-start space-x-4 relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + idx * 0.1 }}
                    >
                      {/* Timeline line */}
                      {idx < recentActivities.length - 1 && (
                        <div className="absolute left-4 top-12 w-0.5 h-full bg-gray-700"></div>
                      )}
                      {/* Icon */}
                      <div className="relative z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-lg">
                        {activity.icon}
                      </div>
                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="font-bold text-sm mb-1 text-white">{activity.title}</h3>
                        <p className="text-sm text-gray-400 mb-2">{activity.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{activity.time}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            activity.status === 'completed' 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skill Progress */}
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white mb-1">Skill Progress</h2>
                <p className="text-sm text-gray-400">Track your development</p>
              </div>
              <div className="premium-glass rounded-2xl p-6">
                <div className="space-y-4">
                  {skillProgress.map((skill, index) => {
                    const getColorClasses = (color) => {
                      const colors = {
                        orange: { gradient: 'from-orange-500 to-orange-600', bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
                        blue: { gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
                        green: { gradient: 'from-green-500 to-green-600', bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
                        purple: { gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' }
                      };
                      return colors[color] || colors.blue;
                    };
                    
                    const color = getColorClasses(skill.color);
                    
                    return (
                      <motion.div 
                        key={index} 
                        className="group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-white">{skill.name}</span>
                          <span className={`text-sm font-bold ${color.text}`}>{skill.level}</span>
                        </div>
                        <div className={`w-full ${color.bg} rounded-full h-2.5 mb-2 overflow-hidden border ${color.border}`}>
                          <motion.div 
                            className={`h-full bg-gradient-to-r ${color.gradient} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${skill.progress}%` }}
                            transition={{ duration: 1, delay: 0.9 + index * 0.1 }}
                          ></motion.div>
                        </div>
                        <div className="text-xs text-gray-400 font-semibold">{skill.progress}%</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
