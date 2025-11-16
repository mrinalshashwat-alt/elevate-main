'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

const AssessmentStart = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [instructions, setInstructions] = useState([]);

  useEffect(() => {
    // Get assessment ID from URL
    const assessmentId = searchParams.get('assessmentId');
    
    let loadedInstructions = [];
    
    if (assessmentId) {
      // Try to get assessment from localStorage
      try {
        const assessments = JSON.parse(localStorage.getItem('elevate_admin_assessments') || '[]');
        const assessment = assessments.find(a => a.id === assessmentId);
        
        if (assessment && assessment.instructions) {
          // Parse instructions - can be string or array
          if (typeof assessment.instructions === 'string') {
            // Split by newlines or bullets
            loadedInstructions = assessment.instructions
              .split(/\n|•|-\s*/)
              .map(line => line.trim())
              .filter(line => line.length > 0);
          } else if (Array.isArray(assessment.instructions)) {
            loadedInstructions = assessment.instructions;
          }
        }
      } catch (e) {
        console.error('Error loading assessment instructions:', e);
      }
    }
    
    // Default instructions if none found
    if (loadedInstructions.length === 0) {
      loadedInstructions = [
        'Ensure you have a stable internet connection',
        'Do not switch tabs or minimize the browser window',
        'Camera and microphone monitoring will be active',
        'All answers must be your own work',
        'You can navigate between questions and your progress is auto-saved'
      ];
    }
    
    setInstructions(loadedInstructions);
  }, [searchParams]);

  const handleSystemCheck = () => {
    if (acceptedRules) {
      router.push('/user/system-check');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          className="max-w-2xl w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-black/90 border border-white/10 rounded-2xl p-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Before You Begin</h1>
            
            <div className="space-y-4 mb-8">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-orange-400 mt-1">•</span>
                  <span className="text-gray-300">{instruction}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center mb-8">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedRules}
                  onChange={(e) => setAcceptedRules(e.target.checked)}
                  className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 focus:ring-2"
                />
                <span className="ml-3 text-gray-300">
                  I understand and agree to the rules
                </span>
              </label>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => router.push('/user/dashboard')}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSystemCheck}
                disabled={!acceptedRules}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AssessmentStart;
