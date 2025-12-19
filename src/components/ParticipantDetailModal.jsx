'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ParticipantDetailModal = ({ participant, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Null safety checks
  if (!participant || !participant.participant || !participant.attempt) {
    return null;
  }

  // Keyboard navigation - Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'competency', label: 'Competency Analysis', icon: '🎯' },
    { id: 'responses', label: 'Responses', icon: '📝' },
    { id: 'proctoring', label: 'Proctoring', icon: '🔒' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/90 flex items-center justify-center z-[1000] p-4 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-black/95 border border-orange-500/50 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col my-8"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-white/10">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">
                {participant.participant?.name || 'Unknown'}
              </h2>
              <p className="text-gray-400">{participant.participant?.email || 'No email'}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview' && <OverviewTab participant={participant} />}
                {activeTab === 'competency' && <CompetencyTab participant={participant} />}
                {activeTab === 'responses' && <ResponsesTab participant={participant} />}
                {activeTab === 'proctoring' && <ProctoringTab participant={participant} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Overview Tab
const OverviewTab = ({ participant }) => {
  const { participant: profile, attempt, gap_analysis } = participant;

  // Determine fit score color based on percentage
  const getFitScoreColor = (score) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const getFitScoreLabel = (score) => {
    if (score >= 85) return 'Excellent Fit';
    if (score >= 70) return 'Good Fit';
    if (score >= 50) return 'Moderate Fit';
    return 'Poor Fit';
  };

  const fitScore = gap_analysis?.overall_match;
  const fitColor = fitScore ? getFitScoreColor(fitScore) : 'gray';
  const fitLabel = fitScore ? getFitScoreLabel(fitScore) : 'N/A';

  return (
    <div className="space-y-6">
      {/* Fit Score Card - Prominently Displayed */}
      {fitScore !== undefined && (
        <div className={`bg-gradient-to-br ${
          fitColor === 'green' ? 'from-green-500/20 to-green-600/20 border-green-500/50' :
          fitColor === 'yellow' ? 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50' :
          'from-red-500/20 to-red-600/20 border-red-500/50'
        } border rounded-3xl p-8`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">🎯</span>
                <h3 className="text-3xl font-bold text-white">Fit Score</h3>
              </div>
              <p className="text-gray-300 text-sm">Match against job requirements</p>
            </div>
            <div className="text-right">
              <div className={`text-6xl font-bold ${
                fitColor === 'green' ? 'text-green-400' :
                fitColor === 'yellow' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {fitScore}%
              </div>
              <div className={`text-lg font-semibold ${
                fitColor === 'green' ? 'text-green-400' :
                fitColor === 'yellow' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {fitLabel}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
            <motion.div
              className={`h-4 rounded-full ${
                fitColor === 'green' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                fitColor === 'yellow' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                'bg-gradient-to-r from-red-500 to-red-600'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${fitScore}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>

          {/* Quick Insights */}
          {gap_analysis && (
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-green-400 text-2xl font-bold">
                  {gap_analysis.strong_skills?.length || 0}
                </div>
                <div className="text-gray-400 text-xs">Strong Skills</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-yellow-400 text-2xl font-bold">
                  {gap_analysis.skill_gaps?.length || 0}
                </div>
                <div className="text-gray-400 text-xs">Skill Gaps</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <div className="text-red-400 text-2xl font-bold">
                  {gap_analysis.critical_gaps?.length || 0}
                </div>
                <div className="text-gray-400 text-xs">Critical Gaps</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Score Card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-white mb-6">Score Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ScoreMetric label="Total Score" value={attempt.total_score} color="orange" />
          <ScoreMetric label="MCQ" value={attempt.mcq_score} color="blue" />
          <ScoreMetric label="Code" value={attempt.code_score} color="green" />
          <ScoreMetric label="Subjective" value={attempt.subjective_score} color="purple" />
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Attempt Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetadataRow label="Status" value={<StatusBadge status={attempt.status} />} />
          <MetadataRow label="Started" value={attempt.started_at ? new Date(attempt.started_at).toLocaleString() : 'N/A'} />
          <MetadataRow label="Finished" value={attempt.finished_at ? new Date(attempt.finished_at).toLocaleString() : 'Ongoing'} />
          <MetadataRow label="Time Taken" value={attempt.time_taken_minutes ? `${attempt.time_taken_minutes} minutes` : 'N/A'} />
          <MetadataRow label="IP Address" value={attempt.ip_address || 'Not recorded'} />
          <MetadataRow label="Location" value={profile.phone || 'Not provided'} />
        </div>
      </div>
    </div>
  );
};

// Competency Analysis Tab (USP FEATURE)
const CompetencyTab = ({ participant }) => {
  const { competency_scores, gap_analysis } = participant;

  return (
    <div className="space-y-6">
      {/* Gap Analysis Card - KEY USP */}
      {gap_analysis ? (
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/50 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">🎯</span>
            <div>
              <h3 className="text-2xl font-bold text-white">Gap Analysis vs Job Requirements</h3>
              <p className="text-gray-400">Compare candidate skills against job expectations</p>
            </div>
          </div>

          {/* Overall Match Score */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-lg font-semibold text-white">Overall Match</span>
              <span className="text-4xl font-bold text-orange-400">{gap_analysis.overall_match}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-6 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-6 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${gap_analysis.overall_match}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>

          {/* Competencies Breakdown */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white mb-4">Competency-by-Competency Analysis</h4>
            {gap_analysis.competencies.map((comp, idx) => (
              <GapAnalysisRow key={idx} comp={comp} />
            ))}
          </div>

          {/* Insights Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <InsightCard
              title="Strong Skills"
              items={gap_analysis.strong_skills}
              icon="✅"
              color="green"
            />
            <InsightCard
              title="Skill Gaps"
              items={gap_analysis.skill_gaps}
              icon="⚠️"
              color="yellow"
            />
            <InsightCard
              title="Critical Gaps"
              items={gap_analysis.critical_gaps}
              icon="❌"
              color="red"
            />
          </div>
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <span className="text-6xl mb-4 block">📊</span>
          <h4 className="text-xl font-bold text-white mb-2">Gap Analysis Not Available</h4>
          <p className="text-gray-400">
            Gap analysis requires the assessment to be linked to a job with defined competency requirements.
          </p>
        </div>
      )}

      {/* Competency Scores Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-xl font-bold text-white">Competency Breakdown by Question Type</h3>
        </div>
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Competency</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Category</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">MCQ</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Coding</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Subjective</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Total</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-400">Grade</th>
            </tr>
          </thead>
          <tbody>
            {competency_scores.map((score, idx) => (
              <tr key={idx} className="border-t border-white/5">
                <td className="px-6 py-4 text-white font-semibold">{score.competency_name}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                    {score.competency_category}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300">{score.mcq_marks.toFixed(1)}</td>
                <td className="px-6 py-4 text-gray-300">{score.coding_marks.toFixed(1)}</td>
                <td className="px-6 py-4 text-gray-300">{score.subjective_marks.toFixed(1)}</td>
                <td className="px-6 py-4">
                  <span className="text-orange-400 font-bold">{score.percentage.toFixed(1)}%</span>
                </td>
                <td className="px-6 py-4">
                  <GradeBadge grade={score.grade} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {competency_scores.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            No competency scores available yet.
          </div>
        )}
      </div>
    </div>
  );
};

// Gap Analysis Row
const GapAnalysisRow = ({ comp }) => {
  const gapIcons = {
    strong: '✅',
    adequate: '👍',
    gap: '⚠️',
    critical_gap: '❌'
  };

  const gapColors = {
    strong: 'text-green-400',
    adequate: 'text-blue-400',
    gap: 'text-yellow-400',
    critical_gap: 'text-red-400'
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h5 className="text-white font-bold">{comp.name}</h5>
            <span className="px-2 py-1 bg-white/10 text-gray-400 rounded text-xs">
              {comp.category}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            Required: Level {comp.required_level} {'⭐'.repeat(comp.required_level)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-400">{comp.candidate_score.toFixed(1)}%</div>
          <GradeBadge grade={comp.candidate_grade} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-gray-400 mb-1">Gap Status</div>
          <div className={`flex items-center gap-2 ${gapColors[comp.gap]}`}>
            <span className="text-2xl">{gapIcons[comp.gap]}</span>
            <span className="font-semibold capitalize">{comp.gap.replace('_', ' ')}</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Percentile Rank</div>
          <div className="text-white font-semibold">
            Top {100 - comp.percentile}%
            <span className="text-xs text-gray-400 ml-1">(Better than {comp.percentile}%)</span>
          </div>
        </div>
      </div>

      {comp.recommendations?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-xs text-gray-400 mb-2">Recommendations</div>
          <ul className="space-y-1">
            {comp.recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-orange-500">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Insight Card
const InsightCard = ({ title, items, icon, color }) => {
  const colors = {
    green: 'bg-green-500/10 border-green-500/50',
    yellow: 'bg-yellow-500/10 border-yellow-500/50',
    red: 'bg-red-500/10 border-red-500/50'
  };

  return (
    <div className={`${colors[color]} border rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{icon}</span>
        <h5 className="text-white font-bold">{title}</h5>
      </div>
      {items.length > 0 ? (
        <ul className="space-y-1">
          {items.map((item, idx) => (
            <li key={idx} className="text-sm text-gray-300 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400">None</p>
      )}
    </div>
  );
};

// Responses Tab
const ResponsesTab = ({ participant }) => {
  const { responses } = participant;

  return (
    <div className="space-y-4">
      {responses.map((response, idx) => (
        <ResponseCard key={response.id} response={response} index={idx} />
      ))}
      {responses.length === 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-gray-400">No responses recorded.</p>
        </div>
      )}
    </div>
  );
};

// Response Card
const ResponseCard = ({ response, index }) => {
  const [expanded, setExpanded] = useState(index === 0);

  // Calculate max marks from scoring or use default
  const maxMarks = response.question.content.max_marks
    || response.question.scoring?.max_marks
    || response.question.scoring?.points
    || 10;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="text-2xl font-bold text-orange-400">Q{response.question.order + 1}</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs capitalize">
                {response.question.type}
              </span>
              <span className="text-white font-semibold">
                {response.score.toFixed(1)} / {maxMarks} points
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {response.is_graded ? (
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
              Graded
            </span>
          ) : (
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
              Pending
            </span>
          )}
          <svg
            className={`w-6 h-6 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/10 p-6 bg-black/30">
          {response.question.type === 'mcq' && <MCQResponseDetail response={response} />}
          {response.question.type === 'coding' && <CodingResponseDetail response={response} />}
          {response.question.type === 'subjective' && <SubjectiveResponseDetail response={response} />}
        </div>
      )}
    </div>
  );
};

// MCQ Response Detail
const MCQResponseDetail = ({ response }) => {
  const { question, answer } = response;
  const selectedIndex = answer.selected_option;
  const correctIndex = question.content.correct_answer;

  return (
    <div className="space-y-4">
      <div>
        <h5 className="text-white font-semibold mb-2">Question</h5>
        <p className="text-gray-300">{question.content.question}</p>
      </div>
      <div>
        <h5 className="text-white font-semibold mb-2">Options</h5>
        <div className="space-y-2">
          {question.content.options.map((option, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border ${
                idx === correctIndex
                  ? 'bg-green-500/10 border-green-500/50'
                  : idx === selectedIndex
                  ? 'bg-red-500/10 border-red-500/50'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                {idx === correctIndex && <span className="text-green-400">✓</span>}
                {idx === selectedIndex && idx !== correctIndex && <span className="text-red-400">✗</span>}
                <span className="text-white">{option}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {question.content.explanation && (
        <div>
          <h5 className="text-white font-semibold mb-2">Explanation</h5>
          <p className="text-gray-300">{question.content.explanation}</p>
        </div>
      )}
    </div>
  );
};

// Coding Response Detail
const CodingResponseDetail = ({ response }) => {
  const { execution_result } = response;

  return (
    <div className="space-y-4">
      <div>
        <h5 className="text-white font-semibold mb-2">Submitted Code</h5>
        <pre className="bg-black/50 border border-white/10 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
          <code>{response.answer.code || 'No code submitted'}</code>
        </pre>
      </div>

      {execution_result && execution_result.test_case_results && (
        <div>
          <h5 className="text-white font-semibold mb-2">Test Results</h5>
          <div className="space-y-2">
            {execution_result.test_case_results.map((result, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border ${
                  result.passed
                    ? 'bg-green-500/10 border-green-500/50'
                    : 'bg-red-500/10 border-red-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">Test Case #{idx + 1}</span>
                  <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
                    {result.passed ? '✓ Passed' : '✗ Failed'}
                  </span>
                </div>
                {result.error && (
                  <div className="mt-2 text-sm text-red-400">{result.error}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Subjective Response Detail
const SubjectiveResponseDetail = ({ response }) => {
  const { video_transcript, ai_grading_metadata, video_url } = response;

  return (
    <div className="space-y-4">
      {/* Video Player */}
      {video_url && (
        <div>
          <h5 className="text-white font-semibold mb-2">Video Response</h5>
          <div className="bg-black/50 border border-white/10 rounded-lg overflow-hidden">
            <video
              controls
              className="w-full max-h-96"
              src={video_url}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {video_transcript && (
        <div>
          <h5 className="text-white font-semibold mb-2">Transcript (Whisper AI)</h5>
          <div className="bg-black/50 border border-white/10 rounded-lg p-4 text-gray-300 max-h-64 overflow-y-auto">
            {video_transcript}
          </div>
        </div>
      )}

      {ai_grading_metadata?.claude && (
        <div>
          <h5 className="text-white font-semibold mb-2">AI Feedback</h5>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-gray-300 mb-4">{ai_grading_metadata.claude.overall_feedback}</p>

            {ai_grading_metadata.claude.strengths?.length > 0 && (
              <div className="mb-4">
                <div className="text-sm text-green-400 font-semibold mb-2">Strengths</div>
                <ul className="space-y-1">
                  {ai_grading_metadata.claude.strengths.map((s, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-green-400">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {ai_grading_metadata.claude.improvements?.length > 0 && (
              <div>
                <div className="text-sm text-yellow-400 font-semibold mb-2">Areas for Improvement</div>
                <ul className="space-y-1">
                  {ai_grading_metadata.claude.improvements.map((i, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-yellow-400">→</span> {i}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {response.feedback && (
        <div>
          <h5 className="text-white font-semibold mb-2">Grader Feedback</h5>
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-gray-300">
            {response.feedback}
          </div>
        </div>
      )}
    </div>
  );
};

// Proctoring Tab
const ProctoringTab = ({ participant }) => {
  const { attempt } = participant;
  const violations = attempt.proctoring_violations || [];

  const violationCounts = {
    copy: violations.filter(v => v.type === 'copy').length,
    paste: violations.filter(v => v.type === 'paste').length,
    tab_switch: violations.filter(v => v.type === 'tab_switch').length,
    context_menu: violations.filter(v => v.type === 'context_menu').length,
    multiple_faces: violations.filter(v => v.type === 'multiple_faces').length,
    eye_tracking_away: violations.filter(v => v.type === 'eye_tracking_away').length,
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <ViolationCard label="Total Violations" value={violations.length} icon="⚠️" />
        <ViolationCard label="Tab Switches" value={violationCounts.tab_switch} icon="🔄" />
        <ViolationCard label="Copy/Paste" value={violationCounts.copy + violationCounts.paste} icon="📋" />
        <ViolationCard label="Context Menu" value={violationCounts.context_menu} icon="🖱️" />
        <ViolationCard label="Multiple Faces" value={violationCounts.multiple_faces} icon="👥" />
        <ViolationCard label="Eye Tracking" value={violationCounts.eye_tracking_away} icon="👁️" />
      </div>

      {/* Violations Timeline */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h3 className="text-xl font-bold text-white">Violations Timeline</h3>
        </div>
        <div className="p-6">
          {violations.length > 0 ? (
            <div className="space-y-3">
              {violations.map((violation, idx) => (
                <ViolationEvent key={idx} violation={violation} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <span className="text-6xl mb-4 block">✅</span>
              <p className="text-lg">No proctoring violations detected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Violation Card
const ViolationCard = ({ label, value, icon }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="text-3xl font-bold text-white">{value}</div>
  </div>
);

// Violation Event
const ViolationEvent = ({ violation }) => {
  const severityColors = {
    low: 'bg-blue-500/10 border-blue-500/50 text-blue-400',
    medium: 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400',
    high: 'bg-red-500/10 border-red-500/50 text-red-400'
  };

  // Format metadata in user-friendly way
  const formatMetadata = (metadata) => {
    if (!metadata || Object.keys(metadata).length === 0) return null;

    return (
      <div className="text-sm mt-3 pt-3 border-t border-white/10 space-y-1">
        {Object.entries(metadata).map(([key, value]) => (
          <div key={key} className="flex items-start gap-2">
            <span className="font-semibold capitalize">{key.replace('_', ' ')}:</span>
            <span className="text-gray-300">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`${severityColors[violation.severity]} border rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <span className="font-bold capitalize">{violation.type.replace('_', ' ')}</span>
          <span className="px-2 py-1 bg-white/10 rounded text-xs capitalize">{violation.severity}</span>
        </div>
        <span className="text-sm">
          {new Date(violation.timestamp).toLocaleTimeString()}
        </span>
      </div>
      {formatMetadata(violation.metadata)}
    </div>
  );
};

// Utility Components
const ScoreMetric = ({ label, value, color }) => {
  const colors = {
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/50 text-orange-400',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/50 text-blue-400',
    green: 'from-green-500/20 to-green-600/20 border-green-500/50 text-green-400',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/50 text-purple-400'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-4`}>
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className={`text-3xl font-bold ${colors[color].split(' ')[2]}`}>{value}</div>
    </div>
  );
};

const MetadataRow = ({ label, value }) => (
  <div>
    <div className="text-sm text-gray-400 mb-1">{label}</div>
    <div className="text-white font-semibold">{value}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const colors = {
    graded: 'bg-green-500/20 text-green-400',
    grading: 'bg-yellow-500/20 text-yellow-400',
    submitted: 'bg-blue-500/20 text-blue-400',
    ongoing: 'bg-purple-500/20 text-purple-400'
  };

  return (
    <span className={`px-3 py-1 ${colors[status] || 'bg-gray-500/20 text-gray-400'} rounded-full text-sm capitalize`}>
      {status}
    </span>
  );
};

const GradeBadge = ({ grade }) => {
  const colors = {
    'A+': 'bg-green-500/20 text-green-400',
    'A': 'bg-green-500/20 text-green-400',
    'B': 'bg-blue-500/20 text-blue-400',
    'C': 'bg-yellow-500/20 text-yellow-400',
    'D': 'bg-orange-500/20 text-orange-400',
    'F': 'bg-red-500/20 text-red-400'
  };

  return (
    <span className={`px-3 py-1 ${colors[grade] || 'bg-gray-500/20 text-gray-400'} rounded-full text-sm font-bold`}>
      {grade}
    </span>
  );
};

export default ParticipantDetailModal;
