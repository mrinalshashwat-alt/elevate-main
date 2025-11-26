'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [interviewDuration, setInterviewDuration] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [questionAnimation, setQuestionAnimation] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [loaderFade, setLoaderFade] = useState(false);
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const questionTimerRef = useRef(null);
  const durationTimerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const loaderVideoRef = useRef(null);

  const GlassSelect = ({ value, onChange, options, placeholder = 'Select', className = '' }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
      const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, []);
    const selected = options.find((o) => o.value === value);
    return (
      <div ref={ref} className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/60 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20 transition-all text-gray-300 flex items-center justify-between"
        >
          <span className={`${selected ? 'text-gray-200' : 'text-gray-500'}`}>{selected ? selected.label : placeholder}</span>
          <svg className={`w-4 h-4 text-orange-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
        {open && (
          <div className="absolute z-50 mt-2 w-full rounded-xl overflow-hidden border border-orange-500/30 backdrop-blur-md" style={{ background: 'linear-gradient(180deg, rgba(33,20,14,0.9) 0%, rgba(191,54,12,0.6) 100%)', boxShadow: '0 12px 32px rgba(255,87,34,0.25)' }}>
            <div className="max-h-60 overflow-y-auto">
              {options.map((opt) => (
                <button
                  key={opt.value || 'empty'}
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${value === opt.value ? 'bg-white/10 text-white' : 'text-gray-200 hover:bg-white/10'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Comprehensive question bank with 20 preset questions
  const allQuestions = [
    {
      id: 1,
      question: 'Tell me about yourself and your professional background.',
      category: 'Introduction',
      tips: 'Keep it concise, relevant to the role, and highlight your most relevant experiences.'
    },
    {
      id: 2,
      question: 'What are your greatest professional strengths?',
      category: 'Self-Assessment',
      tips: 'Choose strengths relevant to the role and provide specific examples.'
    },
    {
      id: 3,
      question: 'Describe a challenging project you worked on. How did you overcome the obstacles?',
      category: 'Problem-Solving',
      tips: 'Use the STAR method: Situation, Task, Action, Result.'
    },
    {
      id: 4,
      question: 'Where do you see yourself in 5 years?',
      category: 'Career Goals',
      tips: 'Show ambition while demonstrating commitment to the company.'
    },
    {
      id: 5,
      question: 'How do you handle pressure and tight deadlines?',
      category: 'Work Style',
      tips: 'Describe your time management and prioritization strategies.'
    },
    {
      id: 6,
      question: 'What motivates you in your career?',
      category: 'Motivation',
      tips: 'Connect your motivation to the role and company values.'
    },
    {
      id: 7,
      question: 'How do you prioritize your work when handling multiple projects?',
      category: 'Organization',
      tips: 'Explain your decision-making process and tools you use.'
    },
    {
      id: 8,
      question: 'Describe a time when you worked successfully in a team.',
      category: 'Teamwork',
      tips: 'Highlight collaboration, communication, and shared success.'
    },
    {
      id: 9,
      question: 'What is your biggest weakness, and how are you working to improve it?',
      category: 'Self-Awareness',
      tips: 'Choose a real weakness and show growth mindset.'
    },
    {
      id: 10,
      question: 'How do you stay updated with industry trends and new technologies?',
      category: 'Learning',
      tips: 'Mention specific resources, courses, or communities.'
    },
    {
      id: 11,
      question: 'Can you tell me about a time you failed and what you learned from it?',
      category: 'Resilience',
      tips: 'Focus on the learning and growth rather than the failure itself.'
    },
    {
      id: 12,
      question: 'Why do you want to work for our company specifically?',
      category: 'Company Fit',
      tips: 'Research the company and show genuine interest in their mission.'
    },
    {
      id: 13,
      question: 'How do you handle disagreements or conflicts in the workplace?',
      category: 'Communication',
      tips: 'Show diplomacy, active listening, and problem-solving skills.'
    },
    {
      id: 14,
      question: 'Describe a situation where you had to learn something new quickly.',
      category: 'Adaptability',
      tips: 'Highlight your learning ability and how you applied new knowledge.'
    },
    {
      id: 15,
      question: 'What makes you the best candidate for this position?',
      category: 'Value Proposition',
      tips: 'Synthesize your skills, experience, and alignment with the role.'
    },
    {
      id: 16,
      question: 'How do you ensure quality in your work?',
      category: 'Quality',
      tips: 'Mention review processes, testing, or quality assurance methods.'
    },
    {
      id: 17,
      question: 'Tell me about a time you had to make a difficult decision.',
      category: 'Decision-Making',
      tips: 'Explain your thought process and the outcome.'
    },
    {
      id: 18,
      question: 'How do you balance working independently versus collaborating with others?',
      category: 'Work Style',
      tips: 'Show you can do both effectively depending on the situation.'
    },
    {
      id: 19,
      question: 'What are your salary expectations for this role?',
      category: 'Compensation',
      tips: 'Research market rates and provide a range based on your experience.'
    },
    {
      id: 20,
      question: 'Do you have any questions for us?',
      category: 'Closing',
      tips: 'Ask thoughtful questions showing genuine interest in the role.'
    }
  ];

  // Get selected questions based on number
  const selectedQuestions = allQuestions.slice(0, Math.min(parseInt(noOfQuestions) || 5, allQuestions.length));

  // Handle video loader
  useEffect(() => {
    if (loaderVideoRef.current && showLoader) {
      const video = loaderVideoRef.current;
      let fallbackTimeout;
      
      const handleVideoEnd = () => {
        if (fallbackTimeout) clearTimeout(fallbackTimeout);
        setLoaderFade(true);
        setTimeout(() => {
          setShowLoader(false);
        }, 500); // Match fade transition duration
      };

      // Attempt to play video with sound
      const playVideo = async () => {
        try {
          video.volume = 1; // Ensure volume is at maximum
          await video.play();
        } catch (error) {
          // Browser may block autoplay with sound - play muted as fallback
          console.log('Autoplay with sound blocked, attempting muted playback');
          video.muted = true;
          await video.play();
        }
      };

      video.addEventListener('ended', handleVideoEnd);
      
      // Start video playback
      playVideo();
      
      // If video fails to load or is shorter than expected, auto-hide after 8 seconds
      fallbackTimeout = setTimeout(() => {
        if (showLoader) {
          handleVideoEnd();
        }
      }, 8000);

      return () => {
        video.removeEventListener('ended', handleVideoEnd);
        if (fallbackTimeout) clearTimeout(fallbackTimeout);
      };
    }
  }, [showLoader]);

  // Typing animation for questions
  useEffect(() => {
    if (isInterviewStarted && selectedQuestions[currentQuestion]) {
      setQuestionAnimation(true);
      setIsTyping(true);
      setTypingText('');
      const question = selectedQuestions[currentQuestion].question;
      let index = 0;
      
      const typeInterval = setInterval(() => {
        if (index < question.length) {
          setTypingText(question.substring(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(typeInterval);
        }
      }, 30);

      return () => {
        clearInterval(typeInterval);
      };
    }
  }, [currentQuestion, isInterviewStarted]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window && !recognitionRef.current) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

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
          setError('Please allow microphone access to use voice recording.');
        }
        if (event.error !== 'aborted') {
          setIsRecording(false);
        }
      };

      recognitionRef.current.onend = () => {
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
    } else {
      setInterviewDuration(0);
    }
  }, [isInterviewStarted]);

  // Auto-speak question when it changes (with delay for typing animation)
  useEffect(() => {
    if (isInterviewStarted && enableVoice && currentQuestion < selectedQuestions.length && !isSpeaking && !isTyping) {
      const timeout = setTimeout(() => {
        speakQuestion(selectedQuestions[currentQuestion].question);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [currentQuestion, isInterviewStarted, isTyping]);

  const speakQuestion = (question) => {
    if (synthRef.current && enableVoice) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      synthRef.current.speak(utterance);
    }
  };

  const startRecording = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not available in your browser.');
      return;
    }
    
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
          setShowFeedback(true);
          setTimeout(() => setShowFeedback(false), 3000);
        }
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsRecording(false);
      }
    }
  };

  const saveAnswer = (answer) => {
    const answerData = {
      questionId: selectedQuestions[currentQuestion].id,
      answer: answer,
      timestamp: new Date().toISOString(),
      duration: interviewDuration
    };
    setAnswers(prev => [...prev, answerData]);
  };

  const handleStartInterview = () => {
    if (!candidateName || !companyName || !role || !level) {
      setError('Please fill in all required fields');
      return;
    }
    
    setError('');
    setInterviewMode(enableVoice ? 'voice' : 'text');
    setIsInterviewStarted(true);
    setAnswers([]);
    setCurrentQuestion(0);
    setTextAnswer('');
    setTranscript('');
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
    
    if (interviewMode === 'text' && textAnswer.trim()) {
      saveAnswer(textAnswer);
      setTextAnswer('');
    }
    
    setTimeout(() => {
      if (currentQuestion < selectedQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setTranscript('');
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 2000);
      } else {
        handleFinishInterview();
      }
    }, 300);
  };

  const handlePreviousQuestion = () => {
    if (isRecording) {
      stopRecording();
    }
    
    setTimeout(() => {
      setCurrentQuestion(Math.max(0, currentQuestion - 1));
      setTranscript('');
      setTextAnswer(answers[currentQuestion - 1]?.answer || '');
    }, 300);
  };

  const handleFinishInterview = () => {
    if (isRecording) {
      stopRecording();
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsInterviewStarted(false);
    alert(`Interview completed! You answered ${answers.length} questions in ${formatTime(interviewDuration)}.`);
    setCurrentQuestion(0);
    setAnswers([]);
    setInterviewDuration(0);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore if already stopped
        }
      }
      setTimeout(() => {
        startRecording();
      }, 200);
    }
  };

  const handleBackToAgents = () => {
    if (isInterviewStarted) {
      if (confirm('Are you sure you want to leave? Your progress will be lost.')) {
        setIsInterviewStarted(false);
        if (isRecording) stopRecording();
        if (synthRef.current) synthRef.current.cancel();
      }
    } else {
      window.history.back();
    }
  };

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCurrentQuestionData = () => {
    return selectedQuestions[currentQuestion] || null;
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-visible relative">
      {/* Video Loader */}
      {showLoader && (
        <div 
          className={`fixed inset-0 z-[100] bg-black flex items-center justify-center transition-opacity duration-500 ${
            loaderFade ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ pointerEvents: loaderFade ? 'none' : 'auto' }}
        >
          <video
            ref={loaderVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            preload="auto"
            muted
            loop
          >
            <source src="/ai.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Navigation Header */}
      <header className="bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
          <button 
            onClick={handleBackToAgents}
            className="flex items-center space-x-2 hover:text-orange-400 transition-all group px-3 py-2 rounded-lg hover:bg-white/5"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Agents</span>
          </button>
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="w-20 h-20 md:w-24 md:h-24 object-contain" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">AI Mock Interview Agent</h1>
          </div>
          <div className="w-32"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10 overflow-visible">
        {!isInterviewStarted ? (
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Enhanced Robot Section */}
            <div className="space-y-6">
              {/* Video */}
              <div className="relative w-full aspect-video max-w-2xl">
                <video
                  className="w-full h-full object-cover rounded-2xl"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src="/ai.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              {/* Content Below Video */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Ace Your Next Interview</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Practice with AI-powered mock interviews tailored to your target company and role. Get instant feedback and improve your interview skills with realistic scenarios.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                    <span className="text-sm text-orange-400 font-medium">Company-Specific</span>
                  </div>
                  <div className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                    <span className="text-sm text-orange-400 font-medium">Real-time Feedback</span>
                  </div>
                  <div className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                    <span className="text-sm text-orange-400 font-medium">Adaptive Questions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Form Section */}
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">AI Mock Interview</h2>
                    <p className="text-gray-400 mt-1">Premium interview preparation with AI</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3 animate-shake">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Candidate Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/60 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                  <GlassSelect
                    value={companyName}
                    onChange={setCompanyName}
                    placeholder="Select Company"
                    options={[{ value: '', label: 'Select Company' }, 'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix', 'Tesla'].map((v) =>
                      typeof v === 'string' ? { value: v, label: v } : v
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                  <GlassSelect
                    value={role}
                    onChange={setRole}
                    placeholder="Select Role"
                    options={['Software Engineer','Product Manager','Data Analyst','UI/UX Designer','DevOps Engineer','Data Scientist','Full Stack Developer'].map((v) => ({ value: v, label: v }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Questions</label>
                    <input
                      type="number"
                      min="3"
                      max="20"
                      value={noOfQuestions}
                      onChange={(e) => {
                        const val = Math.max(3, Math.min(20, parseInt(e.target.value) || 5));
                        setNoOfQuestions(val.toString());
                      }}
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/60 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Level</label>
                    <GlassSelect
                      value={level}
                      onChange={setLevel}
                      placeholder="Select Level"
                      options={['Beginner','Intermediate','Advanced','Expert'].map((v) => ({ value: v, label: v }))}
                    />
                  </div>
                </div>
              </div>

              {/* Enhanced Interview Type Toggle */}
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-white/5 to-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-orange-500/30 transition-all cursor-pointer group" onClick={() => setEnableVoice(!enableVoice)}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${enableVoice ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-gray-400'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold block text-white">Voice Mode</span>
                    <span className="text-xs text-gray-400">Practice with real-time voice interaction</span>
                  </div>
                </div>
                <button
                  className={`relative w-16 h-9 rounded-full transition-all duration-300 ${
                    enableVoice ? 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full transition-all duration-300 shadow-lg ${
                      enableVoice ? 'translate-x-7' : ''
                    }`}
                  ></div>
                </button>
              </div>

              <button
                onClick={handleStartInterview}
                className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-800 transition-all shadow-xl hover:shadow-2xl hover:shadow-orange-500/40 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Interview Session
              </button>
            </div>
          </div>
        ) : interviewMode === 'text' ? (
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="group relative bg-black/90 border border-[#FF5728] rounded-3xl p-8 overflow-hidden"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
                transformStyle: 'preserve-3d'
              }}
              whileHover={{ 
                y: -8,
                scale: 1.02,
                rotateX: 2,
                transition: { duration: 0.3 }
              }}
            >
            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 overflow-hidden rounded-3xl">
              <div className="absolute top-2 left-2 right-0 bottom-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
              <div className="premium-card-content relative z-20">
              {/* Enhanced Header */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-xl font-bold">{currentQuestion + 1}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400 font-medium">Question {currentQuestion + 1} of {selectedQuestions.length}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-semibold text-white">{formatTime(interviewDuration)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                      <span className="text-orange-400 font-medium">{getCurrentQuestionData()?.category}</span>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 h-3 rounded-full transition-all duration-500 shadow-lg shadow-orange-500/30"
                    style={{ width: `${((currentQuestion + 1) / selectedQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Enhanced Question */}
              <div className="mb-8">
                <div className="bg-gradient-to-br from-orange-500/10 to-blue-500/10 border border-orange-500/20 rounded-2xl p-6 mb-6">
                  <h3 className="text-2xl font-bold text-white mb-3 leading-relaxed">
                    {isTyping ? (
                      <span>
                        {typingText}
                        <span className="animate-pulse text-orange-400">|</span>
                      </span>
                    ) : (
                      selectedQuestions[currentQuestion]?.question
                    )}
                  </h3>
                  {!isTyping && getCurrentQuestionData()?.tips && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-sm text-gray-400 flex items-start gap-2">
                        <svg className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span><strong className="text-orange-400">Tip:</strong> {getCurrentQuestionData()?.tips}</span>
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    className="w-full h-64 px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/60 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20 resize-none transition-all placeholder-gray-600 text-white text-lg leading-relaxed"
                    placeholder="Type your answer here... Be detailed and specific."
                  ></textarea>
                  <div className="absolute bottom-3 right-3 flex items-center gap-4 text-xs text-gray-500">
                    <span>{getWordCount(textAnswer)} words</span>
                    <span>{textAnswer.length} characters</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Navigation */}
              <div className="pt-6 border-t border-white/10">
                <div className="flex justify-between gap-4">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestion === 0}
                    className="px-6 py-3.5 bg-white/10 border border-white/10 rounded-xl hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    className="px-10 py-3.5 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-800 transition-all shadow-xl hover:shadow-2xl hover:shadow-orange-500/40 flex items-center gap-3 transform hover:scale-105 active:scale-95 border-2 border-transparent hover:border-orange-400/50"
                  >
                    {currentQuestion < selectedQuestions.length - 1 ? (
                      <>
                        <span>Next Question</span>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>Finish Interview</span>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="flex gap-6 pb-8 min-h-[calc(100vh-120px)]">
            {/* Enhanced Left Side - AI Bot */}
            <motion.div 
              className="group relative w-1/3 bg-black/90 border border-[#FF5728] rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden h-fit sticky top-24"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
                transformStyle: 'preserve-3d'
              }}
              whileHover={{ 
                y: -8,
                scale: 1.02,
                rotateX: 2,
                transition: { duration: 0.3 }
              }}
            >
            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 overflow-hidden rounded-3xl">
              <div className="absolute top-2 left-2 right-0 bottom-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
              <div className="premium-card-content relative z-20 w-full flex flex-col items-center">
              {/* Candidate Info Display */}
              <div className="w-full mb-6 space-y-3">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Candidate</span>
                    <span className="text-sm font-bold text-white">{candidateName || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Company</span>
                    <span className="text-sm font-bold text-white">{companyName || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Role</span>
                    <span className="text-sm font-bold text-white">{role || 'Not set'}</span>
                  </div>
                </div>
              </div>

              {/* Brain Video/Image */}
              <div className="relative w-full max-w-sm mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-purple-500/20 to-blue-500/30 blur-3xl animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-orange-500/20 to-blue-500/20 rounded-3xl p-4 backdrop-blur-sm border border-white/10 overflow-hidden">
                  {isSpeaking ? (
                    <div className="flex items-center justify-center gap-2 h-48">
                      <div className="w-2 h-12 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-20 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-16 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-24 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                      <div className="w-2 h-14 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  ) : isTyping ? (
                    <div className="flex flex-col items-center justify-center h-48">
                      <div className="w-20 h-20 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-400 text-sm">AI is thinking...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48">
                      {/* Video commented out - file not available */}
                      {/* <video
                        className="w-full h-full max-w-xs max-h-48 object-contain rounded-2xl"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                      >
                        <source src="/brain.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                      </video> */}
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center mb-4">
                        <svg className="w-16 h-16 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <p className="text-gray-300 text-center font-medium mt-2">AI Interview Assistant</p>
                      <p className="text-gray-500 text-xs text-center mt-1">Ready to interview</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Recording Status */}
              {isRecording && (
                <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border-2 border-red-500/50 rounded-2xl px-6 py-3 flex items-center gap-3 animate-pulse z-10 mb-4">
                  <div className="relative">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-red-400 block">Recording</span>
                    <span className="text-xs text-red-300">Speak clearly...</span>
                  </div>
                </div>
              )}

              {/* Feedback Badge */}
              {showFeedback && (
                <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl px-4 py-2 flex items-center gap-2 z-10 mb-4 animate-bounce-in">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-green-400">Answer saved!</span>
                </div>
              )}

              {/* Enhanced Interview Info */}
              <div className="mt-auto w-full space-y-3 text-sm">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Question</span>
                    <span className="text-xl font-bold text-white">{currentQuestion + 1}<span className="text-gray-500">/{selectedQuestions.length}</span></span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mt-3">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${((currentQuestion + 1) / selectedQuestions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Duration
                    </span>
                    <span className="text-lg font-bold text-white">{formatTime(interviewDuration)}</span>
                  </div>
                </div>
              </div>
              </div>
            </motion.div>

            {/* Enhanced Right Side - Interview Questions */}
            <motion.div 
              className="group relative flex-1 bg-black/90 border border-[#FF5728] rounded-3xl p-8 flex flex-col overflow-hidden"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
                transformStyle: 'preserve-3d'
              }}
              whileHover={{ 
                y: -8,
                scale: 1.02,
                rotateX: 2,
                transition: { duration: 0.3 }
              }}
            >
            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 overflow-hidden rounded-3xl">
              <div className="absolute top-2 left-2 right-0 bottom-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
              <div className="premium-card-content relative z-20 flex flex-col flex-1">
              {/* Enhanced Header */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="font-bold">{currentQuestion + 1}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400 font-medium">Question {currentQuestion + 1} of {selectedQuestions.length}</span>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTime(interviewDuration)}
                        </div>
                        <div className="px-2.5 py-1 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                          <span className="text-xs text-orange-400 font-medium">{getCurrentQuestionData()?.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 h-2.5 rounded-full transition-all duration-500 shadow-lg shadow-orange-500/30"
                    style={{ width: `${((currentQuestion + 1) / selectedQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Enhanced Question */}
              <div className="mb-6 flex flex-col">
                <div className="bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-blue-500/10 border border-orange-500/20 rounded-2xl p-6 mb-6">
                  <h3 className="text-2xl font-bold mb-4 text-white leading-relaxed">
                    {isTyping ? (
                      <span>
                        {typingText}
                        <span className="animate-pulse text-orange-400">|</span>
                      </span>
                    ) : (
                      selectedQuestions[currentQuestion]?.question
                    )}
                  </h3>
                  {!isTyping && getCurrentQuestionData()?.tips && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-sm text-gray-400 flex items-start gap-2">
                        <svg className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span><strong className="text-orange-400">Tip:</strong> {getCurrentQuestionData()?.tips}</span>
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Enhanced Transcript/Answer Display */}
                <div className="bg-black/20 border border-white/10 rounded-2xl p-5 min-h-[200px] max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col mb-6">
                  {transcript ? (
                    <div className="relative">
                      <p className="text-gray-200 whitespace-pre-wrap text-lg leading-relaxed">{transcript}</p>
                      {isRecording && (
                        <div className="absolute bottom-2 right-2 flex items-center gap-2 text-xs text-gray-500">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span>Live transcription</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 italic">Your answer will appear here as you speak...</p>
                        <p className="text-gray-600 text-sm mt-2">Click the microphone button to start recording</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Recording Controls */}
                <div className="flex justify-center">
                  {!isSpeaking ? (
                    <button
                      onClick={toggleRecording}
                      disabled={isTyping}
                      className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all flex items-center gap-3 shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isRecording 
                          ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white' 
                          : 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <div className="relative">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                            </svg>
                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping"></div>
                          </div>
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                          Start Recording
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="px-8 py-4 bg-blue-500/20 border border-blue-500/30 rounded-2xl flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-blue-400 font-medium">AI is speaking... Please wait</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Navigation - Always accessible at bottom */}
              <div className="pt-6 mt-6 border-t border-white/10">
                {/* Warning when recording */}
                {isRecording && (
                  <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl flex items-center gap-2 animate-pulse">
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="text-sm text-yellow-400 font-medium">Please stop recording first to proceed to the next question</span>
                  </div>
                )}
                
                <div className="flex justify-between gap-4">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestion === 0 || isRecording}
                    className="px-6 py-3.5 bg-white/10 border border-white/10 rounded-xl hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    disabled={isRecording}
                    className="px-10 py-3.5 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-800 transition-all shadow-xl hover:shadow-2xl hover:shadow-orange-500/40 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-3 transform hover:scale-105 active:scale-95 disabled:hover:scale-100 border-2 border-transparent hover:border-orange-400/50"
                    title={isRecording ? "Stop recording first to continue" : ""}
                  >
                    {currentQuestion < selectedQuestions.length - 1 ? (
                      <>
                        <span>Next Question</span>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        <span>Finish Interview</span>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { 
            height: 20px;
            opacity: 0.7;
          }
          50% { 
            height: 60px;
            opacity: 1;
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default AIMockInterview;