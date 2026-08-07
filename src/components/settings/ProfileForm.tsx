import React, { useState, useRef } from 'react';
import { Camera, Trash2, Save, Upload, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
  bio: string;
  avatar: string | null;
}

interface ProfileFormProps {
  initialData: ProfileData;
  onSave: (updatedFields: Partial<ProfileData>) => Promise<void>;
  onAvatarUpload: (file: File) => Promise<void>;
  onAvatarRemove: () => Promise<void>;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSave,
  onAvatarUpload,
  onAvatarRemove,
}) => {
  const [formData, setFormData] = useState<ProfileData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are supported for avatar uploads!');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Avatar file size must be less than 2MB.');
      return;
    }

    const toastId = toast.loading('Uploading avatar image...');
    try {
      await onAvatarUpload(file);
      // Create local preview
      const reader = new FileReader();
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
      toast.success('Avatar uploaded successfully!', { id: toastId });
    } catch (e: any) {
      toast.error(e.message || 'Avatar upload failed.', { id: toastId });
    }
  };

  const handleRemoveAvatar = async () => {
    if (window.confirm('Are you sure you want to delete your avatar image?')) {
      const toastId = toast.loading('Removing avatar image...');
      try {
        await onAvatarRemove();
        setFormData((prev) => ({ ...prev, avatar: null }));
        toast.success('Avatar removed successfully.', { id: toastId });
      } catch (e: any) {
        toast.error(e.message || 'Avatar removal failed.', { id: toastId });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('First and last names are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio,
      });
    } catch (err) {
      // toast is already displayed in parent or API layer
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      {/* Title */}
      <div className="flex flex-col gap-1 pb-3 border-b border-zinc-100 dark:border-zinc-900">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Profile Settings</h3>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
          Manage your personal identifiers, display photo, contact information, and biography.
        </p>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-zinc-50/40 dark:bg-zinc-900/10 border border-zinc-200/50 dark:border-zinc-800/50">
        <div className="relative group shrink-0">
          <div className="w-20 h-20 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden shadow-inner">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt={`${formData.firstName} ${formData.lastName}`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserIcon className="w-10 h-10 text-zinc-400" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex-1 w-full border border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-indigo-500 bg-indigo-55/10 dark:bg-indigo-950/20'
              : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
          }`}
        >
          <Upload className="w-5 h-5 text-zinc-400 mb-2" />
          <p className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
            Drag & drop your photo here, or <span className="text-indigo-600 dark:text-indigo-400">browse</span>
          </p>
          <p className="text-[9px] text-zinc-400 mt-0.5">JPEG, PNG or WEBP up to 2MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {formData.avatar && (
          <button
            type="button"
            onClick={handleRemoveAvatar}
            className="px-3 py-1.5 border border-red-200 bg-red-50/20 dark:border-red-950/20 text-red-600 hover:text-red-700 font-bold text-[10px] rounded-lg flex items-center gap-1.5 transition-all cursor-pointer self-stretch sm:self-center justify-center"
          >
            <Trash2 className="w-3 h-3" /> Remove Photo
          </button>
        )}
      </div>

      {/* Input Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* First Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="John"
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors shadow-sm"
          />
        </div>

        {/* Last Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Doe"
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors shadow-sm"
          />
        </div>

        {/* Username */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username || ''}
            onChange={handleChange}
            placeholder="johndoe123"
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors shadow-sm"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            disabled
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 outline-none cursor-not-allowed shadow-inner"
          />
        </div>

        {/* Phone Number */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Phone Number
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber || ''}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors shadow-sm"
          />
        </div>

        {/* Biography */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Biography
          </label>
          <textarea
            name="bio"
            value={formData.bio || ''}
            onChange={handleChange}
            rows={4}
            placeholder="Write a short summary about your roles, projects, or interests..."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50 outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors shadow-sm resize-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end pt-4 border-t border-zinc-100 dark:border-zinc-900 mt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>Save Changes</span>
        </button>
      </div>
    </motion.form>
  );
};
