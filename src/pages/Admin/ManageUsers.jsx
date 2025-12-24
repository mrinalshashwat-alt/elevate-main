'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../../api/admin';
import AdminLayout from '../../components/AdminLayout';
import RoleAssignmentModal from '../../components/RoleAssignmentModal';

const ManageUsers = () => {
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => getUsers(),
  });

  const handleReadOnlyAction = () => {
    alert('User provisioning is read-only in this build. Please use the backend admin or management commands to create or modify users.');
  };

  const handleEditRoles = (user) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };

  const handleRoleUpdateSuccess = () => {
    // Refresh the user list after role update
    refetch();
  };

  return (
    <AdminLayout title="Manage Users">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white">Manage Users</h1>
          <p className="text-gray-400">View and manage user accounts and permissions</p>
        </div>
        <button
          onClick={handleReadOnlyAction}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add User</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading users...</p>
        </div>
      ) : !usersData?.data || usersData.data.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-20 h-20 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
          <p className="text-gray-400 mb-6">Start by adding your first user</p>
          <button
            onClick={handleReadOnlyAction}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
          >
            Add User
          </button>
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Name</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Roles</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Organizations</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Status</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Joined</th>
                <th className="px-6 py-4 text-left text-gray-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersData.data.map((user) => (
                <tr key={user.id} className="border-t border-white/10 hover:bg-white/10 transition-colors duration-200">
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role, idx) => {
                          const getRoleBadgeColor = (roleName) => {
                            const roleColors = {
                              'Super Admin': 'bg-purple-500/20 border border-purple-500/40 text-purple-300',
                              'Recruiter Admin': 'bg-blue-500/20 border border-blue-500/40 text-blue-300',
                              'Training Admin': 'bg-green-500/20 border border-green-500/40 text-green-300',
                              'College Admin': 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300',
                              'Interviewer': 'bg-orange-500/20 border border-orange-500/40 text-orange-300',
                              'User': 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300',
                            };
                            return roleColors[roleName] || 'bg-gray-500/20 border border-gray-500/40 text-gray-300';
                          };

                          return (
                            <span
                              key={idx}
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(role)}`}
                            >
                              {role}
                            </span>
                          );
                        })
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-500/20 border border-gray-500/40 text-gray-300">
                          No roles
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.organizations && user.organizations.length > 0 ? (
                        user.organizations.map((org, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 border border-indigo-500/40 text-indigo-300"
                            title={org.org_type}
                          >
                            {org.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No organizations</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(user.joinedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditRoles(user)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 hover:border-blue-500/50 rounded-lg transition-all hover:scale-110"
                        title="Edit roles"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={handleReadOnlyAction}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-all hover:scale-110"
                        title="Delete user"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Role Assignment Modal */}
      <RoleAssignmentModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        user={selectedUser}
        onSuccess={handleRoleUpdateSuccess}
      />
    </AdminLayout>
  );
};

export default ManageUsers;
