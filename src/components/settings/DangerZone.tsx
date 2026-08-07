import React, { useState } from 'react';
import { Trash2, ShieldAlert, Key, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

interface DangerZoneProps {
  onDeleteAccount: (passwordConfirm: string) => Promise<void>;
}

export const DangerZone: React.FC<DangerZoneProps> = ({ onDeleteAccount }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeCheck, setAgreeCheck] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error('You must provide your confirmation password to delete your account.');
      return;
    }
    if (!agreeCheck) {
      toast.error('You must accept the terms of data purging.');
      return;
    }
    if (confirmText.toLowerCase() !== 'delete') {
      toast.error('Please type the word "DELETE" to confirm account termination.');
      return;
    }

    if (
      window.confirm(
        'CRITICAL ALERT: Are you absolutely certain you want to permanently delete your account? This operation is absolute and cannot be undone. All documents, vector embeddings, conversations, settings, and profile details will be completely wiped from the database.'
      )
    ) {
      setIsDeleting(true);
      const toastId = toast.loading('Initiating account deletion and vector database purging...');
      try {
        await onDeleteAccount(password);
        toast.success('Your account has been deleted. Logging you out...', { id: toastId });
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete account.', { id: toastId });
        setIsDeleting(false);
      }
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
        <h3 className="text-sm font-bold text-zinc-900 dark:text-red-500">Danger Zone</h3>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
          Permanently delete your profile, documents, chats, and account metadata. These steps are irreversible.
        </p>
      </div>

      {/* Warning Alert Box */}
      <div className="p-4 border border-red-200 bg-red-50/10 dark:border-red-950/20 rounded-2xl flex items-start gap-3.5 text-left">
        <div className="p-2.5 bg-red-100 dark:bg-red-950/20 text-red-650 dark:text-red-450 rounded-xl shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-extrabold text-red-800 dark:text-red-400">Irreversible Action Warning</span>
          <p className="text-[10px] text-red-700/80 dark:text-red-400/80 leading-relaxed">
            By terminating your personal knowledge assistant profile, we will immediately initiate complete database cascade deletions. Your files, document indexes, vector embeddings, search activities, and billing metrics will be permanently erased.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleDeleteSubmit}
        className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl flex flex-col gap-4 text-left shadow-sm"
      >
        <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-100 dark:border-zinc-900">
          <Key className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Confirm Account Security</span>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Confirm Your Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isDeleting}
              className="w-full pl-3.5 pr-10 py-2 text-xs rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 outline-none focus:border-red-500 transition-colors shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-450 hover:text-zinc-700 dark:hover:text-zinc-250 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Text Confirmation code */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Type <span className="text-red-600 dark:text-red-400">"DELETE"</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            disabled={isDeleting}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 outline-none focus:border-red-500 transition-colors shadow-sm"
          />
        </div>

        {/* Checkbox agreement */}
        <label className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 cursor-pointer hover:bg-zinc-100/50 transition-all mt-2">
          <input
            type="checkbox"
            checked={agreeCheck}
            onChange={(e) => setAgreeCheck(e.target.checked)}
            disabled={isDeleting}
            className="rounded text-red-600 focus:ring-red-500 border-zinc-300 dark:border-zinc-850 mt-0.5"
          />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              I understand that all my cloud data and document embeddings will be wiped.
            </span>
            <span className="text-[9px] text-zinc-400">
              This action is fully irreversible and cannot be recovered under any circumstances.
            </span>
          </div>
        </label>

        {/* Delete Button */}
        <div className="flex items-center justify-end pt-3 border-t border-zinc-100 dark:border-zinc-900/40 mt-2">
          <button
            type="submit"
            disabled={isDeleting || !agreeCheck || confirmText.toLowerCase() !== 'delete'}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            {isDeleting ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>Permanently Delete My Account</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};
