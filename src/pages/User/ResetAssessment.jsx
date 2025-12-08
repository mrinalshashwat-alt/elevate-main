'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FiRefreshCw, FiTrash2, FiCheckCircle } from 'react-icons/fi';

/**
 * Utility page to reset assessment state
 * Useful for debugging and testing
 * Access at: /user/reset-assessment
 */
const ResetAssessment = () => {
  const router = useRouter();
  const [cleared, setCleared] = React.useState(false);

  const clearAllAssessmentData = () => {
    const keys = [
      'assessment_token',
      'assessment_data',
      'attempt_data',
      'attempt_id',
      'can_resume',
      'assessment_flow_completed',
      'assessment_mcq_answers',
      'assessment_coding_state',
      'assessment_video_answers',
      'assessment_violations'
    ];

    keys.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log('Cleared all assessment data from localStorage');
    setCleared(true);

    setTimeout(() => {
      router.push('/');
    }, 2000);
  };

  const showCurrentState = () => {
    const state = {
      assessment_token: localStorage.getItem('assessment_token'),
      assessment_data: localStorage.getItem('assessment_data')?.substring(0, 100),
      attempt_data: localStorage.getItem('attempt_data')?.substring(0, 100),
      attempt_id: localStorage.getItem('attempt_id'),
      can_resume: localStorage.getItem('can_resume'),
      assessment_flow_completed: localStorage.getItem('assessment_flow_completed'),
    };

    console.log('Current localStorage state:', state);
    alert('Check console for current state');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="text-center mb-6">
            <FiRefreshCw className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Reset Assessment State</h1>
            <p className="text-gray-400 text-sm">
              Clear all assessment data from localStorage
            </p>
          </div>

          {cleared ? (
            <div className="text-center">
              <FiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-green-400 mb-2">Assessment data cleared!</p>
              <p className="text-gray-400 text-sm">Redirecting to home...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={showCurrentState}
                className="w-full px-6 py-3 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl font-semibold hover:bg-blue-500/30 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Show Current State</span>
              </button>

              <button
                onClick={clearAllAssessmentData}
                className="w-full px-6 py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-semibold hover:bg-red-500/30 transition-colors flex items-center justify-center space-x-2"
              >
                <FiTrash2 />
                <span>Clear All Data</span>
              </button>

              <button
                onClick={() => router.back()}
                className="w-full px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>This page is for debugging only</p>
          <p>Access: /user/reset-assessment</p>
        </div>
      </div>
    </div>
  );
};

export default ResetAssessment;


