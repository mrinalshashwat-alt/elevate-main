'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createAssessment } from '../../api/admin';

const CreateAssessment = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    questions: 20,
    status: 'draft',
  });

  const createMutation = useMutation({
    mutationFn: createAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminAssessments'] });
      router.push('/admin/assessments');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Navigation Header */}
      <header className="bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
          <button 
            onClick={() => router.push('/admin/assessments')} 
            className="flex items-center space-x-2 hover:text-orange-400 transition-all group px-3 py-2 rounded-lg hover:bg-white/5"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back to Assessments</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Create Assessment</h1>
          </div>
          <div className="w-32"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        <motion.div 
          className="group relative bg-black/90 border border-[#FF5728] rounded-3xl p-8 overflow-hidden"
          style={{
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 87, 40, 0.3) inset',
            transformStyle: 'preserve-3d'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ 
            y: -8,
            scale: 1.01,
            transition: { duration: 0.3 }
          }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 overflow-hidden rounded-3xl">
            <div className="absolute top-2 left-2 right-0 bottom-0 bg-gradient-to-br from-white/20 via-transparent to-transparent"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
          
          <div className="relative z-20">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <label className="absolute -top-2 left-3 px-2 bg-black text-xs text-gray-400 group-focus-within:text-orange-400 transition-colors">Assessment Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/60 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder-gray-600 text-white"
                  placeholder="e.g., JavaScript Fundamentals"
                  required
                />
              </div>

              <div className="relative group">
                <label className="absolute -top-2 left-3 px-2 bg-black text-xs text-gray-400 group-focus-within:text-orange-400 transition-colors">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/60 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20 resize-none h-32 transition-all placeholder-gray-600 text-white"
                  placeholder="Describe what this assessment covers..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="relative group">
                  <label className="absolute -top-2 left-3 px-2 bg-black text-xs text-gray-400 group-focus-within:text-orange-400 transition-colors">Duration (minutes)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/60 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder-gray-600 text-white"
                    min="1"
                    required
                  />
                </div>

                <div className="relative group">
                  <label className="absolute -top-2 left-3 px-2 bg-black text-xs text-gray-400 group-focus-within:text-orange-400 transition-colors">Number of Questions</label>
                  <input
                    type="number"
                    value={formData.questions}
                    onChange={(e) => setFormData({ ...formData, questions: parseInt(e.target.value) })}
                    className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/60 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20 transition-all placeholder-gray-600 text-white"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="absolute -top-2 left-3 px-2 bg-black text-xs text-gray-400 group-focus-within:text-orange-400 transition-colors">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white/5 border border-white/15 rounded-xl focus:outline-none focus:border-orange-500/60 focus:bg-white/10 focus:ring-2 focus:ring-orange-500/20 transition-all text-white"
                >
                  <option value="draft" className="bg-gray-900">Draft</option>
                  <option value="published" className="bg-gray-900">Published</option>
                  <option value="archived" className="bg-gray-900">Archived</option>
                </select>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-orange-500/10 border border-blue-500/20 rounded-2xl p-6">
                <h3 className="font-semibold mb-3 flex items-center text-white">
                  <svg className="w-6 h-6 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Note
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  After creating the assessment, you'll be able to add questions, configure scoring, and set up advanced options.
                </p>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/admin/assessments')}
                  className="flex-1 py-3.5 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 rounded-xl font-bold text-white hover:from-orange-600 hover:to-orange-800 transition-all shadow-xl hover:shadow-2xl hover:shadow-orange-500/40 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {createMutation.isPending ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    'Create Assessment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default CreateAssessment;
