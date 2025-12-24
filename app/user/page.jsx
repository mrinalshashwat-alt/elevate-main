'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/context/AuthContext';
import Link from 'next/link';
import { FiBookOpen, FiVideo, FiMessageSquare, FiArrowRight, FiLogIn, FiUserPlus } from 'react-icons/fi';

export default function UserPortalPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/user/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Redirecting to dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Elevate Your Career
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Take courses, practice interviews, and grow your skills
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-2"
            >
              <FiUserPlus />
              Sign Up Free
            </Link>
            <Link
              href="/user/login"
              className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-lg font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <FiLogIn />
              Login
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-black/50 border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <FiBookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Courses</h3>
            <p className="text-gray-400">
              Learn new skills with expert-led courses in tech, management, and more
            </p>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-2xl p-6 hover:border-orange-500/50 transition-all">
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
              <FiVideo className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Mock Interviews</h3>
            <p className="text-gray-400">
              Practice with AI-powered mock interviews and get instant feedback
            </p>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-2xl p-6 hover:border-green-500/50 transition-all">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <FiMessageSquare className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Career Coach</h3>
            <p className="text-gray-400">
              Get personalized career guidance from our AI career coach
            </p>
          </div>
        </div>

        {/* Assessment CTA */}
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-semibold text-white mb-2">
            Taking an Assessment?
          </h3>
          <p className="text-gray-400 mb-4">
            If you received an assessment invitation from a recruiter, use the link from your email
          </p>
        </div>

        {/* Admin Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Are you a recruiter?{' '}
            <a
              href={typeof window !== 'undefined' && window.location.hostname.startsWith('assess.')
                ? window.location.protocol + '//' + window.location.hostname.replace('assess.', 'admin.') + '/login'
                : '/admin/login'}
              className="text-orange-400 hover:text-orange-300 font-medium"
            >
              Admin Portal
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
