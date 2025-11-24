'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiFileText, FiCode, FiVideo, FiAlertCircle, FiChevronRight, FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';

const AssessmentSummary = () => {
  const router = useRouter();
  const [stats, setStats] = useState({
    mcq: { attempted: 0, total: 20 },
    coding: { attempted: 0, total: 3 },
    video: { attempted: 0, total: 5 },
  });
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(28);
  const [timeSpent, setTimeSpent] = useState('0:00');

  useEffect(() => {
    // Load assessment data from localStorage
    const savedState = localStorage.getItem('assessment_coding_state');
    const mcqAnswers = JSON.parse(localStorage.getItem('assessment_mcq_answers') || '{}');
    const videoAnswers = JSON.parse(localStorage.getItem('assessment_video_answers') || '[]');
    const startTime = localStorage.getItem('assessment_start_time');
    
    // Calculate MCQ stats
    const mcqAnswered = Object.keys(mcqAnswers).filter(key => {
      const answer = mcqAnswers[key];
      return answer && answer !== '' && answer !== null && answer !== undefined;
    }).length;
    
    // Calculate coding stats
    let codingAttempted = 0;
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.codingProblems && Array.isArray(parsed.codingProblems)) {
          codingAttempted = parsed.codingProblems.filter(p => {
            const code = p.code || '';
            return code.trim() !== '' && code.trim().length > 10;
          }).length;
        }
      } catch (e) {
        console.error('Error parsing saved state:', e);
      }
    }
    
    // Calculate video stats
    const videoAttempted = Array.isArray(videoAnswers) ? videoAnswers.length : 0;
    
    setStats({
      mcq: { attempted: mcqAnswered, total: 20 },
      coding: { attempted: codingAttempted, total: 3 },
      video: { attempted: videoAttempted, total: 5 },
    });
    
    setTotalAttempted(mcqAnswered + codingAttempted + videoAttempted);
    
    // Calculate time spent
    if (startTime) {
      const elapsed = Date.now() - parseInt(startTime);
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setTimeSpent(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }
  }, []);

  const handleFinalSubmit = () => {
    if (totalAttempted < totalQuestions) {
      const confirmSubmit = confirm(
        `You have ${totalQuestions - totalAttempted} unanswered question(s). Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }
    
    // Clear all assessment data
    localStorage.removeItem('assessment_coding_state');
    localStorage.removeItem('assessment_mcq_answers');
    localStorage.removeItem('assessment_video_answers');
    localStorage.removeItem('assessment_flow_completed');
    localStorage.removeItem('assessment_start_time');
    
    // Navigate to thank you page
    router.push('/user/assessment-end');
  };

  const handleContinueAssessment = () => {
    router.push('/user/assessment');
  };

  const completionPercentage = Math.round((totalAttempted / totalQuestions) * 100);
  const allCompleted = totalAttempted === totalQuestions;

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-lg border-b border-white/10 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold">Assessment Summary</span>
          </div>
          <div className="text-sm text-gray-400">
            Time Spent: <span className="text-orange-400 font-semibold">{timeSpent}</span>
          </div>
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full grid grid-cols-2 gap-6"
          >
            {/* Left Column - Progress Overview */}
            <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Overall Progress</h1>
                {allCompleted && (
                  <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <FiCheckCircle className="text-green-400 text-sm" />
                    <span className="text-green-400 font-semibold text-sm">Complete</span>
                  </div>
                )}
              </div>

              {/* Circular Progress */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="10"
                      fill="none"
                    />
                    <motion.circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="url(#gradient)"
                      strokeWidth="10"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - completionPercentage / 100) }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#dc2626" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold">{completionPercentage}%</span>
                    <span className="text-gray-400 text-sm">Complete</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-gray-400 text-xs mb-1">Completed</div>
                  <div className="text-2xl font-bold">{totalAttempted}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-gray-400 text-xs mb-1">Remaining</div>
                  <div className="text-2xl font-bold">{totalQuestions - totalAttempted}</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-gray-400 text-xs mb-1">Time</div>
                  <div className="text-2xl font-bold">{timeSpent}</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Questions Attempted</span>
                  <span className="text-xl font-bold">{totalAttempted}/{totalQuestions}</span>
                </div>
                <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Warning Message */}
              {!allCompleted && (
                <div className="flex items-start space-x-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mt-auto">
                  <FiAlertCircle className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-400 font-semibold text-sm mb-0.5">Incomplete Assessment</p>
                    <p className="text-gray-300 text-xs">
                      {totalQuestions - totalAttempted} unanswered question(s) remaining
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Section Breakdown */}
            <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col">
              <h2 className="text-2xl font-bold mb-6">Section Breakdown</h2>
              
              <div className="space-y-4 flex-1">
                {/* MCQ Section */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <FiFileText className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">Multiple Choice</h3>
                        <p className="text-gray-400 text-xs">MCQ Section</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        {stats.mcq.attempted === stats.mcq.total ? (
                          <FiCheckCircle className="text-green-400" />
                        ) : (
                          <FiX className="text-yellow-400" />
                        )}
                        <span className="font-bold text-lg">
                          {stats.mcq.attempted}/{stats.mcq.total}
                        </span>
                      </div>
                      <span className="text-gray-400 text-xs">
                        {Math.round((stats.mcq.attempted / stats.mcq.total) * 100)}% Complete
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${(stats.mcq.attempted / stats.mcq.total) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Coding Section */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <FiCode className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">Coding Problems</h3>
                        <p className="text-gray-400 text-xs">Programming Section</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        {stats.coding.attempted === stats.coding.total ? (
                          <FiCheckCircle className="text-green-400" />
                        ) : (
                          <FiX className="text-yellow-400" />
                        )}
                        <span className="font-bold text-lg">
                          {stats.coding.attempted}/{stats.coding.total}
                        </span>
                      </div>
                      <span className="text-gray-400 text-xs">
                        {Math.round((stats.coding.attempted / stats.coding.total) * 100)}% Complete
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${(stats.coding.attempted / stats.coding.total) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Video Section */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <FiVideo className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">Video Interview</h3>
                        <p className="text-gray-400 text-xs">Video Response Section</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        {stats.video.attempted === stats.video.total ? (
                          <FiCheckCircle className="text-green-400" />
                        ) : (
                          <FiX className="text-yellow-400" />
                        )}
                        <span className="font-bold text-lg">
                          {stats.video.attempted}/{stats.video.total}
                        </span>
                      </div>
                      <span className="text-gray-400 text-xs">
                        {Math.round((stats.video.attempted / stats.video.total) * 100)}% Complete
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all"
                      style={{ width: `${(stats.video.attempted / stats.video.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-black/95 backdrop-blur-lg border-t border-white/10 flex-shrink-0 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={handleContinueAssessment}
            className="flex items-center space-x-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all font-semibold"
          >
            <FiArrowLeft />
            <span>Continue Assessment</span>
          </button>
          <button
            onClick={handleFinalSubmit}
            className="flex items-center space-x-2 px-8 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-bold text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all"
          >
            <span>Submit Assessment</span>
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentSummary;
