'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/AdminLayout';
import { getAssessmentLeaderboard } from '../../api/admin';

// Custom Dropdown Component with Orange Background
const CustomDropdown = ({ label, value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-semibold text-gray-400 mb-3">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 focus:outline-none focus:border-orange-500 transition-all text-white flex items-center justify-between"
      >
        <span className={value ? 'text-white' : 'text-gray-500'}>{value || placeholder}</span>
        <svg
          className={`w-5 h-5 text-orange-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-2 w-full bg-orange-500 rounded-xl overflow-hidden border border-orange-400"
          >
            <div className="max-h-60 overflow-y-auto">
              {options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                    value === option
                      ? 'bg-orange-600 text-white'
                      : 'text-white hover:bg-orange-600'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CandidatesList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('assessmentId');
  
  const [competency, setCompetency] = useState('');
  const [scoreRange, setScoreRange] = useState('All Scores');
  const [showCompetencyModal, setShowCompetencyModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [copiedEmailId, setCopiedEmailId] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allCandidates, setAllCandidates] = useState([]);

  const scoreRangeOptions = ['All Scores', '0% - 25%', '25% - 50%', '50% - 70%', '70% - 80%', '80% - 90%', '90% - 100%'];

  // Fetch leaderboard data
  useEffect(() => {
    if (assessmentId) {
      fetchLeaderboard();
    } else {
      setError('No assessment ID provided in URL');
      setLoading(false);
    }
  }, [assessmentId]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await getAssessmentLeaderboard(assessmentId, { limit: 100 });
      setLeaderboardData(data);
      
      // Transform leaderboard data to candidate format
      const transformed = data.results.map((entry) => ({
        id: entry.participant_id,
        participantId: entry.participant_id,
        name: entry.participant_name,
        email: entry.participant_email,
        score: Math.round(entry.total_score),
        competencyMatch: entry.overall_competency_score ? Math.round(entry.overall_competency_score) : Math.round(entry.total_score),
        competencies: entry.top_competencies || [],
        rank: entry.rank
      }));
      
      setAllCandidates(transformed);
      setError(null);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load candidates data');
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const getFilteredCandidates = () => {
    let filtered = [...allCandidates];

    // Filter by competency
    if (competency && competency !== 'All Competencies') {
      filtered = filtered.filter(c => 
        c.competencies && c.competencies.some(comp => comp.name === competency)
      );
    }

    // Filter by score range
    if (scoreRange && scoreRange !== 'All Scores') {
      const rangeMatch = scoreRange.match(/(\d+)% - (\d+)%/);
      if (rangeMatch) {
        const min = parseInt(rangeMatch[1]);
        const max = parseInt(rangeMatch[2]);
        filtered = filtered.filter(c => c.score >= min && c.score <= max);
      }
    }

    return filtered;
  };

  const candidates = getFilteredCandidates();

  // Get unique competencies from all candidates
  const competencyOptions = ['All Competencies', ...new Set(
    allCandidates.flatMap(c => c.competencies ? c.competencies.map(comp => comp.name) : [])
  )];

  // Calculate stats from filtered candidates
  const avgCompetencyMatch = candidates.length > 0
    ? Math.round(candidates.reduce((sum, c) => sum + c.competencyMatch, 0) / candidates.length)
    : 0;
  const avgScore = candidates.length > 0
    ? Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length)
    : 0;
  const passRate = candidates.length > 0
    ? Math.round((candidates.filter(c => c.score >= 70).length / candidates.length) * 100)
    : 0;
  const totalCandidates = candidates.length;

  const handleCompetencyClick = (candidate) => {
    setSelectedCandidate(candidate);
    setShowCompetencyModal(true);
  };

  const handleCopyEmail = async (email, candidateId) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmailId(candidateId);
      setTimeout(() => {
        setCopiedEmailId(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Candidates">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading candidates...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Candidates">
        <div className="bg-red-500/10 border border-red-500/50 rounded-3xl p-8">
          <p className="text-white text-center">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Candidates">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-white">Candidates</h1>
        <p className="text-gray-400">Browse and filter candidates by competency and score</p>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <h2 className="text-4xl font-bold mb-8 text-orange-400">Completed Assessment - Candidates</h2>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <CustomDropdown
            label="Competency"
            value={competency}
            onChange={setCompetency}
            options={competencyOptions}
            placeholder="Select competency"
          />
          <CustomDropdown
            label="Score Range"
            value={scoreRange}
            onChange={setScoreRange}
            options={scoreRangeOptions}
            placeholder="Select score range"
          />
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <motion.div 
            className="bg-black/90 border border-white/10 rounded-2xl p-6"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-sm text-gray-400 mb-2 uppercase tracking-wide">Average Competency Match</h3>
            <p className="text-4xl font-black text-orange-400">{avgCompetencyMatch}%</p>
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
            <h3 className="text-sm text-gray-400 mb-2 uppercase tracking-wide">Total Candidates</h3>
            <p className="text-4xl font-black text-orange-400">{totalCandidates}</p>
          </motion.div>
        </div>

        {/* Candidates Table */}
        {candidates.length === 0 ? (
          <motion.div 
            className="bg-black/90 border border-white/10 rounded-3xl p-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <svg className="w-24 h-24 mx-auto mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-2xl font-bold mb-3 text-white">No candidates found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your filters to see more results</p>
            <button
              onClick={() => {
                setCompetency('All Competencies');
                setScoreRange('All Scores');
              }}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-semibold text-white hover:shadow-lg transition-all"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <motion.div 
            className="bg-black/90 border border-white/10 rounded-3xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Candidate Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Competency Match</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">View Report</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate, index) => (
                    <motion.tr
                      key={candidate.id}
                      className="border-b border-white/10 hover:bg-white/5 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => router.push(`/admin/results?assessmentId=${assessmentId}&participantId=${candidate.participantId}`)}
                          className="font-semibold text-white hover:text-orange-400 transition-colors cursor-pointer text-left"
                        >
                          {candidate.name}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <p className="text-gray-400">{candidate.email}</p>
                          <button
                            onClick={() => handleCopyEmail(candidate.email, candidate.id)}
                            className="relative p-1.5 rounded-lg hover:bg-white/10 transition-all group"
                            title="Copy email"
                          >
                            {copiedEmailId === candidate.id ? (
                              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleCompetencyClick(candidate)}
                          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity w-full"
                        >
                          <span className="text-white font-semibold min-w-[50px]">{candidate.competencyMatch}%</span>
                          <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden max-w-[150px]">
                            <motion.div
                              className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${candidate.competencyMatch}%` }}
                              transition={{ duration: 1, delay: index * 0.2 }}
                            ></motion.div>
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => router.push(`/admin/results?assessmentId=${assessmentId}&participantId=${candidate.participantId}`)}
                          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg text-white font-semibold hover:shadow-lg transition-all transform hover:scale-105"
                        >
                          View Full Report
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </main>

      {/* Competency Breakdown Modal */}
      <AnimatePresence>
        {showCompetencyModal && selectedCandidate && (
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
                <h3 className="text-2xl font-bold text-white">Competency Breakdown: {selectedCandidate.name}</h3>
                <button
                  onClick={() => setShowCompetencyModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {selectedCandidate.competencies && selectedCandidate.competencies.length > 0 ? (
                <>
                  <div className="space-y-6">
                    {selectedCandidate.competencies.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-semibold">{item.name}</span>
                          <span className="text-orange-400 font-bold">{Math.round(item.score)}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                          <motion.div
                            className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${item.score}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                          ></motion.div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Overall Score</span>
                      <span className="text-3xl font-black text-orange-400">
                        {selectedCandidate.score}%
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-400 text-center py-8">No competency data available</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default CandidatesList;

