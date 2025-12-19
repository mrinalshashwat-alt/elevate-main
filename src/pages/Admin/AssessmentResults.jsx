'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/AdminLayout';
import { getAssessmentLeaderboard, getParticipantDetail } from '../../api/admin';
import ParticipantDetailModal from '../../components/ParticipantDetailModal';

const AssessmentResults = () => {
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('id');
  const assessmentName = searchParams.get('name') || 'Assessment Results';

  const [activeTab, setActiveTab] = useState('leaderboard');
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingParticipant, setLoadingParticipant] = useState(false);

  // Fetch leaderboard data with useCallback to fix ESLint warning
  const fetchLeaderboard = useCallback(async () => {
    if (!assessmentId) {
      setError('No assessment ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getAssessmentLeaderboard(assessmentId, { limit: 100 });
      setLeaderboardData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleViewParticipant = async (participantId) => {
    try {
      setLoadingParticipant(true);
      const detail = await getParticipantDetail(assessmentId, participantId);
      setSelectedParticipant(detail);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error fetching participant detail:', err);
      setError('Failed to load participant details');
    } finally {
      setLoadingParticipant(false);
    }
  };

  const handleExportCSV = () => {
    if (!leaderboardData || !leaderboardData.results) {
      return;
    }

    const results = leaderboardData.results;

    // CSV headers
    const headers = [
      'Rank',
      'Name',
      'Email',
      'Total Score',
      'MCQ Score',
      'Code Score',
      'Subjective Score',
      'Time Taken (minutes)',
      'Top Competencies'
    ];

    // Convert data to CSV rows
    const rows = results.map(entry => [
      entry.rank,
      entry.participant_name,
      entry.email,
      entry.total_score,
      entry.mcq_score,
      entry.code_score,
      entry.subjective_score,
      entry.time_taken_minutes,
      entry.top_competencies?.join('; ') || ''
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Escape cells that contain commas or quotes
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${assessmentName.replace(/[^a-z0-9]/gi, '_')}_results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'participants', label: 'All Participants', icon: '👥' },
  ];

  return (
    <AdminLayout
      title={assessmentName}
      breadcrumbs={[
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Assessments', path: '/admin/assessment-list' },
        { label: 'Results' }
      ]}
    >
      {/* Statistics Summary */}
      {leaderboardData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Participants"
            value={leaderboardData.count || 0}
            icon="👥"
          />
          <StatCard
            label="Average Score"
            value={calculateAverageScore(leaderboardData.results)}
            icon="📊"
            suffix="%"
          />
          <StatCard
            label="Pass Rate"
            value={calculatePassRate(leaderboardData.results)}
            icon="✅"
            suffix="%"
          />
          <StatCard
            label="Completed"
            value={leaderboardData.results?.length || 0}
            icon="🎯"
          />
        </div>
      )}

      {/* Tab Navigation and Actions */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                  : 'bg-black border border-orange-500/50 text-white'
              }`}
              whileHover={{ scale: activeTab === tab.id ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Export CSV Button */}
        {leaderboardData && leaderboardData.results?.length > 0 && (
          <motion.button
            onClick={handleExportCSV}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>📥</span>
            Export CSV
          </motion.button>
        )}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchLeaderboard} />
        ) : (
          <>
            {activeTab === 'leaderboard' && (
              <LeaderboardTab
                data={leaderboardData?.results || []}
                onViewDetail={handleViewParticipant}
              />
            )}
            {activeTab === 'participants' && (
              <ParticipantsTab
                data={leaderboardData?.results || []}
                onViewDetail={handleViewParticipant}
              />
            )}
          </>
        )}
      </motion.div>

      {/* Participant Detail Modal */}
      {showDetailModal && selectedParticipant && (
        <ParticipantDetailModal
          participant={selectedParticipant}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {/* Loading Overlay for Participant Detail */}
      {loadingParticipant && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999]">
          <div className="bg-black/90 border border-orange-500/50 rounded-2xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mb-4"></div>
            <p className="text-white text-lg">Loading participant details...</p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

// Helper functions
const calculateAverageScore = (results) => {
  if (!results || results.length === 0) return 0;
  const sum = results.reduce((acc, r) => acc + r.total_score, 0);
  return Math.round(sum / results.length);
};

const calculatePassRate = (results) => {
  if (!results || results.length === 0) return 0;
  const passed = results.filter(r => r.total_score >= 50).length;
  return Math.round((passed / results.length) * 100);
};

// Stat Card Component
const StatCard = ({ label, value, icon, suffix = '' }) => (
  <motion.div
    className="bg-black/90 border border-white/10 rounded-2xl p-6"
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2 }}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="text-3xl font-bold text-white">
      {value}{suffix}
    </div>
  </motion.div>
);

// Loading State
const LoadingState = () => (
  <div className="bg-black/90 border border-white/10 rounded-3xl p-12 text-center">
    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mb-4"></div>
    <p className="text-white text-lg">Loading results...</p>
  </div>
);

// Error State
const ErrorState = ({ message, onRetry }) => (
  <div className="bg-black/90 border border-red-500/50 rounded-3xl p-12 text-center">
    <div className="text-red-500 text-6xl mb-4">⚠️</div>
    <h3 className="text-white text-xl font-bold mb-2">Error Loading Data</h3>
    <p className="text-gray-400 mb-6">{message}</p>
    <button
      onClick={onRetry}
      className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
    >
      Retry
    </button>
  </div>
);

// Leaderboard Tab
const LeaderboardTab = ({ data, onViewDetail }) => {
  const topThree = data.slice(0, 3);
  const restOfLeaders = data.slice(3);

  return (
    <div className="space-y-6">
      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {topThree.map((entry, idx) => (
            <TopPerformerCard
              key={entry.participant_id}
              entry={entry}
              position={idx + 1}
              onViewDetail={onViewDetail}
            />
          ))}
        </div>
      )}

      {/* Rest of Leaderboard */}
      {restOfLeaders.length > 0 && (
        <div className="bg-black/90 border border-white/10 rounded-3xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Rank</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Participant</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Total Score</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">MCQ</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Code</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Subjective</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {restOfLeaders.map((entry) => (
                <LeaderboardRow
                  key={entry.participant_id}
                  entry={entry}
                  onViewDetail={onViewDetail}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.length === 0 && (
        <div className="bg-black/90 border border-white/10 rounded-3xl p-12 text-center">
          <p className="text-gray-400 text-lg">No participants have completed this assessment yet.</p>
        </div>
      )}
    </div>
  );
};

// Top Performer Card
const TopPerformerCard = ({ entry, position, onViewDetail }) => {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
  const colors = {
    1: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50',
    2: 'from-gray-400/20 to-gray-500/20 border-gray-400/50',
    3: 'from-orange-700/20 to-orange-800/20 border-orange-700/50'
  };

  return (
    <motion.div
      className={`bg-gradient-to-br ${colors[position]} border rounded-3xl p-6 text-center cursor-pointer`}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={() => onViewDetail(entry.participant_id)}
    >
      <div className="text-6xl mb-4">{medals[position]}</div>
      <div className="text-5xl font-bold text-white mb-2">{entry.rank}</div>
      <h3 className="text-xl font-bold text-white mb-1">{entry.participant_name}</h3>
      <p className="text-gray-400 text-sm mb-4">{entry.email}</p>
      <div className="text-4xl font-bold text-orange-400 mb-4">{entry.total_score}</div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-gray-400">MCQ</div>
          <div className="text-white font-bold">{entry.mcq_score}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-gray-400">Code</div>
          <div className="text-white font-bold">{entry.code_score}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2">
          <div className="text-gray-400">Subj.</div>
          <div className="text-white font-bold">{entry.subjective_score}</div>
        </div>
      </div>
      {entry.top_competencies?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-xs text-gray-400 mb-2">Top Skills</div>
          <div className="flex flex-wrap gap-1 justify-center">
            {entry.top_competencies.slice(0, 3).map((comp, idx) => (
              <span key={idx} className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">
                {comp.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Leaderboard Row
const LeaderboardRow = ({ entry, onViewDetail }) => (
  <motion.tr
    className="border-t border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
    onClick={() => onViewDetail(entry.participant_id)}
  >
    <td className="px-6 py-4">
      <span className="text-white font-bold text-lg">#{entry.rank}</span>
    </td>
    <td className="px-6 py-4">
      <div>
        <div className="text-white font-semibold">{entry.participant_name}</div>
        <div className="text-gray-400 text-sm">{entry.email}</div>
      </div>
    </td>
    <td className="px-6 py-4">
      <span className="text-orange-400 font-bold text-lg">{entry.total_score}</span>
    </td>
    <td className="px-6 py-4 text-white">{entry.mcq_score}</td>
    <td className="px-6 py-4 text-white">{entry.code_score}</td>
    <td className="px-6 py-4 text-white">{entry.subjective_score}</td>
    <td className="px-6 py-4 text-gray-400">{entry.time_taken_minutes} min</td>
    <td className="px-6 py-4">
      <button
        className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-semibold hover:bg-orange-500/30 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onViewDetail(entry.participant_id);
        }}
      >
        View Details
      </button>
    </td>
  </motion.tr>
);

// Participants Tab with Filtering
const ParticipantsTab = ({ data, onViewDetail }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreRange, setScoreRange] = useState({ min: 0, max: 100 });
  const [codeScoreRange, setCodeScoreRange] = useState({ min: 0, max: 100 });
  const [sortBy, setSortBy] = useState('rank');
  const [sortOrder, setSortOrder] = useState('asc');

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = data.filter(entry => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' ||
        entry.participant_name.toLowerCase().includes(searchLower) ||
        entry.email.toLowerCase().includes(searchLower);

      // Score range filter
      const matchesScoreRange = entry.total_score >= scoreRange.min && entry.total_score <= scoreRange.max;

      // Code score range filter
      const matchesCodeScore = entry.code_score >= codeScoreRange.min && entry.code_score <= codeScoreRange.max;

      return matchesSearch && matchesScoreRange && matchesCodeScore;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch(sortBy) {
        case 'name':
          aVal = a.participant_name.toLowerCase();
          bVal = b.participant_name.toLowerCase();
          return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        case 'total_score':
          aVal = a.total_score;
          bVal = b.total_score;
          break;
        case 'code_score':
          aVal = a.code_score;
          bVal = b.code_score;
          break;
        case 'time':
          aVal = a.time_taken_minutes;
          bVal = b.time_taken_minutes;
          break;
        default: // rank
          aVal = a.rank;
          bVal = b.rank;
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [data, searchTerm, scoreRange, codeScoreRange, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setScoreRange({ min: 0, max: 100 });
    setCodeScoreRange({ min: 0, max: 100 });
    setSortBy('rank');
    setSortOrder('asc');
  };

  return (
    <div className="bg-black/90 border border-white/10 rounded-3xl overflow-hidden">
      {/* Header with Filters */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">All Participants ({filteredData.length} of {data.length})</h3>
          {(searchTerm || scoreRange.min > 0 || scoreRange.max < 100 || codeScoreRange.min > 0 || codeScoreRange.max < 100) && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-semibold hover:bg-orange-500/30 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Search by Name/Email</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search..."
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>

          {/* Total Score Range */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Total Score: {scoreRange.min}% - {scoreRange.max}%
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={scoreRange.min}
                onChange={(e) => setScoreRange({ ...scoreRange, min: parseInt(e.target.value) || 0 })}
                className="w-20 px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500/50"
              />
              <span className="text-gray-400">to</span>
              <input
                type="number"
                min="0"
                max="100"
                value={scoreRange.max}
                onChange={(e) => setScoreRange({ ...scoreRange, max: parseInt(e.target.value) || 100 })}
                className="w-20 px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500/50"
              />
            </div>
          </div>

          {/* Code Score Range */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              Code Score: {codeScoreRange.min}% - {codeScoreRange.max}%
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={codeScoreRange.min}
                onChange={(e) => setCodeScoreRange({ ...codeScoreRange, min: parseInt(e.target.value) || 0 })}
                className="w-20 px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500/50"
              />
              <span className="text-gray-400">to</span>
              <input
                type="number"
                min="0"
                max="100"
                value={codeScoreRange.max}
                onChange={(e) => setCodeScoreRange({ ...codeScoreRange, max: parseInt(e.target.value) || 100 })}
                className="w-20 px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead className="bg-white/5">
          <tr>
            <th
              className="px-6 py-4 text-left text-sm font-semibold text-gray-400 cursor-pointer hover:text-orange-400 transition-colors"
              onClick={() => handleSort('rank')}
            >
              Rank {sortBy === 'rank' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th
              className="px-6 py-4 text-left text-sm font-semibold text-gray-400 cursor-pointer hover:text-orange-400 transition-colors"
              onClick={() => handleSort('name')}
            >
              Participant {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th
              className="px-6 py-4 text-left text-sm font-semibold text-gray-400 cursor-pointer hover:text-orange-400 transition-colors"
              onClick={() => handleSort('total_score')}
            >
              Total Score {sortBy === 'total_score' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">MCQ</th>
            <th
              className="px-6 py-4 text-left text-sm font-semibold text-gray-400 cursor-pointer hover:text-orange-400 transition-colors"
              onClick={() => handleSort('code_score')}
            >
              Code {sortBy === 'code_score' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Subjective</th>
            <th
              className="px-6 py-4 text-left text-sm font-semibold text-gray-400 cursor-pointer hover:text-orange-400 transition-colors"
              onClick={() => handleSort('time')}
            >
              Time {sortBy === 'time' && (sortOrder === 'asc' ? '↑' : '↓')}
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((entry) => (
            <LeaderboardRow
              key={entry.participant_id}
              entry={entry}
              onViewDetail={onViewDetail}
            />
          ))}
        </tbody>
      </table>
      {filteredData.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-gray-400 text-lg">
            {data.length === 0 ? 'No participants found.' : 'No participants match the current filters.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AssessmentResults;
