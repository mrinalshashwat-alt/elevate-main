'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail, FiUsers, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { inviteOrganizationMember, bulkInviteOrganizationMembers } from '../api/organization';

/**
 * InviteMemberModal Component
 *
 * Modal for inviting members to an organization via email.
 * Supports both single and bulk invitations.
 *
 * Features:
 * - Single email invitation
 * - Bulk invitation (comma-separated or one per line)
 * - CSV paste support
 * - Role selection
 * - Success/error feedback
 */
const InviteMemberModal = ({ isOpen, onClose, organizationId, organizationName, onSuccess }) => {
  const [mode, setMode] = useState('single'); // 'single' or 'bulk'
  const [email, setEmail] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');
  const [role, setRole] = useState('member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const roles = [
    { value: 'member', label: 'Member', description: 'Basic access' },
    { value: 'admin', label: 'Administrator', description: 'Full organization control' },
    { value: 'recruiter', label: 'Recruiter', description: 'Manage job postings and candidates' },
    { value: 'training_admin', label: 'Training Admin', description: 'Manage training content' },
    { value: 'college_admin', label: 'College Admin', description: 'Manage college-specific features' },
    { value: 'interviewer', label: 'Interviewer', description: 'Conduct interviews' },
    { value: 'student', label: 'Student', description: 'Student access' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (mode === 'single') {
        // Single email invitation
        const result = await inviteOrganizationMember(organizationId, email.trim(), role);
        setSuccessMessage(result.detail || `Invitation sent to ${email}`);
        setEmail('');
      } else {
        // Bulk email invitation
        // Parse emails (support comma-separated, space-separated, or newline-separated)
        const emailList = bulkEmails
          .split(/[,\n\s]+/)
          .map(e => e.trim())
          .filter(e => e.length > 0);

        if (emailList.length === 0) {
          setError('Please enter at least one email address');
          setIsSubmitting(false);
          return;
        }

        const result = await bulkInviteOrganizationMembers(organizationId, emailList, role);

        const successCount = result.successful || 0;
        const failedCount = result.failed || 0;
        const alreadyMembersCount = result.already_members?.length || 0;

        let message = `Successfully sent ${successCount} invitation(s).`;
        if (failedCount > 0) {
          message += ` ${failedCount} failed.`;
        }
        if (alreadyMembersCount > 0) {
          message += ` ${alreadyMembersCount} user(s) already members.`;
        }

        setSuccessMessage(message);
        setBulkEmails('');
      }

      if (onSuccess) {
        onSuccess();
      }

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccessMessage('');
        setError('');
      }, 2000);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.email?.[0] ||
        'Failed to send invitation. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setBulkEmails('');
    setRole('member');
    setMode('single');
    setError('');
    setSuccessMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="invite-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
      >
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl relative"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FiMail className="w-6 h-6 text-orange-400" />
                  Invite Members to {organizationName}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Send email invitations to new members
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Mode Toggle */}
              <div className="flex gap-2 bg-white/5 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setMode('single')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    mode === 'single'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FiMail className="inline w-4 h-4 mr-2" />
                  Single Invitation
                </button>
                <button
                  type="button"
                  onClick={() => setMode('bulk')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    mode === 'bulk'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FiUsers className="inline w-4 h-4 mr-2" />
                  Bulk Invitation
                </button>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                  <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-2">
                  <FiCheck className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-300">{successMessage}</p>
                </div>
              )}

              {/* Single Email Mode */}
              {mode === 'single' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                    placeholder="user@example.com"
                  />
                </div>
              )}

              {/* Bulk Email Mode */}
              {mode === 'bulk' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Addresses *
                  </label>
                  <textarea
                    required
                    value={bulkEmails}
                    onChange={(e) => setBulkEmails(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all font-mono text-sm"
                    placeholder={`Enter multiple emails (one per line or comma-separated):\n\nuser1@example.com\nuser2@example.com\nuser3@example.com\n\nOr paste from CSV: user1@example.com, user2@example.com`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supports comma-separated, space-separated, or one email per line
                  </p>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label} - {r.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg font-medium text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg font-semibold text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </span>
                  ) : mode === 'single' ? (
                    'Send Invitation'
                  ) : (
                    'Send Invitations'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InviteMemberModal;
