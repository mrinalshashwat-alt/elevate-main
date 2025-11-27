'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const AssessmentEnd = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          className="max-w-2xl w-full text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-8"
          >
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-16 h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold mb-4">Thank You!</h1>
            <p className="text-gray-400 text-lg">
              Your assessment has been submitted successfully.
            </p>
          </motion.div>

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => router.push('/user/dashboard')}
              className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors font-semibold"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => {
                // Clear any remaining assessment data
                localStorage.removeItem('assessment_coding_state');
                localStorage.removeItem('assessment_mcq_answers');
                localStorage.removeItem('assessment_video_answers');
                localStorage.removeItem('assessment_flow_completed');
                localStorage.removeItem('assessment_start_time');
                router.push('/user/dashboard');
              }}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Exit
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AssessmentEnd;
