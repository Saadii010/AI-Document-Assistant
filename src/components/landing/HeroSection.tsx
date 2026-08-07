import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  MessageSquare,
  Search,
  UploadCloud,
  Cpu,
  ChevronRight,
  Database,
  CheckCircle,
  Play,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MockDoc {
  name: string;
  size: string;
  questions: { q: string; a: string; source: string; highlight: string; page: number }[];
}

const mockDocuments: MockDoc[] = [
  {
    name: 'rag_performance_review.pdf',
    size: '1.8 MB',
    questions: [
      {
        q: 'What were the training parameters for the vector embeddings?',
        a: 'The embeddings were generated using a dense vector model with 1536 dimensions. Chunks were tokenized into 512-token segments with a 10% sliding window overlap to guarantee absolute context cohesion across page boundaries.',
        source: 'rag_performance_review.pdf — Section 4.2 (Page 12)',
        highlight: '...embeddings were generated using a dense vector model with 1536 dimensions...',
        page: 12,
      },
      {
        q: 'How does the system mitigate LLM hallucinations?',
        a: 'Hallucinations are fully mitigated by running context-grounded queries. The retrieval engine injects strict semantic chunks from the local vector database directly into the system prompt, enforcing that only provided references are used.',
        source: 'rag_performance_review.pdf — Section 5.1 (Page 18)',
        highlight: '...retrieval engine injects strict semantic chunks from the local vector database directly into...',
        page: 18,
      }
    ]
  },
  {
    name: 'employee_handbook.docx',
    size: '4.2 MB',
    questions: [
      {
        q: 'What is the corporate policy on remote workspace allowances?',
        a: 'Full-time employees are eligible for a one-time remote workspace stipend of up to $500. This stipend covers ergonomic chairs, desk lighting, and computer accessories. Claims must be submitted within 30 days of joining.',
        source: 'employee_handbook.docx — HR Guidelines (Page 5)',
        highlight: '...Full-time employees are eligible for a one-time remote workspace stipend of up to $500...',
        page: 5,
      },
      {
        q: 'How many days of paid leave are allocated annually?',
        a: 'We allocate 25 days of paid annual leave, accruing monthly from your start date. Unused leave up to a maximum of 5 days can be carried forward into the next calendar year.',
        source: 'employee_handbook.docx — Paid Leave Policies (Page 9)',
        highlight: '...allocate 25 days of paid annual leave, accruing monthly from your start date...',
        page: 9,
      }
    ]
  }
];

