'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const Results = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'report', label: 'Report' },
    { id: 'proctoring', label: 'Proctoring' }
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Navigation Header */}
      <header className="bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
          <button 
            onClick={() => router.push('/admin/assessment-list')} 
            className="flex items-center space-x-2 hover:text-orange-400 transition-all group px-3 py-2 rounded-lg hover:bg-white/5"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Assessments</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Results</h1>
          </div>
          <div className="w-40"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Tab Navigation */}
        <div className="flex items-center gap-4 mb-8">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                  : 'bg-black border border-orange-500/50 text-white'
              }`}
              whileHover={{ scale: activeTab === tab.id ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'report' && <ReportTab />}
          {activeTab === 'proctoring' && <ProctoringTab />}
        </motion.div>
      </main>
    </div>
  );
};

// Profile Tab Component
const ProfileTab = () => {
  return (
    <div className="space-y-6">
      {/* Candidate Overview Card */}
      <motion.div 
        className="group relative bg-black/90 border border-white/10 rounded-3xl p-8 overflow-hidden"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
        }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-2 border-orange-500/30 flex items-center justify-center">
            <svg className="w-12 h-12 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Ava Thompson</h2>
                <p className="text-xl text-white mb-2">Product Analyst</p>
              </div>
              <span className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-bold">
                Match fit : 98%
              </span>
            </div>
            <div className="flex items-center gap-4 text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>ava.thompson@example.com</span>
              </div>
              <span className="text-gray-600">•</span>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* About Candidate */}
      <motion.div 
        className="bg-black/90 border border-white/10 rounded-3xl p-8"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-1 h-8 bg-orange-500 rounded-full"></div>
          <h3 className="text-2xl font-bold text-white">About Candidate</h3>
        </div>
        <p className="text-white leading-relaxed">
          Experienced product analyst with a strong background in data-driven decision making and cross-functional collaboration. 
          Specialized in A/B testing, user behavior analysis, and product metrics optimization. Proven track record of improving 
          product performance through actionable insights and strategic recommendations.
        </p>
      </motion.div>

      {/* Skills */}
      <motion.div 
        className="bg-black/90 border border-white/10 rounded-3xl p-8"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-1 h-8 bg-orange-500 rounded-full"></div>
          <h3 className="text-2xl font-bold text-white">Skills</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          {['MS Office', 'Communication', 'Problem Solving', 'SQL', 'A/B Testing', 'Data Visualization', 'Python', 'Tableau', 'Analytics'].map((skill) => (
            <span key={skill} className="px-4 py-2 bg-black border border-orange-500/50 text-white rounded-full text-sm">
              {skill}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Experience and Education */}
      <div className="grid grid-cols-2 gap-6">
        <motion.div 
          className="bg-black/90 border border-white/10 rounded-3xl p-8"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-white mb-6">Experience</h3>
          <div className="space-y-4">
            {[
              { role: 'Senior Product Analyst', company: 'TechCorp Inc.', period: '2022 — Present' },
              { role: 'Product Analyst', company: 'DataFlow Systems', period: '2020 — 2022' }
            ].map((exp, idx) => (
              <div key={idx}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-bold">{exp.role}</p>
                    <p className="text-orange-400">{exp.company}</p>
                  </div>
                  <span className="text-white text-sm">{exp.period}</span>
                </div>
                {idx < 1 && <div className="border-t border-orange-500/30 mt-4"></div>}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="bg-black/90 border border-white/10 rounded-3xl p-8"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-white mb-6">Education</h3>
          <div className="space-y-4">
            {[
              { degree: 'Master of Science', university: 'Stanford University', period: '2017 — 2019' },
              { degree: 'Bachelor of Science', university: 'UC Berkeley', period: '2013 — 2017' }
            ].map((edu, idx) => (
              <div key={idx}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-white font-bold">{edu.degree}</p>
                    <p className="text-orange-400">{edu.university}</p>
                  </div>
                  <span className="text-white text-sm">{edu.period}</span>
                </div>
                {idx < 1 && <div className="border-t border-orange-500/30 mt-4"></div>}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Download Resume Button */}
      <div className="flex justify-end">
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold text-white hover:shadow-lg shadow-orange-500/40 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Download Resume
        </motion.button>
      </div>
    </div>
  );
};

// Report Tab Component
const ReportTab = () => {
  const skills = ['abc...', 'abc...', 'abc...', 'abc...', 'abc...', 'abc...'];
  const percentages = [82, 74, 69, 88, 76, 71];
  const overallScore = 78;

  return (
    <div className="space-y-6">
      {/* Main Report Layout - 2 columns */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Skill Overview */}
          <motion.div 
            className="bg-black/90 border border-white/10 rounded-3xl p-8"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">Skill Overview</h3>
            <div className="space-y-4">
              {skills.map((skill, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white">{skill}</span>
                    <span className="text-white font-bold">{percentages[idx]}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentages[idx]}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Overall Score */}
          <motion.div 
            className="bg-black/90 border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">Overall Score</h3>
            <div className="relative w-64 h-64">
              <svg className="transform -rotate-90" width="256" height="256">
                <circle
                  cx="128"
                  cy="128"
                  r="112"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="16"
                  fill="none"
                />
                <motion.circle
                  cx="128"
                  cy="128"
                  r="112"
                  stroke="url(#orangeGradient)"
                  strokeWidth="16"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 112}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 112 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 112 * (1 - overallScore / 100) }}
                  transition={{ duration: 1.5 }}
                />
                <defs>
                  <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff7849" />
                    <stop offset="100%" stopColor="#ff9500" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-black text-white">{overallScore}%</div>
                  <div className="text-sm text-gray-400">Overall Score</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Competency Overview */}
          <motion.div 
            className="bg-black/90 border border-white/10 rounded-3xl p-8"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">Competency Overview</h3>
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="text-center text-gray-500">
                <svg className="w-48 h-48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Strengths */}
          <motion.div 
            className="bg-black/90 border border-white/10 rounded-3xl p-8"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">Strengths</h3>
            <ul className="space-y-3">
              {[
                'Breaks complex problems into measurable hypotheses with clear success metrics.',
                'Strong SQL proficiency and efficient data wrangling.',
                'Excellent analytical thinking and pattern recognition.',
                'Communicates insights concisely with relevant visuals.',
                'Proven ability to translate data into actionable recommendations.',
                'Strong collaboration skills across technical and non-technical teams.'
              ].map((strength, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <span className="text-white">{strength}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Detailed Summary */}
      <motion.div 
        className="bg-black/90 border border-white/10 rounded-3xl p-8"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-2xl font-bold text-white mb-6">Detailed Summary</h3>
        <p className="text-white leading-relaxed">
          Candidate shows strong analytical depth with reliable data tooling skills. Communication is clear, 
          with minor gaps in contextual framing. Performance indicates readiness for mid-level analytical roles 
          with guidance on experimentation best practices.
        </p>
      </motion.div>

      {/* Export Report Button */}
      <div className="flex justify-end">
        <motion.button
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold text-white hover:shadow-lg shadow-orange-500/40 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Export Report
        </motion.button>
      </div>
    </div>
  );
};

// Proctoring Tab Component
const ProctoringTab = () => {
  const violations = [
    { time: '00:03:25', event: 'Eye Movement', description: 'Candidate looked away for 4 seconds' },
    { time: '00:05:10', event: 'Tab Switch', description: 'Browser tab changed' },
    { time: '00:10:12', event: 'Multiple Faces', description: 'Detected 2 faces on screen' },
    { time: '00:18:40', event: 'Eye Movement', description: 'Brief glance away (2 seconds)' },
    { time: '00:26:03', event: 'Tab Switch', description: 'User focused another application' }
  ];

  return (
    <div className="space-y-6">
      {/* Proctoring Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <motion.div 
          className="bg-black/90 border border-white/10 rounded-3xl p-8 text-center"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-sm text-gray-400 mb-4 uppercase tracking-wide">Total Violations</h3>
          <p className="text-4xl font-black text-orange-400">3</p>
        </motion.div>
        <motion.div 
          className="bg-black/90 border border-white/10 rounded-3xl p-8 text-center"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-sm text-gray-400 mb-4 uppercase tracking-wide">Eyes Diverted</h3>
          <p className="text-4xl font-black text-orange-400">5</p>
        </motion.div>
        <motion.div 
          className="bg-black/90 border border-white/10 rounded-3xl p-8 text-center"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-sm text-gray-400 mb-4 uppercase tracking-wide">Multiple Faces</h3>
          <p className="text-4xl font-black text-orange-400">1</p>
        </motion.div>
        <motion.div 
          className="bg-black/90 border border-white/10 rounded-3xl p-8 text-center"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-sm text-gray-400 mb-4 uppercase tracking-wide">Tab Switches</h3>
          <p className="text-4xl font-black text-orange-400">2</p>
        </motion.div>
      </div>

      {/* Detailed Activity Log */}
      <motion.div 
        className="bg-black/90 border border-white/10 rounded-3xl p-8"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-2xl font-bold text-white mb-6">Detailed Activity Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Time</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Event</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Description</th>
              </tr>
            </thead>
            <tbody>
              {violations.map((violation, idx) => (
                <motion.tr 
                  key={idx}
                  className="border-b border-white/10"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                >
                  <td className="py-4 px-4 text-white">{violation.time}</td>
                  <td className="py-4 px-4">
                    <span className="text-orange-400 font-semibold">{violation.event}</span>
                  </td>
                  <td className="py-4 px-4 text-white">{violation.description}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Summary Note */}
      <motion.div 
        className="bg-black/90 border border-white/10 rounded-3xl p-8"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-2xl font-bold text-white mb-6">Summary Note</h3>
        <p className="text-white leading-relaxed">
          Candidate maintained fair focus throughout the session. 3 minor distractions detected. No major proctoring violations. 
          Visual checks were mostly consistent with a single anomaly (multiple faces) resolved quickly.
        </p>
      </motion.div>
    </div>
  );
};

export default Results;
