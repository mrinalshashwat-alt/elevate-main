'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const AssessmentSummary = () => {
  const router = useRouter();
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(28);

  useEffect(() => {
    // Load assessment data from localStorage
    const savedState = localStorage.getItem('assessment_coding_state');
    const mcqAnswers = JSON.parse(localStorage.getItem('assessment_mcq_answers') || '{}');
    const videoAnswers = JSON.parse(localStorage.getItem('assessment_video_answers') || '[]');
    
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
    
    setTotalAttempted(mcqAnswered + codingAttempted + videoAttempted);
  }, []);

  const handleFinalSubmit = () => {
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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          className="max-w-2xl w-full text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-6">Assessment Summary</h1>
          
          <div className="bg-black/90 border border-white/10 rounded-2xl p-8 mb-8">
            <div className="text-6xl font-bold text-orange-400 mb-4">
              {totalAttempted}/{totalQuestions}
            </div>
            <p className="text-gray-400 text-lg mb-2">Questions Attempted</p>
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mt-4">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all"
                style={{ width: `${Math.round((totalAttempted / totalQuestions) * 100)}%` }}
              />
            </div>
          </div>

          {totalAttempted < totalQuestions && (
            <p className="text-yellow-400 mb-6">
              You have {totalQuestions - totalAttempted} unanswered question(s).
            </p>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={handleContinueAssessment}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors font-semibold"
            >
              Continue Assessment
            </button>
            <button
              onClick={handleFinalSubmit}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Final Submit
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AssessmentSummary;
