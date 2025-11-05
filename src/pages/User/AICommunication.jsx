'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const AICommunication = () => {
  const router = useRouter();
  const [coachingMode, setCoachingMode] = useState(''); // '', 'presentation', 'negotiation', 'public-speaking', 'interview', 'meeting'
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [sessionType, setSessionType] = useState('text'); // 'text', 'voice'
  const [currentScenario, setCurrentScenario] = useState(0);
  const [userName, setUserName] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [sessionDuration, setSessionDuration] = useState('15');
  const [enableVoice, setEnableVoice] = useState(true);
  
  // Session state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionTime, setSessionTime] = useState(0);
  const [responses, setResponses] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [loaderFade, setLoaderFade] = useState(false);
  
  // Refs
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const durationTimerRef = useRef(null);
  const loaderVideoRef = useRef(null);

  // Custom glass popover select (dark orange glass menu)
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

  const coachingScenarios = {
    'presentation': [
      {
        title: 'Product Launch Presentation',
        description: 'Present a new product to stakeholders',
        prompt: 'You need to present our new AI-powered analytics tool to the board of directors. The presentation should be 10 minutes long and cover the key features, market opportunity, and expected ROI.',
        tips: ['Start with a compelling hook', 'Use data to support your points', 'Address potential concerns proactively', 'End with a clear call to action']
      },
      {
        title: 'Quarterly Results Review',
        description: 'Present quarterly performance to your team',
        prompt: 'Present the Q3 results to your team. Revenue is up 15% but customer acquisition cost has increased. You need to maintain team morale while being transparent about challenges.',
        tips: ['Balance positive and negative news', 'Focus on solutions, not just problems', 'Use visual aids effectively', 'Encourage team input']
      }
    ],
    'negotiation': [
      {
        title: 'Salary Negotiation',
        description: 'Negotiate your salary with HR',
        prompt: 'You\'ve been offered a position with a salary of $85,000. Based on your research, similar roles pay $95,000-$105,000. You have strong experience and additional certifications.',
        tips: ['Research market rates thoroughly', 'Highlight your unique value', 'Be prepared to compromise', 'Consider non-salary benefits']
      },
      {
        title: 'Client Contract Negotiation',
        description: 'Negotiate terms with a potential client',
        prompt: 'A client wants to reduce your project fee by 20% but extend the timeline. You need to maintain profitability while keeping the client relationship strong.',
        tips: ['Understand their constraints', 'Find creative solutions', 'Maintain professional relationships', 'Document everything clearly']
      }
    ],
    'public-speaking': [
      {
        title: 'Conference Keynote',
        description: 'Deliver a keynote at a tech conference',
        prompt: 'You\'re speaking at TechConf 2024 about "The Future of AI in Business." The audience includes 500+ tech professionals, investors, and media.',
        tips: ['Know your audience', 'Use storytelling techniques', 'Practice your timing', 'Prepare for Q&A']
      },
      {
        title: 'Wedding Toast',
        description: 'Give a heartfelt wedding toast',
        prompt: 'You\'re the best man/maid of honor and need to give a 3-5 minute toast. The couple has been together for 8 years and you\'ve known them both since college.',
        tips: ['Keep it personal but appropriate', 'Practice your timing', 'Have a backup plan', 'End on a positive note']
      }
    ],
    'interview': [
      {
        title: 'Behavioral Interview',
        description: 'Answer behavioral questions confidently',
        prompt: 'The interviewer asks: "Tell me about a time when you had to work with a difficult team member. How did you handle the situation?"',
        tips: ['Use the STAR method', 'Be specific with examples', 'Show growth and learning', 'Stay positive about the experience']
      },
      {
        title: 'Technical Interview',
        description: 'Explain complex concepts clearly',
        prompt: 'Explain how machine learning algorithms work to a non-technical audience. You have 5 minutes to make it understandable and engaging.',
        tips: ['Use analogies and metaphors', 'Start with the big picture', 'Use visual aids if possible', 'Check for understanding']
      }
    ],
    'meeting': [
      {
        title: 'Team Standup',
        description: 'Lead an effective team standup',
        prompt: 'You\'re leading the daily standup for your development team. Two team members are behind on their tasks, and there\'s a critical bug that needs immediate attention.',
        tips: ['Keep it focused and brief', 'Address blockers quickly', 'Encourage team participation', 'Follow up on action items']
      },
      {
        title: 'Client Meeting',
        description: 'Conduct a productive client meeting',
        prompt: 'You\'re meeting with a client to discuss project delays. The project is 2 weeks behind schedule due to scope changes they requested, but they\'re not happy about the timeline.',
        tips: ['Prepare data and documentation', 'Listen actively to concerns', 'Propose solutions, not just problems', 'Set clear expectations']
      }
    ]
  };

  const skillLevels = {
    'presentation': ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    'negotiation': ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    'public-speaking': ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    'interview': ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    'meeting': ['Beginner', 'Intermediate', 'Advanced', 'Expert']
  };

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
        }, 500);
      };

      const playVideo = async () => {
        try {
          video.volume = 1;
          await video.play();
        } catch (error) {
          console.log('Autoplay with sound blocked, attempting muted playback');
          video.muted = true;
          await video.play();
        }
      };

      video.addEventListener('ended', handleVideoEnd);
      
      playVideo();
      
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

  // Timer for session duration
  useEffect(() => {
    if (isSessionStarted) {
      durationTimerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
      return () => {
        if (durationTimerRef.current) {
          clearInterval(durationTimerRef.current);
        }
      };
    }
  }, [isSessionStarted]);

  // Auto-speak prompt when session starts
  useEffect(() => {
    if (isSessionStarted && enableVoice && sessionType === 'voice' && !isSpeaking) {
      const currentPrompt = coachingScenarios[coachingMode]?.[selectedSkill]?.prompt;
      if (currentPrompt) {
        const timeout = setTimeout(() => speakPrompt(currentPrompt), 500);
        return () => clearTimeout(timeout);
      }
    }
  }, [isSessionStarted, enableVoice, sessionType]);

  const speakPrompt = (text) => {
    if (synthRef.current && enableVoice) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => {
        setIsSpeaking(false);
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
        saveResponse(transcript);
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 3000);
      }
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setIsRecording(false);
      }
    }
  };

  const saveResponse = (response) => {
    setResponses(prev => [...prev, response]);
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


  const handleStartSession = () => {
    if (!userName || !coachingMode || !selectedSkill || !difficulty) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setSessionType(enableVoice ? 'voice' : 'text');
    setIsSessionStarted(true);
    setResponses([]);
    setSessionTime(0);
    
    if (enableVoice) {
      setTimeout(() => {
        const currentPrompt = coachingScenarios[coachingMode]?.[selectedSkill]?.prompt;
        if (currentPrompt) speakPrompt(currentPrompt);
      }, 500);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBackToAgents = () => {
    if (isSessionStarted) {
      if (confirm('Are you sure you want to leave? Your progress will be lost.')) {
        setIsSessionStarted(false);
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

  const resetSession = () => {
    setIsSessionStarted(false);
    setCoachingMode('');
    setCurrentScenario(0);
    setSessionTime(0);
    setError('');
    setResponses([]);
    setTranscript('');
    if (isRecording) {
      stopRecording();
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  const handleReplayPrompt = () => {
    const currentPrompt = coachingScenarios[coachingMode]?.[selectedSkill]?.prompt;
    if (currentPrompt) speakPrompt(currentPrompt);
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
          >
            <source src="/ai2.mp4" type="video/mp4" />
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
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">AI Communication Coach</h1>
          </div>
          <div className="w-32"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10 overflow-visible">
        {!isSessionStarted ? (
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Enhanced Agent Section */}
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
                <h3 className="text-2xl font-bold text-white">Master Professional Communication</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Practice real-world communication scenarios with AI-powered feedback. Improve your presentation, negotiation, and interpersonal skills through interactive sessions.
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                    <span className="text-sm text-orange-400 font-medium">Real-time Feedback</span>
                  </div>
                  <div className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                    <span className="text-sm text-orange-400 font-medium">Voice & Text Mode</span>
                  </div>
                  <div className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                    <span className="text-sm text-orange-400 font-medium">Personalized Coaching</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Form Section */}
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">AI Communication Coach</h2>
                    <p className="text-gray-400 mt-1">Premium communication training with AI</p>
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

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/60 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Your Skill</label>
                  <GlassSelect
                    value={coachingMode}
                    onChange={(v) => { setCoachingMode(v); setSelectedSkill(''); setDifficulty(''); }}
                    placeholder="Select Your Skill"
                    options={[
                      { value: '', label: 'Select Your Skill' },
                      { value: 'presentation', label: 'Presentation Skills' },
                      { value: 'negotiation', label: 'Negotiation' },
                      { value: 'public-speaking', label: 'Public Speaking' },
                      { value: 'interview', label: 'Interview Skills' },
                      { value: 'meeting', label: 'Meeting Leadership' }
                    ]}
                  />
                </div>

                {coachingMode && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Practice Scenario</label>
                      <GlassSelect
                        value={selectedSkill}
                        onChange={setSelectedSkill}
                        placeholder="Select Practice Scenario"
                        options={[{ value: '', label: 'Select Practice Scenario' }, ...(coachingScenarios[coachingMode] || []).map((scenario, index) => ({ value: String(index), label: scenario.title }))]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Skill Level</label>
                      <GlassSelect
                        value={difficulty}
                        onChange={setDifficulty}
                        placeholder="Select Skill Level"
                        options={[{ value: '', label: 'Select Skill Level' }, ...(skillLevels[coachingMode] || []).map((lvl) => ({ value: lvl, label: lvl }))]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Session Duration (minutes)</label>
                      <input
                        type="number"
                        min="5"
                        max="60"
                        value={sessionDuration}
                        onChange={(e) => setSessionDuration(e.target.value)}
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/60 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder-gray-600 text-white"
                      />
                    </div>
                  </>
                )}
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
                onClick={handleStartSession}
                className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-800 transition-all shadow-xl hover:shadow-2xl hover:shadow-orange-500/40 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Communication Session
              </button>
            </div>
          </div>
        ) : sessionType === 'text' ? (
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
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {coachingScenarios[coachingMode]?.[selectedSkill]?.title}
                      </h2>
                      <p className="text-gray-400 mt-1 text-sm">
                        {coachingScenarios[coachingMode]?.[selectedSkill]?.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTime(sessionTime)}
                        </div>
                        <div className="px-2.5 py-1 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                          <span className="text-xs text-orange-400 font-medium">{difficulty}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={resetSession}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all font-medium"
                  >
                    End Session
                  </button>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 h-3 rounded-full transition-all duration-500 shadow-lg shadow-orange-500/30"
                    style={{ width: '100%' }}
                  ></div>
                </div>
              </div>

              {/* Enhanced Scenario */}
              <div className="mb-8">
                <div className="bg-gradient-to-br from-orange-500/10 to-blue-500/10 border border-orange-500/20 rounded-2xl p-6 mb-6">
                  <h3 className="text-2xl font-bold text-white mb-3 leading-relaxed">Practice Scenario</h3>
                  <p className="text-gray-200 leading-relaxed text-lg">
                    {coachingScenarios[coachingMode]?.[selectedSkill]?.prompt}
                  </p>
                  {coachingScenarios[coachingMode]?.[selectedSkill]?.tips && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-sm text-gray-400 flex items-start gap-2 mb-2">
                        <svg className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span><strong className="text-orange-400">Key Tips:</strong></span>
                      </p>
                      <div className="grid md:grid-cols-2 gap-2 mt-2">
                        {coachingScenarios[coachingMode]?.[selectedSkill]?.tips?.map((tip, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-orange-400 font-bold">{index + 1}.</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    className="w-full h-64 px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/60 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20 resize-none transition-all placeholder-gray-600 text-white text-lg leading-relaxed"
                    placeholder="Type your response here... Be detailed and specific."
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
                  <button className="px-6 py-3.5 bg-white/10 border border-white/10 rounded-xl hover:bg-white/20 transition-all font-medium flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Get Feedback
                  </button>
                  <button className="px-10 py-3.5 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-orange-800 transition-all shadow-xl hover:shadow-2xl hover:shadow-orange-500/40 flex items-center gap-3 transform hover:scale-105 active:scale-95 border-2 border-transparent hover:border-orange-400/50">
                    <span>Submit Response</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
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
              <div className="relative w-full max-w-sm mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-purple-500/20 to-blue-500/30 blur-3xl animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-orange-500/20 to-blue-500/20 rounded-3xl p-8 backdrop-blur-sm border border-white/10">
                  {isSpeaking ? (
                    <div className="flex items-center justify-center gap-2 h-32">
                      <div className="w-2 h-12 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                      <div className="w-2 h-20 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-16 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-24 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                      <div className="w-2 h-14 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32">
                      <div className="w-28 h-28 bg-gradient-to-br from-orange-500 via-orange-600 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
                        <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-gray-300 text-center font-medium">AI Communication Coach</p>
                      <p className="text-gray-500 text-xs text-center mt-1">Ready to coach</p>
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
                  <span className="text-sm font-medium text-green-400">Response saved!</span>
                </div>
              )}

              {/* Enhanced Interview Info */}
              <div className="mt-auto w-full space-y-3 text-sm z-10">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Communication Mode</span>
                    <span className="text-xl font-bold text-white capitalize">{coachingMode}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 mt-3">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Skill Level</span>
                    <span className="text-lg font-bold text-white">{difficulty}</span>
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
                    <span className="text-lg font-bold text-white">{formatTime(sessionTime)}</span>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="w-full mt-4 space-y-2 z-10">
                <button
                  onClick={handleReplayPrompt}
                  className="w-full px-4 py-2.5 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-xl hover:bg-orange-500/30 transition-all text-sm font-semibold"
                >
                  Replay Prompt
                </button>
                <button
                  onClick={resetSession}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all text-sm font-semibold"
                >
                  End Session
                </button>
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
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-1">
                        {coachingScenarios[coachingMode]?.[selectedSkill]?.title}
                      </h2>
                      <p className="text-sm text-gray-400">{coachingScenarios[coachingMode]?.[selectedSkill]?.description}</p>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 h-2.5 rounded-full transition-all duration-500 shadow-lg shadow-orange-500/30"
                    style={{ width: '100%' }}
                  ></div>
                </div>
              </div>

              {/* Enhanced Question */}
              <div className="mb-6 flex flex-col">
                <div className="bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-blue-500/10 border border-orange-500/20 rounded-2xl p-6 mb-6">
                  <h3 className="text-2xl font-bold mb-4 text-white leading-relaxed">Practice Scenario</h3>
                  <p className="text-gray-200 leading-relaxed text-lg">
                    {coachingScenarios[coachingMode]?.[selectedSkill]?.prompt}
                  </p>
                  {coachingScenarios[coachingMode]?.[selectedSkill]?.tips && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-sm text-gray-400 flex items-start gap-2">
                        <svg className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span><strong className="text-orange-400">Key Tips:</strong></span>
                      </p>
                      <div className="mt-2 space-y-2">
                        {coachingScenarios[coachingMode]?.[selectedSkill]?.tips?.map((tip, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm text-gray-300">
                            <span className="text-orange-400 font-bold">{index + 1}.</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              {/* Practice Area */}
              <div className="mt-auto pt-6 border-t border-white/10">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Your Response
                </h3>
                
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
                      className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all flex items-center gap-3 shadow-xl transform hover:scale-105 active:scale-95 ${
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

export default AICommunication;
