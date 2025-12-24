'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { FiCheck, FiLoader, FiArrowRight, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import Link from 'next/link';
import { login as loginAPI } from '../../api/auth';

const UserLogin = () => {
  const router = useRouter();
  const { isAuthenticated, user, login: authLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push('/user/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await loginAPI({
        email: email.trim().toLowerCase(),
        password,
        remember_me: rememberMe,
      });

      // Store token and login
      await authLogin(response.token);

      setIsRedirecting(true);
      setTimeout(() => {
        router.push('/user/dashboard');
      }, 500);
    } catch (err) {
      console.error('Login failed:', err);
      const errorMessage = err?.response?.data?.password?.[0] ||
                          err?.response?.data?.email?.[0] ||
                          err?.response?.data?.detail ||
                          'Invalid email or password. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname.includes('localhost'));
    if (isLocalhost) {
      router.push('/user/forgot-password');
    } else {
      window.location.href = window.location.protocol + '//' + window.location.hostname.replace(/^(www\.|admin\.)?/, 'assess.') + '/forgot-password';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-10 max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <FiUser className="w-7 h-7 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome Back</h1>
          <p className="text-gray-400 text-sm">Continue your learning journey</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-500 bg-white/5 border-white/10 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-300">
                Remember me
              </label>
            </div>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading || isRedirecting}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
            whileHover={{ scale: isLoading || isRedirecting ? 1 : 1.01 }}
            whileTap={{ scale: isLoading || isRedirecting ? 1 : 0.99 }}
          >
            {isLoading ? (
              <>
                <FiLoader className="animate-spin w-4 h-4" />
                Signing in...
              </>
            ) : isRedirecting ? (
              <>
                <FiCheck className="w-4 h-4" />
                Redirecting...
              </>
            ) : (
              <>
                Sign In
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Links */}
        <div className="mt-8 pt-6 border-t border-white/5 space-y-3 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign up free
            </Link>
          </p>
          <p className="text-xs text-gray-500">
            Are you a recruiter?{' '}
            <a
              href={typeof window !== 'undefined' && window.location.hostname.startsWith('assess.')
                ? window.location.protocol + '//' + window.location.hostname.replace('assess.', 'admin.') + '/login'
                : '/admin/login'}
              className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
            >
              Admin Portal →
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default UserLogin;
