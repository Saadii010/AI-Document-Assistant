import React, { useState } from 'react';
import { Bell, Save, Mail, Monitor, Upload, Sparkles, ShieldCheck, RefreshCw, Bookmark } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export interface NotificationData {
  emailNotifications: boolean;
  browserNotifications: boolean;
  uploadNotifications: boolean;
  aiCompletionNotifications: boolean;
  securityAlerts: boolean;
  systemUpdates: boolean;
  newsletter: boolean;
}

interface NotificationSettingsProps {
  initialData: NotificationData;
  onSave: (data: NotificationData) => Promise<void>;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  initialData,
  onSave,
}) => {
  const [emailNotifications, setEmailNotifications] = useState(initialData.emailNotifications !== false);
  const [browserNotifications, setBrowserNotifications] = useState(initialData.browserNotifications !== false);
  const [uploadNotifications, setUploadNotifications] = useState(initialData.uploadNotifications !== false);
  const [aiCompletionNotifications, setAiCompletionNotifications] = useState(initialData.aiCompletionNotifications !== false);
  const [securityAlerts, setSecurityAlerts] = useState(initialData.securityAlerts !== false);
  const [systemUpdates, setSystemUpdates] = useState(initialData.systemUpdates !== false);
  const [newsletter, setNewsletter] = useState(initialData.newsletter === true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        emailNotifications,
        browserNotifications,
        uploadNotifications,
        aiCompletionNotifications,
        securityAlerts,
        systemUpdates,
        newsletter,
      });
      toast.success('Notification settings saved!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save notifications.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggles = [
    {
      id: 'email',
      label: 'Email Notifications',
      desc: 'Receive messages on document indexing states and chat reports directly inside your inbox.',
      icon: Mail,
      color: 'text-indigo-500',
      bg: 'bg-indigo-50/20 dark:bg-indigo-950/20',
      state: emailNotifications,
      setter: setEmailNotifications,
    },
    {
      id: 'browser',
      label: 'In-App Browser Prompts',
      desc: 'Enables quick workspace toaster notifications for actions happening inside the dashboard.',
      icon: Monitor,
      color: 'text-sky-500',
      bg: 'bg-sky-50/20 dark:bg-sky-950/20',
      state: browserNotifications,
      setter: setBrowserNotifications,
    },
    {
      id: 'upload',
      label: 'Upload Confirmations',
      desc: 'Receive immediate alerts when your files start processing and successfully finish indexing.',
      icon: Upload,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50/20 dark:bg-emerald-950/20',
      state: uploadNotifications,
      setter: setUploadNotifications,
    },
    {
      id: 'ai',
      label: 'AI Completion Reports',
      desc: 'Get alerted when long AI model reasoning procedures, summaries, or exports are compiled.',
      icon: Sparkles,
      color: 'text-purple-500',
      bg: 'bg-purple-50/20 dark:bg-purple-950/20',
      state: aiCompletionNotifications,
      setter: setAiCompletionNotifications,
    },
    {
      id: 'security',
      label: 'Critical Security Alerts',
      desc: 'Get notified immediately of password changes, session revocations, or foreign IP logs.',
      icon: ShieldCheck,
      color: 'text-rose-500',
      bg: 'bg-rose-50/20 dark:bg-rose-950/20',
      state: securityAlerts,
      setter: setSecurityAlerts,
    },
    {
      id: 'system',
      label: 'Core System Updates',
      desc: 'Receive alerts regarding software optimizations, model deprecations, or performance maintenance.',
      icon: RefreshCw,
      color: 'text-violet-500',
      bg: 'bg-violet-50/20 dark:bg-violet-950/20',
      state: systemUpdates,
      setter: setSystemUpdates,
    },
    {
      id: 'newsletter',
      label: 'Weekly Newsletter Digests',
      desc: 'Opt-in to receiving weekly personal assistant statistics, productivity tips, and expert use-cases.',
      icon: Bookmark,
      color: 'text-amber-500',
      bg: 'bg-amber-50/20 dark:bg-amber-950/20',
      state: newsletter,
      setter: setNewsletter,
    },
  ];

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      {/* Title */}
      <div className="flex flex-col gap-1 pb-3 border-b border-zinc-100 dark:border-zinc-900">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Notification Preferences</h3>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
          Set rules for when, where, and how you receive workspace logs, alerts, updates, and digests.
        </p>
      </div>

      {/* Grid of Toggles */}
      <div className="flex flex-col gap-3.5">
        {toggles.map((tog) => {
          const Icon = tog.icon;
          return (
            <div
              key={tog.id}
              className="flex items-start justify-between gap-4 p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3.5 text-left">
                <div className={`p-2.5 rounded-lg ${tog.bg} ${tog.color} shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-normal">{tog.label}</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed max-w-xl">{tog.desc}</p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => tog.setter(!tog.state)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  tog.state ? 'bg-indigo-600' : 'bg-zinc-250 dark:bg-zinc-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    tog.state ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end pt-4 border-t border-zinc-100 dark:border-zinc-900 mt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>Save Notifications</span>
        </button>
      </div>
    </motion.form>
  );
};
