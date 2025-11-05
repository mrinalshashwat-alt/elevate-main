'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [competency, setCompetency] = useState('');
  const [scoreRange, setScoreRange] = useState('70% - 100%');
  const [location, setLocation] = useState('All locations');
  const [showCompetencyModal, setShowCompetencyModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const competencyOptions = ['All Competencies', 'Frontend Development', 'Backend Development', 'Full Stack', 'Data Analysis', 'Product Management'];
  const scoreRangeOptions = ['All Scores', '0% - 25%', '25% - 50%', '50% - 70%', '70% - 80%', '80% - 90%', '90% - 100%'];
  const locationOptions = ['All locations', 'San Francisco, CA', 'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Remote'];

  const allCandidates = [
    {
      id: 1,
      name: 'Ava Thompson',
      email: 'ava.thompson@example.com',
      score: 88,
      competencyMatch: 82,
      location: 'San Francisco, CA',
      competency: 'Product Management'
    },
    {
      id: 2,
      name: 'Liam Patel',
      email: 'liam.patel@example.com',
      score: 74,
      competencyMatch: 68,
      location: 'New York, NY',
      competency: 'Backend Development'
    },
    {
      id: 3,
      name: 'Sophia Nguyen',
      email: 'sophia.nguyen@example.com',
      score: 92,
      competencyMatch: 90,
      location: 'Los Angeles, CA',
      competency: 'Frontend Development'
    },
    {
      id: 4,
      name: 'Ethan Garcia',
      email: 'ethan.garcia@example.com',
      score: 61,
      competencyMatch: 74,
      location: 'Remote',
      competency: 'Full Stack'
    },
    {
      id: 5,
      name: 'Emma Wilson',
      email: 'emma.wilson@example.com',
      score: 85,
      competencyMatch: 88,
      location: 'Chicago, IL',
      competency: 'Data Analysis'
    },
    {
      id: 6,
      name: 'Noah Martinez',
      email: 'noah.martinez@example.com',
      score: 79,
      competencyMatch: 75,
      location: 'San Francisco, CA',
      competency: 'Full Stack'
    },
    {
      id: 7,
      name: 'Olivia Brown',
      email: 'olivia.brown@example.com',
      score: 95,
      competencyMatch: 92,
      location: 'New York, NY',
      competency: 'Frontend Development'
    },
    {
      id: 8,
      name: 'James Anderson',
      email: 'james.anderson@example.com',
      score: 67,
      competencyMatch: 71,
      location: 'Remote',
      competency: 'Backend Development'
    },
    {
      id: 9,
      name: 'Isabella Lee',
      email: 'isabella.lee@example.com',
      score: 83,
      competencyMatch: 79,
      location: 'Los Angeles, CA',
      competency: 'Product Management'
    },
    {
      id: 10,
      name: 'Mason Taylor',
      email: 'mason.taylor@example.com',
      score: 72,
      competencyMatch: 69,
      location: 'Chicago, IL',
      competency: 'Data Analysis'
    }
  ];

  // Filter logic
  const getFilteredCandidates = () => {
    let filtered = [...allCandidates];

    // Filter by competency
    if (competency && competency !== 'All Competencies') {
      filtered = filtered.filter(c => c.competency === competency);
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

    // Filter by location
    if (location && location !== 'All locations') {
      filtered = filtered.filter(c => c.location === location);
    }

    return filtered;
  };

  const candidates = getFilteredCandidates();

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

  // Mock competency breakdown data for different roles
  const getCompetencyBreakdown = (role) => {
    const breakdowns = {
      'Product Management': [
        { name: 'Strategic Thinking', score: 85 },
        { name: 'Product Vision', score: 88 },
        { name: 'Stakeholder Management', score: 82 },
        { name: 'Data Analysis', score: 79 },
        { name: 'User Research', score: 80 },
      ],
      'Frontend Development': [
        { name: 'React/JavaScript', score: 92 },
        { name: 'CSS/Design Systems', score: 88 },
        { name: 'Performance Optimization', score: 85 },
        { name: 'Testing', score: 90 },
        { name: 'API Integration', score: 87 },
      ],
      'Backend Development': [
        { name: 'API Design', score: 74 },
        { name: 'Database Management', score: 71 },
        { name: 'System Architecture', score: 68 },
        { name: 'Security', score: 72 },
        { name: 'Scalability', score: 69 },
      ],
      'Full Stack': [
        { name: 'Frontend Skills', score: 74 },
        { name: 'Backend Skills', score: 75 },
        { name: 'Full Stack Integration', score: 76 },
        { name: 'DevOps', score: 73 },
        { name: 'Problem Solving', score: 77 },
      ],
      'Data Analysis': [
        { name: 'SQL', score: 88 },
        { name: 'Data Visualization', score: 85 },
        { name: 'Statistical Analysis', score: 90 },
        { name: 'Python/R', score: 87 },
        { name: 'Business Intelligence', score: 89 },
      ],
    };
    return breakdowns[role] || [
      { name: 'Technical Skills', score: 75 },
      { name: 'Communication', score: 78 },
      { name: 'Problem Solving', score: 80 },
      { name: 'Team Collaboration', score: 76 },
      { name: 'Leadership', score: 72 },
    ];
  };

  const handleCompetencyClick = (role) => {
    setSelectedRole(role);
    setShowCompetencyModal(true);
  };

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Candidates</h1>
          </div>
          <div className="w-40"></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <h2 className="text-4xl font-bold mb-8 text-orange-400">Completed Assessment - Candidates</h2>

        {/* Filters */}
        <div className="grid grid-cols-3 gap-6 mb-8">
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
          <CustomDropdown
            label="Location (optional)"
            value={location}
            onChange={setLocation}
            options={locationOptions}
            placeholder="Select location"
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
                setCompetency('');
                setScoreRange('70% - 100%');
                setLocation('All locations');
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
                          onClick={() => router.push(`/admin/results?candidateId=${candidate.id}&tab=profile`)}
                          className="font-semibold text-white hover:text-orange-400 transition-colors cursor-pointer text-left"
                        >
                          {candidate.name}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-400">{candidate.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleCompetencyClick(candidate.competency)}
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
                          onClick={() => router.push('/admin/results?tab=report')}
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
        {showCompetencyModal && selectedRole && (
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
                <h3 className="text-2xl font-bold text-white">Competency Breakdown: {selectedRole}</h3>
                <button
                  onClick={() => setShowCompetencyModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {getCompetencyBreakdown(selectedRole).map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">{item.name}</span>
                      <span className="text-orange-400 font-bold">{item.score}%</span>
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
                  <span className="text-gray-400">Overall Match Score</span>
                  <span className="text-3xl font-black text-orange-400">
                    {Math.round(getCompetencyBreakdown(selectedRole).reduce((sum, item) => sum + item.score, 0) / getCompetencyBreakdown(selectedRole).length)}%
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CandidatesList;

