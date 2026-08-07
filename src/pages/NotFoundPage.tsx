import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, HelpCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center max-w-md mx-auto py-12 flex flex-col items-center gap-6 animate-fade-in">
      <div className="p-3.5 rounded-2xl bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800 shadow-sm inline-flex">
        <HelpCircle className="w-10 h-10 animate-bounce" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-black tracking-tight text-zinc-950 dark:text-zinc-50">
          404
        </h1>
        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
          Resource Not Found
        </h2>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 max-w-xs leading-relaxed">
          The page you are looking for does not exist, has been archived, or was moved to another directory.
        </p>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Return to Dashboard
      </Link>
    </div>
  );
};
export default NotFoundPage;
