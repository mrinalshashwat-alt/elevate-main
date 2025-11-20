'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FirebaseError } from 'firebase/app';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAuthErrorMessage = (authError) => {
    if (!authError) return 'Something went wrong. Please try again.';

    const code = authError.code || '';

    switch (code) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/email-already-in-use':
        return 'That email is already registered. Try logging in instead.';
      case 'auth/weak-password':
        return 'Choose a stronger password (at least 6 characters).';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection and try again.';
      default:
        return authError.message || 'An unexpected error occurred. Please try again.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Please share your name so we can personalize your journey.');
      return;
    }

    if (!email.trim()) {
      setError('Email is required to create your account.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(name.trim(), email.trim(), password);
      setSuccess('Account created! Redirecting to your dashboard…');
      setTimeout(() => {
        router.replace('/user/dashboard');
      }, 1200);
    } catch (authError) {
      const friendlyMessage =
        authError instanceof FirebaseError
          ? getAuthErrorMessage(authError)
          : 'Unable to create your account right now.';
      setError(friendlyMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0a0f] via-[#12060a] to-black text-white flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,126,64,0.35),transparent_60%)] pointer-events-none blur-3xl" />
      <div className="w-full max-w-lg relative z-10">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-orange-200/90 hover:text-orange-100 transition">
            ← Back to home
          </Link>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl p-8 md:p-10 shadow-[0_35px_120px_rgba(255,120,64,0.25)]">
          <h1 className="text-3xl md:text-4xl font-black mb-2 bg-gradient-to-r from-orange-200 via-amber-100 to-white bg-clip-text text-transparent">
            Create your ElevateCareer account
          </h1>
          <p className="text-sm md:text-base text-gray-200/80 mb-6">
            Unlock AI-powered interview prep, communication coaching, and career guidance tailored to you.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-white/80 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-2xl bg-black/50 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
                placeholder="Jordan Taylor"
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-white/80 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl bg-black/50 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-white/80 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl bg-black/50 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-semibold text-white/80 mb-2">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-2xl bg-black/50 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-400/40 bg-red-500/10 text-red-200 text-sm px-4 py-3">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-green-400/40 bg-green-500/10 text-green-200 text-sm px-4 py-3">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm uppercase tracking-[0.3em] bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 text-black shadow-[0_20px_60px_rgba(255,140,80,0.35)] hover:shadow-[0_25px_70px_rgba(255,140,80,0.5)] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-sm text-gray-300/80 mt-6 text-center">
            Already have an account?{' '}
            <Link href="/#login" className="text-orange-200 hover:text-orange-100 font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;




































