'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const AdminLayoutContent = ({ children, title, breadcrumbs = [], stats }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      path: '/admin/dashboard', 
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' 
    },
    {
      id: 'jobs',
      label: 'Jobs',
      path: '/admin/jobs',
      icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    },
    {
      id: 'assessments',
      label: 'Assessments',
      path: '/admin/assessment-list',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
    },
    { 
      id: 'candidates', 
      label: 'Candidates', 
      path: '/admin/candidates', 
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' 
    },
    { 
      id: 'results', 
      label: 'Results', 
      path: '/admin/results', 
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' 
    },
    { 
      id: 'users', 
      label: 'Manage Users', 
      path: '/admin/manage-users', 
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' 
    },
  ];

  const isActive = (path) => {
    if (path === '/admin/dashboard') {
      return pathname === path;
    }
    
    // Handle assessment-list page with different tabs
    if (pathname === '/admin/assessment-list') {
      const currentTab = searchParams.get('tab');
      
      // If path has query params, check the tab parameter
      if (path.includes('?')) {
        const urlParams = new URLSearchParams(path.split('?')[1]);
        const paramKey = urlParams.keys().next().value;
        const paramValue = urlParams.get(paramKey);
        
        if (paramKey === 'tab') {
          // For jobs tab - only active when tab=jobs
          if (paramValue === 'jobs') {
            return currentTab === 'jobs';
          }
          // For assessments tab - active when tab=assessments or no tab (defaults to assessments)
          if (paramValue === 'assessments') {
            return currentTab === 'assessments' || currentTab === null;
          }
        }
      }
      // If navigation path doesn't have query params but we're on assessment-list,
      // don't mark as active (prevents conflicts)
      return false;
    }
    
    // Handle query params in path for other pages
    const pathWithoutQuery = path.split('?')[0];
    if (path.includes('?')) {
      const urlParams = new URLSearchParams(path.split('?')[1]);
      const paramKey = urlParams.keys().next().value;
      const paramValue = urlParams.get(paramKey);
      return pathname.startsWith(pathWithoutQuery) && searchParams.get(paramKey) === paramValue;
    }
    
    // For other pages without query params, check if pathname starts with path
    return pathname.startsWith(pathWithoutQuery);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleNavigation = (path) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex">
      {/* Left Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-black/40 backdrop-blur-xl border-r border-orange-500/20 sticky top-0 h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-orange-500/20">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.jpg" 
              alt="Elevate Logo" 
              className="w-10 h-10 object-contain rounded-lg border border-orange-500/20"
            />
            <span className="text-xl font-bold text-white">Elevate</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold ${
                  active
                    ? 'bg-orange-500/20 text-white border border-orange-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <svg className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-black/80 backdrop-blur-xl border-b border-orange-500/20 sticky top-0 z-50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left: System Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-semibold">System Online</span>
              </div>

              {/* Center: Search Bar */}
              <div className="flex-1 max-w-2xl mx-8">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search platform..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              {/* Right: Actions & User */}
              <div className="flex items-center space-x-3">
                {/* Notifications */}
                <button className="relative p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/30 transition-all">
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                </button>

                {/* Settings */}
                <button className="p-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/30 transition-all">
                  <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                {/* User Profile */}
                <div className="flex items-center space-x-3 px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-orange-500/30 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border-2 border-orange-500/30 flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400/20 to-purple-400/20"></div>
                  </div>
                  <div className="hidden xl:block">
                    <div className="text-sm font-bold text-white">{user?.name || 'Admin User'}</div>
                    <div className="text-xs text-gray-400">Administrator</div>
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/30 rounded-lg transition-all text-sm font-semibold text-gray-300 hover:text-orange-400"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>


        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </main>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden fixed bottom-6 right-6 p-4 bg-orange-500 rounded-full shadow-lg hover:bg-orange-600 transition-all z-50"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="lg:hidden fixed inset-y-0 left-0 w-64 bg-black/95 backdrop-blur-xl border-r border-orange-500/20 z-40 overflow-y-auto"
          >
              <div className="p-6 border-b border-orange-500/20">
                <div className="flex items-center space-x-3 mb-6">
                  <img 
                    src="/logo.jpg" 
                    alt="Elevate Logo" 
                    className="w-10 h-10 object-contain rounded-lg border border-orange-500/20"
                  />
                  <span className="text-xl font-bold text-white">Elevate</span>
                </div>
              </div>
            <div className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold ${
                      active
                        ? 'bg-orange-500/20 text-white border border-orange-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                    </svg>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const AdminLayout = ({ children, title, breadcrumbs = [], stats }) => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="flex gap-2 justify-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <AdminLayoutContent title={title} breadcrumbs={breadcrumbs} stats={stats}>
        {children}
      </AdminLayoutContent>
    </Suspense>
  );
};

export default AdminLayout;

