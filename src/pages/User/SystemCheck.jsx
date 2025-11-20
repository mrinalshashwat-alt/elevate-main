'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiCamera, FiMic, FiCheck, FiRefreshCw, FiInfo, FiShield, FiWifi, FiMonitor } from 'react-icons/fi';

const SystemCheck = () => {
  const router = useRouter();
  const videoRef = useRef(null);
  const [cameraStatus, setCameraStatus] = useState('checking');
  const [micStatus, setMicStatus] = useState('checking');
  const [micLevel, setMicLevel] = useState(0);
  const [listening, setListening] = useState(false);
  const [stream, setStream] = useState(null);
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [micDataArray, setMicDataArray] = useState(null);

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
      // Mark flow as completed before navigating to assessment
      localStorage.setItem('assessment_flow_completed', 'true');
      router.push('/user/assessment');
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

                {/* Demo Start Button */}
                <div>
                  <button
                    onClick={() => {
                      localStorage.setItem('assessment_flow_completed', 'true');
                      router.push('/user/assessment');
                    }}
                    className="w-full px-6 py-2.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl font-semibold hover:bg-blue-500/30 transition-colors text-sm"
                  >
                    Demo Start (Skip Checks)
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
    </div>
  );
};

export default SystemCheck;

