'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiEye, FiBook, FiActivity, FiSettings } from 'react-icons/fi';

const Settings = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

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
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 px-3">Main</h3>
            <div className="space-y-1">
              <button
                onClick={() => router.push('/user/dashboard')}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 border border-transparent"
              >
                <FiHome className="w-5 h-5 text-orange-500" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => router.push('/user/overview')}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 border border-transparent"
              >
                <FiEye className="w-5 h-5 text-orange-500" />
                <span>Overview</span>
              </button>
            </div>
          </div>

          {/* Workspace Section */}
          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 px-3">Workspace</h3>
            <div className="space-y-1">
              <button
                onClick={() => router.push('/user/courses')}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 border border-transparent"
              >
                <FiBook className="w-5 h-5 text-orange-500" />
                <span>Learning</span>
              </button>
              <button
                onClick={() => router.push('/user/dashboard')}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm font-semibold text-white/60 hover:text-white hover:bg-white/10 border border-transparent"
              >
                <FiActivity className="w-5 h-5 text-orange-500" />
                <span>Activities</span>
              </button>
            </div>
          </div>

          {/* System Section */}
          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3 px-3">System</h3>
            <div className="space-y-1">
              <button
                onClick={() => router.push('/user/settings')}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm font-semibold bg-orange-500/20 text-white border border-orange-500/30"
              >
                <FiSettings className="w-5 h-5 text-orange-500" />
                <span>Settings</span>
              </button>
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
              <div>
                <h1 className="text-xl font-bold text-white">Settings</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <motion.div 
            className="rounded-lg p-8 border border-white/10 relative overflow-hidden mb-6"
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
              <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
              <p className="text-white/60">Manage your account preferences and settings</p>
            </div>
          </motion.div>

          {/* Settings Content */}
          <div className="space-y-6">
            {/* Profile Settings */}
            <motion.div
              className="rounded-lg p-6 border border-white/10 relative overflow-hidden"
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
                <h3 className="text-xl font-bold text-white mb-4">Profile</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white">Name</label>
                    <input
                      type="text"
                      defaultValue={user?.name || ''}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-white">Email</label>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Notification Settings */}
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
                <h3 className="text-xl font-bold text-white mb-4">Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">Push Notifications</p>
                      <p className="text-sm text-white/60">Receive notifications on your device</p>
                    </div>
                    <button
                      onClick={() => setNotifications(!notifications)}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        notifications ? 'bg-orange-500' : 'bg-white/10'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        notifications ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">Email Updates</p>
                      <p className="text-sm text-white/60">Receive updates via email</p>
                    </div>
                    <button
                      onClick={() => setEmailUpdates(!emailUpdates)}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        emailUpdates ? 'bg-orange-500' : 'bg-white/10'
                      }`}
                    >
                      <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        emailUpdates ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;


