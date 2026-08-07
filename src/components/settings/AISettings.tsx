import React, { useState } from 'react';
import { Cpu, Save, Sliders, Sparkles, MessageSquare, Info } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export interface AIData {
  preferredModel: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  streaming: boolean;
  defaultDocSelection: string;
  autoSaveConversations: boolean;
  citationDisplay: boolean;
  responseLanguage: string;
}

interface AISettingsProps {
  initialData: AIData;
  onSave: (data: AIData) => Promise<void>;
}

export const AISettings: React.FC<AISettingsProps> = ({
  initialData,
  onSave,
}) => {
  const [preferredModel, setPreferredModel] = useState(initialData.preferredModel || 'Gemini 1.5 Flash');
  const [temperature, setTemperature] = useState(initialData.temperature !== undefined ? initialData.temperature : 0.7);
  const [maxTokens, setMaxTokens] = useState(initialData.maxTokens || 2048);
  const [topP, setTopP] = useState(initialData.topP !== undefined ? initialData.topP : 0.95);
  const [streaming, setStreaming] = useState(initialData.streaming !== false);
  const [defaultDocSelection, setDefaultDocSelection] = useState(initialData.defaultDocSelection || 'all');
  const [autoSaveConversations, setAutoSaveConversations] = useState(initialData.autoSaveConversations !== false);
  const [citationDisplay, setCitationDisplay] = useState(initialData.citationDisplay !== false);
  const [responseLanguage, setResponseLanguage] = useState(initialData.responseLanguage || 'en');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave({
        preferredModel,
        temperature,
        maxTokens,
        topP,
        streaming,
        defaultDocSelection,
        autoSaveConversations,
        citationDisplay,
        responseLanguage,
      });
      toast.success('AI configurations updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update AI configurations.');
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
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">AI LLM Model Configuration</h3>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
          Fine-tune the cognitive defaults, hyperparameter thresholds, text streaming speeds, and default query behaviors.
        </p>
      </div>

      {/* Model Selection Cards */}
      <div className="flex flex-col gap-2.5">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Preferred LLM Model Engine
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              id: 'Gemini 1.5 Flash',
              name: 'Gemini 1.5 Flash',
              desc: 'Optimized for lighting-fast summaries, context scanning, and real-time response times.',
              badge: 'Default Engine',
            },
            {
              id: 'Gemini 1.5 Pro',
              name: 'Gemini 1.5 Pro',
              desc: 'High-cognitive deep reasoning, ideal for complex multi-format documents and structured files.',
              badge: 'Deep Analytics',
            },
          ].map((m) => {
            const isSelected = preferredModel === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setPreferredModel(m.id)}
                className={`p-4 border rounded-xl flex flex-col text-left justify-between gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/15 ring-1 ring-indigo-500'
                    : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950 hover:bg-zinc-50/50'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-2 bg-indigo-50 dark:bg-zinc-900 text-indigo-500 rounded-lg shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-zinc-850 dark:text-zinc-150">{m.name}</span>
                    <span className="text-[10px] text-zinc-400 leading-normal">{m.desc}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between w-full mt-1 pt-2 border-t border-zinc-100 dark:border-zinc-900/40">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{m.badge}</span>
                  {isSelected && (
                    <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Parameters */}
      <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/20 dark:bg-zinc-950 rounded-2xl flex flex-col gap-5">
        <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-100 dark:border-zinc-900">
          <Sliders className="w-4 h-4 text-zinc-400" />
          <h4 className="text-xs font-bold text-zinc-850 dark:text-zinc-200">Hyperparameters</h4>
        </div>

        {/* Temperature Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Temperature</span>
            <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{temperature}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.2"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-indigo-600 h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-800"
          />
          <div className="flex items-center justify-between text-[9px] text-zinc-400">
            <span>Deterministic / Strict</span>
            <span>Creative / Creative</span>
          </div>
        </div>

        {/* Top P Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Top-P</span>
            <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{topP}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={topP}
            onChange={(e) => setTopP(parseFloat(e.target.value))}
            className="w-full accent-indigo-600 h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-800"
          />
        </div>

        {/* Maximum Tokens */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Maximum Generation Length</span>
            <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{maxTokens} tokens</span>
          </div>
          <input
            type="range"
            min="256"
            max="8192"
            step="256"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            className="w-full accent-indigo-600 h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-800"
          />
        </div>
      </div>

      {/* Switches Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Streaming responses */}
        <label className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl cursor-pointer hover:bg-zinc-50/50">
          <div className="flex flex-col gap-0.5 max-w-xs text-left">
            <span className="text-xs font-bold text-zinc-850 dark:text-zinc-150">Streaming Responses</span>
            <span className="text-[10px] text-zinc-400 leading-normal">Generate words incrementally with real-time feedback loops.</span>
          </div>
          <input
            type="checkbox"
            checked={streaming}
            onChange={(e) => setStreaming(e.target.checked)}
            className="rounded text-indigo-600 border-zinc-300 dark:border-zinc-800"
          />
        </label>

        {/* Citation Display */}
        <label className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl cursor-pointer hover:bg-zinc-50/50">
          <div className="flex flex-col gap-0.5 max-w-xs text-left">
            <span className="text-xs font-bold text-zinc-850 dark:text-zinc-150">Citation & Source Mapping</span>
            <span className="text-[10px] text-zinc-400 leading-normal">Render text bookmarks and inline hyperlinks referring to document snippets.</span>
          </div>
          <input
            type="checkbox"
            checked={citationDisplay}
            onChange={(e) => setCitationDisplay(e.target.checked)}
            className="rounded text-indigo-600 border-zinc-300 dark:border-zinc-800"
          />
        </label>

        {/* Auto Save */}
        <label className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl cursor-pointer hover:bg-zinc-50/50">
          <div className="flex flex-col gap-0.5 max-w-xs text-left">
            <span className="text-xs font-bold text-zinc-850 dark:text-zinc-150">Auto-Save Conversations</span>
            <span className="text-[10px] text-zinc-400 leading-normal">Persist dialogue histories in the clouds automatically.</span>
          </div>
          <input
            type="checkbox"
            checked={autoSaveConversations}
            onChange={(e) => setAutoSaveConversations(e.target.checked)}
            className="rounded text-indigo-600 border-zinc-300 dark:border-zinc-800"
          />
        </label>

        {/* Default Selection */}
        <div className="flex flex-col gap-1.5 p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl text-left">
          <span className="text-xs font-bold text-zinc-850 dark:text-zinc-150">Default Document Selection</span>
          <select
            value={defaultDocSelection}
            onChange={(e) => setDefaultDocSelection(e.target.value)}
            className="mt-1 px-3.5 py-2 text-xs rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
          >
            <option value="all">Query all libraries and directories</option>
            <option value="recent">Limit to recently viewed documents only</option>
            <option value="none">No default documents (Pure chat mode)</option>
          </select>
        </div>

        {/* Response Language */}
        <div className="flex flex-col gap-1.5 p-4 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl text-left sm:col-span-2">
          <span className="text-xs font-bold text-zinc-850 dark:text-zinc-150">Preferred Response Language</span>
          <select
            value={responseLanguage}
            onChange={(e) => setResponseLanguage(e.target.value)}
            className="mt-1 px-3.5 py-2 text-xs rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 outline-none focus:border-indigo-500 shadow-sm cursor-pointer"
          >
            <option value="en">English (US)</option>
            <option value="es">Spanish (Español)</option>
            <option value="fr">French (Français)</option>
            <option value="de">German (Deutsch)</option>
            <option value="zh">Chinese (中文)</option>
            <option value="ur">Urdu (اردو)</option>
          </select>
        </div>
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
          <span>Save AI Settings</span>
        </button>
      </div>
    </motion.form>
  );
};
