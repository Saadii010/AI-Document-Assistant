import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';
import { Mail, Sparkles, ArrowLeft, ArrowRight, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';

export const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setResetToken(null);
    try {
      const response = await ApiService.post<any>('/auth/forgot-password', data);
      if (response.success) {
        setSubmitted(true);
        toast.success('Password reset instructions generated!');
        if (response.resetToken) {
          // Store reset token for rapid test workflow in preview mode
          setResetToken(response.resetToken);
        }
      } else {
        throw new Error(response.message || 'Something went wrong.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not process request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-8 sm:py-12 animate-fade-in">
      <div className="p-8 sm:p-10 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-lg flex flex-col gap-6">
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-950 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm inline-flex">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Forgot Password
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No worries, we will help you reset it securely
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400" htmlFor="email">
                Registered Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-zinc-50 dark:bg-zinc-900 outline-none transition-all ${
                    errors.email
                      ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700 dark:focus:border-zinc-100 dark:focus:ring-zinc-100'
                  }`}
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <span className="text-[11px] text-red-500 font-medium">
                  {errors.email.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? 'Sending Request...' : 'Send Reset Link'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-4 text-center">
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              If an account with that email exists, we have generated a password reset token.
            </div>

            {/* Premium Interactive Developer Workflow for testing reset tokens */}
            {resetToken && (
              <div className="text-left mt-2 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  <Terminal className="w-4 h-4 text-zinc-400" />
                  Dev Sandbox Token Intercept
                </div>
                <div className="font-mono text-xs p-2 rounded bg-zinc-100 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 break-all select-all select-none cursor-pointer" title="Click to copy">
                  {resetToken}
                </div>
                <Link
                  to={`/reset-password?token=${resetToken}`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all text-center"
                >
                  Click to Prefill & Reset <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            <button
              onClick={() => setSubmitted(false)}
              className="mt-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Try another email
            </button>
          </div>
        )}

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;
