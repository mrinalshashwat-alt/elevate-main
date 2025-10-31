'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiClock, FiSave, FiChevronLeft, FiChevronRight, FiSend, FiShield, FiCheckCircle } from 'react-icons/fi';

const Assessment = () => {
  const router = useRouter();
  const videoRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(34 * 60 + 18); // 34:18 in seconds
  const [currentQuestion, setCurrentQuestion] = useState(5);
  const [totalQuestions] = useState(20);
  const [attempted] = useState(8);
  const [selectedAnswer, setSelectedAnswer] = useState('merge-sort');
  const [questions, setQuestions] = useState([
    { id: 1, attempted: true },
    { id: 2, attempted: true },
    { id: 3, attempted: true },
    { id: 4, attempted: true },
    { id: 5, attempted: true, current: true },
    ...Array.from({ length: 15 }, (_, i) => ({ id: i + 6, attempted: false })),
  ]);
  const [currentSection, setCurrentSection] = useState('mcq');
  const [stream, setStream] = useState(null);

  useEffect(() => {
    // Start camera for proctoring
    startProctoring();
    // Start timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitSection();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startProctoring = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (error) {
      console.error('Proctoring camera error:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleClearResponse = () => {
    setSelectedAnswer('');
  };

  const handleSubmitSection = () => {
    router.push('/user/dashboard');
  };

  const handleSaveAndExit = () => {
    router.push('/user/dashboard');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex justify-between items-center bg-black">
        <div className="flex items-center space-x-3">
          <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold">AI Assessment</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">Assessment In Progress</span>
          <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800 rounded-lg">
            <FiClock className="text-orange-500" />
            <span className="text-orange-500 font-semibold">{formatTime(timeLeft)}</span>
          </div>
          <button
            onClick={handleSaveAndExit}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span>Save & Exit</span>
            <FiSave className="text-orange-500" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Proctoring and Navigation */}
        <div className="w-80 bg-black border-r border-gray-800 p-6 overflow-y-auto">
          {/* Proctoring Active */}
          <motion.div 
            className="group relative bg-black/90 border border-[#FF5728] rounded-3xl p-6 mb-6 overflow-hidden"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
              transformStyle: 'preserve-3d'
            }}
            whileHover={{ y: -8, scale: 1.02, rotateX: 2 }}
            transition={{ duration: 0.3 }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
            <div className="premium-card-content relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Proctoring Active</h3>
              <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-semibold">
                Good
              </span>
            </div>
            
            {/* Video Feed */}
            <div className="rounded-xl overflow-hidden mb-4" style={{ aspectRatio: '4/3' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>

            {/* Assessment Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Total: {totalQuestions}</span>
                <span className="text-gray-400">Attempted: {attempted}</span>
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all"
                  style={{ width: `${(attempted / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span className="text-gray-400">Pending</span>
            </div>
            </div>
          </motion.div>

          {/* Question Map */}
          <motion.div 
            className="group relative bg-black/90 border border-[#FF5728] rounded-3xl p-6 mb-6 overflow-hidden"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
              transformStyle: 'preserve-3d'
            }}
            whileHover={{ y: -8, scale: 1.02, rotateX: 2 }}
            transition={{ duration: 0.3 }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
            <div className="premium-card-content relative z-10">
            <h3 className="font-semibold mb-4">Question Map</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(q.id)}
                  className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                    q.current
                      ? 'bg-orange-500 text-white'
                      : q.attempted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {q.id}
                </button>
              ))}
            </div>
            </div>
          </motion.div>

          {/* System Check */}
          <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-500 font-semibold">
            <FiCheckCircle />
            <span>System Check: All Good</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-black">
          {/* Section Tabs */}
          <div className="flex items-center space-x-2 px-6 py-4 border-b border-gray-800">
            <button
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentSection === 'mcq'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              onClick={() => setCurrentSection('mcq')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>MCQ Section</span>
            </button>
            <button
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentSection === 'coding'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              onClick={() => setCurrentSection('coding')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span>&lt;/&gt; Coding Section</span>
            </button>
            <button
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentSection === 'video'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              onClick={() => setCurrentSection('video')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Video Section</span>
            </button>
          </div>

          {/* Question Content */}
          <div className="flex-1 px-6 py-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-sm text-gray-400">MCQ — Question {currentQuestion} of {totalQuestions}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <FiShield />
                  <span>Proctoring enabled</span>
                </div>
              </div>

              <motion.div 
                className="group relative bg-black/90 border border-[#FF5728] rounded-3xl p-6 mb-6 overflow-hidden"
                style={{
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
                  transformStyle: 'preserve-3d'
                }}
                whileHover={{ y: -8, scale: 1.02, rotateX: 2 }}
                transition={{ duration: 0.3 }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
                <div className="premium-card-content relative z-10">
                <h2 className="text-xl font-semibold mb-6">
                  Which sorting algorithm has the best average time complexity for large, randomly distributed datasets?
                </h2>

                <div className="space-y-4">
                  {[
                    { id: 'bubble-sort', label: 'Bubble Sort' },
                    { id: 'merge-sort', label: 'Merge Sort' },
                    { id: 'insertion-sort', label: 'Insertion Sort' },
                    { id: 'selection-sort', label: 'Selection Sort' },
                  ].map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center space-x-3 p-4 rounded-lg cursor-pointer transition-colors ${
                        selectedAnswer === option.id
                          ? 'bg-orange-500/20 border border-orange-500/50'
                          : 'bg-gray-700/50 border border-gray-700 hover:bg-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={option.id}
                        checked={selectedAnswer === option.id}
                        onChange={() => setSelectedAnswer(option.id)}
                        className="w-5 h-5 text-orange-500 focus:ring-orange-500 focus:ring-2"
                      />
                      <span className="text-lg">{option.label}</span>
                    </label>
                  ))}
                </div>
                </div>
              </motion.div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 1}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <FiChevronLeft />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleClearResponse}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Clear Response
                </button>

                <div className="flex items-center space-x-2">
                  {currentQuestion < totalQuestions ? (
                    <button
                      onClick={handleNext}
                      className="flex items-center space-x-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <span>Next</span>
                      <FiChevronRight />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitSection}
                      className="flex items-center space-x-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors font-semibold"
                    >
                      <span>Submit Section</span>
                      <FiSend />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessment;

