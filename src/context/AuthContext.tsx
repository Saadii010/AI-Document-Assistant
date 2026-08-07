import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types/auth.types';
import { ApiService } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await ApiService.get<User>('/auth/me');
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        ApiService.clearToken();
        setUser(null);
      }
    } catch (err) {
      // Clear session if we get any authorization/verification errors
      ApiService.clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    // Setup listener for global token expiration event
    const handleSessionExpired = () => {
      setUser(null);
      toast.error('Your session has expired. Please log in again.');
    };

    window.addEventListener('auth-session-expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth-session-expired', handleSessionExpired);
    };
  }, []);

  const login = async (credentials: { email: string; password: any }) => {
    setIsLoading(true);
    try {
      const response = await ApiService.post<User>('/auth/login', credentials);
      if (response.success && response.token && response.user) {
        ApiService.setToken(response.token);
        setUser(response.user);
        toast.success(response.message || 'Welcome back!');
      } else {
        throw new Error(response.message || 'Login failed.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { firstName: string; lastName: string; email: string; password: any }) => {
    setIsLoading(true);
    try {
      const response = await ApiService.post<User>('/auth/register', data);
      if (response.success && response.token && response.user) {
        ApiService.setToken(response.token);
        setUser(response.user);
        toast.success(response.message || 'Registration successful!');
      } else {
        throw new Error(response.message || 'Registration failed.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not register user.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await ApiService.post('/auth/logout');
    } catch (err) {
      // Safe to ignore backend errors for logout as we are wiping the token locally
    } finally {
      ApiService.clearToken();
      setUser(null);
      setIsLoading(false);
      toast.success('Logged out successfully.');
    }
  };

  const updateProfile = async (data: { firstName: string; lastName: string }) => {
    try {
      const response = await ApiService.put<User>('/users/profile', data);
      if (response.success && response.user) {
        setUser(response.user);
        toast.success(response.message || 'Profile updated!');
      } else {
        throw new Error(response.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  const changePassword = async (data: { currentPassword: string; newPassword: any }) => {
    try {
      const response = await ApiService.put('/users/change-password', data);
      if (response.success) {
        toast.success(response.message || 'Password updated successfully!');
      } else {
        throw new Error(response.message || 'Failed to change password.');
      }
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await ApiService.post<User>('/users/avatar', formData);
      if (response.success && response.user) {
        setUser(response.user);
        toast.success(response.message || 'Avatar updated successfully!');
      } else {
        throw new Error(response.message || 'Failed to upload avatar.');
      }
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  const removeAvatar = async () => {
    try {
      const response = await ApiService.delete<User>('/users/avatar');
      if (response.success && response.user) {
        setUser(response.user);
        toast.success(response.message || 'Avatar removed.');
      } else {
        throw new Error(response.message || 'Failed to remove avatar.');
      }
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        uploadAvatar,
        removeAvatar,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
