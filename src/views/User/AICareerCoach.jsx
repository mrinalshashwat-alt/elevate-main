'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AICareerCoach = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userDetails, setUserDetails] = useState({
    name: '',
    age: '',
    currentRole: '',
    experience: '',
    education: '',
    interests: '',
    skills: '',
    goals: ''
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [showPsychometricOptions, setShowPsychometricOptions] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    const initialMessage = {
      type: 'agent',
      text: "Hello! I'm your AI Career Guide. I'm here to help you discover your ideal career path through personalized analysis. Let's start by getting to know you better. What's your name?",
      timestamp: new Date()
    };
    setChatMessages([initialMessage]);
  }, []);

  const agentQuestions = [
    { key: 'name', question: "What's your name?" },
    { key: 'age', question: "How old are you?" },
    { key: 'currentRole', question: "What's your current role or field of study?" },
    { key: 'experience', question: "How many years of professional experience do you have?" },
    { key: 'education', question: "What's your highest level of education?" },
    { key: 'interests', question: "What are your main interests and passions?" },
    { key: 'skills', question: "What are your key skills and competencies?" },
    { key: 'goals', question: "What are your career goals for the next 5 years?" }
  ];

  const handleUserResponse = (response) => {
    const currentQuestion = agentQuestions[currentStep];
    if (currentQuestion) {
      setUserDetails(prev => ({
        ...prev,
        [currentQuestion.key]: response
      }));

      const userMessage = {
        type: 'user',
        text: response,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, userMessage]);

      // Agent response
      setTimeout(() => {
        if (currentStep < agentQuestions.length - 1) {
          const nextQuestion = agentQuestions[currentStep + 1];
          const agentMessage = {
            type: 'agent',
            text: nextQuestion.question,
            timestamp: new Date()
          };
          setChatMessages(prev => [...prev, agentMessage]);
          setCurrentStep(prev => prev + 1);
        } else {
          // All questions answered, show psychometric options
          const agentMessage = {
            type: 'agent',
            text: "Thank you for sharing! Based on your responses, I recommend we run a comprehensive psychometric analysis. This will help us understand your personality, strengths, and career fit. Which analysis would you like to start with?",
            timestamp: new Date(),
            showOptions: true
          };
          setChatMessages(prev => [...prev, agentMessage]);
          setShowPsychometricOptions(true);
        }
      }, 1000);
    }
  };

  const psychometricOptions = [
    {
      id: 'career-analysis',
      title: 'Career Analysis',
      description: 'Comprehensive assessment of your career interests, values, and personality traits to identify best-fit career paths.',
      icon: '🎯'
    },
    {
      id: 'career-mapping',
      title: 'Career Mapping',
      description: 'Create a visual roadmap showing your current position and potential career progression paths.',
      icon: '🗺️'
    },
    {
      id: 'career-path-planning',
      title: 'Career Path Planning',
      description: 'Strategic planning with actionable steps to achieve your career goals and milestones.',
      icon: '📈'
    },
    {
      id: 'skill-gap-analysis',
      title: 'Skill Gap Analysis',
      description: 'Identify the skills you need to develop to reach your target roles and career objectives.',
      icon: '📊'
    },
    {
      id: 'competency-mapping',
      title: 'Competency Mapping (Job Role Wise)',
      description: 'Detailed analysis of required competencies for specific job roles and how you measure against them.',
      icon: '💼'
    }
  ];

  const handleAnalysisSelection = (analysisId) => {
    setSelectedAnalysis(analysisId);
    setIsAnalyzing(true);
    
    const analysis = psychometricOptions.find(a => a.id === analysisId);
    const agentMessage = {
      type: 'agent',
      text: `Excellent choice! I'm now running your ${analysis.title}. This comprehensive analysis will evaluate your profile against industry standards and provide personalized recommendations. Please wait while I process this...`,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, agentMessage]);

    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      const resultsMessage = {
        type: 'agent',
        text: `Analysis complete! Based on your profile, I've generated personalized insights and recommendations. Here's what I found:\n\n• Your profile shows strong alignment with ${analysis.title.toLowerCase()} requirements\n• I've identified key strengths and areas for development\n• Personalized action plan has been created\n\nWould you like to explore another analysis or review your detailed report?`,
        timestamp: new Date(),
        showResults: true
      };
      setChatMessages(prev => [...prev, resultsMessage]);
    }, 3000);
  };

  const handleStartOver = () => {
    setCurrentStep(0);
    setUserDetails({
      name: '',
      age: '',
      currentRole: '',
      experience: '',
      education: '',
      interests: '',
      skills: '',
      goals: ''
    });
    setChatMessages([]);
    setShowPsychometricOptions(false);
    setSelectedAnalysis(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className="bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
          <button 
            onClick={() => window.history.back()} 
            className="flex items-center space-x-2 hover:text-orange-400 transition-all group px-3 py-2 rounded-lg hover:bg-white/5"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Agents</span>
          </button>
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="w-20 h-20 md:w-24 md:h-24 object-contain" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">AI Career Guide</h1>
          </div>
          <div className="w-32"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8 min-h-[calc(100vh-200px)]">
          {/* Left Side - Agent Avatar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <motion.div 
                className="bg-black/90 border border-[#FF5728] rounded-3xl p-8 flex flex-col items-center"
                style={{
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative w-64 h-64 mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-purple-500/20 to-blue-500/30 blur-3xl animate-pulse"></div>
                  <div className="relative w-full h-full bg-gradient-to-br from-orange-500/20 to-blue-500/20 rounded-3xl p-6 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <video
                      className="w-full h-full object-contain rounded-2xl"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                    >
                      <source src="/brain.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AI Career Guide</h3>
                <p className="text-gray-400 text-sm text-center mb-4">
                  Your personal career intelligence assistant
                </p>
                <div className="w-full space-y-2">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">Progress</span>
                      <span className="text-sm font-bold text-orange-400">
                        {Math.round((currentStep / agentQuestions.length) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(currentStep / agentQuestions.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Side - Chat Interface */}
          <div className="lg:col-span-2">
            <motion.div 
              className="bg-black/90 border border-[#FF5728] rounded-3xl p-6 flex flex-col h-[calc(100vh-250px)]"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset'
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                <AnimatePresence>
                  {chatMessages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl p-4 ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' 
                          : 'bg-white/5 border border-white/10 text-gray-200'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                        
                        {message.showOptions && (
                          <div className="mt-4 space-y-2">
                            {psychometricOptions.map((option) => (
                              <button
                                key={option.id}
                                onClick={() => handleAnalysisSelection(option.id)}
                                className="w-full text-left p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-orange-500/50 transition-all"
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-2xl">{option.icon}</span>
                                  <div className="flex-1">
                                    <h4 className="font-bold text-white text-sm mb-1">{option.title}</h4>
                                    <p className="text-xs text-gray-400">{option.description}</p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-gray-400"
                  >
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-sm">Analyzing your profile...</span>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              {!showPsychometricOptions && currentStep < agentQuestions.length && (
                <div className="border-t border-white/10 pt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={`Type your answer...`}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/60 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder-gray-600 text-white"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          handleUserResponse(e.target.value.trim());
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.target.previousElementSibling;
                        if (input.value.trim()) {
                          handleUserResponse(input.value.trim());
                          input.value = '';
                        }
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-orange-500/40"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}

              {showPsychometricOptions && !isAnalyzing && (
                <div className="border-t border-white/10 pt-4">
                  <button
                    onClick={handleStartOver}
                    className="w-full px-6 py-3 bg-white/10 border border-white/20 rounded-xl font-medium hover:bg-white/20 transition-all"
                  >
                    Start New Session
                  </button>
                </div>
              )}
            </motion.div>

            {/* Platform Description */}
            <motion.div 
              className="mt-6 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                How It Works
              </h3>
              <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
                <p>
                  <strong className="text-orange-400">1. Interactive Assessment:</strong> Our AI agent will ask you basic questions about your background, skills, interests, and goals.
                </p>
                <p>
                  <strong className="text-orange-400">2. Psychometric Analysis:</strong> Choose from comprehensive analyses including career mapping, skill gap analysis, and competency mapping.
                </p>
                <p>
                  <strong className="text-orange-400">3. Personalized Insights:</strong> Receive detailed recommendations, career paths, and actionable steps tailored to your profile.
                </p>
                <p>
                  <strong className="text-orange-400">4. Career Planning:</strong> Get strategic guidance on skill development, career transitions, and achieving your professional goals.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(249, 115, 22, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(249, 115, 22, 0.7);
        }
      `}</style>
    </div>
  );
};

export default AICareerCoach;
