'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiCamera, FiMic, FiCheck, FiRefreshCw, FiInfo, FiShield, FiWifi, FiMonitor, FiLoader, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import { startAssessment } from '../../api/candidate';

const SystemCheck = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoRef = useRef(null);
  const [cameraStatus, setCameraStatus] = useState('checking');
  const [micStatus, setMicStatus] = useState('checking');
  const [micLevel, setMicLevel] = useState(0);
  const [listening, setListening] = useState(false);
  const [stream, setStream] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [micDataArray, setMicDataArray] = useState(null);

  // Participant details
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [participantDetails, setParticipantDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkCamera();
    checkMicrophone();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  const checkCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraStatus('passed');
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraStatus('failed');
    }
  };

  const checkMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 256;
      source.connect(analyserNode);

      setAudioContext(ctx);
      setAnalyser(analyserNode);
      
      const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
      setMicDataArray(dataArray);
      
      setMicStatus('passed');
      setListening(true);
      
      const updateMicLevel = () => {
        if (analyserNode && dataArray) {
          analyserNode.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setMicLevel(Math.min(average / 2.55, 100));
          requestAnimationFrame(updateMicLevel);
        }
      };
      updateMicLevel();
      
      // Store stream tracks for cleanup
      stream.getTracks().forEach(track => {
        if (track.kind === 'audio') {
          setStream(prev => {
            if (prev) {
              return prev;
            }
            return stream;
          });
        }
      });
    } catch (error) {
      console.error('Microphone error:', error);
      setMicStatus('failed');
    }
  };

  const rerunCheck = () => {
    setCameraStatus('checking');
    setMicStatus('checking');
    setMicLevel(0);
    setListening(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (audioContext) {
      audioContext.close();
    }
    setTimeout(() => {
      checkCamera();
      checkMicrophone();
    }, 500);
  };

  const handleStartTest = () => {
    if (cameraStatus === 'passed' && micStatus === 'passed') {
      setShowDetailsForm(true);
    }
  };

  // Clear any stale attempt data from previous sessions
  useEffect(() => {
    // Only clear if we're starting fresh (not resuming)
    const hasExistingAttempt = localStorage.getItem('attempt_id');
    if (!hasExistingAttempt) {
      // Clean up any stale data
      localStorage.removeItem('assessment_flow_completed');
      localStorage.removeItem('attempt_data');
      localStorage.removeItem('can_resume');
      console.log('Cleared stale attempt data from previous session');
    }
  }, []);

  const handleStartAssessment = async () => {
    if (!participantDetails.name || !participantDetails.email) {
      setError('Please provide your name and email');
      return;
    }

    try {
      setStarting(true);
      setError(null);

      // Get assessment data from localStorage
      const assessmentData = JSON.parse(localStorage.getItem('assessment_data') || '{}');
      const assessmentId = searchParams.get('assessmentId') || assessmentData.id;

      if (!assessmentId) {
        throw new Error('Assessment ID not found');
      }

      console.log('Starting assessment with ID:', assessmentId);
      console.log('Participant details:', participantDetails);

      // Start assessment with backend
      const response = await startAssessment(assessmentId, {
        email: participantDetails.email,
        name: participantDetails.name,
        phone: participantDetails.phone || ''
      });

      console.log('Assessment started successfully:', response);

      // Validate response structure
      if (!response.attempt_id) {
        console.error('Invalid response: missing attempt_id', response);
        throw new Error('Invalid response from server: missing attempt_id');
      }

      if (!response.questions || !Array.isArray(response.questions)) {
        console.error('Invalid response: missing or invalid questions array', response);
        throw new Error('Invalid response from server: missing questions');
      }

      console.log('Response validation passed:', {
        attempt_id: response.attempt_id,
        attempt_token: response.attempt_token ? 'JWT present' : 'missing',
        questions_count: response.questions.length,
        can_resume: response.can_resume
      });

      // Store attempt data - ensure all required fields are present
      localStorage.setItem('attempt_data', JSON.stringify(response));
      localStorage.setItem('attempt_id', response.attempt_id);
      localStorage.setItem('can_resume', response.can_resume ? 'true' : 'false');
      localStorage.setItem('assessment_flow_completed', 'true');

      // Store JWT token for guest participant authentication (stateless, industry standard)
      if (response.attempt_token) {
        localStorage.setItem('attempt_token', response.attempt_token);
        console.log('✅ Stored JWT attempt_token for stateless authentication');
      }

      console.log('Stored attempt data in localStorage');
      console.log('localStorage keys:', Object.keys(localStorage));
      console.log('attempt_data length:', localStorage.getItem('attempt_data')?.length);
      
      // Small delay to ensure localStorage is written
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Navigating to /user/assessment');

      // Navigate to assessment
      router.push('/user/assessment');
    } catch (err) {
      console.error('Error starting assessment:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      let errorMessage = 'Failed to start assessment. Please try again.';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error occurred. The assessment may not be properly configured or active. Please use "Demo Start" button or contact support.';
      }
      
      setError(errorMessage);
      setStarting(false);
    }
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center space-x-3">
          <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-contain" />
          <span className="text-xl font-bold">AI Assessment</span>
        </div>
        <div className="text-sm text-gray-400">
          <span>Having trouble? </span>
          <a href="mailto:support@aiassessments.com" className="text-orange-500 hover:text-orange-400">
            Contact support@aiassessments.com
          </a>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8 pb-24">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2 text-white">System Check</h1>
              <p className="text-gray-400">Ensure your camera and microphone are working properly before starting</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Panel - Camera Setup */}
              <div className="space-y-6">
                <motion.div
                  className="bg-white/5 border border-white/10 rounded-2xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h2 className="text-xl font-bold mb-4 text-white">Camera Preview</h2>
                  
                  {/* Camera Preview */}
                  <div className="w-full flex justify-center mb-4">
                    <motion.div 
                      className="group relative bg-black/90 border border-orange-500/30 rounded-xl overflow-hidden"
                      style={{ 
                        aspectRatio: '4/3',
                        width: '100%',
                        maxWidth: '100%',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
                      }}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative z-10 w-full h-full">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </motion.div>
                  </div>

                  <p className="text-orange-400 text-sm text-center mb-4">
                    Center your face, ensure good lighting and a neutral background.
                  </p>

                  {/* Camera Status */}
                  <div 
                    className={`flex items-center justify-between px-5 py-3 rounded-xl ${
                      cameraStatus === 'passed' ? 'bg-green-500/10 border border-green-500/30' : 
                      cameraStatus === 'failed' ? 'bg-red-500/10 border border-red-500/30' :
                      'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <FiCamera className="text-gray-400 w-5 h-5" />
                      <span className="font-medium text-sm text-white">Camera Status</span>
                    </div>
                    <div>
                      {cameraStatus === 'passed' && (
                        <div className="flex items-center space-x-2">
                          <FiCheck className="text-green-500 w-5 h-5" />
                          <span className="text-green-500 font-semibold text-sm">Passed</span>
                        </div>
                      )}
                      {cameraStatus === 'checking' && (
                        <span className="text-gray-400 text-sm">Checking...</span>
                      )}
                      {cameraStatus === 'failed' && (
                        <span className="text-red-500 font-semibold text-sm">Failed</span>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Device Indicators */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                    <FiCamera className="text-gray-400 w-4 h-4" />
                    <span className="text-sm text-gray-300">Integrated Webcam</span>
                  </div>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                    <FiMic className="text-gray-400 w-4 h-4" />
                    <span className="text-sm text-gray-300">Built-in Microphone</span>
                  </div>
                </div>

                {/* Demo Start Button - Creates mock attempt data */}
                <div>
                  <button
                    onClick={() => {
                      console.log('Demo Start: Creating mock attempt data');
                      
                      // Get assessment data
                      const assessmentData = JSON.parse(localStorage.getItem('assessment_data') || '{}');
                      
                      // Create mock attempt response matching backend structure
                      const mockAttemptData = {
                        attempt_id: 'demo-attempt-' + Date.now(),
                        assessment_id: assessmentData.id || 'demo-assessment',
                        participant_id: 'demo-participant',
                        expires_at: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
                        time_remaining_seconds: 90 * 60, // 90 minutes
                        can_resume: false,
                        assessment: {
                          id: assessmentData.id || 'demo-assessment',
                          name: assessmentData.name || 'Demo Assessment',
                          description: assessmentData.description || '',
                          instructions: assessmentData.instructions || '',
                          duration_minutes: assessmentData.duration_minutes || 90,
                          total_questions: 28,
                          settings: assessmentData.settings || {}
                        },
                        questions: [
                          // MCQ Questions (20)
                          ...Array.from({ length: 20 }, (_, i) => ({
                            id: `mcq-${i + 1}`,
                            type: 'mcq',
                            order: i + 1,
                            marks: 1,
                            content: {
                              question: `Sample MCQ Question ${i + 1}`,
                              options: ['Option A', 'Option B', 'Option C', 'Option D']
                            }
                          })),
                          // Coding Questions (3)
                          ...Array.from({ length: 3 }, (_, i) => ({
                            id: `coding-${i + 1}`,
                            type: 'coding',
                            order: 20 + i + 1,
                            marks: 10,
                            content: {
                              problem_statement: `Write a function to solve problem ${i + 1}`,
                              description: 'Sample coding problem description',
                              test_cases: [
                                { input: 'test input', expected_output: 'test output' }
                              ]
                            }
                          })),
                          // Video Questions (5)
                          ...Array.from({ length: 5 }, (_, i) => ({
                            id: `video-${i + 1}`,
                            type: 'video',
                            order: 23 + i + 1,
                            marks: 5,
                            content: {
                              question: `Video Interview Question ${i + 1}`,
                              description: 'Please record your response to this question'
                            }
                          }))
                        ]
                      };
                      
                      // Store in localStorage
                      localStorage.setItem('attempt_data', JSON.stringify(mockAttemptData));
                      localStorage.setItem('attempt_id', mockAttemptData.attempt_id);
                      localStorage.setItem('can_resume', 'false');
                      localStorage.setItem('assessment_flow_completed', 'true');
                      
                      console.log('Mock attempt data created:', mockAttemptData);
                      console.log('Navigating to assessment...');
                      
                      // Navigate to assessment
                      router.push('/user/assessment');
                    }}
                    className="w-full px-6 py-2.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl font-semibold hover:bg-blue-500/30 transition-colors text-sm"
                  >
                    Demo Start (Skip Backend)
                  </button>
                </div>
              </div>

              {/* Right Panel - Microphone Check & System Info */}
              <div className="space-y-6">
                {/* Microphone Check Card */}
                <motion.div 
                  className="bg-white/5 border border-white/10 rounded-2xl p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-xl font-bold mb-4 text-white">Microphone Check</h2>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <FiMic className="text-gray-400 w-4 h-4" />
                        <span className="text-sm text-gray-300">Speak at a normal volume</span>
                      </div>
                      {listening && (
                        <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">Listening</span>
                      )}
                    </div>
                    <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-100"
                        initial={{ width: 0 }}
                        animate={{ width: `${micLevel}%` }}
                      />
                    </div>
                  </div>

                  <div className={`flex items-center justify-between px-4 py-3 rounded-xl mb-4 ${
                    micStatus === 'passed' ? 'bg-green-500/10 border border-green-500/30' : 
                    micStatus === 'failed' ? 'bg-red-500/10 border border-red-500/30' :
                    'bg-white/5 border border-white/10'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <FiMic className="text-gray-400 w-5 h-5" />
                      <span className="text-sm font-medium text-white">Microphone Status</span>
                    </div>
                    <div>
                      {micStatus === 'passed' && (
                        <div className="flex items-center space-x-2">
                          <FiCheck className="text-green-500 w-5 h-5" />
                          <span className="text-green-500 font-semibold text-sm">Passed</span>
                        </div>
                      )}
                      {micStatus === 'checking' && (
                        <span className="text-gray-400 text-sm">Checking...</span>
                      )}
                      {micStatus === 'failed' && (
                        <span className="text-red-500 font-semibold text-sm">Failed</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={checkMicrophone}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors text-sm font-medium"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    <span>Re-test Microphone</span>
                  </button>
                </motion.div>

                {/* System Requirements Card */}
                <motion.div 
                  className="bg-white/5 border border-white/10 rounded-2xl p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <FiInfo className="text-orange-400 w-5 h-5" />
                    <h2 className="text-xl font-bold text-white">System Requirements</h2>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <FiShield className="text-green-400 w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">Proctoring Enabled</p>
                        <p className="text-xs text-gray-400">Camera and microphone monitoring active</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FiWifi className="text-blue-400 w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">Stable Internet</p>
                        <p className="text-xs text-gray-400">Ensure a reliable connection</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <FiMonitor className="text-purple-400 w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">Browser Compatible</p>
                        <p className="text-xs text-gray-400">Chrome, Firefox, or Edge recommended</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-xs">
                Your camera, microphone, network, and browser details are only used to verify readiness for your assessment.
              </p>
            </div>
          </div>
        </div>

        {/* Sticky Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-white/10 z-50 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <button
              onClick={handleStartTest}
              disabled={cameraStatus !== 'passed' || micStatus !== 'passed'}
              className="px-8 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Begin Assessment
            </button>
            <button
              onClick={rerunCheck}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <FiRefreshCw />
              <span>Re-run Check</span>
            </button>
          </div>
        </div>
      </div>

      {/* Participant Details Modal */}
      {showDetailsForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Enter Your Details</h2>
              <p className="text-gray-400 text-sm">Please provide your information to start the assessment</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={participantDetails.name}
                    onChange={(e) => setParticipantDetails(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                    disabled={starting}
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={participantDetails.email}
                    onChange={(e) => setParticipantDetails(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                    disabled={starting}
                  />
                </div>
              </div>

              {/* Phone Input (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={participantDetails.phone}
                    onChange={(e) => setParticipantDetails(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                    disabled={starting}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleStartAssessment}
                disabled={starting || !participantDetails.name || !participantDetails.email}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {starting ? (
                  <>
                    <FiLoader className="w-5 h-5 animate-spin" />
                    <span>Starting...</span>
                  </>
                ) : (
                  <span>Start Assessment</span>
                )}
              </button>
              <button
                onClick={() => {
                  setShowDetailsForm(false);
                  setError(null);
                }}
                disabled={starting}
                className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SystemCheck;

