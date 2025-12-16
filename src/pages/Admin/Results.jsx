'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/AdminLayout';
import { getParticipantDetail, getAssessmentLeaderboard } from '../../api/admin';

const Results = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('assessmentId');
  const participantId = searchParams.get('participantId');
  
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [showCompetencyModal, setShowCompetencyModal] = useState(false);
  const [selectedCompetency, setSelectedCompetency] = useState(null);
  const [participantData, setParticipantData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(null); // 'overview' or 'individual'

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Determine view mode and fetch data
  useEffect(() => {
    if (!assessmentId) {
      setError('Missing assessmentId in URL');
      setLoading(false);
      return;
    }

    if (participantId) {
      // Individual participant view
      setViewMode('individual');
      setActiveTab('profile');
      fetchParticipantDetail();
    } else {
      // Assessment overview
      setViewMode('overview');
      setActiveTab('leaderboard');
      fetchLeaderboard();
    }
  }, [assessmentId, participantId]);

  const fetchParticipantDetail = async () => {
    try {
      setLoading(true);
      const data = await getParticipantDetail(assessmentId, participantId);
      setParticipantData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching participant detail:', err);
      setError('Failed to load participant data');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await getAssessmentLeaderboard(assessmentId, { limit: 100 });
      setLeaderboardData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load assessment results');
    } finally {
      setLoading(false);
    }
  };

  // Tabs depend on view mode
  const overviewTabs = [
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'competency-analysis', label: 'Competency Analysis', icon: '📊' },
    { id: 'insights', label: 'Insights', icon: '💡' }
  ];

  const individualTabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'report', label: 'Report' },
    { id: 'proctoring', label: 'Proctoring' }
  ];

  const tabs = viewMode === 'overview' ? overviewTabs : individualTabs;

  if (loading) {
    return (
      <AdminLayout 
        title="Results" 
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Results' }
        ]}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading results...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout 
        title="Results" 
        breadcrumbs={[
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Results' }
        ]}
      >
        <div className="bg-red-500/10 border border-red-500/50 rounded-3xl p-8">
          <p className="text-white text-center">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  // Determine title based on view mode
  const pageTitle = viewMode === 'overview' 
    ? 'Assessment Results' 
    : participantData 
      ? `${participantData.participant.name} - Results` 
      : 'Results';

  return (
    <AdminLayout 
      title={pageTitle}
      breadcrumbs={[
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Assessments', path: '/admin/assessment-list' },
        { label: 'Results' }
      ]}
    >
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
              {tab.icon && <span className="mr-2">{tab.icon}</span>}
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
          {viewMode === 'overview' && (
            <>
              {activeTab === 'leaderboard' && <LeaderboardTab data={leaderboardData} assessmentId={assessmentId} router={router} />}
              {activeTab === 'competency-analysis' && <CompetencyAnalysisTab data={leaderboardData} />}
              {activeTab === 'insights' && <InsightsTab data={leaderboardData} />}
            </>
          )}
          
          {viewMode === 'individual' && (
            <>
              {activeTab === 'profile' && <ProfileTab data={participantData} />}
              {activeTab === 'report' && <ReportTab data={participantData} setShowCompetencyModal={setShowCompetencyModal} setSelectedCompetency={setSelectedCompetency} />}
              {activeTab === 'proctoring' && <ProctoringTab data={participantData} />}
            </>
          )}
        </motion.div>

        {/* Competency Breakdown Modal */}
        <AnimatePresence>
          {showCompetencyModal && selectedCompetency && (
            <motion.div
              className="fixed inset-0 bg-black/90 flex items-center justify-center z-[1000] p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCompetencyModal(false)}
            >
              <motion.div
                className="bg-black/95 border border-orange-500/50 rounded-3xl p-8 max-w-2xl w-full"
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Competency Breakdown: {selectedCompetency.name}</h3>
                  <button
                    onClick={() => setShowCompetencyModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">Overall Score</span>
                      <span className="text-orange-400 font-bold text-2xl">{selectedCompetency.score}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-4 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${selectedCompetency.score}%` }}
                        transition={{ duration: 1 }}
                      ></motion.div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Key Strengths:</h4>
                    <ul className="space-y-2">
                      {selectedCompetency.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-300">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </AdminLayout>
  );
};

// Profile Tab Component
const ProfileTab = ({ data }) => {
  const { participant, attempt, gap_analysis } = data;
  const matchFit = gap_analysis ? gap_analysis.overall_match : null;

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
                <h2 className="text-3xl font-bold text-white mb-2">{participant.name}</h2>
                <p className="text-xl text-white mb-2">Score: {attempt.total_score}%</p>
              </div>
              {matchFit && (
                <span className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-bold">
                  Match fit: {matchFit}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{participant.email}</span>
              </div>
              {participant.phone && (
                <>
                  <span className="text-gray-600">•</span>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{participant.phone}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Assessment Summary */}
      <motion.div 
        className="bg-black/90 border border-white/10 rounded-3xl p-8"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-1 h-8 bg-orange-500 rounded-full"></div>
          <h3 className="text-2xl font-bold text-white">Assessment Summary</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Score</p>
            <p className="text-2xl font-bold text-white">{attempt.total_score}%</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">MCQ Score</p>
            <p className="text-2xl font-bold text-orange-400">{attempt.mcq_score}%</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Code Score</p>
            <p className="text-2xl font-bold text-orange-400">{attempt.code_score || 0}%</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Time Taken</p>
            <p className="text-2xl font-bold text-white">{attempt.time_taken_minutes} min</p>
          </div>
        </div>
      </motion.div>

      {/* Technical Details */}
      <motion.div 
        className="bg-black/90 border border-white/10 rounded-3xl p-8"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-1 h-8 bg-orange-500 rounded-full"></div>
          <h3 className="text-2xl font-bold text-white">Technical Details</h3>
        </div>
        <div className="space-y-3 text-white">
          <div className="flex justify-between">
            <span className="text-gray-400">Attempt ID:</span>
            <span className="font-mono text-sm">{attempt.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Status:</span>
            <span className="capitalize">{attempt.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Started:</span>
            <span>{new Date(attempt.started_at).toLocaleString()}</span>
          </div>
          {attempt.finished_at && (
            <div className="flex justify-between">
              <span className="text-gray-400">Finished:</span>
              <span>{new Date(attempt.finished_at).toLocaleString()}</span>
            </div>
          )}
          {attempt.ip_address && (
            <div className="flex justify-between">
              <span className="text-gray-400">IP Address:</span>
              <span className="font-mono text-sm">{attempt.ip_address}</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// Report Tab Component
const ReportTab = ({ data, setShowCompetencyModal, setSelectedCompetency }) => {
  const { attempt, competency_scores, gap_analysis } = data;
  const overallScore = Math.round(attempt.total_score);
  
  // Transform competency_scores for display
  const competencies = competency_scores.map(cs => ({
    name: cs.competency_name,
    score: Math.round(cs.percentage_score),
    details: [
      `Score: ${cs.score_obtained}/${cs.max_possible_score} points`,
      `Questions: ${cs.questions_attempted}/${cs.total_questions}`,
      `Percentage: ${cs.percentage_score.toFixed(1)}%`
    ]
  }));

  const handleCompetencyClick = (competency) => {
    setSelectedCompetency(competency);
    setShowCompetencyModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Row - Score and Competency */}
      <div className="grid grid-cols-2 gap-6">
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

        {/* Competency Overview */}
        <motion.div 
          className="bg-black/90 border border-white/10 rounded-3xl p-8"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-white mb-6">Competency Overview</h3>
          <div className="space-y-4">
            {competencies.map((competency, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">{competency.name}</span>
                  <span className="text-white font-bold">{competency.score}%</span>
                </div>
                <button
                  onClick={() => handleCompetencyClick(competency)}
                  className="w-full bg-white/10 rounded-full h-3 overflow-hidden cursor-pointer hover:bg-white/15 transition-colors"
                >
                  <motion.div
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${competency.score}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                  ></motion.div>
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Gap Analysis (if available) */}
      {gap_analysis && (
        <motion.div 
          className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/50 rounded-3xl p-8"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-white mb-6">🎯 Gap Analysis vs Job Requirements</h3>
          <div className="space-y-4">
            {gap_analysis.strong_skills && gap_analysis.strong_skills.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-green-400 mb-2">✅ Strong Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {gap_analysis.strong_skills.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-300 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {gap_analysis.skill_gaps && gap_analysis.skill_gaps.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-yellow-400 mb-2">⚠️ Skill Gaps</h4>
                <div className="flex flex-wrap gap-2">
                  {gap_analysis.skill_gaps.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {gap_analysis.critical_gaps && gap_analysis.critical_gaps.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-red-400 mb-2">❌ Critical Gaps</h4>
                <div className="flex flex-wrap gap-2">
                  {gap_analysis.critical_gaps.map((skill, idx) => (
                    <span key={idx} className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-300 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Score Breakdown by Question Type */}
      <motion.div 
        className="bg-black/90 border border-white/10 rounded-3xl p-8"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-2xl font-bold text-white mb-6">Score Breakdown</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white">MCQ Questions</span>
              <span className="text-white font-bold">{attempt.mcq_score}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${attempt.mcq_score}%` }}
                transition={{ duration: 1 }}
              ></motion.div>
            </div>
          </div>
          {attempt.code_score > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white">Coding Questions</span>
                <span className="text-white font-bold">{attempt.code_score}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${attempt.code_score}%` }}
                  transition={{ duration: 1, delay: 0.1 }}
                ></motion.div>
              </div>
            </div>
          )}
          {attempt.subjective_score > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white">Subjective Questions</span>
                <span className="text-white font-bold">{attempt.subjective_score}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${attempt.subjective_score}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                ></motion.div>
              </div>
            </div>
          )}
        </div>
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
const ProctoringTab = ({ data }) => {
  const { attempt } = data;
  const violations = attempt.proctoring_violations || [];

  // Calculate metrics
  const totalViolations = violations.length;
  const tabSwitches = violations.filter(v => v.type === 'tab_switch' || v.type === 'window_blur').length;
  const multipleFaces = violations.filter(v => v.type === 'multiple_faces').length;
  const noFace = violations.filter(v => v.type === 'no_face').length;
  const eyesDiverted = violations.filter(v => v.type === 'eye_movement').length;

  // Format timestamp to HH:MM:SS
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  // Get violation label
  const getViolationLabel = (type) => {
    const labels = {
      'tab_switch': 'Tab Switch',
      'window_blur': 'Window Blur',
      'multiple_faces': 'Multiple Faces',
      'no_face': 'No Face Detected',
      'eye_movement': 'Eyes Diverted',
      'unauthorized_device': 'Unauthorized Device'
    };
    return labels[type] || type;
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    const colors = {
      'low': 'text-yellow-400',
      'medium': 'text-orange-400',
      'high': 'text-red-400'
    };
    return colors[severity] || 'text-gray-400';
  };

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
          <p className="text-4xl font-black text-orange-400">{totalViolations}</p>
        </motion.div>
        <motion.div 
          className="bg-black/90 border border-white/10 rounded-3xl p-8 text-center"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-sm text-gray-400 mb-4 uppercase tracking-wide">Tab Switches</h3>
          <p className="text-4xl font-black text-orange-400">{tabSwitches}</p>
        </motion.div>
        <motion.div 
          className="bg-black/90 border border-white/10 rounded-3xl p-8 text-center"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-sm text-gray-400 mb-4 uppercase tracking-wide">Multiple Faces</h3>
          <p className="text-4xl font-black text-orange-400">{multipleFaces}</p>
        </motion.div>
        <motion.div 
          className="bg-black/90 border border-white/10 rounded-3xl p-8 text-center"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-sm text-gray-400 mb-4 uppercase tracking-wide">No Face</h3>
          <p className="text-4xl font-black text-orange-400">{noFace}</p>
        </motion.div>
      </div>

      {/* Detailed Activity Log */}
      <motion.div 
        className="bg-black/90 border border-white/10 rounded-3xl p-8"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-2xl font-bold text-white mb-6">Detailed Activity Log</h3>
        {violations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Time</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Event</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Severity</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Details</th>
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
                    <td className="py-4 px-4 text-white">{formatTime(violation.timestamp)}</td>
                    <td className="py-4 px-4">
                      <span className="text-orange-400 font-semibold">{getViolationLabel(violation.type)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-semibold capitalize ${getSeverityColor(violation.severity)}`}>
                        {violation.severity}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-300">
                      {violation.metadata && typeof violation.metadata === 'object' 
                        ? JSON.stringify(violation.metadata, null, 2) 
                        : 'No additional details'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No proctoring violations recorded</p>
        )}
      </motion.div>

      {/* Summary Note */}
      <motion.div 
        className="bg-black/90 border border-white/10 rounded-3xl p-8"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-2xl font-bold text-white mb-6">Summary Note</h3>
        <p className="text-white leading-relaxed">
          {totalViolations === 0 
            ? "Excellent! No proctoring violations detected. Candidate maintained focus throughout the assessment."
            : totalViolations <= 3
            ? `Minor proctoring concerns detected (${totalViolations} violations). Overall behavior is acceptable with minor distractions.`
            : totalViolations <= 10
            ? `Moderate proctoring violations detected (${totalViolations} violations). Review recommended before making final decision.`
            : `Significant proctoring violations detected (${totalViolations} violations). Manual review strongly recommended.`
          }
        </p>
      </motion.div>
    </div>
  );
};

