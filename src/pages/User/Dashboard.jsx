'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getUserDashboard } from '../../api/user';
import { useAuth } from '../../context/AuthContext';
import { FiBell, FiLogOut, FiClock, FiBook, FiVideo, FiTrendingUp, FiCheckCircle, FiCalendar, FiActivity } from 'react-icons/fi';

const UserDashboard = () => {
  const [mounted, setMounted] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Auto-rotate cards
    const cardInterval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 3);
    }, 5000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(cardInterval);
    };
  }, []);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['userDashboard'],
    queryFn: getUserDashboard,
    enabled: mounted,
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

  const quickActions = [
    {
      title: 'Mock Prep',
      description: 'Practice interviews and assessments',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'from-blue-500/20 via-blue-600/20 to-blue-700/20',
      hoverGradient: 'group-hover:from-blue-500/30 group-hover:via-blue-600/30 group-hover:to-blue-700/30',
      action: () => router.push('/user/mock-prep'),
      stats: '12 sessions',
      color: 'blue'
    },
    {
      title: 'AI Agents',
      description: 'Access AI coaching tools',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      gradient: 'from-orange-500/20 via-orange-600/20 to-red-600/20',
      hoverGradient: 'group-hover:from-orange-500/30 group-hover:via-orange-600/30 group-hover:to-red-600/30',
      action: () => router.push('/user/agents'),
      stats: '5 active',
      color: 'orange'
    },
    {
      title: 'Courses',
      description: 'Browse learning materials',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      gradient: 'from-green-500/20 via-green-600/20 to-emerald-600/20',
      hoverGradient: 'group-hover:from-green-500/30 group-hover:via-green-600/30 group-hover:to-emerald-600/30',
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
    { name: 'JavaScript', progress: 85, color: 'yellow' },
    { name: 'React', progress: 78, color: 'blue' },
    { name: 'Node.js', progress: 65, color: 'green' },
    { name: 'Python', progress: 45, color: 'purple' },
    { name: 'Communication', progress: 92, color: 'orange' }
  ];

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
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
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Subtle Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
      </div>

      <div className="relative z-10">
        {/* Clean Professional Header */}
        <header className="bg-black border-b border-gray-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              {/* Left Section */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-contain" />
                  <h1 className="text-xl font-bold">Dashboard</h1>
                </div>
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span>{formatDate(currentTime)}</span>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-3">
                {/* Time Display */}
                <div className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-black/90 border border-[#FF5728] rounded-lg">
                  <FiClock className="text-orange-500" />
                  <span className="text-orange-500 font-semibold">{formatTime(currentTime)}</span>
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2.5 rounded-lg bg-black/90 border border-[#FF5728] hover:bg-black transition-colors"
                  >
                    <FiBell className="w-5 h-5 text-gray-400" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black"></div>
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 top-14 w-80 bg-black/90 border border-[#FF5728] rounded-3xl p-6 shadow-2xl z-50"
                      style={{
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset'
                      }}
                    >
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-800">
                        <h3 className="font-bold text-lg text-white">Notifications</h3>
                        <button 
                          onClick={() => setShowNotifications(false)}
                          className="p-1 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="space-y-3 max-h-80 overflow-y-auto">
                        <div className="p-3 bg-black/50 border border-orange-500/20 rounded-xl hover:bg-black transition-colors">
                          <p className="font-semibold text-white text-sm mb-1">Mock Interview Scheduled</p>
                          <p className="text-gray-400 text-xs">Tomorrow at 2:00 PM</p>
                        </div>
                        <div className="p-3 bg-black/50 border border-blue-500/20 rounded-xl hover:bg-black transition-colors">
                          <p className="font-semibold text-white text-sm mb-1">New Course Available</p>
                          <p className="text-gray-400 text-xs">Advanced React Patterns</p>
                        </div>
                        <div className="p-3 bg-black/50 border border-green-500/20 rounded-xl hover:bg-black transition-colors">
                          <p className="font-semibold text-white text-sm mb-1">Assessment Completed</p>
                          <p className="text-gray-400 text-xs">JavaScript Fundamentals</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile */}
                <div className="flex items-center space-x-3 px-4 py-2 bg-black/90 border border-[#FF5728] rounded-lg">
                  <div className="relative">
                    <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center border-2 border-orange-400">
                      <span className="text-white font-bold text-sm">{user?.name?.charAt(0) || 'U'}</span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                  </div>
                  <div className="hidden md:block">
                    <div className="font-semibold text-sm text-white">{user?.name || 'User'}</div>
                    <div className="text-xs text-gray-400">Online</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
                    title="Logout"
                  >
                    <FiLogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Ready to continue your learning journey? Let's make today productive.
            </p>
          </div>

          {/* Premium Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div 
              className="group relative bg-black/90 border border-[#FF5728] rounded-3xl p-6 overflow-hidden"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
                transformStyle: 'preserve-3d'
              }}
              whileHover={{ y: -8, scale: 1.02, rotateX: 2 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
              <div className="premium-card-content relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Total Courses</h3>
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <FiBook className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <p className="text-5xl font-bold mb-3 text-white">{stats?.totalCourses || 12}</p>
                <div className="flex items-center text-sm text-green-400 font-medium mb-3">
                  <FiTrendingUp className="w-4 h-4 mr-1" />
                  +2 this week
                </div>
                <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="group relative bg-black/90 border border-[#FF5728] rounded-3xl p-6 overflow-hidden"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
                transformStyle: 'preserve-3d'
              }}
              whileHover={{ y: -8, scale: 1.02, rotateX: 2 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
              <div className="premium-card-content relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Completed</h3>
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <FiCheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <p className="text-5xl font-bold mb-3 text-white">{stats?.completedCourses || 8}</p>
                <div className="flex items-center text-sm text-green-400 font-medium mb-3">
                  <FiTrendingUp className="w-4 h-4 mr-1" />
                  67% completion rate
                </div>
                <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="group relative bg-black/90 border border-[#FF5728] rounded-3xl p-6 overflow-hidden"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
                transformStyle: 'preserve-3d'
              }}
              whileHover={{ y: -8, scale: 1.02, rotateX: 2 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
              <div className="premium-card-content relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Interviews</h3>
                  <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                    <FiVideo className="w-6 h-6 text-orange-400" />
                  </div>
                </div>
                <p className="text-5xl font-bold mb-3 text-white">{stats?.upcomingInterviews || 3}</p>
                <div className="flex items-center text-sm text-orange-400 font-medium mb-3">
                  <FiClock className="w-4 h-4 mr-1" />
                  Next: Tomorrow
                </div>
                <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="group relative bg-black/90 border border-[#FF5728] rounded-3xl p-6 overflow-hidden"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
                transformStyle: 'preserve-3d'
              }}
              whileHover={{ y: -8, scale: 1.02, rotateX: 2 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
              <div className="premium-card-content relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Skill Score</h3>
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <FiTrendingUp className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <p className="text-5xl font-bold mb-3 text-white">{stats?.skillScore || 87}%</p>
                <div className="flex items-center text-sm text-purple-400 font-medium mb-3">
                  <FiTrendingUp className="w-4 h-4 mr-1" />
                  +5 this month
                </div>
                <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full w-[87%] bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Premium Quick Actions */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2 text-white">Quick Actions</h2>
                <p className="text-gray-400 font-medium">Access your most used features</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickActions.map((action, idx) => (
                  <motion.button
                    key={idx}
                    onClick={action.action}
                    onMouseEnter={() => setActiveCard(idx)}
                    className="group relative bg-black/90 border border-[#FF5728] rounded-3xl p-7 text-left overflow-hidden"
                    style={{
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
                      transformStyle: 'preserve-3d'
                    }}
                    whileHover={{ y: -8, scale: 1.02, rotateX: 2 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>
                    <div className="premium-card-content relative z-10">
                      <div className="mb-5 transform group-hover:scale-110 transition-transform duration-500 text-gray-300 group-hover:text-white">
                        {action.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-white">{action.title}</h3>
                      <p className="text-gray-400 mb-5 text-sm leading-relaxed">{action.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                        <span className="text-xs text-gray-500 font-medium">{action.stats}</span>
                        <div className="flex items-center text-sm font-semibold text-gray-400 group-hover:text-orange-400 transition-colors">
                          <span>Start</span>
                          <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Premium Upcoming Events */}
            <div className="lg:col-span-1">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2 text-white">Upcoming Events</h2>
                <p className="text-gray-400 font-medium">Your schedule</p>
              </div>

              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <motion.div 
                    key={event.id} 
                    className="group relative bg-black/90 border border-[#FF5728] rounded-3xl p-5 overflow-hidden"
                    style={{
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
                      transformStyle: 'preserve-3d'
                    }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>
                    <div className="premium-card-content relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-sm text-white leading-tight">{event.title}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          event.priority === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          event.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-green-500/20 text-green-400 border-green-500/30'
                        }`}>
                          {event.priority}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mb-3 font-medium">{event.time}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          event.type === 'interview' ? 'bg-orange-400' :
                          event.type === 'course' ? 'bg-blue-400' :
                          'bg-purple-400'
                        }`}></div>
                        <span className="uppercase tracking-wide">{event.type.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Premium Recent Activities & Skill Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Premium Recent Activities */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2 text-white">Recent Activities</h2>
                <p className="text-gray-400 font-medium">Your latest progress</p>
              </div>

              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <motion.div 
                    key={activity.id} 
                    className="group relative bg-black/90 border border-[#FF5728] rounded-3xl p-5 overflow-hidden"
                    style={{
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
                      transformStyle: 'preserve-3d'
                    }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>
                    <div className="premium-card-content relative z-10 flex items-start space-x-4">
                      <div className="text-3xl filter drop-shadow-lg">{activity.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-sm mb-2 text-white">{activity.title}</h3>
                        <p className="text-gray-400 text-xs mb-3 leading-relaxed">{activity.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-medium">{activity.time}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            activity.status === 'completed' 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                              : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          }`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Premium Skill Progress */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2 text-white">Skill Progress</h2>
                <p className="text-gray-400 font-medium">Track your development</p>
              </div>

              <div className="space-y-4">
                {skillProgress.map((skill, index) => (
                  <motion.div 
                    key={index} 
                    className="group relative bg-black/90 border border-[#FF5728] rounded-3xl p-5 overflow-hidden"
                    style={{
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
                      transformStyle: 'preserve-3d'
                    }}
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>
                    <div className="premium-card-content relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-sm text-white">{skill.name}</span>
                        <span className="text-sm font-semibold text-gray-300">{skill.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2.5 mb-3 overflow-hidden">
                        <div 
                          className={`h-full rounded-full bg-gradient-to-r ${
                            skill.color === 'yellow' ? 'from-yellow-400 to-yellow-600' :
                            skill.color === 'blue' ? 'from-blue-400 to-blue-600' :
                            skill.color === 'green' ? 'from-green-400 to-green-600' :
                            skill.color === 'purple' ? 'from-purple-400 to-purple-600' :
                            'from-orange-400 to-orange-600'
                          } shadow-lg`}
                          style={{ width: `${skill.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 font-medium">
                        <FiTrendingUp className="w-3 h-3 mr-1" />
                        {skill.progress > 80 ? 'Expert' : skill.progress > 60 ? 'Advanced' : skill.progress > 40 ? 'Intermediate' : 'Beginner'}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Premium 3D Glass Effects Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotateX(0deg); }
          50% { transform: translateY(-5px) rotateX(2deg); }
        }
        
        .group:hover {
          animation: float 3s ease-in-out infinite;
        }

        /* Glass morphism enhancement */
        .backdrop-blur-xl {
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        /* 3D perspective */
        [style*="preserve-3d"] {
          transform-style: preserve-3d;
        }

        /* Subtle shine effect on hover */
        .group:hover::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          transform: rotate(45deg);
          animation: shine 3s infinite;
        }

        @keyframes shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;
