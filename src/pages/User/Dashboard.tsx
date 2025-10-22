'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getUserDashboard } from '../../api/user';
import { useAuth } from '../../context/AuthContext';

const UserDashboard: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
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
    },
  ];

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] animate-pulse [animation-delay:2s]"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-black/50 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-xl font-bold">User Dashboard</span>
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
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

          {/* Stats Grid with Glass Effect */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-blue-500/40 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/10 group-hover:to-blue-600/5 transition-all duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 text-sm font-medium">Total Courses</h3>
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold mb-1">{stats?.totalCourses || 0}</p>
                <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-transparent rounded-full"></div>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-green-500/40 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-600/0 group-hover:from-green-500/10 group-hover:to-green-600/5 transition-all duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 text-sm font-medium">Completed</h3>
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold mb-1">{stats?.completedCourses || 0}</p>
                <div className="h-1 w-12 bg-gradient-to-r from-green-500 to-transparent rounded-full"></div>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-orange-500/40 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-600/0 group-hover:from-orange-500/10 group-hover:to-orange-600/5 transition-all duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 text-sm font-medium">Interviews</h3>
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold mb-1">{stats?.upcomingInterviews || 0}</p>
                <div className="h-1 w-12 bg-gradient-to-r from-orange-500 to-transparent rounded-full"></div>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-600/0 group-hover:from-purple-500/10 group-hover:to-purple-600/5 transition-all duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400 text-sm font-medium">Skill Score</h3>
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <p className="text-4xl font-bold mb-1">{stats?.skillScore || 0}%</p>
                <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-transparent rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Quick Actions Section Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Quick Actions</h2>
            <p className="text-gray-400">Access your most used features</p>
          </div>

          {/* Carousel Cards */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.action}
                  onMouseEnter={() => setActiveCard(idx)}
                  className={`group relative bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border rounded-2xl p-8 text-left transition-all duration-500 overflow-hidden ${
                    activeCard === idx ? 'border-white/20 scale-[1.02]' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} ${action.hoverGradient} transition-all duration-500`}></div>
                  
                  {/* Animated border gradient */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}>
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </div>

                  <div className="relative">
                    <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500">
                      {action.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{action.title}</h3>
                    <p className="text-gray-300 mb-6">{action.description}</p>
                    
                    <div className="flex items-center text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                      <span>Get Started</span>
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>

                  {/* Active indicator */}
                  {activeCard === idx && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-600"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Carousel Indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {quickActions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCard(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeCard === idx ? 'w-8 bg-gradient-to-r from-orange-500 to-red-600' : 'w-2 bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;