// ============================================================================
// OVERVIEW MODE TABS
// ============================================================================

// Leaderboard Tab - Top 10 candidates
const LeaderboardTab = ({ data, assessmentId, router }) => {
  if (!data || !data.results) return null;

  const topCandidates = data.results.slice(0, 10);
  
  // Calculate stats
  const avgScore = data.results.length > 0 
    ? Math.round(data.results.reduce((sum, c) => sum + c.total_score, 0) / data.results.length)
    : 0;
  const passRate = data.results.length > 0
    ? Math.round((data.results.filter(c => c.total_score >= 70).length / data.results.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
          className="bg-black/90 border border-white/10 rounded-2xl p-6"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-sm text-gray-400 mb-2 uppercase tracking-wide">Total Candidates</h3>
          <p className="text-4xl font-black text-orange-400">{data.count || 0}</p>
        </motion.div>
        <motion.div 
          className="bg-black/90 border border-white/10 rounded-2xl p-6"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-sm text-gray-400 mb-2 uppercase tracking-wide">Average Score</h3>
          <p className="text-4xl font-black text-orange-400">{avgScore}%</p>
        </motion.div>
        <motion.div 
          className="bg-black/90 border border-white/10 rounded-2xl p-6"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-sm text-gray-400 mb-2 uppercase tracking-wide">Pass Rate</h3>
          <p className="text-4xl font-black text-orange-400">{passRate}%</p>
        </motion.div>
        <motion.div 
          className="bg-black/90 border border-white/10 rounded-2xl p-6"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-sm text-gray-400 mb-2 uppercase tracking-wide">Completed</h3>
          <p className="text-4xl font-black text-orange-400">{data.results.length}</p>
        </motion.div>
      </div>

      {/* Top 3 Podium */}
      {topCandidates.length >= 3 && (
        <motion.div 
          className="bg-black/90 border border-white/10 rounded-3xl p-8"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-white mb-6">🏆 Top 3 Performers</h3>
          <div className="grid grid-cols-3 gap-6">
            {/* Rank 2 - Left */}
            <div className="text-center pt-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-400/20 to-gray-500/20 border-2 border-gray-400/30 flex items-center justify-center">
                <span className="text-3xl">🥈</span>
              </div>
              <button
                onClick={() => router.push(`/admin/results?assessmentId=${assessmentId}&participantId=${topCandidates[1].participant_id}`)}
                className="text-lg font-bold text-white hover:text-orange-400 transition-colors"
              >
                {topCandidates[1].participant_name}
              </button>
              <p className="text-3xl font-black text-gray-400 mt-2">{Math.round(topCandidates[1].total_score)}%</p>
            </div>

            {/* Rank 1 - Center */}
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border-2 border-yellow-500/50 flex items-center justify-center">
                <span className="text-4xl">👑</span>
              </div>
              <button
                onClick={() => router.push(`/admin/results?assessmentId=${assessmentId}&participantId=${topCandidates[0].participant_id}`)}
                className="text-xl font-bold text-white hover:text-orange-400 transition-colors"
              >
                {topCandidates[0].participant_name}
              </button>
              <p className="text-4xl font-black text-orange-400 mt-2">{Math.round(topCandidates[0].total_score)}%</p>
            </div>

            {/* Rank 3 - Right */}
            <div className="text-center pt-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400/20 to-orange-600/20 border-2 border-orange-500/30 flex items-center justify-center">
                <span className="text-3xl">🥉</span>
              </div>
              <button
                onClick={() => router.push(`/admin/results?assessmentId=${assessmentId}&participantId=${topCandidates[2].participant_id}`)}
                className="text-lg font-bold text-white hover:text-orange-400 transition-colors"
              >
                {topCandidates[2].participant_name}
              </button>
              <p className="text-3xl font-black text-orange-600 mt-2">{Math.round(topCandidates[2].total_score)}%</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Full Leaderboard Table */}
      <motion.div 
        className="bg-black/90 border border-white/10 rounded-3xl overflow-hidden"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <div className="p-6 border-b border-white/10">
          <h3 className="text-2xl font-bold text-white">Full Leaderboard</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Candidate</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Score</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Time Taken</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {topCandidates.map((candidate, index) => (
                <motion.tr
                  key={candidate.participant_id}
                  className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <td className="px-6 py-4">
                    <span className="text-white font-bold text-lg">#{candidate.rank}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => router.push(`/admin/results?assessmentId=${assessmentId}&participantId=${candidate.participant_id}`)}
                      className="font-semibold text-white hover:text-orange-400 transition-colors text-left"
                    >
                      {candidate.participant_name}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{candidate.participant_email}</td>
                  <td className="px-6 py-4">
                    <span className="text-white font-bold text-lg">{Math.round(candidate.total_score)}%</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{candidate.time_taken_minutes || 0} min</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => router.push(`/admin/results?assessmentId=${assessmentId}&participantId=${candidate.participant_id}`)}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white font-semibold hover:shadow-lg transition-all text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

// Competency Analysis Tab - Aggregate competency gaps
const CompetencyAnalysisTab = ({ data }) => {
  if (!data || !data.results) return null;

  // Aggregate competency scores
  const competencyMap = {};
  data.results.forEach(candidate => {
    if (candidate.top_competencies) {
      candidate.top_competencies.forEach(comp => {
        if (!competencyMap[comp.name]) {
          competencyMap[comp.name] = {
            name: comp.name,
            scores: [],
            totalCandidates: 0
          };
        }
        competencyMap[comp.name].scores.push(comp.score);
        competencyMap[comp.name].totalCandidates++;
      });
    }
  });

  // Calculate average scores for each competency
  const competencies = Object.values(competencyMap).map(comp => ({
    name: comp.name,
    avgScore: comp.scores.reduce((sum, s) => sum + s, 0) / comp.scores.length,
    candidateCount: comp.totalCandidates
  })).sort((a, b) => b.avgScore - a.avgScore);

  // Identify strengths and gaps
  const strengths = competencies.filter(c => c.avgScore >= 70);
  const gaps = competencies.filter(c => c.avgScore < 70 && c.avgScore >= 50);
  const criticalGaps = competencies.filter(c => c.avgScore < 50);

  return (
    <div className="space-y-6">
      {/* Overall Competency Score */}
      <motion.div 
        className="bg-black/90 border border-white/10 rounded-3xl p-8"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-2xl font-bold text-white mb-6">Overall Competency Performance</h3>
        <div className="space-y-4">
          {competencies.map((comp, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">{comp.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">({comp.candidateCount} candidates)</span>
                  <span className="text-white font-bold">{Math.round(comp.avgScore)}%</span>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <motion.div
                  className={`h-3 rounded-full ${
                    comp.avgScore >= 70 
                      ? 'bg-gradient-to-r from-green-500 to-green-600'
                      : comp.avgScore >= 50
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                        : 'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${comp.avgScore}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                ></motion.div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <motion.div 
          className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/50 rounded-3xl p-8"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-white mb-4">✅ Strong Competencies</h3>
          <p className="text-gray-300 mb-6">Candidates perform well in these areas</p>
          <div className="flex flex-wrap gap-3">
            {strengths.map((comp, idx) => (
              <span key={idx} className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-300 rounded-full text-sm font-semibold">
                {comp.name} ({Math.round(comp.avgScore)}%)
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Gaps */}
      {gaps.length > 0 && (
        <motion.div 
          className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/50 rounded-3xl p-8"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-white mb-4">⚠️ Skill Gaps</h3>
          <p className="text-gray-300 mb-6">Candidates need improvement in these areas</p>
          <div className="flex flex-wrap gap-3">
            {gaps.map((comp, idx) => (
              <span key={idx} className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 rounded-full text-sm font-semibold">
                {comp.name} ({Math.round(comp.avgScore)}%)
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Critical Gaps */}
      {criticalGaps.length > 0 && (
        <motion.div 
          className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/50 rounded-3xl p-8"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-white mb-4">❌ Critical Gaps</h3>
          <p className="text-gray-300 mb-6">Significant improvement needed</p>
          <div className="flex flex-wrap gap-3">
            {criticalGaps.map((comp, idx) => (
              <span key={idx} className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-300 rounded-full text-sm font-semibold">
                {comp.name} ({Math.round(comp.avgScore)}%)
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Insights Tab - Areas for improvement and recommendations
const InsightsTab = ({ data }) => {
  if (!data || !data.results) return null;

  const candidates = data.results;
  const totalCandidates = candidates.length;
  
  // Calculate metrics
  const avgScore = Math.round(candidates.reduce((sum, c) => sum + c.total_score, 0) / totalCandidates);
  const highPerformers = candidates.filter(c => c.total_score >= 80).length;
  const lowPerformers = candidates.filter(c => c.total_score < 50).length;
  const passRate = Math.round((candidates.filter(c => c.total_score >= 70).length / totalCandidates) * 100);

  // Aggregate MCQ vs Code scores
  const avgMcqScore = Math.round(candidates.reduce((sum, c) => sum + (c.mcq_score || 0), 0) / totalCandidates);
  const avgCodeScore = candidates.filter(c => c.code_score > 0).length > 0
    ? Math.round(candidates.reduce((sum, c) => sum + (c.code_score || 0), 0) / candidates.filter(c => c.code_score > 0).length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-6">
        <motion.div 
          className="bg-black/90 border border-white/10 rounded-3xl p-8"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-white mb-6">📊 Performance Distribution</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">High Performers (≥80%)</span>
              <span className="text-green-400 font-bold">{highPerformers} ({Math.round((highPerformers/totalCandidates)*100)}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Pass Rate (≥70%)</span>
              <span className="text-orange-400 font-bold">{passRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Low Performers (&lt;50%)</span>
              <span className="text-red-400 font-bold">{lowPerformers} ({Math.round((lowPerformers/totalCandidates)*100)}%)</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-black/90 border border-white/10 rounded-3xl p-8"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-white mb-6">💯 Score Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Average MCQ Score</span>
              <span className="text-blue-400 font-bold">{avgMcqScore}%</span>
            </div>
            {avgCodeScore > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Average Code Score</span>
                <span className="text-green-400 font-bold">{avgCodeScore}%</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Overall Average</span>
              <span className="text-orange-400 font-bold">{avgScore}%</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recommendations */}
      <motion.div 
        className="bg-black/90 border border-orange-500/30 rounded-3xl p-8"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-2xl font-bold text-white mb-6">💡 Recommendations</h3>
        <ul className="space-y-4">
          {passRate < 50 && (
            <li className="flex items-start gap-3">
              <span className="text-red-400 text-xl">⚠️</span>
              <div>
                <p className="text-white font-semibold">Low Pass Rate Detected</p>
                <p className="text-gray-400">Consider reviewing assessment difficulty or providing additional training materials</p>
              </div>
            </li>
          )}
          {passRate >= 50 && passRate < 70 && (
            <li className="flex items-start gap-3">
              <span className="text-yellow-400 text-xl">📈</span>
              <div>
                <p className="text-white font-semibold">Moderate Pass Rate</p>
                <p className="text-gray-400">Identify specific weak areas and offer targeted training programs</p>
              </div>
            </li>
          )}
          {passRate >= 70 && (
            <li className="flex items-start gap-3">
              <span className="text-green-400 text-xl">✅</span>
              <div>
                <p className="text-white font-semibold">Good Pass Rate</p>
                <p className="text-gray-400">Candidates are well-prepared. Consider increasing difficulty for better differentiation</p>
              </div>
            </li>
          )}
          {avgMcqScore > avgCodeScore + 20 && avgCodeScore > 0 && (
            <li className="flex items-start gap-3">
              <span className="text-blue-400 text-xl">💻</span>
              <div>
                <p className="text-white font-semibold">Coding Skills Need Attention</p>
                <p className="text-gray-400">MCQ scores significantly higher than coding scores. Recommend hands-on coding practice</p>
              </div>
            </li>
          )}
          {lowPerformers > totalCandidates * 0.3 && (
            <li className="flex items-start gap-3">
              <span className="text-red-400 text-xl">🎯</span>
              <div>
                <p className="text-white font-semibold">High Number of Low Performers</p>
                <p className="text-gray-400">Consider offering remedial courses or screening improvements for future assessments</p>
              </div>
            </li>
          )}
          <li className="flex items-start gap-3">
            <span className="text-orange-400 text-xl">📚</span>
            <div>
              <p className="text-white font-semibold">Continuous Improvement</p>
              <p className="text-gray-400">Review competency gaps in the Analysis tab to design targeted training programs</p>
            </div>
          </li>
        </ul>
      </motion.div>

      {/* Action Items */}
      <motion.div 
        className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/50 rounded-3xl p-8"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <h3 className="text-2xl font-bold text-white mb-6">🚀 Suggested Actions</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-orange-400">For High Performers</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Fast-track for advanced roles</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Assign mentorship responsibilities</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Provide leadership training</span>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-orange-400">For Low Performers</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Offer personalized training plans</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Schedule 1-on-1 mentoring sessions</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Provide additional resources</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Results;
