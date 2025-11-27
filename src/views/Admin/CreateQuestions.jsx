'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '../../components/AdminLayout';
import { tempQuestionsStorage } from '../../lib/localStorage';

const CreateQuestions = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get('assessmentId');
  
  const [activeTab, setActiveTab] = useState('manual'); // 'manual', 'ai', 'csv'
  
  // Manual Question states
  const [questionType, setQuestionType] = useState('mcq');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [points, setPoints] = useState(10);
  const [testCases, setTestCases] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  
  // AI Generation states
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState('easy');
  const [aiQuestionCount, setAiQuestionCount] = useState(5);
  
  // Questions list
  const [allQuestions, setAllQuestions] = useState([]);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const csvQuestions = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        return {
          id: `csv-${Date.now()}-${index}`,
          type: 'mcq',
          question: values[0] || `Question ${index + 1}`,
          options: values.slice(1, -1) || [],
          correctAnswer: values[values.length - 1] || '',
        };
      });
      
      setAllQuestions([...allQuestions, ...csvQuestions]);
      alert(`Successfully imported ${csvQuestions.length} questions from CSV!`);
    };
    reader.readAsText(file);
  };

  const handleAIGenerate = () => {
    const generatedQuestions = Array.from({ length: parseInt(aiQuestionCount) || 5 }, (_, i) => ({
      id: `ai-${Date.now()}-${i}`,
      type: 'mcq',
      question: `${aiPrompt || 'AI Generated Question'} ${i + 1}`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      difficulty: aiDifficulty,
    }));
    setAllQuestions([...allQuestions, ...generatedQuestions]);
    setShowAIModal(false);
    setAiPrompt('');
    alert(`Successfully generated ${generatedQuestions.length} questions!`);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) {
      alert('Please enter a question.');
      return;
    }
    
    if (questionType === 'mcq' && (!correctAnswer || options.filter(o => o.trim()).length < 2)) {
      alert('Please add at least 2 options and select a correct answer.');
      return;
    }
    
    const questionData = {
      id: `question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: questionType,
      question: question.trim(),
      options: questionType === 'mcq' ? options.filter(o => o.trim()) : [],
      correctAnswer: questionType === 'mcq' ? correctAnswer : '',
      difficulty,
      points: points || 10,
      testCases: questionType === 'coding' ? testCases : '',
      expectedOutput: questionType === 'coding' ? expectedOutput : '',
      createdAt: new Date().toISOString(),
    };
    
    setAllQuestions([...allQuestions, questionData]);
    
    // Reset form
    setQuestion('');
    setOptions(['', '', '', '']);
    setCorrectAnswer('');
    setTestCases('');
    setExpectedOutput('');
    setDifficulty('medium');
    setPoints(10);
    
    alert('Question added successfully!');
  };

  const handleSaveAndReturn = () => {
    if (allQuestions.length === 0) {
      alert('Please add at least one question before saving.');
      return;
    }
    
    // Save questions to localStorage
    const existingQuestions = tempQuestionsStorage.getAll();
    // Avoid duplicates by checking IDs
    const existingIds = new Set(existingQuestions.map(q => q.id));
    const newQuestions = allQuestions.filter(q => !existingIds.has(q.id));
    const updatedQuestions = [...existingQuestions, ...newQuestions];
    tempQuestionsStorage.save(updatedQuestions);
    
    // Navigate back to create assessment
    router.push(`/admin/create-assessment${assessmentId ? `?assessmentId=${assessmentId}` : ''}`);
  };

  return (
    <AdminLayout title="Create Question">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/admin/create-assessment${assessmentId ? `?assessmentId=${assessmentId}` : ''}`)}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Create Assessment
        </button>
        <h1 className="text-3xl font-bold mb-2 text-white">Create Question</h1>
        <p className="text-white/60">Add a new question to your assessment</p>
      </div>

      <main className="max-w-4xl mx-auto">
        {/* Tab Selector */}
        <div className="mb-6 flex gap-4">
          {[
            { id: 'manual', label: 'Write Manually', icon: '✍️' },
            { id: 'ai', label: 'Generate with AI', icon: '🤖' },
            { id: 'csv', label: 'Upload CSV/PDF', icon: '📄' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 rounded-lg border transition-all font-semibold ${
                activeTab === tab.id
                  ? 'bg-orange-500/20 text-white border-orange-500/30'
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Questions Summary */}
        {allQuestions.length > 0 && (
          <motion.div 
            className="rounded-lg p-4 border border-green-500/30 bg-green-500/10 mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">
                Total Questions Added: <span className="text-green-400">{allQuestions.length}</span>
              </span>
              <button
                onClick={handleSaveAndReturn}
                className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 transition-all text-sm font-semibold"
              >
                Save & Return to Assessment
              </button>
            </div>
          </motion.div>
        )}

        {/* Manual Write Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'manual' && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-lg p-8 border border-white/10 relative overflow-hidden"
              style={{ 
                backgroundColor: '#000000',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                transformStyle: 'preserve-3d'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none"></div>
              <div className="relative z-10">
                <form onSubmit={handleManualSubmit} className="space-y-6">
              {/* Question Type */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-white">Question Type</label>
                <div className="grid grid-cols-3 gap-4">
                  {['mcq', 'coding', 'video'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setQuestionType(type)}
                      className={`px-4 py-3 rounded-lg border transition-all font-semibold ${
                        questionType === type
                          ? 'bg-orange-500/20 text-white border-orange-500/30'
                          : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {type.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-white">Question</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your question here..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all resize-none"
                  rows={4}
                  required
                />
              </div>

                  {/* Options (for MCQ) */}
                  {questionType === 'mcq' && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-semibold text-white">Options</label>
                        <button
                          type="button"
                          onClick={handleAddOption}
                          className="text-sm text-orange-500 hover:text-orange-400 transition-colors"
                        >
                          + Add Option
                        </button>
                      </div>
                      <div className="space-y-3">
                        {options.map((option, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                              className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setCorrectAnswer(option)}
                              className={`px-4 py-2 rounded-lg border transition-all text-sm font-semibold ${
                                correctAnswer === option
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
                              }`}
                            >
                              Correct
                            </button>
                            {options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(index)}
                                className="p-2 text-red-400 hover:text-red-300 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Coding Question Fields */}
                  {questionType === 'coding' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold mb-3 text-white">Test Cases</label>
                        <textarea
                          value={testCases}
                          onChange={(e) => setTestCases(e.target.value)}
                          placeholder="Enter test cases..."
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all resize-none"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-3 text-white">Expected Output</label>
                        <textarea
                          value={expectedOutput}
                          onChange={(e) => setExpectedOutput(e.target.value)}
                          placeholder="Enter expected output..."
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all resize-none"
                          rows={3}
                        />
                      </div>
                    </>
                  )}

              {/* Difficulty and Points */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-white">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                  >
                    <option value="easy" className="bg-black">Easy</option>
                    <option value="medium" className="bg-black">Medium</option>
                    <option value="hard" className="bg-black">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3 text-white">Points</label>
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    min="1"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                    required
                  />
                </div>
              </div>

                  {/* Submit Buttons */}
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/create-assessment${assessmentId ? `?assessmentId=${assessmentId}` : ''}`)}
                      className="flex-1 py-3.5 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all font-semibold text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg font-bold text-white hover:from-orange-600 hover:to-orange-700 transition-all shadow-xl hover:shadow-2xl hover:shadow-orange-500/40 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Add Question
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* AI Generate Tab */}
          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-lg p-8 border border-white/10 relative overflow-hidden"
              style={{ 
                backgroundColor: '#000000',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                transformStyle: 'preserve-3d'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none"></div>
              <div className="relative z-10">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3 text-white">Prompt</label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Write your prompt to generate questions..."
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all resize-none"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-3 text-white">Difficulty</label>
                      <select
                        value={aiDifficulty}
                        onChange={(e) => setAiDifficulty(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                      >
                        <option value="easy" className="bg-black">Easy</option>
                        <option value="medium" className="bg-black">Medium</option>
                        <option value="hard" className="bg-black">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-3 text-white">Number of Questions</label>
                      <input
                        type="number"
                        value={aiQuestionCount}
                        onChange={(e) => setAiQuestionCount(e.target.value)}
                        min="1"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAIGenerate}
                    className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg font-bold text-white hover:from-orange-600 hover:to-orange-700 transition-all shadow-xl hover:shadow-2xl hover:shadow-orange-500/40 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Generate Questions
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* CSV Upload Tab */}
          {activeTab === 'csv' && (
            <motion.div
              key="csv"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-lg p-8 border border-white/10 relative overflow-hidden"
              style={{ 
                backgroundColor: '#000000',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                transformStyle: 'preserve-3d'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent pointer-events-none"></div>
              <div className="relative z-10">
                <div className="text-center">
                  <label className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center hover:border-orange-500/50 transition-colors cursor-pointer block">
                    <input
                      type="file"
                      accept=".csv,.pdf"
                      onChange={handleCSVUpload}
                      className="hidden"
                    />
                    <svg className="w-16 h-16 mx-auto mb-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-white mb-2 font-semibold">Drag & drop CSV/PDF here</p>
                    <p className="text-white/60 text-sm">or click to browse</p>
                    <p className="text-white/40 text-xs mt-2">Upload a .csv or .pdf file with questions</p>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </AdminLayout>
  );
};

export default CreateQuestions;