export const HeroSection: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  // Interactive Simulator State
  const [activeDoc, setActiveDoc] = useState<MockDoc>(mockDocuments[0]);
  const [step, setStep] = useState<'upload' | 'processing' | 'ready' | 'chat'>('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingLog, setProcessingLog] = useState('');
  const [selectedQuestionIdx, setSelectedQuestionIdx] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Run File Upload Simulation
  const handleUploadSim = () => {
    setStep('processing');
    setUploadProgress(0);
    setProcessingLog('Extracting text structure...');

    let prog = 0;
    const interval = setInterval(() => {
      prog += 5;
      setUploadProgress(prog);

      if (prog === 30) {
        setProcessingLog('Splitting text chunks (512 token limits)...');
      } else if (prog === 60) {
        setProcessingLog('Generating high-dimensional vector embeddings...');
      } else if (prog === 85) {
        setProcessingLog('Storing vectors securely in high-speed index...');
      } else if (prog >= 100) {
        clearInterval(interval);
        setStep('ready');
      }
    }, 100);
  };

  // Run Chat Simulation
  const handleQuestionSelect = (idx: number) => {
    if (isTyping) return;
    setSelectedQuestionIdx(idx);
    setIsTyping(true);
    setAnswerText('');
    
    const targetText = activeDoc.questions[idx].a;
    let charIdx = 0;
    const timer = setInterval(() => {
      setAnswerText((prev) => prev + targetText.charAt(charIdx));
      charIdx++;
      if (charIdx >= targetText.length) {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 15);
  };

  // Reset demo simulator
  const handleReset = () => {
    setStep('upload');
    setUploadProgress(0);
    setProcessingLog('');
    setSelectedQuestionIdx(null);
    setAnswerText('');
    setIsTyping(false);
  };

  return (
    <section id="home" className="relative min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900/30 dark:to-zinc-950">
      
      {/* Decorative background grid & glow patterns */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent rounded-full blur-3xl opacity-60 dark:opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)]" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* Left Side: Copy and call-to-actions */}
        <div className="lg:col-span-5 text-center lg:text-left flex flex-col gap-6 items-center lg:items-start">
          
          {/* Animated Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-200/60 bg-zinc-100/50 dark:border-zinc-800/60 dark:bg-zinc-900/40 text-xs font-semibold tracking-wide text-zinc-600 dark:text-zinc-400 select-none shadow-sm"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            Empowered by Gemini 1.5 Flash
          </motion.div>

          {/* Premium Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.1]"
          >
            Your Private <br />
            <span className="bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              AI Knowledge
            </span>
            <br />
            Base Assistant.
          </motion.h1>

          {/* Product Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-lg"
          >
            Securely index, chunk, and search PDFs, manuals, and papers. Engage with a localized semantic engine featuring absolute transparency, side-by-side highlighting, and exact source citations.
          </motion.p>

          {/* Call-to-action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4.5 w-full sm:w-auto justify-center lg:justify-start"
          >
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 text-sm font-bold rounded-xl bg-zinc-950 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all shadow-md hover:-translate-y-0.5"
              >
                Go to Dashboard <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 text-sm font-bold rounded-xl bg-zinc-950 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all shadow-lg hover:-translate-y-0.5 shadow-indigo-500/10 dark:shadow-none"
                >
                  Get Started Free <ChevronRight className="w-4 h-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 text-sm font-semibold rounded-xl border border-zinc-200 bg-white/40 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/20 dark:text-zinc-300 dark:hover:bg-zinc-900/60 transition-all"
                >
                  See How It Works
                </a>
              </>
            )}
          </motion.div>

          {/* Features checkmarks list */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 gap-x-6 gap-y-2.5 mt-2.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400"
          >
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Fully Localized Embeddings
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Strict Zero-Hallucination
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Side-by-Side Citations
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> No Credit Card Required
            </span>
          </motion.div>
        </div>

        {/* Right Side: Interactive Knowledge Assistant Simulator */}
        <div className="lg:col-span-7 w-full flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl relative overflow-hidden"
          >
            {/* Window control bar */}
            <div className="px-5 py-4 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/20">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 ml-2 select-none font-mono">
                  demo_playground_v1.sh
                </span>
              </div>
              {step !== 'upload' && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-all"
                  title="Reset Demo Simulator"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            {/* Simulated Workspace */}
            <div className="p-6 min-h-[380px] flex flex-col justify-between">
              
              {/* STEP 1: UPLOAD MOCK DOCUMENT */}
              {step === 'upload' && (
                <div className="flex-1 flex flex-col items-center justify-center py-8">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-2">
                    Step 1: Process Your Source Material
                  </span>
                  <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mb-6 text-center">
                    Select a dataset to seed your AI context
                  </h3>
                  
                  {/* Cards container */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mb-8">
                    {mockDocuments.map((doc) => (
                      <button
                        key={doc.name}
                        onClick={() => setActiveDoc(doc)}
                        className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                          activeDoc.name === doc.name
                            ? 'border-indigo-500 bg-indigo-50/10 dark:border-indigo-500 dark:bg-indigo-950/10 ring-2 ring-indigo-500/20'
                            : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 mt-0.5">
                          <FileText className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate max-w-[150px]">
                            {doc.name}
                          </p>
                          <p className="text-xs text-zinc-400 mt-0.5">{doc.size}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Drag & Drop Simulation Trigger */}
                  <button
                    onClick={handleUploadSim}
                    className="w-full max-w-xs py-4 px-6 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/10 flex flex-col items-center gap-2 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/20 transition-all text-center select-none group"
                  >
                    <UploadCloud className="w-8 h-8 text-indigo-500 group-hover:scale-105 transition-transform" />
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                      Process {activeDoc.name}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Simulate 100% cloud parsing engine
                    </span>
                  </button>
                </div>
              )}

              {/* STEP 2: CHUNKING & EMBEDDINGS LOADER */}
              {step === 'processing' && (
                <div className="flex-1 flex flex-col items-center justify-center py-10">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center mb-6">
                    <Database className="w-8 h-8 text-indigo-500 animate-bounce" />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-100 mb-2">
                    RAG Chunking Pipeline Active
                  </h4>
                  <p className="text-xs text-zinc-400 mb-6 font-mono">
                    {processingLog}
                  </p>
                  
                  {/* Custom Progress Bar */}
                  <div className="w-full max-w-sm h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      initial={{ width: '0%' }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ ease: 'linear' }}
                    />
                  </div>
                  <span className="text-xs font-semibold mt-2.5 text-zinc-500">{uploadProgress}%</span>
                </div>
              )}

              {/* STEP 3: EMBEDDING INDEX SUCCESS */}
              {step === 'ready' && (
                <div className="flex-1 flex flex-col items-center justify-center py-10">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-6">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h4 className="text-base font-bold text-zinc-800 dark:text-zinc-100 mb-1.5 text-center">
                    Document Context Synced Successfully
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center max-w-xs mb-8">
                    {activeDoc.name} has been chunked, embedded, and mapped to the semantic index.
                  </p>
                  
                  <button
                    onClick={() => setStep('chat')}
                    className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider bg-zinc-950 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 rounded-xl shadow-md transition-all"
                  >
                    Open AI Chat Playground <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
              )}

              {/* STEP 4: ACTIVE INTERACTIVE CHAT PREVIEW */}
              {step === 'chat' && (
                <div className="flex-1 flex flex-col h-full gap-5">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-200/50 dark:border-zinc-800/50">
                    <div className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 text-[10px] font-bold uppercase tracking-wider">
                      Context Loaded
                    </div>
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400 truncate max-w-[200px]">
                      {activeDoc.name}
                    </span>
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                    {/* Questions Selection Column */}
                    <div className="md:col-span-5 flex flex-col gap-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        Ask a Question
                      </span>
                      {activeDoc.questions.map((q, idx) => (
                        <button
                          key={idx}
                          disabled={isTyping}
                          onClick={() => handleQuestionSelect(idx)}
                          className={`p-3 text-xs font-bold rounded-xl text-left transition-all border ${
                            selectedQuestionIdx === idx
                              ? 'border-indigo-500 bg-indigo-50/10 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-950/20'
                              : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          "{q.q}"
                        </button>
                      ))}
                    </div>

                    {/* AI Chat Display Column */}
                    <div className="md:col-span-7 flex flex-col justify-between border border-zinc-200/60 dark:border-zinc-800/60 rounded-xl p-4.5 bg-zinc-50/30 dark:bg-zinc-950/10 min-h-[190px]">
                      {selectedQuestionIdx === null ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                          <MessageSquare className="w-5 h-5 text-zinc-400 mb-2 animate-bounce" />
                          <p className="text-xs text-zinc-400 max-w-[200px]">
                            Click one of the questions on the left to watch the RAG search pipeline retrieve and formulate answers instantly.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3.5 h-full justify-between">
                          <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 flex items-center gap-1.5 font-mono">
                              <Cpu className="w-3 h-3" /> VERIFIED AI ANSWER:
                            </span>
                            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                              {answerText}
                              {isTyping && <span className="inline-block w-1.5 h-3 bg-indigo-500 ml-0.5 animate-pulse" />}
                            </p>
                          </div>

                          {/* Sources card */}
                          {!isTyping && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-3 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/20 dark:border-zinc-800/40"
                            >
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 mb-1 font-mono">
                                <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> SOURCE CITATION:
                              </div>
                              <p className="text-[10px] text-zinc-400 truncate">
                                {activeDoc.questions[selectedQuestionIdx].source}
                              </p>
                              <div className="mt-1.5 bg-zinc-200/50 dark:bg-zinc-950/40 px-2 py-1.5 rounded text-[9px] text-zinc-500 italic border-l-2 border-indigo-400 truncate">
                                "{activeDoc.questions[selectedQuestionIdx].highlight}"
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
export default HeroSection;
