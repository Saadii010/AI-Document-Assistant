import React, { useState, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon,
  Mail,
  Camera,
  Trash2,
  Lock,
  Calendar,
  ShieldAlert,
  Check,
  X,
  Sparkles,
  UploadCloud,
  Terminal,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword, uploadAvatar, removeAvatar } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Forms initialization
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    control: passwordControl,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  });

  const newPassword = useWatch({ control: passwordControl, name: 'newPassword' }) || '';

  const passwordRequirements = [
    { label: 'Minimum 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { label: 'Numeric character', test: (p: string) => /\d/.test(p) },
    { label: 'Special character (@$!%*?&)', test: (p: string) => /[@$!%*?&]/.test(p) },
  ];

  const onProfileSubmit = async (data: any) => {
    setProfileLoading(true);
    try {
      await updateProfile(data);
    } catch (err) {
      // toast is already fired inside context
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: any) => {
    setPasswordLoading(true);
    try {
      await changePassword(data);
      resetPasswordForm();
    } catch (err) {
      // handled
    } finally {
      setPasswordLoading(false);
    }
  };

  // Trigger file selection window
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Process file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processAvatarFile(file);
  };

  const processAvatarFile = async (file: File) => {
    // Basic validations
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, JPG, PNG, and WEBP image files are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit.');
      return;
    }

    setAvatarLoading(true);
    try {
      await uploadAvatar(file);
    } catch (err) {
      // handled
    } finally {
      setAvatarLoading(false);
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processAvatarFile(file);
    }
  };

  const handleRemoveAvatar = async () => {
    if (window.confirm('Are you sure you want to remove your profile avatar?')) {
      setAvatarLoading(true);
      try {
        await removeAvatar();
      } catch (err) {
        // handled
      } finally {
        setAvatarLoading(false);
      }
    }
  };

  const getInitials = () => {
    if (!user) return 'AI';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto flex flex-col gap-8 sm:gap-12 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col gap-2 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Account Profile
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Manage your personal details, secure logins, and customize your assistant identity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Avatar & Core Info Card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="p-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-md flex flex-col items-center text-center gap-6">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500 self-start">
              Profile Picture
            </span>

            {/* Drag & Drop Upload Container */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`relative w-36 h-36 rounded-full overflow-hidden border-2 cursor-pointer transition-all flex flex-col items-center justify-center group select-none ${
                isDragging
                  ? 'border-zinc-900 bg-zinc-100 dark:border-zinc-100 dark:bg-zinc-900 scale-105'
                  : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100/50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-900/50 dark:hover:border-zinc-700'
              }`}
            >
              {avatarLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-zinc-100 animate-spin" />
                  <span className="text-[10px] font-bold text-zinc-500">Uploading...</span>
                </div>
              ) : user?.avatar ? (
                <>
                  <img
                    src={user.avatar}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-30"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1 text-zinc-900 dark:text-zinc-50">
                    <Camera className="w-5 h-5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Change</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-3xl font-extrabold text-zinc-600 dark:text-zinc-400">
                    {getInitials()}
                  </span>
                  <div className="absolute bottom-2.5 bg-zinc-900 text-zinc-50 p-1.5 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}

              {/* Invisible file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Usability feedback */}
            <div className="flex flex-col gap-1 text-center">
              <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                Drag image here or click to browse
              </p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-none">
                JPG, PNG, WEBP — Max 5MB
              </p>
            </div>

            {user?.avatar && !avatarLoading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveAvatar();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors py-1 px-3 border border-red-200/50 dark:border-red-950/20 rounded-xl bg-red-50/50 dark:bg-red-950/10 hover:bg-red-100/50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Avatar
              </button>
            )}

            <div className="w-full border-t border-zinc-100 dark:border-zinc-900 pt-5 flex flex-col gap-3 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 dark:text-zinc-500">Account ID:</span>
                <span className="font-mono text-[10px] bg-zinc-50 dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {user?.id}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 dark:text-zinc-500">Role level:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
                  {user?.role}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 dark:text-zinc-500">Joined on:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {user ? formatDate(user.createdAt) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Forms block */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Form 1: General Details */}
          <div className="p-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-md flex flex-col gap-5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
              Basic Details
            </span>

            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="flex flex-col gap-4">
              {/* Names row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 outline-none hover:border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:hover:border-zinc-700 dark:focus:border-zinc-100 dark:focus:ring-zinc-100 transition-all"
                      {...registerProfile('firstName', { required: 'First name is required' })}
                    />
                  </div>
                  {profileErrors.firstName && (
                    <span className="text-[11px] text-red-500 font-medium">
                      {profileErrors.firstName.message}
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
                      className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 outline-none hover:border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:hover:border-zinc-700 dark:focus:border-zinc-100 dark:focus:ring-zinc-100 transition-all"
                      {...registerProfile('lastName', { required: 'Last name is required' })}
                    />
                  </div>
                  {profileErrors.lastName && (
                    <span className="text-[11px] text-red-500 font-medium">
                      {profileErrors.lastName.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Email Address (Read-only for security) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                  Email Address (Disabled)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-300 dark:text-zinc-600">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-600 cursor-not-allowed select-none outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full sm:w-auto self-start mt-2 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm transition-all disabled:opacity-50"
              >
                {profileLoading ? 'Saving Details...' : 'Save Details'}
              </button>
            </form>
          </div>

          {/* Form 2: Password Modifiers */}
          <div className="p-6 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-md flex flex-col gap-5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
              Change Password
            </span>

            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="flex flex-col gap-4">
              {/* Current Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400" htmlFor="currentPassword">
                  Current Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 outline-none hover:border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:hover:border-zinc-700 dark:focus:border-zinc-100 dark:focus:ring-zinc-100 transition-all"
                    {...registerPassword('currentPassword', { required: 'Current password is required' })}
                  />
                </div>
                {passwordErrors.currentPassword && (
                  <span className="text-[11px] text-red-500 font-medium">
                    {passwordErrors.currentPassword.message}
                  </span>
                )}
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400" htmlFor="newPassword">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 outline-none hover:border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:hover:border-zinc-700 dark:focus:border-zinc-100 dark:focus:ring-zinc-100 transition-all"
                    {...registerPassword('newPassword', {
                      required: 'New password is required',
                      validate: {
                        rules: (value) => {
                          const isValid =
                            value.length >= 8 &&
                            /[A-Z]/.test(value) &&
                            /[a-z]/.test(value) &&
                            /\d/.test(value) &&
                            /[@$!%*?&]/.test(value);
                          return isValid || 'Password does not meet safety criteria.';
                        },
                      },
                    })}
                  />
                </div>
                {passwordErrors.newPassword && (
                  <span className="text-[11px] text-red-500 font-medium">
                    {passwordErrors.newPassword.message}
                  </span>
                )}

                {/* Live Checklist */}
                <div className="mt-2.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 dark:text-zinc-500">
                    New Password Security Rules
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                    {passwordRequirements.map((req, idx) => {
                      const passed = req.test(newPassword);
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
                disabled={passwordLoading}
                className="w-full sm:w-auto self-start mt-2 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm transition-all disabled:opacity-50"
              >
                {passwordLoading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
