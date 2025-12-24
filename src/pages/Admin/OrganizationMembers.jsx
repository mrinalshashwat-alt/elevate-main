'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiPlus, FiX, FiTrash2, FiAlertCircle, FiCheck, FiSearch, FiMail, FiUserPlus } from 'react-icons/fi';
import AdminLayout from '../../components/AdminLayout';
import InviteMemberModal from '../../components/InviteMemberModal';
import { fetchOrganizationMembers, addOrganizationMember, removeOrganizationMember } from '../../api/organization';
import { getUsers } from '../../api/admin';

const OrganizationMembers = ({ organizationId }) => {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { data: membersData, isLoading, refetch } = useQuery({
    queryKey: ['organizationMembers', organizationId],
    queryFn: () => fetchOrganizationMembers(organizationId),
    enabled: !!organizationId,
  });

  const { data: usersData } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => getUsers(),
  });

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      await addOrganizationMember(organizationId, selectedUserId, selectedRole);
      setSuccessMessage('Member added successfully');
      setIsAddModalOpen(false);
      setSelectedUserId('');
      setSelectedRole('member');
      refetch();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId, userName) => {
    if (!confirm(`Remove ${userName} from this organization?`)) return;

    try {
      await removeOrganizationMember(organizationId, userId);
      setSuccessMessage('Member removed successfully');
      refetch();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to remove member');
    }
  };

  const filteredUsers = usersData?.data?.filter((user) => {
    const alreadyMember = membersData?.results?.some((m) => m.user_id === user.id);
    if (alreadyMember) return false;

    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query)
    );
  });

  return (
    <AdminLayout title="Organization Members">
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/organizations')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <FiArrowLeft className="w-5 h-5" />
          Back to Organizations
        </button>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white">
              {membersData?.organization?.name || 'Organization'} Members
            </h1>
            <p className="text-gray-400">
              Manage members and their roles
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg font-semibold transition-all flex items-center space-x-2"
            >
              <FiUserPlus className="w-5 h-5" />
              <span>Add Existing User</span>
            </button>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-5 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center space-x-2"
            >
              <FiMail className="w-5 h-5" />
              <span>Invite via Email</span>
            </button>
          </div>
        </div>
      </div>

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2"
        >
          <FiCheck className="w-5 h-5 text-green-400" />
          <p className="text-sm text-green-300">{successMessage}</p>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2"
        >
          <FiAlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
        </motion.div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading members...</p>
        </div>
      ) : !membersData?.results || membersData.results.length === 0 ? (
        <div className="text-center py-16 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl">
          <FiPlus className="w-20 h-20 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold text-white mb-2">No members yet</h3>
          <p className="text-gray-400 mb-6">Add your first member to get started</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
          >
            Add Member
          </button>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Name</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Role</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Joined</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {membersData.results.map((member) => (
                <tr key={member.id} className="border-t border-white/10 hover:bg-white/10 transition-colors duration-200">
                  <td className="px-6 py-4 font-medium text-white">{member.name}</td>
                  <td className="px-6 py-4 text-gray-300">{member.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 border border-blue-500/40 text-blue-300">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{new Date(member.joined_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleRemoveMember(member.user_id, member.name)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-all"
                      title="Remove member"
                    >
                      <FiTrash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {isAddModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-md"
              >
                <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Add Member</h2>
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleAddMember} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Search & Select User *
                    </label>
                    <div className="relative mb-2">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all text-sm"
                      />
                    </div>
                    <select
                      required
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                    >
                      <option value="">Select a user...</option>
                      {filteredUsers?.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Role *
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="recruiter">Recruiter</option>
                      <option value="training_admin">Training Admin</option>
                      <option value="college_admin">College Admin</option>
                      <option value="interviewer">Interviewer</option>
                      <option value="student">Student</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg font-medium text-white hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg font-semibold text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Adding...' : 'Add Member'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        organizationId={organizationId}
        organizationName={membersData?.organization?.name || 'Organization'}
        onSuccess={() => {
          refetch();
          setSuccessMessage('Invitation(s) sent successfully');
          setTimeout(() => setSuccessMessage(''), 3000);
        }}
      />
    </AdminLayout>
  );
};

export default OrganizationMembers;
