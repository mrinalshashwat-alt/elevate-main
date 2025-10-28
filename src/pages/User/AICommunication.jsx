'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

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
  
  // Refs
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const durationTimerRef = useRef(null);

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
    window.history.back();
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
          <h1 className="text-2xl font-bold">AI Communication Coach</h1>
          <div className="w-32"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!isSessionStarted ? (
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Visual Section */}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h2 className="text-4xl font-bold">AI Communication Coach</h2>
                </div>
                <p className="text-gray-400 text-lg">Master professional communication with personalized AI coaching and real-time feedback.</p>
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
                  placeholder="Your Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all placeholder-gray-600"
                />

                <select
                  value={coachingMode}
                  onChange={(e) => {
                    setCoachingMode(e.target.value);
                    setSelectedSkill('');
                    setDifficulty('');
                  }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all text-gray-400 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23999'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 14l-7 7m0 0l-7-7m7 7V3'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1.25rem',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="">Select Communication Skill</option>
                  <option value="presentation">Presentation Skills</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="public-speaking">Public Speaking</option>
                  <option value="interview">Interview Skills</option>
                  <option value="meeting">Meeting Leadership</option>
                </select>

                {coachingMode && (
                  <>
                    <select
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all text-gray-400 appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23999'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 14l-7 7m0 0l-7-7m7 7V3'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        backgroundSize: '1.25rem',
                        paddingRight: '2.5rem'
                      }}
                    >
                      <option value="">Select Scenario</option>
                      {coachingScenarios[coachingMode]?.map((scenario, index) => (
                        <option key={index} value={index}>{scenario.title}</option>
                      ))}
                    </select>

                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all text-gray-400 appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23999'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 14l-7 7m0 0l-7-7m7 7V3'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 1rem center',
                        backgroundSize: '1.25rem',
                        paddingRight: '2.5rem'
                      }}
                    >
                      <option value="">Select Difficulty Level</option>
                      {skillLevels[coachingMode]?.map((level, index) => (
                        <option key={index} value={level}>{level}</option>
                      ))}
                    </select>

                    <div className="space-y-1">
                      <label className="text-sm text-gray-400">Session Duration (minutes)</label>
                      <input
                        type="number"
                        min="5"
                        max="60"
                        value={sessionDuration}
                        onChange={(e) => setSessionDuration(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all placeholder-gray-600"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Session Type Toggle */}
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
                onClick={handleStartSession}
                className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-orange-500/30 text-lg"
              >
                Start Communication Session
              </button>
            </div>
          </div>
        ) : sessionType === 'text' ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Session Header */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-orange-400">
                    {coachingScenarios[coachingMode]?.[selectedSkill]?.title}
                  </h2>
                  <p className="text-gray-400 mt-1">
                    {coachingScenarios[coachingMode]?.[selectedSkill]?.description}
                  </p>
                </div>
          <button
                  onClick={resetSession}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all"
                >
                  End Session
                </button>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>Difficulty: {difficulty}</span>
                <span>Duration: {sessionDuration} minutes</span>
                <span>Time: {formatTime(sessionTime)}</span>
              </div>
            </div>

            {/* Scenario Card */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Scenario</h3>
              <div className="bg-gradient-to-r from-orange-500/10 to-blue-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
                <p className="text-gray-200 leading-relaxed">
                  {coachingScenarios[coachingMode]?.[selectedSkill]?.prompt}
                </p>
              </div>
              
              <h4 className="text-lg font-semibold mb-3">Key Tips:</h4>
              <div className="grid md:grid-cols-2 gap-3">
                {coachingScenarios[coachingMode]?.[selectedSkill]?.tips?.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-orange-400 text-sm font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Practice Area */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Your Response</h3>
              <textarea
                className="w-full h-64 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-orange-500/50 focus:bg-white/10 resize-none transition-all placeholder-gray-600"
                placeholder="Practice your response here. Focus on clarity, confidence, and structure..."
              ></textarea>
              
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-all">
                    Get AI Feedback
                  </button>
                  <button className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all">
                    Record Practice
                  </button>
                </div>
                <button className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all">
                  Submit Response
          </button>
        </div>
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-gray-400 text-center">AI Communication Coach</p>
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

              {/* Session Info */}
              <div className="mt-auto w-full space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Mode:</span>
                  <span className="text-white capitalize">{coachingMode}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Difficulty:</span>
                  <span className="text-white">{difficulty}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Duration:</span>
                  <span className="text-white">{formatTime(sessionTime)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="w-full mt-4 space-y-2">
                <button
                  onClick={handleReplayPrompt}
                  className="w-full px-4 py-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-all text-sm font-medium"
                >
                  Replay Prompt
                </button>
                <button
                  onClick={resetSession}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all text-sm font-medium"
                >
                  End Session
                </button>
              </div>
            </div>

            {/* Right Side - Coaching Content */}
            <div className="flex-1 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 flex flex-col overflow-y-auto custom-scrollbar">
              {/* Header */}
              <div className="mb-6 pb-4 border-b border-white/10">
                <h2 className="text-2xl font-bold text-orange-400 mb-2">
                  {coachingScenarios[coachingMode]?.[selectedSkill]?.title}
                </h2>
                <p className="text-gray-400">{coachingScenarios[coachingMode]?.[selectedSkill]?.description}</p>
              </div>

              {/* Scenario Prompt */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Scenario
                </h3>
                <div className="bg-gradient-to-r from-orange-500/10 to-blue-500/10 border border-orange-500/20 rounded-xl p-4">
                  <p className="text-gray-200 leading-relaxed">
                    {coachingScenarios[coachingMode]?.[selectedSkill]?.prompt}
                  </p>
                </div>
              </div>
              
              {/* Tips */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Key Tips
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {coachingScenarios[coachingMode]?.[selectedSkill]?.tips?.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                      <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-orange-400 text-sm font-bold">{index + 1}</span>
                      </div>
                      <p className="text-gray-300 text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practice Area */}
              <div className="mt-auto pt-6 border-t border-white/10">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Your Response
                </h3>
                
                {/* Transcript/Answer Display */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-h-[200px] max-h-[400px] overflow-y-auto custom-scrollbar mb-4">
                  {transcript ? (
                    <p className="text-gray-300 whitespace-pre-wrap">{transcript}</p>
                  ) : (
                    <p className="text-gray-500 italic">Your response will appear here as you speak...</p>
                  )}
                </div>

                {/* Recording Button */}
                {!isSpeaking && (
                  <div className="flex justify-center">
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

export default AICommunication;
