import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ApiService } from '../services/api';
import { Eye, EyeOff, Sparkles, Lock, ArrowLeft, ArrowRight, Check, X, Key } from 'lucide-react';
import toast from 'react-hot-toast';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const tokenParam = searchParams.get('token') || '';

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      token: '',
      password: '',
    },
  });

  // Prefill token if it comes from search parameters
  useEffect(() => {
    if (tokenParam) {
      setValue('token', tokenParam);
    }
  }, [tokenParam, setValue]);

  // Watch password for requirement checklist
  const password = useWatch({ control, name: 'password' }) || '';

  const passwordRequirements = [
    { label: 'Minimum 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { label: 'Numeric character', test: (p: string) => /\d/.test(p) },
    { label: 'Special character (@$!%*?&)', test: (p: string) => /[@$!%*?&]/.test(p) },
  ];

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await ApiService.post('/auth/reset-password', data);
      if (response.success) {
        toast.success(response.message || 'Password reset successfully!');
        navigate('/login');
      } else {
        throw new Error(response.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid or expired token.');
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
            Reset Password
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Set your new secure password credentials
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Token input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400" htmlFor="token">
              Reset Token
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Key className="w-4 h-4" />
              </span>
              <input
                id="token"
                type="text"
                placeholder="Paste your reset token here"
                className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-zinc-50 dark:bg-zinc-900 outline-none transition-all ${
                  errors.token
                    ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700 dark:focus:border-zinc-100 dark:focus:ring-zinc-100'
                }`}
                {...register('token', { required: 'Reset token is required' })}
              />
            </div>
            {errors.token && (
              <span className="text-[11px] text-red-500 font-medium">
                {errors.token.message}
              </span>
            )}
          </div>

          {/* Password input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400" htmlFor="password">
              New Password
            </label>
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
                  required: 'New password is required',
                  validate: {
                    rules: (value) => {
                      const isValid =
                        value.length >= 8 &&
                        /[A-Z]/.test(value) &&
                        /[a-z]/.test(value) &&
                        /\d/.test(value) &&
                        /[@$!%*?&]/.test(value);
                      return isValid || 'Password does not meet all security guidelines.';
                    },
                  },
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

            {/* Password strength list */}
            <div className="mt-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                Password Security Rules
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {passwordRequirements.map((req, idx) => {
                  const passed = req.test(password);
                  return (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      {passed ? (
                        <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700 shrink-0" />
                      )}
                      <span className={passed ? 'text-zinc-600 dark:text-zinc-300 font-medium' : 'text-zinc-400 dark:text-zinc-600'}>
                        {req.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

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
export default ResetPasswordPage;
