'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSave, FiArrowLeft, FiPlus, FiTrash2, FiCpu,
  FiFileText, FiCode, FiVideo, FiCheckCircle, FiClock, FiSettings,
  FiChevronDown, FiCopy, FiBriefcase, FiLink, FiRefreshCw
} from 'react-icons/fi';
import {
  getAssessment,
  patchAssessment,
  publishAssessment,
  getAssessmentQuestions,
  createQuestion,
  deleteQuestion,
  getQuestionTemplates,
  addTemplateToAssessment,
  getJobs,
  addAssessmentCompetency,
  removeAssessmentCompetency,
  syncJobCompetencies,
  syncRoleCompetencies,
} from '../../api/admin';
import AdminLayout from '../../components/AdminLayout';
import JobTitleSearch from '../../components/JobTitleSearch';
import CompetencySelector from '../../components/CompetencySelector';

// Difficulty options
const DIFFICULTY_OPTIONS = [
  { value: 1, label: 'Very Easy' },
  { value: 2, label: 'Easy' },
  { value: 3, label: 'Medium' },
  { value: 4, label: 'Hard' },
  { value: 5, label: 'Very Hard' },
];

// Reusable glass select component
const GlassSelect = ({ value, onChange, options, placeholder = 'Select', className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  
  const selected = options.find((o) => o.value === value);
  
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/60 text-gray-300 flex items-center justify-between"
      >
        <span className={selected ? 'text-gray-200' : 'text-gray-500'}>{selected ? selected.label : placeholder}</span>
        <FiChevronDown className={`w-4 h-4 text-orange-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl overflow-hidden border border-orange-500/30 backdrop-blur-md bg-black/90">
          <div className="max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${value === opt.value ? 'bg-orange-500/20 text-white' : 'text-gray-200 hover:bg-white/10'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Question type icon component
const QuestionTypeIcon = ({ type, className = "w-5 h-5" }) => {
  switch (type) {
    case 'mcq': return <FiCheckCircle className={className} />;
    case 'coding': return <FiCode className={className} />;
    case 'subjective': return <FiFileText className={className} />;
    case 'video': return <FiVideo className={className} />;
    default: return <FiFileText className={className} />;
  }
};

// Loading animation for AI generation
const AIGeneratingOverlay = ({ isVisible, questionCount }) => {
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100]"
    >
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-6">
          <motion.div
            className="absolute inset-0 border-4 border-purple-500/30 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 border-4 border-t-purple-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-4 border-4 border-blue-500/50 rounded-full"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <FiCpu className="absolute inset-0 m-auto w-12 h-12 text-purple-400" />
        </div>
        <motion.h3
          className="text-2xl font-bold text-white mb-2"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Generating {questionCount} Questions...
        </motion.h3>
        <p className="text-gray-400">Our AI is crafting personalized questions for your assessment</p>
        <div className="flex justify-center gap-1 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-purple-500 rounded-full"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Intuitive Bulk Generation Modal
const BulkGenerationModal = ({ 
  isOpen, 
  onClose, 
  onGenerate, 
  selectedJobTitleId, 
  selectedJobId, 
  selectedCompetencies 
}) => {
  // Question type toggles
  const [enabledTypes, setEnabledTypes] = useState({
    mcq: true,
    coding: true,
    video: false,
    essay: false,
    case_study: false,
  });
  
  // MCQ / Aptitude config (with difficulty distribution)
  const [mcqConfig, setMcqConfig] = useState({
    total: 10,
    distribution: {
      very_easy: 1,
      easy: 2,
      medium: 4,
      hard: 2,
      very_hard: 1,
    }
  });
  
  // Coding config (DSA only with difficulty)
  const [codingConfig, setCodingConfig] = useState({
    easy: 1,
    medium: 1,
    hard: 0,
  });
  
  // Subjective types (no difficulty)
  const [videoCount, setVideoCount] = useState(2);
  const [essayCount, setEssayCount] = useState(1);
  const [caseStudyCount, setCaseStudyCount] = useState(1);
  
  // Preset handlers for MCQ
  const applyMcqPreset = (preset) => {
    const total = mcqConfig.total;
    let distribution;
    
    switch (preset) {
      case 'balanced':
        distribution = {
          very_easy: Math.round(total * 0.1),
          easy: Math.round(total * 0.2),
          medium: Math.round(total * 0.4),
          hard: Math.round(total * 0.2),
          very_hard: Math.round(total * 0.1),
        };
        break;
      case 'easy':
        distribution = {
          very_easy: Math.round(total * 0.2),
          easy: Math.round(total * 0.4),
          medium: Math.round(total * 0.3),
          hard: Math.round(total * 0.1),
          very_hard: 0,
        };
        break;
      case 'hard':
        distribution = {
          very_easy: 0,
          easy: Math.round(total * 0.1),
          medium: Math.round(total * 0.3),
          hard: Math.round(total * 0.4),
          very_hard: Math.round(total * 0.2),
        };
        break;
      default:
        return;
    }
    
    // Adjust to match total exactly
    const sum = Object.values(distribution).reduce((a, b) => a + b, 0);
    if (sum !== total) {
      distribution.medium += (total - sum);
    }
    
    setMcqConfig({ ...mcqConfig, distribution });
  };
  
  // Update MCQ total and redistribute
  const updateMcqTotal = (newTotal) => {
    const oldTotal = mcqConfig.total;
    if (oldTotal === 0) {
      setMcqConfig({
        total: newTotal,
        distribution: {
          very_easy: Math.round(newTotal * 0.1),
          easy: Math.round(newTotal * 0.2),
          medium: Math.round(newTotal * 0.4),
          hard: Math.round(newTotal * 0.2),
          very_hard: Math.round(newTotal * 0.1),
        }
      });
      return;
    }
    
    const ratio = newTotal / oldTotal;
    const newDistribution = {};
    let sum = 0;
    
    Object.keys(mcqConfig.distribution).forEach((key, index, arr) => {
      if (index === arr.length - 1) {
        // Last item gets the remainder
        newDistribution[key] = Math.max(0, newTotal - sum);
      } else {
        newDistribution[key] = Math.max(0, Math.round(mcqConfig.distribution[key] * ratio));
        sum += newDistribution[key];
      }
    });
    
    setMcqConfig({ total: newTotal, distribution: newDistribution });
  };
  
  // Calculate totals
  const getTotalQuestions = () => {
    let total = 0;
    if (enabledTypes.mcq) total += mcqConfig.total;
    if (enabledTypes.coding) total += codingConfig.easy + codingConfig.medium + codingConfig.hard;
    if (enabledTypes.video) total += videoCount;
    if (enabledTypes.essay) total += essayCount;
    if (enabledTypes.case_study) total += caseStudyCount;
    return total;
  };
  
  const getMcqDistributionSum = () => {
    return Object.values(mcqConfig.distribution).reduce((a, b) => a + b, 0);
  };
  
  const handleGenerate = () => {
    const config = {
      mcq: enabledTypes.mcq ? {
        enabled: true,
        distribution: mcqConfig.distribution
      } : { enabled: false },
      coding: enabledTypes.coding ? {
        enabled: true,
        easy: codingConfig.easy,
        medium: codingConfig.medium,
        hard: codingConfig.hard,
      } : { enabled: false },
      video: enabledTypes.video ? { enabled: true, count: videoCount } : { enabled: false },
      essay: enabledTypes.essay ? { enabled: true, count: essayCount } : { enabled: false },
      case_study: enabledTypes.case_study ? { enabled: true, count: caseStudyCount } : { enabled: false },
    };
    
    onGenerate(config);
  };
  
  if (!isOpen) return null;
  
  const canGenerate = (selectedJobTitleId || selectedJobId) && selectedCompetencies.length > 0 && getTotalQuestions() > 0;
  const mcqDistributionValid = getMcqDistributionSum() === mcqConfig.total;
  
  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <FiCpu className="w-6 h-6 text-purple-400" />
              AI Question Generator
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Configure the types and difficulty of questions you want to generate
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-400">{getTotalQuestions()}</div>
            <div className="text-xs text-gray-500">Total Questions</div>
          </div>
        </div>
        
        {/* Warnings */}
        {(!selectedJobTitleId && !selectedJobId) && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-4 text-yellow-400 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>Select a Role or Job in the Details tab first</span>
          </div>
        )}
        {selectedCompetencies.length === 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-4 text-yellow-400 text-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>Sync competencies first to generate relevant questions</span>
          </div>
        )}
        
        <div className="space-y-4">
          {/* MCQ / Aptitude Section */}
          <div className={`rounded-xl border transition-all ${enabledTypes.mcq ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 border-white/10'}`}>
            <div 
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => setEnabledTypes({ ...enabledTypes, mcq: !enabledTypes.mcq })}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${enabledTypes.mcq ? 'bg-green-500/20' : 'bg-white/10'}`}>
                  <FiCheckCircle className={`w-5 h-5 ${enabledTypes.mcq ? 'text-green-400' : 'text-gray-500'}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-white">MCQ / Aptitude</h4>
                  <p className="text-xs text-gray-400">Multiple choice questions with difficulty levels</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors ${enabledTypes.mcq ? 'bg-green-500' : 'bg-gray-600'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform mt-0.5 ${enabledTypes.mcq ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </div>
            </div>
            
            {enabledTypes.mcq && (
              <div className="px-4 pb-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-300 mb-1">Total MCQs</label>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={mcqConfig.total}
                      onChange={(e) => updateMcqTotal(parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                  <div className="flex gap-2 pt-6">
                    <button
                      onClick={() => applyMcqPreset('easy')}
                      className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-green-400 text-xs"
                    >
                      Easy Heavy
                    </button>
                    <button
                      onClick={() => applyMcqPreset('balanced')}
                      className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-blue-400 text-xs"
                    >
                      Balanced
                    </button>
                    <button
                      onClick={() => applyMcqPreset('hard')}
                      className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 text-xs"
                    >
                      Hard Heavy
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Difficulty Distribution 
                    {!mcqDistributionValid && (
                      <span className="text-red-400 ml-2">(Sum: {getMcqDistributionSum()}, should be {mcqConfig.total})</span>
                    )}
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { key: 'very_easy', label: 'V.Easy', color: 'emerald' },
                      { key: 'easy', label: 'Easy', color: 'green' },
                      { key: 'medium', label: 'Medium', color: 'yellow' },
                      { key: 'hard', label: 'Hard', color: 'orange' },
                      { key: 'very_hard', label: 'V.Hard', color: 'red' },
                    ].map(({ key, label, color }) => (
                      <div key={key} className="text-center">
                        <input
                          type="number"
                          min={0}
                          max={mcqConfig.total}
                          value={mcqConfig.distribution[key]}
                          onChange={(e) => setMcqConfig({
                            ...mcqConfig,
                            distribution: {
                              ...mcqConfig.distribution,
                              [key]: parseInt(e.target.value) || 0
                            }
                          })}
                          className={`w-full px-2 py-2 bg-${color}-500/10 border border-${color}-500/30 rounded-lg text-white text-center`}
                          style={{ 
                            backgroundColor: `rgba(${color === 'emerald' ? '16,185,129' : color === 'green' ? '34,197,94' : color === 'yellow' ? '234,179,8' : color === 'orange' ? '249,115,22' : '239,68,68'}, 0.1)`,
                            borderColor: `rgba(${color === 'emerald' ? '16,185,129' : color === 'green' ? '34,197,94' : color === 'yellow' ? '234,179,8' : color === 'orange' ? '249,115,22' : '239,68,68'}, 0.3)`
                          }}
                        />
                        <span className="text-xs text-gray-400 mt-1 block">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Coding Section (DSA Only) */}
          <div className={`rounded-xl border transition-all ${enabledTypes.coding ? 'bg-blue-500/10 border-blue-500/30' : 'bg-white/5 border-white/10'}`}>
            <div 
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => setEnabledTypes({ ...enabledTypes, coding: !enabledTypes.coding })}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${enabledTypes.coding ? 'bg-blue-500/20' : 'bg-white/10'}`}>
                  <FiCode className={`w-5 h-5 ${enabledTypes.coding ? 'text-blue-400' : 'text-gray-500'}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Coding (DSA/Algorithms)</h4>
                  <p className="text-xs text-gray-400">Data structures & algorithms problems (Judge0 sandbox)</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors ${enabledTypes.coding ? 'bg-blue-500' : 'bg-gray-600'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform mt-0.5 ${enabledTypes.coding ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </div>
            </div>
            
            {enabledTypes.coding && (
              <div className="px-4 pb-4">
                <label className="block text-sm text-gray-300 mb-2">Questions per Difficulty</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'easy', label: 'Easy', color: 'green' },
                    { key: 'medium', label: 'Medium', color: 'yellow' },
                    { key: 'hard', label: 'Hard', color: 'red' },
                  ].map(({ key, label, color }) => (
                    <div key={key}>
                      <input
                        type="number"
                        min={0}
                        max={5}
                        value={codingConfig[key]}
                        onChange={(e) => setCodingConfig({
                          ...codingConfig,
                          [key]: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white text-center"
                      />
                      <span className={`text-xs text-${color}-400 mt-1 block text-center`}>{label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Total: {codingConfig.easy + codingConfig.medium + codingConfig.hard} coding questions
                </p>
              </div>
            )}
          </div>
          
          {/* Video Questions */}
          <div className={`rounded-xl border transition-all ${enabledTypes.video ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/5 border-white/10'}`}>
            <div 
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => setEnabledTypes({ ...enabledTypes, video: !enabledTypes.video })}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${enabledTypes.video ? 'bg-purple-500/20' : 'bg-white/10'}`}>
                  <FiVideo className={`w-5 h-5 ${enabledTypes.video ? 'text-purple-400' : 'text-gray-500'}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Video Questions</h4>
                  <p className="text-xs text-gray-400">Behavioral & communication assessment (no difficulty)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {enabledTypes.video && (
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={videoCount}
                    onChange={(e) => setVideoCount(parseInt(e.target.value) || 1)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-16 px-2 py-1 bg-black/50 border border-white/20 rounded-lg text-white text-center text-sm"
                  />
                )}
                <div className={`w-12 h-6 rounded-full transition-colors ${enabledTypes.video ? 'bg-purple-500' : 'bg-gray-600'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform mt-0.5 ${enabledTypes.video ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Essay Questions */}
          <div className={`rounded-xl border transition-all ${enabledTypes.essay ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10'}`}>
            <div 
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => setEnabledTypes({ ...enabledTypes, essay: !enabledTypes.essay })}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${enabledTypes.essay ? 'bg-amber-500/20' : 'bg-white/10'}`}>
                  <FiFileText className={`w-5 h-5 ${enabledTypes.essay ? 'text-amber-400' : 'text-gray-500'}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Essay Questions</h4>
                  <p className="text-xs text-gray-400">Long-form written responses (no difficulty)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {enabledTypes.essay && (
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={essayCount}
                    onChange={(e) => setEssayCount(parseInt(e.target.value) || 1)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-16 px-2 py-1 bg-black/50 border border-white/20 rounded-lg text-white text-center text-sm"
                  />
                )}
                <div className={`w-12 h-6 rounded-full transition-colors ${enabledTypes.essay ? 'bg-amber-500' : 'bg-gray-600'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform mt-0.5 ${enabledTypes.essay ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Case Study */}
          <div className={`rounded-xl border transition-all ${enabledTypes.case_study ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/5 border-white/10'}`}>
            <div 
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => setEnabledTypes({ ...enabledTypes, case_study: !enabledTypes.case_study })}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${enabledTypes.case_study ? 'bg-cyan-500/20' : 'bg-white/10'}`}>
                  <FiBriefcase className={`w-5 h-5 ${enabledTypes.case_study ? 'text-cyan-400' : 'text-gray-500'}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Case Study</h4>
                  <p className="text-xs text-gray-400">Comprehensive problem-solving scenarios (no difficulty)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {enabledTypes.case_study && (
                  <input
                    type="number"
                    min={1}
                    max={3}
                    value={caseStudyCount}
                    onChange={(e) => setCaseStudyCount(parseInt(e.target.value) || 1)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-16 px-2 py-1 bg-black/50 border border-white/20 rounded-lg text-white text-center text-sm"
                  />
                )}
                <div className={`w-12 h-6 rounded-full transition-colors ${enabledTypes.case_study ? 'bg-cyan-500' : 'bg-gray-600'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform mt-0.5 ${enabledTypes.case_study ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Summary & Actions */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-400">
              {enabledTypes.mcq && <span className="mr-3">MCQ: {mcqConfig.total}</span>}
              {enabledTypes.coding && <span className="mr-3">Coding: {codingConfig.easy + codingConfig.medium + codingConfig.hard}</span>}
              {enabledTypes.video && <span className="mr-3">Video: {videoCount}</span>}
              {enabledTypes.essay && <span className="mr-3">Essay: {essayCount}</span>}
              {enabledTypes.case_study && <span className="mr-3">Case Study: {caseStudyCount}</span>}
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-white/10 hover:bg-white/15 rounded-xl text-white font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={!canGenerate || (enabledTypes.mcq && !mcqDistributionValid)}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-purple-500/25"
            >
              <FiCpu className="w-4 h-4 inline mr-2" />
              Generate {getTotalQuestions()} Questions
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AssessmentEdit = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const assessmentId = searchParams.get('id');
  
  const [activeTab, setActiveTab] = useState('details');
  const [lastSaved, setLastSaved] = useState(null);
  const [linkType, setLinkType] = useState('role'); // 'role' or 'job'
  const [selectedRoleName, setSelectedRoleName] = useState('');
  const [selectedJobTitleId, setSelectedJobTitleId] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingCount, setGeneratingCount] = useState(0);
  const [selectedCompetencies, setSelectedCompetencies] = useState([]);
  const [isSyncingCompetencies, setIsSyncingCompetencies] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instructions: '',
    duration_minutes: 60,
    start_at: '',
    end_at: '',
    settings: {
      shuffle_questions: false,
      proctoring_enabled: true,
      show_results_immediately: false,
      allow_late_submission: false,
    },
  });
  
  // Track if form has been modified
  const [isDirty, setIsDirty] = useState(false);
  const initialLoadRef = useRef(true);
  
  // Question management state
  const [showManualModal, setShowManualModal] = useState(false);
  const [showBulkAIModal, setShowBulkAIModal] = useState(false);
  
  // Manual question state
  const [manualQuestion, setManualQuestion] = useState({
    type: 'mcq',
    content: {
      question: '',
      options: ['', '', '', ''],
      correct_answer: 0,
      explanation: '',
    },
    difficulty: 3,
    scoring: { max_marks: 2 },
  });
  
  // Fetch assessment data
  const { data: assessment, isLoading: assessmentLoading, refetch: refetchAssessment } = useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: () => getAssessment(assessmentId),
    enabled: !!assessmentId,
    retry: 1,
  });
  
  // Fetch questions
  const { data: questions, isLoading: questionsLoading, refetch: refetchQuestions } = useQuery({
    queryKey: ['assessmentQuestions', assessmentId],
    queryFn: () => getAssessmentQuestions(assessmentId),
    enabled: !!assessmentId,
  });
  
  // Fetch jobs for dropdown
  const { data: jobsData } = useQuery({
    queryKey: ['adminJobs'],
    queryFn: () => getJobs(1, 100),
  });
  
  // Fetch question templates for "AI" generation (actually from bank)
  const { data: templatesData } = useQuery({
    queryKey: ['questionTemplates', selectedJobTitleId],
    queryFn: () => getQuestionTemplates({ 
      job_title: selectedJobTitleId,
      page_size: 100 
    }),
    enabled: !!selectedJobTitleId,
  });
  
  // Update form when assessment loads
  useEffect(() => {
    if (assessment && initialLoadRef.current) {
      const startDate = assessment.start_at ? new Date(assessment.start_at).toISOString().slice(0, 16) : '';
      const endDate = assessment.end_at ? new Date(assessment.end_at).toISOString().slice(0, 16) : '';
      
      setFormData({
        name: assessment.name || '',
        description: assessment.description || '',
        instructions: assessment.instructions || '',
        duration_minutes: assessment.duration_minutes || 60,
        start_at: startDate,
        end_at: endDate,
        settings: assessment.settings || {
          shuffle_questions: false,
          proctoring_enabled: true,
          show_results_immediately: false,
          allow_late_submission: false,
        },
      });
      
      // Determine link type and set IDs
      if (assessment.job_id || assessment.job) {
        setLinkType('job');
        setSelectedJobId(assessment.job_id || assessment.job);
      } else if (assessment.job_title_id || assessment.job_title) {
        setLinkType('role');
        setSelectedJobTitleId(assessment.job_title_id || assessment.job_title);
        setSelectedRoleName(assessment.job_title_name || '');
      }

      // Load competencies if they exist from backend
      if (assessment.competencies && Array.isArray(assessment.competencies) && assessment.competencies.length > 0) {
        const competencies = assessment.competencies.map(ac => ({
          id: ac.competency_id,
          name: ac.competency_name,
          category: ac.competency_category,
          description: ac.competency_description || '',
          is_inherited: ac.is_inherited,
        }));
        setSelectedCompetencies(competencies);
      }

      initialLoadRef.current = false;
    }
  }, [assessment]);
  
  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data) => patchAssessment(assessmentId, data),
    onSuccess: () => {
      setLastSaved(new Date());
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ['assessment', assessmentId] });
      queryClient.invalidateQueries({ queryKey: ['adminAssessments'] });
    },
    onError: (error) => {
      console.error('Save failed:', error);
    }
  });
  
  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: () => publishAssessment(assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment', assessmentId] });
      queryClient.invalidateQueries({ queryKey: ['adminAssessments'] });
    },
  });
  
  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => refetchQuestions(),
  });
  
  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: (data) => createQuestion({ assessment: assessmentId, ...data }),
    onSuccess: () => {
      refetchQuestions();
      setShowManualModal(false);
      resetManualQuestion();
    },
    onError: (error) => {
      console.error('Create question failed:', error);
      alert('Failed to create question: ' + (error.response?.data?.error || error.message));
    }
  });
  
  // Add template mutation
  const addTemplateMutation = useMutation({
    mutationFn: ({ templateId }) => addTemplateToAssessment(templateId, assessmentId),
    onSuccess: () => refetchQuestions(),
  });
  
  const resetManualQuestion = () => {
    setManualQuestion({
      type: 'mcq',
      content: {
        question: '',
        options: ['', '', '', ''],
        correct_answer: 0,
        explanation: '',
      },
      difficulty: 3,
      scoring: { max_marks: 2 },
    });
  };
  
  // Handle form field change
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);
  
  // Save function
  const handleSave = useCallback(() => {
    if (!assessmentId || !isDirty) return;
    
    const dataToSave = {
      name: formData.name,
      description: formData.description,
      instructions: formData.instructions,
      job: linkType === 'job' ? selectedJobId : null,
      job_title: linkType === 'role' ? selectedJobTitleId : null,
      duration_minutes: formData.duration_minutes,
      settings: formData.settings,
    };
    
    if (formData.start_at) {
      dataToSave.start_at = new Date(formData.start_at).toISOString();
    }
    if (formData.end_at) {
      dataToSave.end_at = new Date(formData.end_at).toISOString();
    }
    
    saveMutation.mutate(dataToSave);
  }, [assessmentId, formData, selectedJobTitleId, selectedJobId, linkType, isDirty, saveMutation]);
  
  // Manual save on button click
  const handleManualSave = () => {
    setIsDirty(true); // Force save
    setTimeout(() => handleSave(), 100);
  };
  
  const handleDeleteQuestion = (questionId) => {
    if (confirm('Are you sure you want to delete this question?')) {
      deleteQuestionMutation.mutate(questionId);
    }
  };
  
  const handlePublish = () => {
    if (!selectedJobTitleId && !selectedJobId) {
      alert('Please select a Role or link to a Job before publishing.');
      setActiveTab('details');
      return;
    }
    if (!questions?.length) {
      alert('Please add at least one question before publishing.');
      return;
    }
    if (selectedCompetencies.length === 0) {
      alert('Please add at least one competency before publishing.');
      return;
    }
    if (confirm('Are you sure you want to publish this assessment? It will become available to participants.')) {
      publishMutation.mutate();
    }
  };
  
  const copyShareableLink = () => {
    if (assessment?.unique_link_token) {
      const link = `${window.location.origin}/user/assessment-start?token=${assessment.unique_link_token}`;
      navigator.clipboard.writeText(link);
      alert('Link copied to clipboard!');
    }
  };
  
  const handleCreateManualQuestion = () => {
    // Validate based on type
    if (manualQuestion.type === 'mcq') {
      if (!manualQuestion.content.question?.trim()) {
        alert('Please enter a question');
        return;
      }
      const filledOptions = manualQuestion.content.options.filter(o => o.trim());
      if (filledOptions.length < 2) {
        alert('Please provide at least 2 options');
        return;
      }
    } else if (manualQuestion.type === 'coding') {
      if (!manualQuestion.content.title?.trim()) {
        alert('Please enter a problem title');
        return;
      }
      if (!manualQuestion.content.problem_statement?.trim()) {
        alert('Please enter a problem statement');
        return;
      }
      if (!manualQuestion.content.test_cases?.length || 
          !manualQuestion.content.test_cases[0]?.input || 
          !manualQuestion.content.test_cases[0]?.output) {
        alert('Please provide at least one test case with input and output');
        return;
      }
    } else if (manualQuestion.type === 'subjective') {
      if (!manualQuestion.content.question?.trim()) {
        alert('Please enter a question');
        return;
      }
    }
    
    let content = { ...manualQuestion.content };
    if (manualQuestion.type === 'mcq') {
      content.options = content.options.filter(o => o.trim());
    }
    
    const questionData = {
      type: manualQuestion.type,
      content: content,
      scoring: manualQuestion.scoring,
      difficulty: manualQuestion.difficulty,
      tags: [],
    };
    createQuestionMutation.mutate(questionData);
  };
  
  // Handle competency changes - for manual add/remove only
  const handleCompetenciesChange = async (newCompetencies) => {
    // Find added and removed competencies
    const currentIds = new Set(selectedCompetencies.map(c => c.id));
    const newIds = new Set(newCompetencies.map(c => c.id));
    
    const added = newCompetencies.filter(c => !currentIds.has(c.id));
    const removed = selectedCompetencies.filter(c => !newIds.has(c.id));
    
    // Update local state immediately for responsiveness
    setSelectedCompetencies(newCompetencies);
    
    // Sync changes to backend
    // Add new competencies
    for (const comp of added) {
      try {
        await addAssessmentCompetency(assessmentId, comp.id, false);
      } catch (error) {
        // Silently ignore "already added" errors
      }
    }
    
    // Remove deleted competencies
    for (const comp of removed) {
      try {
        await removeAssessmentCompetency(assessmentId, comp.id);
      } catch (error) {
        // Silently ignore errors
      }
    }
    
    // Invalidate cache to refresh data
    queryClient.invalidateQueries({ queryKey: ['assessment', assessmentId] });
  };
  
  // Sync competencies from role (replaces all existing)
  const handleSyncRoleCompetencies = async (jobTitleId) => {
    if (!assessmentId || !jobTitleId) return;
    
    setIsSyncingCompetencies(true);
    try {
      const result = await syncRoleCompetencies(assessmentId, jobTitleId);
      if (result.success) {
        // Refetch assessment to get updated competencies
        const updatedAssessment = await refetchAssessment();
        
        // Update local competencies state from the refetched data
        if (updatedAssessment?.data?.competencies && Array.isArray(updatedAssessment.data.competencies)) {
          const competencies = updatedAssessment.data.competencies.map(ac => ({
            id: ac.competency_id,
            name: ac.competency_name,
            category: ac.competency_category,
            description: ac.competency_description || '',
            is_inherited: ac.is_inherited,
          }));
          setSelectedCompetencies(competencies);
        }
        
        alert(`Synced ${result.synced_count} competencies from "${result.job_title_name || 'role'}".`);
      }
    } catch (error) {
      console.error('Failed to sync role competencies:', error);
      alert('Failed to sync competencies: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSyncingCompetencies(false);
    }
  };
  
  // Sync competencies from job
  const handleSyncJobCompetencies = async () => {
    if (!assessmentId || !selectedJobId) return;
    
    setIsSyncingCompetencies(true);
    try {
      // First, save the job link to the backend
      await patchAssessment(assessmentId, { job: selectedJobId, job_title: null });
      
      // Then sync competencies
      const result = await syncJobCompetencies(assessmentId);
      if (result.success) {
        // Refetch assessment to get updated competencies
        const updatedAssessment = await refetchAssessment();
        
        // Update local competencies state from the refetched data
        if (updatedAssessment?.data?.competencies && Array.isArray(updatedAssessment.data.competencies)) {
          const competencies = updatedAssessment.data.competencies.map(ac => ({
            id: ac.competency_id,
            name: ac.competency_name,
            category: ac.competency_category,
            description: ac.competency_description || '',
            is_inherited: ac.is_inherited,
          }));
          setSelectedCompetencies(competencies);
        }
        
        alert(`Synced ${result.synced_count} competencies from the linked job. ${result.deleted_count || 0} previous competencies were removed.`);
      }
    } catch (error) {
      console.error('Failed to sync job competencies:', error);
      alert('Failed to sync competencies: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSyncingCompetencies(false);
    }
  };
  
  // Simulate AI generation by picking from question bank
  const handleBulkGenerate = async (config) => {
    // Calculate total questions from new config format
    let totalCount = 0;
    
    // MCQ with distribution
    if (config.mcq?.enabled && config.mcq.distribution) {
      totalCount += Object.values(config.mcq.distribution).reduce((a, b) => a + b, 0);
    }
    
    // Coding (DSA) with difficulty
    if (config.coding?.enabled) {
      totalCount += (config.coding.easy || 0) + (config.coding.medium || 0) + (config.coding.hard || 0);
    }
    
    // Subjective types (no difficulty)
    if (config.video?.enabled) totalCount += config.video.count || 0;
    if (config.essay?.enabled) totalCount += config.essay.count || 0;
    if (config.case_study?.enabled) totalCount += config.case_study.count || 0;
    
    if (totalCount === 0) {
      alert('Please specify at least one question to generate.');
      return;
    }
    
    if (!selectedJobTitleId && !selectedJobId) {
      alert('Please select a Role or link to a Job first to generate relevant questions.');
      setShowBulkAIModal(false);
      setActiveTab('details');
      return;
    }
    
    if (selectedCompetencies.length === 0) {
      alert('Please add competencies first to generate relevant questions.');
      setShowBulkAIModal(false);
      setActiveTab('details');
      return;
    }
    
    setIsGenerating(true);
    setGeneratingCount(totalCount);
    setShowBulkAIModal(false);
    
    // Simulate AI generation delay (2-4 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));
    
    try {
      // Fetch templates dynamically based on selected role/job
      const jobTitleIdToUse = selectedJobTitleId || (assessment?.job_title_id);
      if (!jobTitleIdToUse) {
        alert('Please select a Role first to generate questions.');
        setIsGenerating(false);
        setGeneratingCount(0);
        return;
      }
      
      // Fetch templates for the selected role
      const templatesResponse = await getQuestionTemplates({ 
        job_title: jobTitleIdToUse,
        page_size: 200  // Get more templates to have enough for filtering
      });
      // Handle paginated response - could be in data or results field
      const templates = templatesResponse?.data || templatesResponse?.results || templatesResponse || [];
      
      console.log(`Fetched ${templates.length} templates for role ${jobTitleIdToUse}`);
      
      let addedCount = 0;
      
      // Helper to add questions of a specific type and difficulty
      const addQuestionsOfType = async (type, count, difficulty, tagFilter = null) => {
        if (count <= 0) return;
        
        // Map difficulty names to numbers (1-5)
        const difficultyMap = {
          'very_easy': 1,
          'easy': 2,
          'medium': 3,
          'hard': 4,
          'very_hard': 5
        };
        const diffNum = typeof difficulty === 'string' ? difficultyMap[difficulty] : difficulty;
        
        // Filter templates by type, difficulty, and optional tag
        let matchingTemplates = templates.filter(t => {
          const typeMatch = t.type === type;
          const difficultyMatch = diffNum === undefined || diffNum === 'any' || t.difficulty === diffNum;
          const tagMatch = !tagFilter || (t.tags && Array.isArray(t.tags) && t.tags.includes(tagFilter));
          return typeMatch && difficultyMatch && tagMatch;
        });
        
        console.log(`Found ${matchingTemplates.length} templates for type=${type}, difficulty=${difficulty}, tag=${tagFilter}`);
        
        if (matchingTemplates.length === 0) {
          console.warn(`No templates found for type=${type}, difficulty=${difficulty}`);
          return;
        }
        
        const shuffled = [...matchingTemplates].sort(() => Math.random() - 0.5);
        const toAdd = shuffled.slice(0, count);
        
        for (const template of toAdd) {
          try {
            await addTemplateMutation.mutateAsync({ templateId: template.id });
            addedCount++;
          } catch (e) {
            console.error('Failed to add template:', e);
          }
        }
      };
      
      // MCQ with distribution
      if (config.mcq?.enabled && config.mcq.distribution) {
        for (const [difficulty, count] of Object.entries(config.mcq.distribution)) {
          await addQuestionsOfType('mcq', count, difficulty);
        }
      }
      
      // Coding (DSA) with difficulty
      if (config.coding?.enabled) {
        await addQuestionsOfType('coding', config.coding.easy || 0, 'easy');
        await addQuestionsOfType('coding', config.coding.medium || 0, 'medium');
        await addQuestionsOfType('coding', config.coding.hard || 0, 'hard');
      }
      
      // Video questions (subjective with 'video' tag)
      if (config.video?.enabled) {
        await addQuestionsOfType('subjective', config.video.count || 0, 'any', 'video');
      }
      
      // Essay questions (subjective with 'essay' tag)
      if (config.essay?.enabled) {
        await addQuestionsOfType('subjective', config.essay.count || 0, 'any', 'essay');
      }
      
      // Case study (subjective with 'case-study' or 'case_study' tag)
      if (config.case_study?.enabled) {
        // Try both tag variations
        await addQuestionsOfType('subjective', config.case_study.count || 0, 'any', 'case-study');
        // If not enough, try case_study tag
        if (addedCount < totalCount) {
          await addQuestionsOfType('subjective', config.case_study.count || 0, 'any', 'case_study');
        }
      }
      
      await refetchQuestions();
      
      if (addedCount < totalCount) {
        alert(`Generated ${addedCount} questions. Some question types may not have enough templates in the bank for the selected role.`);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
      setGeneratingCount(0);
    }
  };
  
  if (!assessmentId) {
    return (
      <AdminLayout title="Assessment Edit">
        <div className="text-center py-12">
          <p className="text-gray-400">No assessment ID provided</p>
          <button
            onClick={() => router.push('/admin/assessment-list')}
            className="mt-4 px-6 py-3 bg-orange-500 rounded-xl text-white"
          >
            Back to Assessments
          </button>
        </div>
      </AdminLayout>
    );
  }
  
  if (assessmentLoading) {
    return (
      <AdminLayout title="Loading...">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }
  
  const getDifficultyLabel = (value) => {
    const opt = DIFFICULTY_OPTIONS.find(o => o.value === value);
    return opt ? opt.label : 'Medium';
  };
  
  const jobOptions = [
    { value: '', label: 'Select a job...' },
    ...(jobsData?.data?.map(job => ({ value: job.id, label: job.title })) || [])
  ];
  
  return (
    <AdminLayout
      title={formData.name || 'Edit Assessment'}
      breadcrumbs={[
        { label: 'Dashboard', path: '/admin/dashboard' },
        { label: 'Assessments', path: '/admin/assessment-list' },
        { label: formData.name || 'Edit' },
      ]}
    >
      {/* AI Generation Overlay */}
      <AnimatePresence>
        <AIGeneratingOverlay isVisible={isGenerating} questionCount={generatingCount} />
      </AnimatePresence>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/assessment-list')}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{formData.name || 'Untitled Assessment'}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                assessment?.status === 'published' ? 'bg-green-500/20 text-green-400' :
                assessment?.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {assessment?.status?.toUpperCase() || 'DRAFT'}
              </span>
              {lastSaved && (
                <span className="text-xs text-gray-500">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              {saveMutation.isPending && (
                <span className="text-xs text-orange-400">Saving...</span>
              )}
              {isDirty && !saveMutation.isPending && (
                <span className="text-xs text-yellow-400">Unsaved changes</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleManualSave}
            disabled={saveMutation.isPending}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm flex items-center gap-2"
          >
            <FiSave className="w-4 h-4" />
            Save
          </button>
          {assessment?.status === 'published' && assessment?.unique_link_token && (
            <button
              onClick={copyShareableLink}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm flex items-center gap-2"
            >
              <FiCopy className="w-4 h-4" />
              Copy Link
            </button>
          )}
          {assessment?.status === 'draft' && (
            <button
              onClick={handlePublish}
              disabled={publishMutation.isPending || !questions?.length || selectedCompetencies.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl font-semibold text-white hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title={selectedCompetencies.length === 0 ? 'Add competencies first' : !questions?.length ? 'Add questions first' : ''}
            >
              {publishMutation.isPending ? 'Publishing...' : 'Publish'}
            </button>
          )}
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'details'
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <FiSettings className="w-4 h-4 inline mr-2" />
          Details
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'questions'
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <FiFileText className="w-4 h-4 inline mr-2" />
          Questions ({questions?.length || 0})
        </button>
      </div>
      
      {/* Details Tab */}
      {activeTab === 'details' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6"
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Assessment Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              placeholder="e.g., Frontend Developer Assessment"
            />
          </div>
          
          {/* Link Type Selection */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Link Assessment To <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="linkType"
                  value="role"
                  checked={linkType === 'role'}
                  onChange={() => {
                    setLinkType('role');
                    setSelectedJobId(null);
                    // NOTE: We do NOT clear competencies when switching link type
                    // User can keep existing competencies or sync new ones
                    setIsDirty(true);
                  }}
                  className="w-4 h-4 text-orange-500"
                />
                <FiBriefcase className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Role / Job Title</span>
                <span className="text-xs text-gray-500">(standalone assessment)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="linkType"
                  value="job"
                  checked={linkType === 'job'}
                  onChange={() => {
                    setLinkType('job');
                    setSelectedJobTitleId(null);
                    setSelectedRoleName('');
                    // NOTE: We do NOT clear competencies when switching link type
                    // User can keep existing competencies or sync new ones
                    setIsDirty(true);
                  }}
                  className="w-4 h-4 text-orange-500"
                />
                <FiLink className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Job Posting</span>
                <span className="text-xs text-gray-500">(linked to hiring)</span>
              </label>
            </div>
            
            {linkType === 'role' && (
              <div>
                <JobTitleSearch
                  value={selectedRoleName}
                  onChange={(jobTitleId, jobTitle) => {
                    setSelectedJobTitleId(jobTitleId);
                    setSelectedRoleName(jobTitle?.name || '');
                    setIsDirty(true);
                    // NOTE: We do NOT auto-sync competencies here
                    // User must explicitly click "Sync Competencies from Role"
                  }}
                  placeholder="Search for a role (e.g., Software Engineer)..."
                  label=""
                  required={true}
                />
                {selectedJobTitleId && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => handleSyncRoleCompetencies(selectedJobTitleId)}
                      disabled={isSyncingCompetencies}
                      className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-blue-400 text-sm font-medium flex items-center gap-2"
                    >
                      <FiRefreshCw className={`w-4 h-4 ${isSyncingCompetencies ? 'animate-spin' : ''}`} />
                      {isSyncingCompetencies ? 'Syncing...' : 'Sync Competencies from Role'}
                    </button>
                    <span className="text-xs text-gray-500">
                      Replace current competencies with role's competencies
                    </span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Select a role, then click "Sync" to load its competencies
                </p>
              </div>
            )}
            
            {linkType === 'job' && (
              <div>
                <GlassSelect
                  value={selectedJobId || ''}
                  onChange={(value) => {
                    setSelectedJobId(value || null);
                    setIsDirty(true);
                    // NOTE: We do NOT auto-clear competencies when job changes
                    // User must explicitly click "Sync Competencies from Job"
                  }}
                  placeholder="Select a job posting..."
                  options={jobOptions}
                />
                {selectedJobId && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={handleSyncJobCompetencies}
                      disabled={isSyncingCompetencies}
                      className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-green-400 text-sm font-medium flex items-center gap-2"
                    >
                      <FiRefreshCw className={`w-4 h-4 ${isSyncingCompetencies ? 'animate-spin' : ''}`} />
                      {isSyncingCompetencies ? 'Syncing...' : 'Sync Competencies from Job'}
                    </button>
                    <span className="text-xs text-gray-500">
                      Pull competencies from the linked job
                    </span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Link to an existing job posting - competencies can be synced from the job
                </p>
              </div>
            )}
          </div>

          {/* Competency Selector */}
          <div>
            <CompetencySelector
              jobTitleId={linkType === 'role' ? selectedJobTitleId : null}
              selectedCompetencies={selectedCompetencies}
              onCompetenciesChange={handleCompetenciesChange}
            />
            <p className="text-xs text-gray-500 mt-2">
              These competencies will be tested in this assessment. You can add or remove competencies as needed.
            </p>
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
              placeholder="Brief description of the assessment..."
            />
          </div>
          
          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Instructions for Participants</label>
            <textarea
              value={formData.instructions}
              onChange={(e) => handleFieldChange('instructions', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
              placeholder="Instructions that will be shown to participants before they start..."
            />
          </div>
          
          {/* Duration and Timing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes) *</label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => handleFieldChange('duration_minutes', parseInt(e.target.value) || 60)}
                min={1}
                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Start Date & Time</label>
              <input
                type="datetime-local"
                value={formData.start_at}
                onChange={(e) => handleFieldChange('start_at', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">End Date & Time</label>
              <input
                type="datetime-local"
                value={formData.end_at}
                onChange={(e) => handleFieldChange('end_at', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
          
          {/* Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Assessment Settings</label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'proctoring_enabled', label: 'Enable Proctoring' },
                { key: 'shuffle_questions', label: 'Shuffle Questions' },
                { key: 'show_results_immediately', label: 'Show Results Immediately' },
                { key: 'allow_late_submission', label: 'Allow Late Submission' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10">
                  <input
                    type="checkbox"
                    checked={formData.settings?.[key] ?? false}
                    onChange={(e) => handleFieldChange('settings', { ...formData.settings, [key]: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Add Question Actions */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setShowBulkAIModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-semibold flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              <FiCpu className="w-5 h-5" />
              Generate Questions with AI
            </button>
            <button
              onClick={() => setShowManualModal(true)}
              className="px-4 py-3 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/50 rounded-xl text-orange-400 font-medium flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Add Manually
            </button>
          </div>
          
          {/* Questions List */}
          <div className="space-y-3">
            {questionsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              </div>
            ) : questions?.length === 0 ? (
              <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                <FiFileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-semibold text-white mb-2">No questions yet</h3>
                <p className="text-gray-400 mb-6">Generate questions with AI or add them manually</p>
                <button
                  onClick={() => setShowBulkAIModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white font-semibold"
                >
                  <FiCpu className="w-4 h-4 inline mr-2" />
                  Generate Questions with AI
                </button>
              </div>
            ) : (
              questions?.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-orange-500/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm font-mono">#{index + 1}</span>
                      <div className={`p-2 rounded-lg ${
                        question.type === 'mcq' ? 'bg-green-500/20 text-green-400' :
                        question.type === 'coding' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        <QuestionTypeIcon type={question.type} />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">
                        {question.title || question.content?.question || question.content?.title || 'Untitled Question'}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-sm">
                        <span className="text-gray-500">{question.type?.toUpperCase()}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-500">{getDifficultyLabel(question.difficulty)}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-500">Weight: {question.weightage || question.scoring?.max_marks || 1}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}
      
      {/* Manual Question Modal */}
      <AnimatePresence>
        {showManualModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowManualModal(false)}
          >
            <motion.div
              className="bg-black/95 border border-orange-500/30 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Add Question Manually</h3>
              
              <div className="space-y-4">
                {/* Question Type */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Question Type</label>
                  <GlassSelect
                    value={manualQuestion.type}
                    onChange={(type) => {
                      let content = {};
                      let scoring = { max_marks: 2 };
                      if (type === 'mcq') {
                        content = { question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' };
                        scoring = { max_marks: 2 };
                      } else if (type === 'coding') {
                        content = { title: '', problem_statement: '', test_cases: [], time_limit_ms: 2000, memory_limit_mb: 256 };
                        scoring = { max_marks: 10, partial_marks_enabled: true };
                      } else {
                        content = { question: '', expected_length: 300 };
                        scoring = { max_marks: 10 };
                      }
                      setManualQuestion({ ...manualQuestion, type, content, scoring });
                    }}
                    options={[
                      { value: 'mcq', label: 'Multiple Choice (MCQ)' },
                      { value: 'coding', label: 'Coding' },
                      { value: 'subjective', label: 'Subjective' },
                    ]}
                  />
                </div>
                
                {/* MCQ Fields */}
                {manualQuestion.type === 'mcq' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Question *</label>
                      <textarea
                        value={manualQuestion.content.question || ''}
                        onChange={(e) => setManualQuestion({
                          ...manualQuestion,
                          content: { ...manualQuestion.content, question: e.target.value }
                        })}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white resize-none"
                        placeholder="Enter your question..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Options *</label>
                      {manualQuestion.content.options?.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2 mb-2">
                          <input
                            type="radio"
                            name="correct"
                            checked={manualQuestion.content.correct_answer === i}
                            onChange={() => setManualQuestion({
                              ...manualQuestion,
                              content: { ...manualQuestion.content, correct_answer: i }
                            })}
                            className="w-4 h-4"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOptions = [...manualQuestion.content.options];
                              newOptions[i] = e.target.value;
                              setManualQuestion({
                                ...manualQuestion,
                                content: { ...manualQuestion.content, options: newOptions }
                              });
                            }}
                            className="flex-1 px-4 py-2 bg-white/5 border border-white/15 rounded-xl text-white"
                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                          />
                        </div>
                      ))}
                      <p className="text-xs text-gray-500">Select the radio button for the correct answer</p>
                    </div>
                  </>
                )}
                
                {/* Subjective Fields */}
                {manualQuestion.type === 'subjective' && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Question *</label>
                    <textarea
                      value={manualQuestion.content.question || ''}
                      onChange={(e) => setManualQuestion({
                        ...manualQuestion,
                        content: { ...manualQuestion.content, question: e.target.value }
                      })}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white resize-none"
                      placeholder="Enter your subjective question..."
                    />
                  </div>
                )}
                
                {/* Coding Fields */}
                {manualQuestion.type === 'coding' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Problem Title *</label>
                      <input
                        type="text"
                        value={manualQuestion.content.title || ''}
                        onChange={(e) => setManualQuestion({
                          ...manualQuestion,
                          content: { ...manualQuestion.content, title: e.target.value }
                        })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white"
                        placeholder="e.g., Two Sum"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Problem Statement *</label>
                      <textarea
                        value={manualQuestion.content.problem_statement || ''}
                        onChange={(e) => setManualQuestion({
                          ...manualQuestion,
                          content: { ...manualQuestion.content, problem_statement: e.target.value }
                        })}
                        rows={4}
                        className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white resize-none"
                        placeholder="Describe the problem..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Sample Test Case</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Input</label>
                          <textarea
                            value={manualQuestion.content.test_cases?.[0]?.input || ''}
                            onChange={(e) => setManualQuestion({
                              ...manualQuestion,
                              content: { 
                                ...manualQuestion.content, 
                                test_cases: [{ 
                                  input: e.target.value, 
                                  output: manualQuestion.content.test_cases?.[0]?.output || '' 
                                }]
                              }
                            })}
                            rows={2}
                            className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-white text-sm resize-none font-mono"
                            placeholder="[1, 2, 3]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Expected Output</label>
                          <textarea
                            value={manualQuestion.content.test_cases?.[0]?.output || ''}
                            onChange={(e) => setManualQuestion({
                              ...manualQuestion,
                              content: { 
                                ...manualQuestion.content, 
                                test_cases: [{ 
                                  input: manualQuestion.content.test_cases?.[0]?.input || '', 
                                  output: e.target.value 
                                }]
                              }
                            })}
                            rows={2}
                            className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg text-white text-sm resize-none font-mono"
                            placeholder="6"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Difficulty */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Difficulty</label>
                  <GlassSelect
                    value={manualQuestion.difficulty}
                    onChange={(val) => setManualQuestion({ ...manualQuestion, difficulty: val })}
                    options={DIFFICULTY_OPTIONS}
                  />
                </div>
                
                {/* Weightage */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Weightage</label>
                  <input
                    type="number"
                    min={1}
                    value={manualQuestion.scoring.max_marks}
                    onChange={(e) => setManualQuestion({ 
                      ...manualQuestion, 
                      scoring: { ...manualQuestion.scoring, max_marks: parseInt(e.target.value) || 1 }
                    })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowManualModal(false)}
                    className="flex-1 py-3 bg-white/10 rounded-xl text-white font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateManualQuestion}
                    disabled={createQuestionMutation.isPending}
                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl text-white font-semibold disabled:opacity-50"
                  >
                    {createQuestionMutation.isPending ? 'Adding...' : 'Add Question'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* AI Bulk Generation Modal - Intuitive Multi-step */}
      <AnimatePresence>
        {showBulkAIModal && (
          <BulkGenerationModal
            isOpen={showBulkAIModal}
            onClose={() => setShowBulkAIModal(false)}
            onGenerate={handleBulkGenerate}
            selectedJobTitleId={selectedJobTitleId}
            selectedJobId={selectedJobId}
            selectedCompetencies={selectedCompetencies}
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AssessmentEdit;
