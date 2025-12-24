'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiCheck, FiLoader, FiArrowRight, FiArrowLeft, FiLock, FiMail, FiEye, FiEyeOff } from 'react-icons/fi';
import { requestPasswordReset, confirmPasswordReset } from '../../api/auth';

const ForgotPassword = ({ portal = 'user' }) => {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP + new password, 3: Success

  // Step 1: Email
  const [email, setEmail] = useState('');
  const [isLoadingOTP, setIsLoadingOTP] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Step 2: OTP + Password
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoadingReset, setIsLoadingReset] = useState(false);
  const [resetError, setResetError] = useState('');

  const isAdmin = portal === 'admin';
  const theme = isAdmin ? 'orange' : 'blue';

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setOtpError('');
    setIsLoadingOTP(true);

    try {
      await requestPasswordReset({ email: email.trim().toLowerCase() });
      setStep(2);
    } catch (err) {
      console.error('OTP request failed:', err);
      const errorMessage = err?.response?.data?.email?.[0] ||
                          err?.response?.data?.detail ||
                          'Failed to send OTP. Please try again.';
      setOtpError(errorMessage);
    } finally {
      setIsLoadingOTP(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');

    // Validate password match
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }

    // Validate password length
    if (newPassword.length < 8) {
      setResetError('Password must be at least 8 characters.');
      return;
    }

    setIsLoadingReset(true);

    try {
      await confirmPasswordReset({
        email: email.trim().toLowerCase(),
        otp: otp,
        new_password: newPassword,
      });
      setStep(3);
    } catch (err) {
      console.error('Password reset failed:', err);
      const errorMessage = err?.response?.data?.otp?.[0] ||
                          err?.response?.data?.new_password?.[0] ||
                          err?.response?.data?.detail ||
                          'Password reset failed. Please try again.';
      setResetError(errorMessage);
    } finally {
      setIsLoadingReset(false);
    }
  };

  const handleBackToLogin = () => {
    const loginPath = isAdmin ? '/admin/login' : '/user/login';
    router.push(loginPath);
  };

  const handleBackToEmail = () => {
    setStep(1);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-${theme}-500/5 rounded-full blur-3xl`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-${theme}-500/5 rounded-full blur-3xl`}></div>
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
            className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-${theme}-500 to-${theme}-600 rounded-xl mb-4`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <FiLock className="w-7 h-7 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {step === 3 ? 'Password Reset' : 'Forgot Password'}
          </h1>
          <p className="text-gray-400 text-sm">
            {step === 1 && "We'll send you a code to reset your password"}
            {step === 2 && 'Enter the code and your new password'}
            {step === 3 && 'Your password has been reset successfully'}
          </p>
        </div>

        {/* Step 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleRequestOTP} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAdmin ? 'admin@company.com' : 'you@example.com'}
                  className={`w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-${theme}-500 focus:ring-1 focus:ring-${theme}-500/30 transition-all`}
                  required
                />
              </div>
            </div>

            {otpError && (
              <motion.div
                className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {otpError}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isLoadingOTP}
              className={`w-full py-2.5 px-4 bg-gradient-to-r from-${theme}-500 to-${theme}-600 text-white rounded-lg font-medium hover:from-${theme}-600 hover:to-${theme}-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-${theme}-500/20`}
              whileHover={{ scale: isLoadingOTP ? 1 : 1.01 }}
              whileTap={{ scale: isLoadingOTP ? 1 : 0.99 }}
            >
              {isLoadingOTP ? (
                <>
                  <FiLoader className="animate-spin w-4 h-4" />
                  Sending...
                </>
              ) : (
                <>
                  Send Reset Code
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </form>
        )}

        {/* Step 2: Enter OTP + New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                autoFocus
                className={`w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-center text-xl tracking-[0.5em] placeholder-gray-500 focus:outline-none focus:border-${theme}-500 focus:ring-1 focus:ring-${theme}-500/30 transition-all`}
                required
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Sent to {email} •{' '}
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className={`text-${theme}-400 hover:text-${theme}-300 transition-colors`}
                >
                  Change
                </button>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className={`w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-${theme}-500 focus:ring-1 focus:ring-${theme}-500/30 transition-all pr-10`}
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

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className={`w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-${theme}-500 focus:ring-1 focus:ring-${theme}-500/30 transition-all pr-10`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {resetError && (
              <motion.div
                className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {resetError}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isLoadingReset || otp.length !== 6}
              className={`w-full py-2.5 px-4 bg-gradient-to-r from-${theme}-500 to-${theme}-600 text-white rounded-lg font-medium hover:from-${theme}-600 hover:to-${theme}-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-lg shadow-${theme}-500/20`}
              whileHover={{ scale: isLoadingReset ? 1 : 1.01 }}
              whileTap={{ scale: isLoadingReset ? 1 : 0.99 }}
            >
              {isLoadingReset ? (
                <>
                  <FiLoader className="animate-spin w-4 h-4" />
                  Resetting...
                </>
              ) : (
                <>
                  Reset Password
                  <FiCheck className="w-4 h-4" />
                </>
              )}
            </motion.button>

            <button
              type="button"
              onClick={handleBackToEmail}
              className="w-full text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              Change Email
            </button>
          </form>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="text-center space-y-6">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <FiCheck className="w-8 h-8 text-green-400" />
            </motion.div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Password Reset Successful
              </h2>
              <p className="text-gray-400 text-sm">
                You can now sign in with your new password
              </p>
            </div>

            <motion.button
              onClick={handleBackToLogin}
              className={`w-full py-2.5 px-4 bg-gradient-to-r from-${theme}-500 to-${theme}-600 text-white rounded-lg font-medium hover:from-${theme}-600 hover:to-${theme}-700 flex items-center justify-center gap-2 transition-all shadow-lg shadow-${theme}-500/20`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              Go to Login
              <FiArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
