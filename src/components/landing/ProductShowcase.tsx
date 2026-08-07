import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  MessageSquare,
  Search,
  FileText,
  Shield,
  Activity,
  HardDrive,
  Users,
  Sparkles,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

export const ProductShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'search' | 'viewer' | 'admin'>('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'User Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'chat', label: 'AI Chat Interface', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'search', label: 'Semantic Search', icon: <Search className="w-4 h-4" /> },
    { id: 'viewer', label: 'PDF Split Viewer', icon: <FileText className="w-4 h-4" /> },
    { id: 'admin', label: 'Admin Panel', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <section id="showcase" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <div className="text-center max-w-3xl mx-auto flex flex-col gap-4.5 mb-14">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
          The Experience
        </span>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
          Walk Through the Native Workspace
        </h2>
        <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
          Explore the exact polished workflows designed to accelerate your document digest cycles.
        </p>
      </div>

      {/* Showcase Tabs Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-4xl mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4.5 py-2.5 text-xs font-bold rounded-xl border transition-all ${
              activeTab === tab.id
                ? 'border-indigo-500 bg-indigo-50/10 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-950/20 shadow-sm'
                : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Screen Showcase Display Window */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl max-w-5xl mx-auto overflow-hidden">
        {/* Mock window control chrome */}
        <div className="px-5 py-3.5 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/20 select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          </div>
          <span className="text-[10px] font-bold text-zinc-400 font-mono">
            https://app.knowledge-ai.com/{activeTab}
          </span>
          <div className="w-8" />
        </div>

        {/* Dynamic Frame Render */}
        <div className="p-6 sm:p-10 min-h-[400px] bg-zinc-50/30 dark:bg-zinc-950/10">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                {/* Stats */}
                <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Total Active Indexed Files', val: '14 Documents', desc: '42.8 MB of text indexed' },
                    { label: 'Cumulative Semantic Queries', val: '1,429 Chats', desc: 'Average 1.2s response speed' },
                    { label: 'Vector Dimension Chunks', val: '4,892 Chunks', desc: '100% cloud db coverage' },
                  ].map((st, i) => (
                    <div key={i} className="p-4.5 rounded-xl border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900 flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{st.label}</span>
                      <span className="text-xl font-black text-zinc-900 dark:text-zinc-50">{st.val}</span>
                      <span className="text-[10px] text-zinc-400 font-medium">{st.desc}</span>
                    </div>
                  ))}
                </div>

                {/* Left Panel - File Inventory */}
                <div className="md:col-span-8 p-5 rounded-xl border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Recently Indexed Material</h4>
                  <div className="flex flex-col gap-2.5">
                    {[
                      { name: 'bylaws_and_contract_agreements.pdf', size: '2.5 MB', chunks: '128 chunks', date: 'Just now' },
                      { name: 'market_research_report_2026.docx', size: '1.4 MB', chunks: '84 chunks', date: '2 hours ago' },
                      { name: 'product_deployment_log_v4.txt', size: '480 KB', chunks: '12 chunks', date: 'Yesterday' },
                    ].map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 text-xs">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-indigo-500" />
                          <span className="font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[150px] sm:max-w-[250px]">{f.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-zinc-400">
                          <span className="font-mono text-[10px]">{f.size}</span>
                          <span className="hidden sm:inline font-mono text-[10px]">{f.chunks}</span>
                          <span className="text-[10px]">{f.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Panel - Upload Action */}
                <div className="md:col-span-4 p-5 rounded-xl border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900 flex flex-col justify-between items-center text-center gap-4">
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 self-start">Integrate New Files</h4>
                  <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-500 animate-pulse">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Drag & Drop new PDFs</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Chunk and vectorized instantly</p>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg p-2 text-xs font-bold text-zinc-500">
                    Browse Files
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch"
              >
                {/* Left side: Sessions */}
                <div className="md:col-span-4 p-4.5 rounded-xl border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900 flex flex-col gap-3">
                  <span className="text-[10px] font-bold uppercase text-zinc-400">Chat Sessions</span>
                  {[
                    { title: 'Bylaws Compliance QA', active: true },
                    { title: 'Market Trends Synthesis', active: false },
                    { title: 'Server Config Troubleshooting', active: false },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg text-xs font-bold transition-all ${
                        s.active
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                          : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border border-transparent text-zinc-500'
                      }`}
                    >
                      {s.title}
                    </div>
                  ))}
                </div>

                {/* Right side: Chat dialogue */}
                <div className="md:col-span-8 p-4.5 rounded-xl border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900 flex flex-col justify-between gap-5 min-h-[300px]">
                  <div className="flex flex-col gap-4">
                    {/* User */}
                    <div className="self-end max-w-[80%] p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Does section 5.2 of the contract authorize automated remote work claims?
                    </div>

                    {/* AI */}
                    <div className="self-start max-w-[85%] p-4.5 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 text-xs flex flex-col gap-2.5">
                      <span className="text-[10px] font-bold text-indigo-500 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 animate-pulse" /> Verified AI Answer:</span>
                      <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                        Yes. Section 5.2 (HR Reimbursements, page 14) explicitly allows full-time remote staff to claim up to $500 in ergo equipment.
                      </p>
                      {/* Citation */}
                      <div className="mt-1.5 p-2 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200/30 text-[9px] text-zinc-400 italic">
                        "Reimbursements: ...remote personnel are authorized up to $500 ergonomics stipend..." — corporate_bylaws.pdf (Page 14)
                      </div>
                    </div>
                  </div>

                  {/* Input form */}
                  <div className="p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-950/20 text-xs">
                    <span className="text-zinc-400 px-3">Query your indexed documents...</span>
                    <div className="px-3.5 py-1.5 bg-zinc-950 text-zinc-50 dark:bg-white dark:text-zinc-950 rounded-lg font-bold">
                      Send
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col gap-6"
              >
                {/* Search Header Bar */}
                <div className="p-4 rounded-xl border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900 flex items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <Search className="w-4 h-4 text-indigo-500" />
                    <span>Search guidelines for "patent disclosure timelines"...</span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-md">Semantic Match Engaged</span>
                </div>

                {/* Search Results */}
                <div className="flex flex-col gap-3">
                  {[
                    { doc: 'patent_guidelines_2026.pdf', text: 'Section 3.1: Inventors must file an initial design disclosure report within 45 days of project baseline confirmation.', score: '98% Semantic Score' },
                    { doc: 'engineering_spec_sheet.docx', text: 'Deployment timelines specify that patents related to core microkernel designs require secondary legal compliance audit logs before publication.', score: '84% Semantic Score' },
                  ].map((res, i) => (
                    <div key={i} className="p-4.5 rounded-xl border border-zinc-200/40 bg-white dark:border-zinc-800/40 dark:bg-zinc-900 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-zinc-400 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-indigo-400" /> {res.doc}</span>
                        <span className="font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">{res.score}</span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed italic">
                        "...{res.text}..."
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'viewer' && (
              <motion.div
                key="viewer"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-5"
              >
                {/* Left split - PDF layout highlights */}
                <div className="md:col-span-6 p-4.5 rounded-xl border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900 flex flex-col gap-4">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="font-bold text-zinc-400">PDF Reader Frame — Page 14 of 32</span>
                    <span className="text-[10px] font-bold text-indigo-500 font-mono">1 Citation Active</span>
                  </div>
                  {/* PDF content replica */}
                  <div className="flex flex-col gap-3 py-4 text-xs leading-relaxed text-zinc-500">
                    <p>Corporate Operational Expenditures: Expenses must remain aligned with regional budgetary directives.</p>
                    <div className="p-3.5 bg-yellow-400/20 dark:bg-yellow-400/10 rounded-xl border-l-4 border-yellow-400 text-zinc-800 dark:text-zinc-200">
                      "Reimbursements: ...remote personnel are authorized up to a $500 ergonomics workspace stipend..."
                    </div>
                    <p>All ergonomics equipment must be requested through HR portals within 30 days of active employment.</p>
                  </div>
                </div>

                {/* Right split - Chat pane citation tracer */}
                <div className="md:col-span-6 p-4.5 rounded-xl border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900 flex flex-col justify-between gap-5">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="font-bold text-zinc-400">Contextual Chat Companion</span>
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/10 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-indigo-500 flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 animate-pulse" /> Verified AI Response:</span>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                      Remote employees are allocated up to $500 for ergonomic office gear.
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/10 text-xs flex flex-col gap-1 select-none">
                    <span className="text-[9px] font-bold text-zinc-400">HIGHLIGHT CORRELATION:</span>
                    <p className="text-[10px] text-zinc-500 italic">"reimbursements: remote personnel ergonomics stipend..."</p>
                    <span className="text-[9px] font-bold text-indigo-500 mt-1 flex items-center gap-1"><BookOpen className="w-3 h-3" /> corporate_bylaws.pdf (Page 14)</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'admin' && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6"
              >
                {/* System charts */}
                <div className="md:col-span-4 p-5 rounded-xl border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5"><Activity className="w-4 h-4 text-emerald-500" /> Host System Metrics</h4>
                  <div className="flex flex-col gap-3 mt-1">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-zinc-500">CPU Usage</span>
                        <span className="text-zinc-700 dark:text-zinc-300">14.8 %</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="w-[14.8%] h-full bg-emerald-500" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-zinc-500">Memory Usage</span>
                        <span className="text-zinc-700 dark:text-zinc-300">42.2 %</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="w-[42.2%] h-full bg-emerald-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audit Logs */}
                <div className="md:col-span-8 p-5 rounded-xl border border-zinc-200/50 bg-white dark:border-zinc-800/50 dark:bg-zinc-900 flex flex-col gap-4">
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5"><Users className="w-4 h-4 text-indigo-500" /> Administrative Audit Log</h4>
                  <div className="flex flex-col gap-2 font-mono text-[10px] text-zinc-500">
                    <p className="p-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20"><span className="text-indigo-500">[INFO]</span> [04-Aug-2026 10:32] User (saadkust5481) successfully uploaded file: contract_agreements.pdf</p>
                    <p className="p-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20"><span className="text-emerald-500">[DB]</span> [04-Aug-2026 10:33] Generated 128 dense vector chunks in 420ms</p>
                    <p className="p-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20"><span className="text-amber-500">[AUTH]</span> [04-Aug-2026 10:35] Admin session active from IP: 192.168.1.1</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
export default ProductShowcase;
