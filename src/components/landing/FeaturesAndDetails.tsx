import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  Upload,
  Cpu,
  MessageSquare,
  Search,
  Bookmark,
  FileText,
  ShieldAlert,
  BarChart3,
  Moon,
  Smartphone,
  Check,
  ChevronRight,
  ArrowDown,
  Database,
  Terminal,
  Activity,
  Zap,
  Lock,
  Eye,
  BookOpen,
  GraduationCap,
  Briefcase,
  Scale,
  DollarSign,
  Heart,
} from 'lucide-react';

export const FeaturesAndDetails: React.FC = () => {
  // Use Case Selection State
  const [selectedUseCase, setSelectedUseCase] = useState<string>('Researchers');

  const features = [
    {
      icon: <Shield className="w-5 h-5 text-indigo-500" />,
      title: 'Secure Authentication',
      description: 'Role-based access routes with industry-standard JWT sessions, secure bcrypt passwords, and complete session auditing.',
    },
    {
      icon: <Upload className="w-5 h-5 text-indigo-500" />,
      title: 'Document Upload',
      description: 'Upload PDF, DOCX, or TXT documents easily. Supports drag-and-drop actions and handles multi-format parsing.',
    },
    {
      icon: <Cpu className="w-5 h-5 text-indigo-500" />,
      title: 'RAG Pipeline',
      description: 'Retrieval-Augmented Generation contextually matches your queries with extracted paragraphs to construct replies.',
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-indigo-500" />,
      title: 'AI Chat Panel',
      description: 'Interact with Gemini AI trained strictly on your documentation. Full chat history, session saving, and prompt inputs.',
    },
    {
      icon: <Search className="w-5 h-5 text-indigo-500" />,
      title: 'Semantic Search',
      description: 'Vector-based searches powered by sentence embeddings. Retrieve conceptual matches regardless of exact keywords.',
    },
    {
      icon: <Bookmark className="w-5 h-5 text-indigo-500" />,
      title: 'Source Citations',
      description: 'absolute transparency. Every AI statement lists precise files, page locations, and matches direct quotes.',
    },
    {
      icon: <FileText className="w-5 h-5 text-indigo-500" />,
      title: 'PDF Viewer',
      description: 'A responsive side-by-side split layout reading workspace showing chat controls and highlighted search citations.',
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-indigo-500" />,
      title: 'Admin Console',
      description: 'Comprehensive controller dashboard offering CPU monitoring, system metrics, activity logs, and rate managers.',
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-indigo-500" />,
      title: 'Detailed Analytics',
      description: 'Interactive system usage charts showing data growth, chunk densities, response lag, and database collections.',
    },
    {
      icon: <Moon className="w-5 h-5 text-indigo-500" />,
      title: 'Dark Mode Support',
      description: 'A beautifully calibrated premium interface supporting both highly legible light mode and eye-safe twilight dark mode.',
    },
    {
      icon: <Smartphone className="w-5 h-5 text-indigo-500" />,
      title: 'Responsive Design',
      description: 'Perfect visual alignment on notebooks, tablets, and mobile devices for a fluid work experience anywhere.',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Upload Documents',
      desc: 'Drag and drop PDFs, manuals, or research papers into your secure workspace portal.',
    },
    {
      num: '02',
      title: 'AI Processes Content',
      desc: 'Our engine extracts text blocks, normalizes formatting, and sanitizes characters automatically.',
    },
    {
      num: '03',
      title: 'Generate Embeddings',
      desc: 'Text blocks are split into overlapping semantic chunks and converted to high-dimensional vector embeddings.',
    },
    {
      num: '04',
      title: 'Ask Questions',
      desc: 'Consult your private assistant via a clean conversational chat panel or structured semantic keyword searches.',
    },
    {
      num: '05',
      title: 'Receive Answers',
      desc: 'Get highly accurate answers compiled exclusively from your documents. Zero hallucinations.',
    },
    {
      num: '06',
      title: 'View Source Citations',
      desc: 'Instantly view document references, direct quotes, and highlighted paragraphs right in the PDF layout.',
    },
  ];

  const useCases = [
    {
      id: 'Researchers',
      icon: <BookOpen className="w-4 h-4" />,
      title: 'Scientific & Academic Researchers',
      desc: 'Quickly digest thousands of pages of academic journals, review medical studies, cross-reference statistics across hundreds of files, and track exact sources for bibliographic documentation with absolute certainty.',
      bullets: [
        'Query cross-document literature instantly',
        'Extract complex formulas and parameters',
        'Maintain exact bibliographies automatically',
      ]
    },
    {
      id: 'Students',
      icon: <GraduationCap className="w-4 h-4" />,
      title: 'Higher Education Students',
      desc: 'Upload class textbooks, lecture transcript logs, and research briefs. Quiz yourself on lecture topics, summarize chapters instantly, and generate high-fidelity study guides grounded purely in course materials.',
      bullets: [
        'Generate study guides from lecture audio scripts',
        'Trace textbook pages for syllabus topics',
        'Grounded summaries prevent academic errors',
      ]
    },
    {
      id: 'Developers',
      icon: <Terminal className="w-4 h-4" />,
      title: 'Software Developers & Architects',
      desc: 'Index legacy software codebases, third-party framework documents, API endpoints, and architectural blueprints. Search configuration guidelines, debug issues, and draft integrations based on private spec sheets.',
      bullets: [
        'Index complex API specifications',
        'Find code configuration criteria instantly',
        'Reference structural architecture guidelines',
      ]
    },
    {
      id: 'Businesses',
      icon: <Briefcase className="w-4 h-4" />,
      title: 'SaaS & Enterprise Operations',
      desc: 'Centralize standard operating procedures, customer support logs, product brochures, and compliance policies. Accelerate employee onboarding and handle routine customer queries safely from a validated source.',
      bullets: [
        'Centralize company SOP directories',
        'Automate customer success context lookups',
        'Speed up employee onboarding guidelines',
      ]
    },
    {
      id: 'LawFirms',
      icon: <Scale className="w-4 h-4" />,
      title: 'Legal Counsel & Law Firms',
      desc: 'Analyze massive litigation discovery binders, corporate bylaws, historical cases, and active contracts. Locate critical clauses, verify conflicting agreements, and citation-check legal filings securely.',
      bullets: [
        'Query discovery documents for evidence',
        'Locate conflicting clauses across binders',
        'Absolute client-confidential isolation',
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-28 md:gap-36">
      
      {/* 1. FEATURES SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto flex flex-col gap-4.5 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
            Unparalleled Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Engineered with Premium Full-Stack Features
          </h2>
          <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            A comprehensive information retrieval ecosystem tailored for absolute accuracy, maximum speed, and enterprise reliability.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="p-6.5 rounded-2xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-900/30 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg hover:shadow-indigo-500/[0.02] transition-all group select-none"
            >
              <div className="w-11 h-11 rounded-xl bg-zinc-900/5 text-zinc-900 dark:bg-white/5 dark:text-zinc-50 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300 shadow-inner">
                {feat.icon}
              </div>
              <h3 className="text-base font-bold mb-2 text-zinc-900 dark:text-zinc-50">
                {feat.title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                {feat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 2. HOW IT WORKS TIMELINE */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
        <div className="text-center max-w-3xl mx-auto flex flex-col gap-4.5 mb-20">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
            Seamless Orchestration
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            From Document to Verified Answer
          </h2>
          <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Discover the exact workflow path of our contextual processing engine.
          </p>
        </div>

        {/* Animated Horizontal Timeline on large screens, vertical list on mobile */}
        <div className="relative">
          {/* Background trace line */}
          <div className="hidden lg:block absolute top-[44px] left-12 right-12 h-[1.5px] bg-gradient-to-r from-indigo-500/20 via-purple-500/30 to-indigo-500/20" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {steps.map((st, idx) => (
              <motion.div
                key={st.num}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="flex flex-col items-center text-center group"
              >
                {/* Timeline Circle */}
                <div className="w-12 h-12 rounded-full border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center font-mono text-xs font-bold text-indigo-500 dark:text-indigo-400 shadow-md group-hover:border-indigo-500 group-hover:scale-105 transition-all duration-300 z-10 mb-5 select-none">
                  {st.num}
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                  {st.title}
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                  {st.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. AI WORKFLOW DIAGRAM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
        <div className="p-8 sm:p-12 rounded-2xl border border-zinc-200/60 bg-zinc-50/50 dark:border-zinc-800/60 dark:bg-zinc-950/20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-4 text-left flex flex-col gap-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                Core Tech Stack
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                The RAG Architecture
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                Our semantic pipeline is designed to enforce complete isolation. We map chunk payloads directly to dense vector indices to enable millisecond response speeds and total security.
              </p>
              <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 my-2" />
              <div className="flex flex-wrap gap-2">
                {['Mongoose', 'Vite', 'TypeScript', 'Gemini AI', 'Cosine Similarity', 'Text Chunking'].map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 text-[10px] font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200/10 dark:border-zinc-800/10"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Graphic Flow Layout */}
            <div className="lg:col-span-8 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-x-auto py-4 select-none">
              
              {/* Document Node */}
              <div className="w-full sm:w-1/3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col items-center gap-3 text-center shadow-md">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-100">Raw Document</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">PDF, DOCX, TXT</p>
                </div>
              </div>

              {/* Arrow 1 */}
              <div className="flex sm:flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
                <ChevronRight className="w-5 h-5 hidden sm:block" />
                <ArrowDown className="w-5 h-5 sm:hidden" />
              </div>

              {/* Middleware Pipeline Node */}
              <div className="w-full sm:w-1/3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col items-center gap-3 text-center shadow-md">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 animate-pulse">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-100">Embedding Engine</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Chunking & Vectorizing</p>
                </div>
              </div>

              {/* Arrow 2 */}
              <div className="flex sm:flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
                <ChevronRight className="w-5 h-5 hidden sm:block" />
                <ArrowDown className="w-5 h-5 sm:hidden" />
              </div>

              {/* DB & LLM Node */}
              <div className="w-full sm:w-1/3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col items-center gap-3 text-center shadow-md">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-100">Vector Storage</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Gemini Retrieval Mapping</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US (Bento Grid Style) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
        <div className="text-center max-w-3xl mx-auto flex flex-col gap-4.5 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
            Absolute Integrity
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Built Differently for Professional Use
          </h2>
          <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Why leading advisors and researchers trust KnowledgeAI with their most confidential documents.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: Fast */}
          <div className="md:col-span-4 p-6.5 rounded-2xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-900/30 flex flex-col justify-between h-[200px]">
            <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white w-fit">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">Millisecond Performance</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                High-speed caching and optimized Mongoose indexing deliver semantic vector matches in under 120ms.
              </p>
            </div>
          </div>

          {/* Card 2: Secure */}
          <div className="md:col-span-4 p-6.5 rounded-2xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-900/30 flex flex-col justify-between h-[200px]">
            <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white w-fit">
              <Lock className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">Strict Access Security</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                Complete password encryption via bcrypt, JWT authorization tokens, and full sandboxed workspace containment.
              </p>
            </div>
          </div>

          {/* Card 3: Private */}
          <div className="md:col-span-4 p-6.5 rounded-2xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-900/30 flex flex-col justify-between h-[200px]">
            <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white w-fit">
              <Eye className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">Absolute Data Isolation</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                Your uploaded document blocks are isolated in secure database schemas. Zero public model re-training pathways.
              </p>
            </div>
          </div>

          {/* Card 4: Source Verified (Wide) */}
          <div className="md:col-span-6 p-6.5 rounded-2xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-900/30 flex flex-col justify-between h-[200px]">
            <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white w-fit">
              <BookOpen className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">100% Citation Grounding</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                We force absolute prompt enforcement constraints. Our AI never synthesizes answers without citing page locations, direct text snippets, and document names.
              </p>
            </div>
          </div>

          {/* Card 5: Modern UI (Wide) */}
          <div className="md:col-span-6 p-6.5 rounded-2xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-900/30 flex flex-col justify-between h-[200px]">
            <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white w-fit">
              <Moon className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">Premium Visual Identity</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                Thoughtfully crafted dark-mode themes, modular workspaces, split document readers, and rich dynamic dashboards centered entirely around productivity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. USE CASES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
        <div className="text-center max-w-3xl mx-auto flex flex-col gap-4.5 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
            Tailored Efficiency
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Engineered for Any Domain
          </h2>
          <p className="text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Click across categories to see how KnowledgeAI unlocks productivity for your exact profession.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {useCases.map((uc) => (
            <button
              key={uc.id}
              onClick={() => setSelectedUseCase(uc.id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                selectedUseCase === uc.id
                  ? 'border-indigo-500 bg-indigo-50/10 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-950/20 shadow-sm'
                  : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {uc.icon} {uc.id}
            </button>
          ))}
        </div>

        {/* Tab Content Panel */}
        <div className="bg-white dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-6 sm:p-10 shadow-sm max-w-4xl mx-auto">
          {useCases.map((uc) => {
            if (uc.id !== selectedUseCase) return null;
            return (
              <motion.div
                key={uc.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
              >
                <div className="md:col-span-7 flex flex-col gap-5">
                  <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20">
                      {uc.icon}
                    </span>
                    {uc.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                    {uc.desc}
                  </p>

                  <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800 my-1" />

                  {/* Bullet points */}
                  <div className="flex flex-col gap-2.5">
                    {uc.bullets.map((bullet) => (
                      <div key={bullet} className="flex items-center gap-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0 text-[10px]">
                          ✓
                        </div>
                        {bullet}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-5 flex justify-center bg-zinc-50 dark:bg-zinc-950/40 p-6 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40">
                  <div className="flex flex-col gap-4 text-center">
                    <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 font-mono tracking-wider">
                      REPRESENTATIVE USE CASE
                    </span>
                    <FileText className="w-14 h-14 text-indigo-400 mx-auto animate-pulse" />
                    <div>
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {uc.id === 'Researchers' ? 'scientific_literature_db.pdf' : 
                         uc.id === 'Students' ? 'macroeconomics_lecture_notes.docx' :
                         uc.id === 'Developers' ? 'api_reference_manual.txt' :
                         uc.id === 'Businesses' ? 'corporate_hr_policy_v2.docx' :
                         'patent_application_discovery.pdf'}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-1">Ready for contextual RAG chatting</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
export default FeaturesAndDetails;
