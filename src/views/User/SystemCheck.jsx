'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiCamera, FiMic, FiCheck, FiRefreshCw } from 'react-icons/fi';

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

      <div className="flex-1 overflow-y-auto">
        <div className="h-full max-w-7xl mx-auto px-4 lg:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 h-full">
          {/* Left Panel - Camera & Microphone Setup */}
          <div className="lg:col-span-3 space-y-6 flex flex-col">
            <div className="flex-shrink-0">
              <h1 className="text-3xl font-bold mb-2">Camera & Microphone Setup</h1>
              <p className="text-gray-400 mb-6">Ensure your camera and microphone are working properly before starting the assessment</p>
            </div>

            {/* Camera Preview */}
            <div className="w-full flex justify-start flex-shrink-0">
              <motion.div 
                className="group relative bg-black/90 border border-[#FF5728] rounded-3xl overflow-hidden"
                style={{ 
                  aspectRatio: '4/3',
                  width: '100%',
                  maxWidth: '700px',
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

            <div className="space-y-4 flex-shrink-0">
              <p className="text-orange-500 text-sm text-left max-w-[700px]">
                Center your face, ensure good lighting and a neutral background.
              </p>

              {/* Device Indicators */}
              <div className="flex flex-wrap justify-start gap-4 max-w-[700px]">
                <div className="flex items-center space-x-2 px-4 py-2 bg-black/90 border border-gray-700 rounded-full">
                  <FiCamera className="text-gray-400" />
                  <span className="text-sm text-gray-300">Camera: Integrated Webcam</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-black/90 border border-gray-700 rounded-full">
                  <FiMic className="text-gray-400" />
                  <span className="text-sm text-gray-300">Mic: Built-in Microphone</span>
                </div>
              </div>
            </div>

            {/* Camera Status */}
            <div 
              className={`group relative flex items-center justify-between px-5 py-4 rounded-2xl overflow-hidden max-w-[700px] flex-shrink-0 min-w-0 ${
                cameraStatus === 'passed' ? 'bg-green-900/30 border border-green-500/30' : 'bg-black/90 border border-[#FF5728]'
              }`}
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 overflow-hidden rounded-2xl">
                <div className="absolute top-2 left-2 right-0 bottom-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
              <div className="flex items-center space-x-3 relative z-10 flex-shrink-0">
                <FiCamera className="text-gray-400 text-lg flex-shrink-0" />
                <span className="font-medium whitespace-nowrap">Camera Status</span>
              </div>
              <div className="relative z-10 flex-shrink-0 ml-4">
                {cameraStatus === 'passed' && (
                  <div className="flex items-center space-x-2">
                    <FiCheck className="text-green-500 text-lg" />
                    <span className="text-green-500 font-semibold whitespace-nowrap">Passed</span>
                  </div>
                )}
                {cameraStatus === 'checking' && (
                  <span className="text-gray-400 whitespace-nowrap">Checking...</span>
                )}
                {cameraStatus === 'failed' && (
                  <div className="flex items-center space-x-2">
                    <span className="text-red-500 whitespace-nowrap">Failed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-[700px] flex-shrink-0">
              <button
                onClick={handleStartTest}
                disabled={cameraStatus !== 'passed' || micStatus !== 'passed'}
                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Start Test
              </button>
              <button
                onClick={rerunCheck}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-black/90 border border-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <FiRefreshCw />
                <span>Re-run Check</span>
              </button>
            </div>

            {/* Demo Start Button */}
            <div className="max-w-[700px] flex-shrink-0">
              <button
                onClick={() => router.push('/user/assessment')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors w-full"
              >
                Demo Start (Skip Checks)
              </button>
            </div>

            {/* Disclaimer */}
            <p className="text-gray-500 text-xs text-left max-w-[700px] mt-6 flex-shrink-0">
              Your camera, microphone, network, and browser details are only used to verify readiness for your assessment.
            </p>
          </div>

          {/* Right Panel - Voice Check & Section Breakdown */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">
          {/* Voice Check Card */}
          <motion.div 
            className="group relative bg-black/90 border border-[#FF5728] rounded-3xl p-6 overflow-hidden flex-shrink-0"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
              transformStyle: 'preserve-3d'
            }}
            whileHover={{ y: -8, scale: 1.02, rotateX: 2 }}
            transition={{ duration: 0.3 }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 overflow-hidden rounded-3xl">
              <div className="absolute top-2 left-2 right-0 bottom-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
            <div className="premium-card-content relative z-20">
            <h2 className="text-xl font-bold mb-4">Voice Check</h2>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <FiMic className="text-gray-400" />
                  <span className="text-sm">Speak at a normal volume</span>
                </div>
                {listening && <span className="text-xs text-gray-400">Listening</span>}
              </div>
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 transition-all duration-100"
                  style={{ width: `${micLevel}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FiCheck className="text-green-500" />
                <span className="text-sm">Microphone detected</span>
              </div>
              {micStatus === 'passed' && (
                <span className="text-sm text-green-500">Good</span>
              )}
            </div>

            <button
              onClick={checkMicrophone}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              <FiRefreshCw />
              <span>Re-test Voice</span>
            </button>
            </div>
          </motion.div>

          {/* Section Breakdown Card */}
          <motion.div 
            className="group relative bg-black/90 border border-[#FF5728] rounded-3xl p-6 overflow-hidden flex-shrink-0"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
              transformStyle: 'preserve-3d'
            }}
            whileHover={{ y: -8, scale: 1.02, rotateX: 2 }}
            transition={{ duration: 0.3 }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 overflow-hidden rounded-3xl">
              <div className="absolute top-2 left-2 right-0 bottom-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
            <div className="premium-card-content relative z-20">
            <h2 className="text-xl font-bold mb-4">Section Breakdown</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-white">MCQ</span>
                <div className="text-right">
                  <span className="text-white">20 Qs</span>
                  <span className="text-gray-400 ml-2">20 min</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Coding</span>
                <div className="text-right">
                  <span className="text-white">2 Qs</span>
                  <span className="text-gray-400 ml-2">40 min</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Video Interview</span>
                <div className="text-right">
                  <span className="text-white">5 Qs</span>
                  <span className="text-gray-400 ml-2">30 min</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white font-semibold">Total</span>
              </div>
              <div className="text-right">
                <span className="text-white">27 Qs</span>
                <span className="text-green-500 ml-2">90 mins</span>
              </div>
            </div>
            </div>
          </motion.div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default SystemCheck;

