import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="text-center max-w-md mx-auto py-12 flex flex-col items-center gap-6 animate-fade-in">
      <div className="p-3.5 rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50 dark:border-red-950/20 shadow-sm inline-flex">
        <ShieldAlert className="w-10 h-10 animate-pulse" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-zinc-50">
          Access Restricted
        </h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 max-w-xs leading-relaxed">
          You do not have the required administrative clearance to access this secure SaaS dashboard node.
        </p>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm transition-all"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Safety
      </Link>
    </div>
  );
};
export default UnauthorizedPage;
