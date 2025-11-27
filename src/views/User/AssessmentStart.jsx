'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiShield, FiClock, FiFileText, FiVideo, FiCode, FiChevronRight, FiX } from 'react-icons/fi';

const AssessmentStart = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [instructions, setInstructions] = useState([]);
  const [assessmentInfo, setAssessmentInfo] = useState(null);

  useEffect(() => {
    const assessmentId = searchParams.get('assessmentId');
    
    let loadedInstructions = [];
    let assessment = null;
    
    if (assessmentId) {
      try {
        const assessments = JSON.parse(localStorage.getItem('elevate_admin_assessments') || '[]');
        assessment = assessments.find(a => a.id === assessmentId);
        
        if (assessment) {
          setAssessmentInfo(assessment);
          
          if (assessment.instructions) {
            if (typeof assessment.instructions === 'string') {
              loadedInstructions = assessment.instructions
                .split(/\n|•|-\s*/)
                .map(line => line.trim())
                .filter(line => line.length > 0);
            } else if (Array.isArray(assessment.instructions)) {
              loadedInstructions = assessment.instructions;
            }
          }
        }
      } catch (e) {
        console.error('Error loading assessment:', e);
      }
    }
    
    if (loadedInstructions.length === 0) {
      loadedInstructions = [
        'Ensure you have a stable internet connection throughout the assessment',
        'Do not switch tabs, minimize the browser window, or use other applications',
        'Camera and microphone monitoring will be active during the assessment',
        'All answers must be your own work - plagiarism will result in disqualification',
        'You can navigate between questions and your progress is automatically saved',
        'Review all answers before final submission as you cannot change them afterward'
      ];
    }
    
    setInstructions(loadedInstructions);
  }, [searchParams]);

  const handleSystemCheck = () => {
    if (acceptedRules) {
      router.push('/user/system-check');
    }
  };

  const sections = [
    { type: 'MCQ', count: 20, time: 20, icon: FiFileText, color: 'blue' },
    { type: 'Coding', count: 3, time: 40, icon: FiCode, color: 'green' },
    { type: 'Video', count: 5, time: 30, icon: FiVideo, color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-contain" />
            <span className="text-xl font-bold">AI Assessment Platform</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">Need help?</span>
            <a href="mailto:support@aiassessments.com" className="text-orange-500 hover:text-orange-400 text-sm font-medium">
              Contact Support
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Assessment Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-3 text-white">
                {assessmentInfo?.title || 'Technical Assessment'}
              </h1>
              {assessmentInfo?.description && (
                <p className="text-gray-300 text-lg">{assessmentInfo.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-2 px-5 py-2.5 bg-green-500/20 border border-green-500/30 rounded-xl ml-6 shadow-lg shadow-green-500/20">
              <FiShield className="text-green-400 w-5 h-5" />
              <span className="text-green-400 font-semibold">Proctored</span>
            </div>
          </div>

          {/* Section Breakdown */}
          <div className="flex flex-wrap gap-3">
            {sections.map((section, index) => {
              const Icon = section.icon;
              const colorClasses = {
                blue: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
                green: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
                purple: { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
              };
              const colors = colorClasses[section.color] || colorClasses.blue;
              
              return (
                <div key={index} className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${colors.bg} border ${colors.border} hover:scale-105 transition-transform`}>
                  <Icon className={`w-4 h-4 ${colors.text}`} />
                  <span className="font-semibold text-sm text-white">{section.type}</span>
                  <span className="text-gray-400 text-sm">({section.count} Q, {section.time} min)</span>
                </div>
              );
            })}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Instructions (scrollable) */}
            <div>
              {/* Instructions */}
              <div className="space-y-4 bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <FiAlertCircle className="w-5 h-5 text-orange-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Important Instructions</h2>
                </div>
                
                <ul className="space-y-3 pl-1 max-h-[400px] overflow-y-auto pr-2">
                  {instructions.map((instruction, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.03 }}
                      className="flex items-start space-x-3 text-gray-300"
                    >
                      <span className="text-orange-400 font-bold mt-0.5 flex-shrink-0 w-6">{index + 1}.</span>
                      <span className="leading-relaxed flex-1">{instruction}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column - Stats Cards (2x2 grid) and Checkbox/Buttons (sticky) */}
            <div className="space-y-6">
              {/* Stats Cards - 2x2 Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-orange-500/30 transition-colors">
                  <div className="flex items-center space-x-2 text-gray-400 mb-2">
                    <FiClock className="w-5 h-5" />
                    <span className="text-sm font-medium">Duration</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{assessmentInfo?.duration || 90} min</p>
                </div>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-orange-500/30 transition-colors">
                  <div className="flex items-center space-x-2 text-gray-400 mb-2">
                    <FiFileText className="w-5 h-5" />
                    <span className="text-sm font-medium">Questions</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{assessmentInfo?.questions || 28}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-orange-500/30 transition-colors">
                  <div className="flex items-center space-x-2 text-gray-400 mb-2">
                    <FiCode className="w-5 h-5" />
                    <span className="text-sm font-medium">Sections</span>
                  </div>
                  <p className="text-3xl font-bold text-white">3</p>
                </div>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-orange-500/30 transition-colors">
                  <div className="flex items-center space-x-2 text-gray-400 mb-2">
                    <FiShield className="w-5 h-5" />
                    <span className="text-sm font-medium">Monitoring</span>
                  </div>
                  <p className="text-3xl font-bold text-white">Active</p>
                </div>
              </div>

              {/* Sticky Checkbox and Buttons */}
              <div className="sticky top-24 space-y-4">
                {/* Agreement Checkbox */}
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <label className="flex items-start space-x-4 cursor-pointer group">
                    <div className="relative flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={acceptedRules}
                        onChange={(e) => setAcceptedRules(e.target.checked)}
                        className="sr-only"
                      />
                      <div 
                        className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                          acceptedRules
                            ? 'bg-orange-500 border-orange-500 shadow-lg shadow-orange-500/30'
                            : 'bg-transparent border-gray-500 group-hover:border-orange-500/50'
                        }`}
                      >
                        {acceptedRules && (
                          <FiCheckCircle className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-200 leading-relaxed text-sm">
                        I have read and understood all the instructions above. I agree to follow the assessment rules and understand that any violation may result in disqualification.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Action Buttons - In series with checkbox */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSystemCheck}
                    disabled={!acceptedRules}
                    className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl font-bold transition-all ${
                      acceptedRules
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl cursor-pointer'
                        : 'bg-gray-700/50 text-gray-400 border border-gray-600/50 cursor-not-allowed'
                    }`}
                  >
                    <span>Continue to System Check</span>
                    <FiChevronRight className={`w-5 h-5 transition-transform ${acceptedRules ? '' : 'opacity-50'}`} />
                  </button>
                  <button
                    onClick={() => router.back()}
                    className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all font-semibold text-gray-300 hover:text-white"
                  >
                    <FiX />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AssessmentStart;
