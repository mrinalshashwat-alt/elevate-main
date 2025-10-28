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
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Enhanced Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse [animation-delay:2s]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] animate-pulse [animation-delay:4s]"></div>
      </div>

      <div className="relative z-10">
        {/* Enhanced Header */}
        <header className="bg-black/30 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <span className="text-white font-bold text-xl">E</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Dashboard</h1>
                  <p className="text-gray-400 text-sm">{formatDate(currentTime)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                {/* Live Clock */}
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-orange-400">
                    {formatTime(currentTime)}
                  </div>
                  <div className="text-xs text-gray-400">Live Time</div>
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all relative"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6z" />
                    </svg>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 top-12 w-80 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl">
                      <h3 className="font-semibold mb-3">Notifications</h3>
                      <div className="space-y-2">
                        <div className="p-2 bg-orange-500/10 rounded-lg text-sm">
                          <p className="font-medium">Mock Interview Scheduled</p>
                          <p className="text-gray-400">Tomorrow at 2:00 PM</p>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-lg text-sm">
                          <p className="font-medium">New Course Available</p>
                          <p className="text-gray-400">Advanced React Patterns</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{user?.name?.charAt(0) || 'U'}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{user?.name || 'User'}</div>
                    <div className="text-xs text-gray-400">Online</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all"
                  >
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Ready to continue your learning journey? Let's make today productive.
            </p>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-blue-500/40 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/10 group-hover:to-blue-600/5 transition-all duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 text-sm font-medium">Total Courses</h3>
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold mb-2">{stats?.totalCourses || 12}</p>
                <div className="flex items-center text-sm text-green-400">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +2 this week
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-transparent rounded-full mt-3"></div>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-green-500/40 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-600/0 group-hover:from-green-500/10 group-hover:to-green-600/5 transition-all duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 text-sm font-medium">Completed</h3>
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold mb-2">{stats?.completedCourses || 8}</p>
                <div className="flex items-center text-sm text-green-400">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  67% completion rate
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-green-500 to-transparent rounded-full mt-3"></div>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-orange-500/40 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-600/0 group-hover:from-orange-500/10 group-hover:to-orange-600/5 transition-all duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 text-sm font-medium">Interviews</h3>
                  <div className="p-3 bg-orange-500/20 rounded-xl">
                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold mb-2">{stats?.upcomingInterviews || 3}</p>
                <div className="flex items-center text-sm text-orange-400">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Next: Tomorrow
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-transparent rounded-full mt-3"></div>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-600/0 group-hover:from-purple-500/10 group-hover:to-purple-600/5 transition-all duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 text-sm font-medium">Skill Score</h3>
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold mb-2">{stats?.skillScore || 87}%</p>
                <div className="flex items-center text-sm text-purple-400">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +5 this month
                </div>
                <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-transparent rounded-full mt-3"></div>
              </div>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Quick Actions</h2>
                <p className="text-gray-400">Access your most used features</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={action.action}
                    onMouseEnter={() => setActiveCard(idx)}
                    className={`group relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border rounded-2xl p-6 text-left transition-all duration-500 overflow-hidden ${
                      activeCard === idx ? 'border-white/20 scale-[1.02]' : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} ${action.hoverGradient} transition-all duration-500`}></div>
                    
                    <div className="relative">
                      <div className="mb-4 transform group-hover:scale-110 transition-transform duration-500">
                        {action.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                      <p className="text-gray-300 mb-4 text-sm">{action.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{action.stats}</span>
                        <div className="flex items-center text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                          <span>Start</span>
                          <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Active indicator */}
                    {activeCard === idx && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-600"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Upcoming Events</h2>
                <p className="text-gray-400">Your schedule</p>
              </div>

              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-sm">{event.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        event.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        event.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {event.priority}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mb-2">{event.time}</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        event.type === 'interview' ? 'bg-orange-400' :
                        event.type === 'course' ? 'bg-blue-400' :
                        'bg-purple-400'
                      }`}></div>
                      {event.type.replace('-', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities & Skill Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activities */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Recent Activities</h2>
                <p className="text-gray-400">Your latest progress</p>
              </div>

              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all">
                    <div className="flex items-start space-x-4">
                      <div className="text-2xl">{activity.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">{activity.title}</h3>
                        <p className="text-gray-400 text-xs mb-2">{activity.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{activity.time}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            activity.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            'bg-blue-500/20 text-blue-400'
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

            {/* Skill Progress */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Skill Progress</h2>
                <p className="text-gray-400">Track your development</p>
              </div>

              <div className="space-y-4">
                {skillProgress.map((skill, index) => (
                  <div key={index} className="bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{skill.name}</span>
                      <span className="text-sm text-gray-400">{skill.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700/30 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${
                          skill.color === 'yellow' ? 'from-yellow-400 to-yellow-600' :
                          skill.color === 'blue' ? 'from-blue-400 to-blue-600' :
                          skill.color === 'green' ? 'from-green-400 to-green-600' :
                          skill.color === 'purple' ? 'from-purple-400 to-purple-600' :
                          'from-orange-400 to-orange-600'
                        }`}
                        style={{ width: `${skill.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      {skill.progress > 80 ? 'Expert' : skill.progress > 60 ? 'Advanced' : skill.progress > 40 ? 'Intermediate' : 'Beginner'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
