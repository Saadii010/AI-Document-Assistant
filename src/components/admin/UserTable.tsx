import React, { useState } from 'react';
import { Edit2, Shield, Eye, Trash2, Power, Key, X, Search, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserTableProps {
  id: string;
  users: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onFetchUsers: (params: any) => void;
  onUpdateUser: (id: string, body: any) => Promise<boolean>;
  onDeleteUser: (id: string) => Promise<boolean>;
}

export const UserTable: React.FC<UserTableProps> = ({
  id,
  users,
  pagination,
  onFetchUsers,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Selected user actions
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [modalType, setModalType] = useState<'view' | 'edit' | 'suspend' | 'delete' | 'password' | null>(null);

  // Form states for edits
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    isActive: true,
  });
  const [newPassword, setNewPassword] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFetchUsers({
      page: 1,
      search: searchTerm,
      status: statusFilter,
      role: roleFilter,
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setRoleFilter('');
    onFetchUsers({ page: 1, search: '', status: '', role: '' });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    onFetchUsers({
      page: newPage,
      search: searchTerm,
      status: statusFilter,
      role: roleFilter,
    });
  };

  const openModal = (user: any, type: 'view' | 'edit' | 'suspend' | 'delete' | 'password') => {
    setSelectedUser(user);
    setModalType(type);
    if (type === 'edit') {
      setEditForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      });
    }
    setNewPassword('');
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalType(null);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    const success = await onUpdateUser(selectedUser.id, editForm);
    if (success) {
      closeModal();
      onFetchUsers({
        page: pagination.page,
        search: searchTerm,
        status: statusFilter,
        role: roleFilter,
      });
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    const success = await onUpdateUser(selectedUser.id, { isActive: !selectedUser.isActive });
    if (success) {
      closeModal();
      onFetchUsers({
        page: pagination.page,
        search: searchTerm,
        status: statusFilter,
        role: roleFilter,
      });
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;
    const success = await onUpdateUser(selectedUser.id, { password: newPassword });
    if (success) {
      closeModal();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    const success = await onDeleteUser(selectedUser.id);
    if (success) {
      closeModal();
      onFetchUsers({
        page: 1,
        search: searchTerm,
        status: statusFilter,
        role: roleFilter,
      });
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div id={id} className="space-y-4">
      {/* Search and Filters Bar */}
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search email, name or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-800 dark:text-zinc-200"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 text-xs font-black rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3.5 py-2 text-xs font-black rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-black rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-md shadow-indigo-500/10 transition-colors"
          >
            Filter
          </button>
          
          {(searchTerm || statusFilter || roleFilter) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3 py-2 text-xs font-black rounded-xl border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-500 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </form>

      {/* Main Table */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                <th className="py-4 px-6">User Accounts</th>
                <th className="py-4 px-4">Role</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4">Storage Used</th>
                <th className="py-4 px-4">Docs</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-xs">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400 dark:text-zinc-600 font-bold">
                    No matching user records located.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-400 shadow-sm">
                        {u.avatar ? (
                          <img src={u.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          `${u.firstName[0]}${u.lastName[0]}`
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-zinc-800 dark:text-zinc-100 block">
                          {u.firstName} {u.lastName}
                        </span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium block">
                          {u.email}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                        u.role === 'admin'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                        u.isActive
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-zinc-500 dark:text-zinc-400 font-bold">
                      {formatBytes(u.stats?.storageUsed || 0)}
                    </td>

                    <td className="py-4 px-4 text-zinc-500 dark:text-zinc-400 font-bold">
                      {u.stats?.documents || 0}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openModal(u, 'view')}
                          title="View user metrics"
                          className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openModal(u, 'edit')}
                          title="Edit user info"
                          className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openModal(u, 'password')}
                          title="Reset Password"
                          className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 transition-all cursor-pointer"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openModal(u, 'suspend')}
                          title={u.isActive ? "Suspend User" : "Activate User"}
                          className={`p-1.5 rounded-lg border hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer ${
                            u.isActive
                              ? 'border-zinc-200 text-zinc-500 hover:text-rose-600 dark:border-zinc-800'
                              : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 hover:text-emerald-700'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openModal(u, 'delete')}
                          title="Purge User"
                          className="p-1.5 rounded-lg border border-zinc-200 hover:border-rose-500/30 hover:bg-rose-500/5 text-zinc-400 hover:text-rose-600 dark:border-zinc-800 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {pagination.pages > 1 && (
          <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/10 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400">
              Showing page {pagination.page} of {pagination.pages} ({pagination.total} total records)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-500 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="p-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-500 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Dialogs/Modals */}
      <AnimatePresence>
        {modalType && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xs"
            />

            {/* Content modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 overflow-hidden z-10 space-y-5"
            >
              <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-900">
                <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                  {modalType === 'view' && 'User Information Summary'}
                  {modalType === 'edit' && 'Edit Account Specifications'}
                  {modalType === 'suspend' && (selectedUser.isActive ? 'Suspend User Access' : 'Reactivate User Access')}
                  {modalType === 'delete' && 'Permanently Delete User'}
                  {modalType === 'password' && 'Reset Account Password'}
                </h4>
                <button onClick={closeModal} className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* VIEW DETAIL */}
              {modalType === 'view' && (
                <div className="space-y-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  <div className="flex gap-4 items-center bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <div className="w-12 h-12 rounded-full bg-indigo-500 text-white font-black flex items-center justify-center text-lg">
                      {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                    </div>
                    <div>
                      <span className="text-sm font-black text-zinc-800 dark:text-zinc-200 block">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </span>
                      <span className="text-xs font-bold text-zinc-400">{selectedUser.email}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Total Uploads</span>
                      <span className="text-sm font-black text-zinc-800 dark:text-zinc-100">{selectedUser.stats?.documents || 0} files</span>
                    </div>
                    <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Volume Storage</span>
                      <span className="text-sm font-black text-zinc-800 dark:text-zinc-100">{formatBytes(selectedUser.stats?.storageUsed || 0)}</span>
                    </div>
                    <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Conversations</span>
                      <span className="text-sm font-black text-zinc-800 dark:text-zinc-100">{selectedUser.stats?.conversations || 0} active</span>
                    </div>
                    <div className="p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Account Role</span>
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase">{selectedUser.role}</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold space-y-1 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                    <div>CREATED: {new Date(selectedUser.createdAt).toLocaleString()}</div>
                    {selectedUser.lastLogin && (
                      <div>LAST SIGN-IN: {new Date(selectedUser.lastLogin).toLocaleString()}</div>
                    )}
                  </div>
                </div>
              )}

              {/* EDIT FORM */}
              {modalType === 'edit' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">First Name</label>
                      <input
                        type="text"
                        value={editForm.firstName}
                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Last Name</label>
                      <input
                        type="text"
                        value={editForm.lastName}
                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Email Address</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">System Role</label>
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Status</label>
                      <select
                        value={editForm.isActive ? 'true' : 'false'}
                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
                      >
                        <option value="true">Active</option>
                        <option value="false">Suspended</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveEdit}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              )}

              {/* SUSPEND DIALOG */}
              {modalType === 'suspend' && (
                <div className="space-y-4">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                    Are you absolutely sure you want to {selectedUser.isActive ? 'suspend' : 'activate'} the access license for{' '}
                    <span className="font-bold text-zinc-800 dark:text-zinc-100">{selectedUser.email}</span>?
                    {selectedUser.isActive && ' Suspended users will be booted instantly and denied auth verification.'}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={closeModal}
                      className="flex-1 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-500 text-xs font-black transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleToggleStatus}
                      className={`flex-1 py-2 rounded-xl text-white text-xs font-black shadow-md transition-colors cursor-pointer ${
                        selectedUser.isActive ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
                      }`}
                    >
                      {selectedUser.isActive ? 'Confirm Suspension' : 'Confirm Activation'}
                    </button>
                  </div>
                </div>
              )}

              {/* RESET PASSWORD */}
              {modalType === 'password' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">New Encrypted Password</label>
                    <input
                      type="password"
                      placeholder="Enter new strong credential..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100"
                    />
                  </div>

                  <button
                    onClick={handleResetPassword}
                    disabled={!newPassword}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black disabled:opacity-50 shadow-md transition-colors cursor-pointer"
                  >
                    Reset Password
                  </button>
                </div>
              )}

              {/* DELETE CONFIRM */}
              {modalType === 'delete' && (
                <div className="space-y-4">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                    Are you absolutely sure you want to completely purge user account{' '}
                    <span className="font-bold text-rose-600 dark:text-rose-400">{selectedUser.email}</span>?
                  </p>
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-[11px] font-medium leading-relaxed">
                    <span className="font-bold block">WARNING! This action is completely irreversible.</span>
                    It will immediately delete the account, all of their RAG documents, embeddings indexes, saved favorites, chat logs, and physical vector storage chunks.
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={closeModal}
                      className="flex-1 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-500 text-xs font-black transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteConfirm}
                      className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md hover:shadow-rose-600/10 transition-colors cursor-pointer"
                    >
                      Confirm Deletion
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
