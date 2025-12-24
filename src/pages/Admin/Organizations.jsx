'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiUsers, FiX, FiHome, FiAlertCircle } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import { fetchOrganizations, createOrganization } from '../../api/organization';

const Organizations = () => {
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    org_type: 'company',
    max_seats: 50,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { data: orgsData, isLoading, refetch } = useQuery({
    queryKey: ['organizations'],
    queryFn: fetchOrganizations,
  });

  const handleCreateOrganization = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await createOrganization(formData);
      setIsCreateModalOpen(false);
      setFormData({ name: '', org_type: 'company', max_seats: 50 });
      refetch();
    } catch (err) {
      setError(err?.response?.data?.name?.[0] || err?.response?.data?.detail || 'Failed to create organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOrgTypeDisplay = (type) => {
    const types = {
      company: 'Company',
      college: 'College',
      platform: 'Platform (B2C)',
    };
    return types[type] || type;
  };

  const getOrgTypeBadge = (type) => {
    const badges = {
      company: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
      college: 'bg-green-500/20 border-green-500/40 text-green-300',
      platform: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
    };
    return badges[type] || 'bg-gray-500/20 border-gray-500/40 text-gray-300';
  };

  return (
    <AdminLayout title="Organizations">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Organizations</h1>
          <p className="text-gray-400">Manage organizations and their members</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center space-x-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Create Organization</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading organizations...</p>
        </div>
      ) : !orgsData?.results || orgsData.results.length === 0 ? (
        <div className="text-center py-16">
          <FiHome className="w-20 h-20 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold text-white mb-2">No organizations yet</h3>
          <p className="text-gray-400 mb-6">Create your first organization to get started</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
          >
            Create Organization
          </button>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Name</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Type</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Members</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Seats</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Created</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orgsData.results.map((org) => (
                <tr key={org.id} className="border-t border-white/10 hover:bg-white/10 transition-colors duration-200">
                  <td className="px-6 py-4 font-semibold text-white">{org.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getOrgTypeBadge(org.org_type)}`}>
                      {getOrgTypeDisplay(org.org_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{org.member_count}</td>
                  <td className="px-6 py-4 text-gray-300">{org.max_seats}</td>
                  <td className="px-6 py-4 text-gray-300">{new Date(org.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => router.push(`/admin/organizations/${org.id}/members`)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 rounded-lg transition-all text-sm font-medium text-blue-300"
                    >
                      <FiUsers className="w-4 h-4" />
                      Manage Members
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <div
              onClick={() => setIsCreateModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-md relative"
              >
                <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Create Organization</h2>
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleCreateOrganization} className="p-6 space-y-4">
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                      <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                      placeholder="e.g., Acme Corporation"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Organization Type *
                    </label>
                    <select
                      value={formData.org_type}
                      onChange={(e) => setFormData({ ...formData, org_type: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                    >
                      <option value="company">Company</option>
                      <option value="college">College</option>
                      <option value="platform">Platform (B2C)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Seats *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.max_seats}
                      onChange={(e) => setFormData({ ...formData, max_seats: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg font-medium text-white hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg font-semibold text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Creating...' : 'Create Organization'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default Organizations;
