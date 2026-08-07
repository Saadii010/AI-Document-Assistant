import React, { useState } from 'react';
import { ShieldAlert, Save, Eye, Search, Database, BarChart2, MessageSquare, Compass } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export interface PrivacyData {
  profileVisibility: 'public' | 'private' | 'contacts';
  searchVisibility: boolean;
  dataCollection: boolean;
  analytics: boolean;
  conversationHistory: boolean;
  personalization: boolean;
}

interface PrivacySettingsProps {
  initialData: PrivacyData;
  onSave: (data: PrivacyData) => Promise<void>;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  initialData,
  onSave,
}) => {
  const [profileVisibility, setProfileVisibility] = useState<PrivacyData['profileVisibility']>(initialData.profileVisibility || 'private');
  const [searchVisibility, setSearchVisibility] = useState(initialData.searchVisibility !== false);
  const [dataCollection, setDataCollection] = useState(initialData.dataCollection !== false);
  const [analytics, setAnalytics] = useState(initialData.analytics !== false);
  const [conversationHistory, setConversationHistory] = useState(initialData.conversationHistory !== false);
  const [personalization, setPersonalization] = useState(initialData.personalization !== false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        profileVisibility,
        searchVisibility,
        dataCollection,
        analytics,
        conversationHistory,
        personalization,
      });
      toast.success('Privacy configurations saved!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save privacy settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      {/* Title */}
      <div className="flex flex-col gap-1 pb-3 border-b border-zinc-100 dark:border-zinc-900">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Privacy & Data Governance</h3>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
          Govern your profile discoverability, workspace metadata indexing, chat logging, and marketing telemetry permissions.
        </p>
      </div>

      {/* Profile Visibility */}
      <div className="flex flex-col gap-2.5 text-left">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Profile Visibility Settings
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'private', label: 'Strict Private (Only Me)', desc: 'Your account stats and uploaded document metadata are hidden from other accounts.' },
            { id: 'contacts', label: 'Shared Contacts', desc: 'Allows trusted members inside your shared folders to inspect your document categories.' },
            { id: 'public', label: 'Public Index', desc: 'Permits standard web search crawlers and public profile lists to find your nickname.' },
          ].map((v) => {
            const isSelected = profileVisibility === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setProfileVisibility(v.id as PrivacyData['profileVisibility'])}
                className={`p-4 border rounded-xl flex flex-col text-left justify-between gap-2.5 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-55/10 dark:bg-indigo-950/25 text-indigo-600 dark:text-indigo-450 font-extrabold shadow-inner'
                    : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 bg-white dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold">{v.label}</span>
                  <span className="text-[9px] text-zinc-400 leading-normal font-normal">{v.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Switches Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Search visibility */}
        <label className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl cursor-pointer hover:bg-zinc-50/50 transition-colors">
          <div className="flex items-start gap-3 text-left">
            <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg shrink-0 mt-0.5 text-zinc-500">
              <Search className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Search Discovery Indexing</span>
              <span className="text-[10px] text-zinc-400 leading-normal">Permit users inside your workspace team to search your profile name.</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={searchVisibility}
            onChange={(e) => setSearchVisibility(e.target.checked)}
            className="rounded text-indigo-600 border-zinc-300 dark:border-zinc-850"
          />
        </label>

        {/* Data collection */}
        <label className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl cursor-pointer hover:bg-zinc-50/50 transition-colors">
          <div className="flex items-start gap-3 text-left">
            <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg shrink-0 mt-0.5 text-zinc-500">
              <Database className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Workspace Optimization Logs</span>
              <span className="text-[10px] text-zinc-400 leading-normal">Allow collecting anonymized performance metrics to fine-tune vector search logic.</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={dataCollection}
            onChange={(e) => setDataCollection(e.target.checked)}
            className="rounded text-indigo-600 border-zinc-300 dark:border-zinc-850"
          />
        </label>

        {/* Analytics */}
        <label className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl cursor-pointer hover:bg-zinc-50/50 transition-colors">
          <div className="flex items-start gap-3 text-left">
            <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg shrink-0 mt-0.5 text-zinc-500">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-zinc-850 dark:text-zinc-200">Personalization Tracking</span>
              <span className="text-[10px] text-zinc-400 leading-normal">Enables our engine to track feature clicks and custom interface habits.</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={analytics}
            onChange={(e) => setAnalytics(e.target.checked)}
            className="rounded text-indigo-600 border-zinc-300 dark:border-zinc-850"
          />
        </label>

        {/* Conversation history */}
        <label className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl cursor-pointer hover:bg-zinc-50/50 transition-colors">
          <div className="flex items-start gap-3 text-left">
            <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg shrink-0 mt-0.5 text-zinc-500">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-zinc-850 dark:text-zinc-200">Chat History Collection</span>
              <span className="text-[10px] text-zinc-400 leading-normal">Allows preserving your historical dialogues in your secure side drawer.</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={conversationHistory}
            onChange={(e) => setConversationHistory(e.target.checked)}
            className="rounded text-indigo-600 border-zinc-300 dark:border-zinc-850"
          />
        </label>

        {/* Personalization */}
        <label className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl cursor-pointer hover:bg-zinc-50/50 transition-colors">
          <div className="flex items-start gap-3 text-left">
            <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg shrink-0 mt-0.5 text-zinc-500">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-zinc-850 dark:text-zinc-200">Personalized Insights</span>
              <span className="text-[10px] text-zinc-400 leading-normal">Generates custom reading suggestions based on your document uploads.</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={personalization}
            onChange={(e) => setPersonalization(e.target.checked)}
            className="rounded text-indigo-600 border-zinc-300 dark:border-zinc-850"
          />
        </label>
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
          <span>Save Privacy Rules</span>
        </button>
      </div>
    </motion.form>
  );
};
