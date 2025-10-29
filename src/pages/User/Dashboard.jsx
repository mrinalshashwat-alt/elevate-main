'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getUserDashboard } from '../../api/user';
import { useAuth } from '../../context/AuthContext';

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
        {/* Premium Enhanced Header */}
        <header className="bg-black/70 backdrop-blur-2xl border-b border-white/20 sticky top-0 z-50 shadow-2xl relative overflow-hidden">
          {/* Header background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-blue-500/5 opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent"></div>
          
          <div className="relative max-w-7xl mx-auto px-6 py-5">
            <div className="flex justify-between items-center">
              {/* Enhanced Left Section with Logo */}
              <div className="flex items-center space-x-5">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-blue-500/30 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl bg-white/10 p-2 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
                    <img 
                      src="/logo.jpg" 
                      alt="Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-gray-400 text-sm font-medium">{formatDate(currentTime)}</p>
                  </div>
                </div>
              </div>

              {/* Enhanced Right Section */}
              <div className="flex items-center space-x-4">
                {/* Premium Live Clock */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative text-right px-5 py-3 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:border-orange-500/50 transition-all duration-300 transform hover:scale-105">
                    <div className="text-3xl font-mono font-bold text-orange-400 tracking-wider drop-shadow-lg">
                      {formatTime(currentTime)}
                    </div>
                    <div className="text-xs text-gray-300 font-semibold uppercase tracking-wider mt-1">Live Time</div>
                  </div>
                </div>

                {/* Enhanced Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-3 rounded-xl bg-white/10 backdrop-blur-xl hover:bg-white/15 border border-white/20 hover:border-orange-500/50 transition-all duration-300 transform hover:scale-110 shadow-lg group"
                  >
                    <svg className="w-6 h-6 text-gray-300 group-hover:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full animate-pulse border-2 border-black shadow-lg flex items-center justify-center">
                      <span className="text-[8px] text-white font-bold">3</span>
                    </div>
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 top-16 w-96 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 shadow-2xl z-50 animate-in slide-in-from-top-2">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
                          <h3 className="font-bold text-xl text-white">Notifications</h3>
                          <button 
                            onClick={() => setShowNotifications(false)}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-gray-400 hover:text-white"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-sm hover:bg-orange-500/15 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-orange-400 rounded-full mt-1.5"></div>
                              <div>
                                <p className="font-bold text-white mb-1">Mock Interview Scheduled</p>
                                <p className="text-gray-400 text-xs">Tomorrow at 2:00 PM</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm hover:bg-blue-500/15 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5"></div>
                              <div>
                                <p className="font-bold text-white mb-1">New Course Available</p>
                                <p className="text-gray-400 text-xs">Advanced React Patterns</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-sm hover:bg-green-500/15 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5"></div>
                              <div>
                                <p className="font-bold text-white mb-1">Assessment Completed</p>
                                <p className="text-gray-400 text-xs">JavaScript Fundamentals</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced User Profile */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center space-x-3 px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl hover:border-orange-500/50 transition-all duration-300 transform hover:scale-105">
                    <div className="relative">
                      <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center border-2 border-orange-400/50 shadow-lg">
                        <span className="text-white font-bold text-sm">{user?.name?.charAt(0) || 'U'}</span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-black"></div>
                    </div>
                    <div className="text-left min-w-[80px]">
                      <div className="font-bold text-sm text-white">{user?.name || 'User'}</div>
                      <div className="text-xs text-gray-300 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        Online
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-all duration-300 transform hover:scale-110"
                      title="Logout"
                    >
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
          {/* Premium Welcome Section */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light">
              Ready to continue your learning journey? Let's make today productive.
            </p>
          </div>

          {/* Premium Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 transform hover:scale-[1.02] hover:-translate-y-1" style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/10 group-hover:to-blue-600/5 transition-all duration-500 rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Total Courses</h3>
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <p className="text-5xl font-bold mb-3 text-white">{stats?.totalCourses || 12}</p>
                <div className="flex items-center text-sm text-green-400 font-medium mb-3">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +2 this week
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-green-500/20 transform hover:scale-[1.02] hover:-translate-y-1" style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-600/0 group-hover:from-green-500/10 group-hover:to-green-600/5 transition-all duration-500 rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Completed</h3>
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl group-hover:bg-green-500/20 transition-colors">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-5xl font-bold mb-3 text-white">{stats?.completedCourses || 8}</p>
                <div className="flex items-center text-sm text-green-400 font-medium mb-3">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  67% completion rate
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-orange-500/20 transform hover:scale-[1.02] hover:-translate-y-1" style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-600/0 group-hover:from-orange-500/10 group-hover:to-orange-600/5 transition-all duration-500 rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Interviews</h3>
                  <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl group-hover:bg-orange-500/20 transition-colors">
                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-5xl font-bold mb-3 text-white">{stats?.upcomingInterviews || 3}</p>
                <div className="flex items-center text-sm text-orange-400 font-medium mb-3">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Next: Tomorrow
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-purple-500/20 transform hover:scale-[1.02] hover:-translate-y-1" style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-600/0 group-hover:from-purple-500/10 group-hover:to-purple-600/5 transition-all duration-500 rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wide">Skill Score</h3>
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <p className="text-5xl font-bold mb-3 text-white">{stats?.skillScore || 87}%</p>
                <div className="flex items-center text-sm text-purple-400 font-medium mb-3">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +5 this month
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[87%] bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                </div>
              </div>
            </div>
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
                  <button
                    key={idx}
                    onClick={action.action}
                    onMouseEnter={() => setActiveCard(idx)}
                    className={`group relative bg-white/5 backdrop-blur-xl border rounded-2xl p-7 text-left transition-all duration-300 overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-[1.03] hover:-translate-y-2 ${
                      activeCard === idx 
                        ? 'border-orange-500/50 shadow-orange-500/20 scale-[1.03] -translate-y-2' 
                        : 'border-white/10 hover:border-white/20'
                    }`}
                    style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} ${action.hoverGradient} transition-all duration-500 opacity-0 group-hover:opacity-100 rounded-2xl`}></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                    
                    <div className="relative z-10">
                      <div className="mb-5 transform group-hover:scale-110 transition-transform duration-500 text-gray-300 group-hover:text-white">
                        {action.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2 text-white">{action.title}</h3>
                      <p className="text-gray-400 mb-5 text-sm leading-relaxed">{action.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <span className="text-xs text-gray-500 font-medium">{action.stats}</span>
                        <div className="flex items-center text-sm font-semibold text-gray-400 group-hover:text-orange-400 transition-colors">
                          <span>Start</span>
                          <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Active indicator */}
                    {activeCard === idx && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
                    )}
                  </button>
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
                  <div key={event.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5 hover:border-white/20 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1" style={{ transformStyle: 'preserve-3d' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                    <div className="relative z-10">
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
                  </div>
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
                  <div key={activity.id} className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5 hover:border-white/20 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                    <div className="relative z-10 flex items-start space-x-4">
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
                  </div>
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
                  <div key={index} className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-5 hover:border-white/20 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-sm text-white">{skill.name}</span>
                        <span className="text-sm font-semibold text-gray-300">{skill.progress}%</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2.5 mb-3 overflow-hidden">
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
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        {skill.progress > 80 ? 'Expert' : skill.progress > 60 ? 'Advanced' : skill.progress > 40 ? 'Intermediate' : 'Beginner'}
                      </div>
                    </div>
                  </div>
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
