'use client';

import React, { useState, useEffect, useRef } from 'react';

const AIMockInterview: React.FC = () => {
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [interviewMode, setInterviewMode] = useState<'text' | 'voice'>('text');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [candidateName, setCandidateName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [noOfQuestions, setNoOfQuestions] = useState('5');
  const [level, setLevel] = useState('');
  const [enableVoice, setEnableVoice] = useState(true);
  
  // Vapi state
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [callStatus, setCallStatus] = useState('');
  const [transcript, setTranscript] = useState<Array<{role: string; text: string; timestamp: string}>>([]);
  const [interviewDuration, setInterviewDuration] = useState(0);
  const [vapiReady, setVapiReady] = useState(false);
  
  const vapiRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const VAPI_PUBLIC_KEY = 'adb5bbe4-54e9-4abc-b34c-f9d2f3540d1b';
  const ASSISTANT_ID = 'e88e2dd0-e87a-4519-9cb5-abe7b5c4d9d7';

  const questions = [
    'Tell me about yourself and your background.',
    'What are your greatest strengths?',
    'Describe a challenging project you worked on.',
    'Where do you see yourself in 5 years?',
    'How do you handle pressure and deadlines?',
  ];

  // Initialize Vapi
  useEffect(() => {
    const existingScript = document.querySelector('script[src*="vapi-ai"]');
    if (existingScript || vapiRef.current) return;

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/dist/index.js';
    script.async = true;
    script.onload = () => {
      try {
        vapiRef.current = new (window as any).Vapi(VAPI_PUBLIC_KEY);
        setupVapiListeners();
        console.log('Vapi SDK loaded successfully');
      } catch (err) {
        console.error('Failed to initialize Vapi:', err);
        setError('Failed to initialize voice system');
      }
    };
    script.onerror = () => {
      setError('Failed to load Vapi SDK. Please check your internet connection.');
    };
    document.body.appendChild(script);

    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer for interview duration
  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => {
        setInterviewDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isCallActive]);

  const setupVapiListeners = () => {
    if (!vapiRef.current) return;

    vapiRef.current.on('call-start', () => {
      setIsCallActive(true);
      setCallStatus('Interview started');
      setError('');
      setInterviewDuration(0);
    });

    vapiRef.current.on('call-end', () => {
      setIsCallActive(false);
      setCallStatus('Interview ended');
    });

    vapiRef.current.on('speech-start', () => {
      setCallStatus('AI Interviewer is speaking...');
    });

    vapiRef.current.on('speech-end', () => {
      setCallStatus('Your turn to speak...');
    });

    vapiRef.current.on('message', (message: any) => {
      if (message.type === 'transcript') {
        setTranscript(prev => [...prev, {
          role: message.role,
          text: message.transcript,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    });

    vapiRef.current.on('error', (error: any) => {
      setError(`Error: ${error.message}`);
      setIsLoading(false);
      setIsCallActive(false);
    });
  };

  const startVoiceInterview = async () => {
    if (!vapiRef.current) {
      setError('Voice system is still loading. Please wait a moment and try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await vapiRef.current.start({
        assistantId: ASSISTANT_ID,
      });
    } catch (err: any) {
      console.error('Vapi start error:', err);
      setError(`Failed to start interview: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const endVoiceInterview = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
  };

  const toggleMute = () => {
    if (vapiRef.current) {
      vapiRef.current.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const handleStartInterview = () => {
    if (!candidateName || !companyName || !role || !level) {
      setError('Please fill in all fields');
      return;
    }
    
    if (enableVoice && !vapiRef.current) {
      setError('Voice system is still loading. Please wait a moment and try again.');
      return;
    }
    
    setError('');
    setInterviewMode(enableVoice ? 'voice' : 'text');
    setIsInterviewStarted(true);
    
    if (enableVoice) {
      setTimeout(() => startVoiceInterview(), 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackToAgents = () => {
    if (isCallActive) {
      endVoiceInterview();
    }
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white overflow-hidden">
      {/* Navigation Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={handleBackToAgents}
            className="flex items-center space-x-2 hover:text-orange-500 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Agents</span>
          </button>
          <h1 className="text-2xl font-bold">AI Mock Interview Agent</h1>
          <div className="w-32"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!isInterviewStarted ? (
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Robot Section */}
            <div className="flex items-center justify-center">
              <div className="relative w-full aspect-video max-w-md">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-blue-500/20 blur-3xl"></div>
                <div className="relative w-full h-full overflow-hidden group transition-all">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                  >
                    <source src="/robo.webm" type="video/webm" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-blue-500/5 group-hover:from-orange-500/10 group-hover:to-blue-500/10 transition-all pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-4xl font-bold">AI Mock Interview Agent</h2>
                </div>
                <p className="text-gray-400 text-lg">Train smarter for your dream role with real-time AI feedback.</p>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Candidate Name"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all placeholder-gray-600"
                />

                <select
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all text-gray-400 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23999'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 14l-7 7m0 0l-7-7m7 7V3'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.25rem',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="">Select Company</option>
                  <option value="Google">Google</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Apple">Apple</option>
                  <option value="Meta">Meta</option>
                </select>

                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all text-gray-400 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23999'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 14l-7 7m0 0l-7-7m7 7V3'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.25rem',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="">Select Role</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                </select>

                <div className="space-y-1">
                  <label className="text-sm text-gray-400">No. of Questions</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={noOfQuestions}
                    onChange={(e) => setNoOfQuestions(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all placeholder-gray-600"
                  />
                </div>

                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all text-gray-400 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23999'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 14l-7 7m0 0l-7-7m7 7V3'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.25rem',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="">Select Level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              {/* Enable Voice Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all cursor-pointer" onClick={() => setEnableVoice(!enableVoice)}>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <div>
                    <span className="font-medium block">Enable Real-Time Voice</span>
                    {enableVoice && !vapiReady && (
                      <span className="text-xs text-yellow-400 flex items-center gap-1 mt-1">
                        <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Loading voice system...
                      </span>
                    )}
                    {enableVoice && vapiReady && (
                      <span className="text-xs text-green-400 flex items-center gap-1 mt-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Voice system ready
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    enableVoice ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all ${
                      enableVoice ? 'translate-x-6' : ''
                    }`}
                  ></div>
                </button>
              </div>

              <button
                onClick={handleStartInterview}
                disabled={enableVoice && !vapiReady}
                className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-orange-500/30 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enableVoice && !vapiReady ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Loading Voice System...
                  </span>
                ) : (
                  'Start Interview'
                )}
              </button>
            </div>
          </div>
        ) : interviewMode === 'text' ? (
          <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-400 font-medium">Question {currentQuestion + 1} of {questions.length}</span>
                <span className="text-sm text-gray-400 font-medium">Time: 2:30</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-6 text-white">{questions[currentQuestion]}</h3>
              <textarea
                className="w-full h-48 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 focus:bg-white/10 resize-none transition-all placeholder-gray-600"
                placeholder="Type your answer here..."
              ></textarea>
            </div>

            <div className="flex justify-between gap-4">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="px-6 py-3 bg-white/10 border border-white/10 rounded-xl hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  if (currentQuestion < questions.length - 1) {
                    setCurrentQuestion(currentQuestion + 1);
                  } else {
                    alert('Interview completed! Check your feedback.');
                    setIsInterviewStarted(false);
                  }
                }}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                {currentQuestion < questions.length - 1 ? 'Next' : 'Finish'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Interview Info Bar */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Candidate</p>
                  <p className="font-semibold text-orange-400">{candidateName}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Company</p>
                  <p className="font-semibold">{companyName}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Role</p>
                  <p className="font-semibold">{role}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Level</p>
                  <p className="font-semibold">{level}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-1">Duration</p>
                  <p className="font-semibold text-green-400">{formatTime(interviewDuration)}</p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Interview Area */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                  {/* Video/Call Display Area - Increased Height */}
                  <div className="bg-gradient-to-br from-orange-500/20 to-blue-500/20 border border-white/10 rounded-xl mb-6 flex items-center justify-center relative overflow-hidden" style={{ minHeight: '500px' }}>
                    {isCallActive ? (
                      <div className="text-center space-y-6 p-8">
                        {/* Animated Pulse Effect */}
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-40 h-40 bg-orange-500/20 rounded-full animate-ping"></div>
                          </div>
                          <div className="relative w-32 h-32 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-orange-500/50">
                            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <p className="text-3xl font-bold">Interview in Progress</p>
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="text-sm font-medium">{callStatus}</p>
                          </div>
                        </div>

                        {/* Audio Visualizer Effect */}
                        <div className="flex items-center justify-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1 bg-gradient-to-t from-orange-500 to-orange-300 rounded-full"
                              style={{
                                height: '40px',
                                animation: `pulse 1s ease-in-out ${i * 0.1}s infinite alternate`
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-6 p-8">
                        <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto border-4 border-white/20">
                          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="space-y-2">
                          <p className="text-2xl font-bold">Ready to Start</p>
                          <p className="text-gray-400">Click "Start Voice Interview" to begin</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Controls */}
                  <div className="flex flex-wrap justify-center gap-4">
                    {!isCallActive ? (
                      <button
                        onClick={startVoiceInterview}
                        disabled={isLoading}
                        className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/30 text-lg"
                      >
                        {isLoading ? (
                          <>
                            <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Connecting...
                          </>
                        ) : (
                          <>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Start Voice Interview
                          </>
                        )}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={toggleMute}
                          className={`flex items-center gap-3 px-8 py-4 rounded-xl transition-all font-semibold ${
                            isMuted 
                              ? 'bg-yellow-500/20 border-2 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30' 
                              : 'bg-white/10 border-2 border-white/20 hover:bg-white/20'
                          }`}
                        >
                          {isMuted ? (
                            <>
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                              </svg>
                              Unmute
                            </>
                          ) : (
                            <>
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                              </svg>
                              Mute
                            </>
                          )}
                        </button>
                        <button
                          onClick={endVoiceInterview}
                          className="flex items-center gap-3 px-8 py-4 bg-red-500/20 border-2 border-red-500/50 text-red-400 rounded-xl hover:bg-red-500/30 transition-all font-semibold"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          End Interview
                        </button>
                      </>
                    )}
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-all">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{transcript.filter(t => t.role === 'assistant').length}</p>
                    <p className="text-xs text-gray-400 mt-1">AI Questions</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-all">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-orange-400">{transcript.filter(t => t.role === 'user').length}</p>
                    <p className="text-xs text-gray-400 mt-1">Your Responses</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-all">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-2xl font-bold text-green-400">{isCallActive ? 'Active' : 'Idle'}</p>
                    <p className="text-xs text-gray-400 mt-1">Status</p>
                  </div>
                </div>
              </div>

              {/* Enhanced Transcript Panel */}
              <div className="lg:col-span-1">
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 sticky top-24" style={{ maxHeight: 'calc(100vh - 120px)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Live Transcript
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-400">Recording</span>
                    </div>
                  </div>
                  
                  <div className="overflow-y-auto space-y-3 pr-2 custom-scrollbar" style={{ height: 'calc(100vh - 280px)' }}>
                    {transcript.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-sm">
                          Transcript will appear here during the interview
                        </p>
                      </div>
                    ) : (
                      transcript.map((entry, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg text-sm transition-all hover:scale-[1.02] ${
                            entry.role === 'assistant'
                              ? 'bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20'
                              : 'bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                entry.role === 'assistant' ? 'bg-blue-500/20' : 'bg-orange-500/20'
                              }`}>
                                {entry.role === 'assistant' ? (
                                  <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                )}
                              </div>
                              <span className={`font-semibold text-xs ${
                                entry.role === 'assistant' ? 'text-blue-400' : 'text-orange-400'
                              }`}>
                                {entry.role === 'assistant' ? 'AI Interviewer' : 'You'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">{entry.timestamp}</span>
                          </div>
                          <p className="text-gray-200 leading-relaxed">{entry.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { height: 20px; }
          50% { height: 50px; }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default AIMockInterview;