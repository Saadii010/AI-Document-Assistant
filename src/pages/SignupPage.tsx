import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Sparkles, Mail, Lock, User as UserIcon, ArrowRight, Check, X } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Watch password to check validation requirements live
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
    setErrorMsg(null);
    try {
      await registerUser(data);
      navigate('/profile');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto py-8 sm:py-12 animate-fade-in">
      <div className="p-8 sm:p-10 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-lg flex flex-col gap-6">
        {/* Brand/Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-950 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 shadow-sm inline-flex">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create your account
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Access secure document analysis and AI conversations
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl border border-red-200/50 bg-red-50 text-red-600 dark:border-red-950/20 dark:bg-red-950/20 dark:text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400" htmlFor="firstName">
                First Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-zinc-50 dark:bg-zinc-900 outline-none transition-all ${
                    errors.firstName
                      ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700 dark:focus:border-zinc-100 dark:focus:ring-zinc-100'
                  }`}
                  {...register('firstName', { required: 'First name is required' })}
                />
              </div>
              {errors.firstName && (
                <span className="text-[11px] text-red-500 font-medium">
                  {errors.firstName.message}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400" htmlFor="lastName">
                Last Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border bg-zinc-50 dark:bg-zinc-900 outline-none transition-all ${
                    errors.lastName
                      ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700 dark:focus:border-zinc-100 dark:focus:ring-zinc-100'
                  }`}
                  {...register('lastName', { required: 'Last name is required' })}
                />
              </div>
              {errors.lastName && (
                <span className="text-[11px] text-red-500 font-medium">
                  {errors.lastName.message}
                </span>
              )}
            </div>
          </div>

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
                placeholder="john.doe@example.com"
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
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400" htmlFor="password">
              Password
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
                  required: 'Password is required',
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

            {/* Live Password Rules Indicator Checklist */}
            <div className="mt-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                Password Security Rules
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
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

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border bg-zinc-50 dark:bg-zinc-900 outline-none transition-all ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700 dark:focus:border-zinc-100 dark:focus:ring-zinc-100'
                }`}
                {...register('confirmPassword', {
                  required: 'Confirm password is required',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
              />
            </div>
            {errors.confirmPassword && (
              <span className="text-[11px] text-red-500 font-medium">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center text-xs text-zinc-400 dark:text-zinc-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
export default SignupPage;
