import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await login(data);
      navigate('/profile');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-8 sm:py-12 animate-fade-in">
      <div className="p-8 sm:p-10 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-lg flex flex-col gap-6">
        {/* Brand/Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-950 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm inline-flex">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome back
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to access your secure knowledge base
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl border border-red-200/50 bg-red-50 text-red-600 dark:border-red-950/20 dark:bg-red-950/20 dark:text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
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

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400" htmlFor="password">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border bg-zinc-50 dark:bg-zinc-900 outline-none transition-all ${
                  errors.password
                    ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700 dark:focus:border-zinc-100 dark:focus:ring-zinc-100'
                }`}
                {...register('password', {
                  required: 'Password is required',
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-[11px] text-red-500 font-medium">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-400 dark:text-zinc-500 mt-2">
          New to KnowledgeAI?{' '}
          <Link
            to="/signup"
            className="font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
