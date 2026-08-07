import React, { useState } from 'react';
import { Shield, Save, Eye, EyeOff, Key, ShieldAlert, Download } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

interface SecuritySettingsProps {
  onPasswordChange: (data: any) => Promise<void>;
  onDownloadSecurityLogs: () => Promise<void>;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  onPasswordChange,
  onDownloadSecurityLogs,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tfaEnabled, setTfaEnabled] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Current password is required.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    setIsSubmitting(true);
    try {
      await onPasswordChange({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Your password has been changed successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update your password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTfaToggle = () => {
    setTfaEnabled(!tfaEnabled);
    if (!tfaEnabled) {
      toast.success('Two-Factor Authentication Setup initialized (Placeholder). Scan QR code to bind Authenticator app.');
    } else {
      toast.success('Two-Factor Authentication de-authorized successfully.');
    }
  };

  const handleDownloadLogs = async () => {
    const toastId = toast.loading('Compiling security audit logs...');
    try {
      await onDownloadSecurityLogs();
      toast.success('Security logs downloaded successfully!', { id: toastId });
    } catch (e: any) {
      toast.error('Failed to download security logs.', { id: toastId });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      {/* Title */}
      <div className="flex flex-col gap-1 pb-3 border-b border-zinc-100 dark:border-zinc-900">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Security & Authentication</h3>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
          Reinforce account access safety, update your secret password, and configure two-factor authenticator safeguards.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Change Password Card */}
        <form
          onSubmit={handlePasswordSubmit}
          className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl flex flex-col gap-4 text-left shadow-sm"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-900">
            <Key className="w-4 h-4 text-zinc-400" />
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Change Password</span>
          </div>

          {/* Current Password */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3.5 pr-10 py-2 text-xs rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 outline-none focus:border-indigo-500 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-450 hover:text-zinc-700 dark:hover:text-zinc-250 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3.5 pr-10 py-2 text-xs rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 outline-none focus:border-indigo-500 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-450 hover:text-zinc-700 dark:hover:text-zinc-250 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3.5 pr-10 py-2 text-xs rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 outline-none focus:border-indigo-500 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-450 hover:text-zinc-700 dark:hover:text-zinc-250 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2 mt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Update Password</span>
            </button>
          </div>
        </form>

        {/* Right Columns: TFA & Logs */}
        <div className="flex flex-col gap-6">
          {/* Two Factor Authentication Card */}
          <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl flex flex-col gap-4 text-left shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-900">
              <Shield className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Two-Factor Authentication (2FA)</span>
            </div>

            <p className="text-[10px] text-zinc-400 leading-normal">
              Inject an auxiliary layer of safety to your account by requesting a unique 6-digit pin code in your mobile Authenticator app during logging in.
            </p>

            <div className="flex items-center justify-between p-3 border border-zinc-250/40 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 rounded-xl">
              <div className="flex flex-col">
                <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200">Authenticator Application</span>
                <span className="text-[9px] text-zinc-400">Google Authenticator, Authy, or Duo</span>
              </div>
              <button
                type="button"
                onClick={handleTfaToggle}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  tfaEnabled ? 'bg-indigo-600' : 'bg-zinc-250 dark:bg-zinc-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    tfaEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Audit Logs Card */}
          <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl flex flex-col gap-4 text-left shadow-sm">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-900">
              <ShieldAlert className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Security Audit Logging</span>
            </div>

            <p className="text-[10px] text-zinc-400 leading-normal">
              Inspect historical account actions, password updates, exports, imports, and logins to audit potential compromises.
            </p>

            <button
              onClick={handleDownloadLogs}
              className="w-full px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-250/20 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download Security Audit Logs
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
