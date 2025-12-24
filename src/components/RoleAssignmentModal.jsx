'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { fetchAvailableRoles, assignRole, removeRole } from '../api/auth';

/**
 * RoleAssignmentModal Component
 *
 * Modal for managing user roles in the system.
 * Follows Glider.ai pattern: Edit button → Modal → Role checkboxes → Save
 *
 * Features:
 * - Fetches available roles from backend
 * - Multi-select checkboxes for all roles
 * - Shows current user roles (checked)
 * - Super Admin only access
 * - Clean glassmorphic UI matching AdminLogin design
 */
const RoleAssignmentModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [initialRoles, setInitialRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch available roles on mount
  useEffect(() => {
    if (isOpen) {
      loadRoles();
    }
  }, [isOpen]);

  // Set initial selected roles when user changes
  useEffect(() => {
    if (user?.roles && Array.isArray(user.roles)) {
      setSelectedRoles(user.roles);
      setInitialRoles(user.roles);
    } else if (user?.role) {
      // Fallback for single role
      setSelectedRoles([user.role]);
      setInitialRoles([user.role]);
    } else {
      setSelectedRoles([]);
      setInitialRoles([]);
    }
  }, [user]);

  const loadRoles = async () => {
    setIsLoading(true);
    setError('');
    try {
      const roles = await fetchAvailableRoles();
      setAvailableRoles(roles);
    } catch (err) {
      setError('Failed to load available roles. Please try again.');
      console.error('Error fetching roles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleToggle = (roleName) => {
    setSelectedRoles((prev) => {
      if (prev.includes(roleName)) {
        return prev.filter((r) => r !== roleName);
      } else {
        return [...prev, roleName];
      }
    });
  };

  const handleSave = async () => {
    if (!user?.id) {
      setError('User ID is required.');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      // Determine which roles to add and which to remove
      const rolesToAdd = selectedRoles.filter((role) => !initialRoles.includes(role));
      const rolesToRemove = initialRoles.filter((role) => !selectedRoles.includes(role));

      // Execute role changes
      const promises = [];

      for (const role of rolesToAdd) {
        promises.push(assignRole(user.id, role));
      }

      for (const role of rolesToRemove) {
        promises.push(removeRole(user.id, role));
      }

      await Promise.all(promises);

      setSuccessMessage('Roles updated successfully!');
      setInitialRoles(selectedRoles);

      // Call success callback to refresh user list
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }

      // Close modal after short delay
      setTimeout(() => {
        onClose();
        setSuccessMessage('');
      }, 1500);
    } catch (err) {
      const errorMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.role?.[0] ||
        err?.message ||
        'Failed to update roles. Please try again.';
      setError(errorMessage);
      console.error('Error updating roles:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = () => {
    if (selectedRoles.length !== initialRoles.length) return true;
    return !selectedRoles.every((role) => initialRoles.includes(role));
  };

  const getRoleBadgeColor = (roleName) => {
    const roleColors = {
      'Super Admin': 'bg-purple-500/20 border-purple-500/40 text-purple-300',
      'Recruiter Admin': 'bg-blue-500/20 border-blue-500/40 text-blue-300',
      'Training Admin': 'bg-green-500/20 border-green-500/40 text-green-300',
      'College Admin': 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
      'Interviewer': 'bg-orange-500/20 border-orange-500/40 text-orange-300',
      'User': 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
    };
    return roleColors[roleName] || 'bg-gray-500/20 border-gray-500/40 text-gray-300';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Edit User Roles</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {user?.name || user?.email || 'User'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <FiX className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 max-h-96 overflow-y-auto">
                {/* Loading State */}
                {isLoading && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-3"></div>
                    <p className="text-gray-400 text-sm">Loading roles...</p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2"
                  >
                    <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300">{error}</p>
                  </motion.div>
                )}

                {/* Success Message */}
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-2"
                  >
                    <FiCheck className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-300">{successMessage}</p>
                  </motion.div>
                )}

                {/* Roles Checkboxes */}
                {!isLoading && availableRoles.length > 0 && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Select Roles
                    </label>
                    {availableRoles.map((role) => (
                      <label
                        key={role.name}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedRoles.includes(role.name)
                            ? 'bg-white/5 border-orange-500/50 hover:bg-white/10'
                            : 'bg-white/[0.02] border-white/10 hover:bg-white/5'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role.name)}
                          onChange={() => handleRoleToggle(role.name)}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-orange-500 focus:ring-2 focus:ring-orange-500/50"
                        />
                        <div className="flex-1">
                          <div
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                              role.name
                            )}`}
                          >
                            {role.name}
                          </div>
                          {role.description && (
                            <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && availableRoles.length === 0 && !error && (
                  <div className="text-center py-8">
                    <FiAlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No roles available</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/10 flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg font-medium text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges()}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg font-semibold text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RoleAssignmentModal;
