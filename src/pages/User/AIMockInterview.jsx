'use client';

import React, { useState, useEffect, useRef } from 'react';

const AIMockInterview = () => {
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [interviewMode, setInterviewMode] = useState('text');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [candidateName, setCandidateName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [noOfQuestions, setNoOfQuestions] = useState('5');
  const [level, setLevel] = useState('');
  const [enableVoice, setEnableVoice] = useState(true);
  
  // Interview state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [interviewDuration, setInterviewDuration] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Refs
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const questionTimerRef = useRef(null);
  const durationTimerRef = useRef(null);

  // Question bank
  const allQuestions = [
    'Tell me about yourself and your background.',
    'What are your greatest strengths?',
    'Describe a challenging project you worked on.',
    'Where do you see yourself in 5 years?',
    'How do you handle pressure and deadlines?',
    'What motivates you in your career?',
    'How do you prioritize your work?',
    'Describe a time when you worked in a team.',
    'What is your biggest weakness?',
    'How do you stay updated with industry trends?'
  ];

  // Get selected questions based on number
  const selectedQuestions = allQuestions.slice(0, parseInt(noOfQuestions));

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window && !recognitionRef.current) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('Please allow microphone access to use voice recording.');
        }
        if (event.error !== 'aborted') {
          setIsRecording(false);
        }
      };

      recognitionRef.current.onend = () => {
        // Reset recording state when recognition ends
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Timer for interview duration
  useEffect(() => {
    if (isInterviewStarted) {
      durationTimerRef.current = setInterval(() => {
        setInterviewDuration(prev => prev + 1);
      }, 1000);
      return () => {
        if (durationTimerRef.current) {
          clearInterval(durationTimerRef.current);
        }
      };
    }
  }, [isInterviewStarted]);

  // Auto-speak question when it changes
  useEffect(() => {
    if (isInterviewStarted && enableVoice && currentQuestion < selectedQuestions.length && !isSpeaking) {
      const timeout = setTimeout(() => {
        speakQuestion(selectedQuestions[currentQuestion]);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [currentQuestion, isInterviewStarted]);

  const speakQuestion = (question) => {
    if (synthRef.current && enableVoice) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.onend = () => {
        setIsSpeaking(false);
        // Don't auto-start recording, let user control it
      };
      synthRef.current.speak(utterance);
    }
  };

  const startRecording = () => {
    if (!recognitionRef.current) return;
    
    if (!isRecording) {
      try {
        setTranscript('');
        setIsRecording(true);
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        if (error.name !== 'InvalidStateError') {
          setIsRecording(false);
        }
      }
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;
    
    if (isRecording) {
      try {
        setIsRecording(false);
        recognitionRef.current.stop();
        if (transcript.trim()) {
          saveAnswer(transcript);
        }
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsRecording(false);
      }
    }
  };

  const saveAnswer = (answer) => {
    setAnswers(prev => [...prev, answer]);
  };

  const handleStartInterview = () => {
    if (!candidateName || !companyName || !role || !level) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setInterviewMode(enableVoice ? 'voice' : 'text');
    setIsInterviewStarted(true);
    setAnswers([]);
    setCurrentQuestion(0);
    
    if (enableVoice) {
      setTimeout(() => speakQuestion(selectedQuestions[0]), 500);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextQuestion = () => {
    if (isRecording) {
      stopRecording();
    }
    
    // Wait a bit for recording to fully stop
    setTimeout(() => {
      if (currentQuestion < selectedQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setTranscript('');
      } else {
        handleFinishInterview();
      }
    }, 100);
  };

  const handlePreviousQuestion = () => {
    if (isRecording) {
      stopRecording();
    }
    
    // Wait a bit for recording to fully stop
    setTimeout(() => {
      setCurrentQuestion(Math.max(0, currentQuestion - 1));
      setTranscript('');
    }, 100);
  };

  const handleFinishInterview = () => {
    setIsInterviewStarted(false);
    if (isRecording) {
      stopRecording();
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    alert('Interview completed! Check your feedback.');
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      // Ensure recognition is stopped before starting
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore if already stopped
        }
      }
      // Small delay to ensure clean state
      setTimeout(() => {
        startRecording();
      }, 200);
    }
  };

  const handleBackToAgents = () => {
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

              {/* Interview Type Toggle */}
              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all cursor-pointer" onClick={() => setEnableVoice(!enableVoice)}>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <div>
                    <span className="font-medium block">Voice Mode</span>
                    <span className="text-xs text-gray-400">Practice with voice interaction</span>
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
                className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-orange-500/30 text-lg"
              >
                Start Interview
              </button>
            </div>
          </div>
        ) : interviewMode === 'text' ? (
          <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-400 font-medium">Question {currentQuestion + 1} of {selectedQuestions.length}</span>
                <span className="text-sm text-gray-400 font-medium">Time: {formatTime(interviewDuration)}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all"
                  style={{ width: `${((currentQuestion + 1) / selectedQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-6 text-white">{selectedQuestions[currentQuestion]}</h3>
              <textarea
                className="w-full h-48 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 focus:bg-white/10 resize-none transition-all placeholder-gray-600"
                placeholder="Type your answer here..."
              ></textarea>
            </div>

            <div className="flex justify-between gap-4">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
                className="px-6 py-3 bg-white/10 border border-white/10 rounded-xl hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Previous
              </button>
              <button
                onClick={handleNextQuestion}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                {currentQuestion < selectedQuestions.length - 1 ? 'Next' : 'Finish'}
              </button>
            </div>
          </div>
        ) : (
          <div className="h-[calc(100vh-120px)] flex gap-4">
            {/* Left Side - AI Bot/Placeholder */}
            <div className="w-1/3 bg-gradient-to-br from-gray-900 to-gray-950 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-sm mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-blue-500/20 blur-3xl animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-orange-500/10 to-blue-500/10 rounded-2xl p-8 backdrop-blur-sm">
                  {isSpeaking ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3 h-12 bg-orange-500 rounded animate-pulse"></div>
                      <div className="w-3 h-16 bg-orange-500 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-3 h-20 bg-orange-500 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-3 h-14 bg-orange-500 rounded animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                      <div className="w-3 h-10 bg-orange-500 rounded animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-center">AI Interview Assistant</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recording Status */}
              {isRecording && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl px-4 py-2 flex items-center gap-2 animate-pulse">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-red-400">Recording...</span>
                </div>
              )}

              {/* Interview Info */}
              <div className="mt-auto w-full space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Question:</span>
                  <span className="text-white">{currentQuestion + 1}/{selectedQuestions.length}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Duration:</span>
                  <span className="text-white">{formatTime(interviewDuration)}</span>
                </div>
              </div>
            </div>

            {/* Right Side - Interview Questions */}
            <div className="flex-1 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 flex flex-col">
              {/* Header */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-400 font-medium">Question {currentQuestion + 1} of {selectedQuestions.length}</span>
                  <span className="text-sm text-gray-400 font-medium">Time: {formatTime(interviewDuration)}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all"
                    style={{ width: `${((currentQuestion + 1) / selectedQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question */}
              <div className="mb-6 flex-1">
                <h3 className="text-2xl font-bold mb-4 text-white">{selectedQuestions[currentQuestion]}</h3>
                
                {/* Transcript/Answer Display */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-h-[300px] max-h-[400px] overflow-y-auto custom-scrollbar">
                  {transcript ? (
                    <p className="text-gray-300 whitespace-pre-wrap">{transcript}</p>
                  ) : (
                    <p className="text-gray-500 italic">Your answer will appear here as you speak...</p>
                  )}
                </div>

                {/* Recording Button */}
                {!isSpeaking && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={toggleRecording}
                      className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                        isRecording 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isRecording ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        )}
                      </svg>
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between gap-4 mt-auto pt-4 border-t border-white/10">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                  className="px-6 py-3 bg-white/10 border border-white/10 rounded-xl hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextQuestion}
                  disabled={isRecording}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentQuestion < selectedQuestions.length - 1 ? 'Next Question' : 'Finish Interview'}
                </button>
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
