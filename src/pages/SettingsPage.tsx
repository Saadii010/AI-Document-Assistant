import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import toast from 'react-hot-toast';
import { Settings, ChevronRight, Loader2, Users } from 'lucide-react';

// Import newly created Settings sub-components
import { SettingsSidebar, SettingsSection } from '../components/settings/SettingsSidebar';
import { ProfileForm } from '../components/settings/ProfileForm';
import { AppearanceSettings, AppearanceData } from '../components/settings/AppearanceSettings';
import { NotificationSettings, NotificationData } from '../components/settings/NotificationSettings';
import { AISettings, AIData } from '../components/settings/AISettings';
import { PrivacySettings, PrivacyData } from '../components/settings/PrivacySettings';
import { SecuritySettings } from '../components/settings/SecuritySettings';
import { SessionTable, Session, SecurityLog } from '../components/settings/SessionTable';
import { StorageCard } from '../components/settings/StorageCard';
import { DangerZone } from '../components/settings/DangerZone';
import { ExportDialog } from '../components/settings/ExportDialog';

export const SettingsPage: React.FC = () => {
  const { logout, refreshUser } = useAuth();
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [isLoading, setIsLoading] = useState(true);

  // States from DB endpoints
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>({ documentsUploaded: 0, storageUsed: 0, aiRequests: 0 });
  const [settings, setSettings] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);

  const fetchAllData = async () => {
    try {
      const [settingsRes, profileRes, sessionsRes] = await Promise.all([
        ApiService.get<any>('/settings') as any,
        ApiService.get<any>('/settings/profile') as any,
        ApiService.get<any>('/settings/sessions') as any,
      ]);

      if (settingsRes.success) {
        setSettings(settingsRes.settings);
        setPreferences(settingsRes.preferences);
      }
      if (profileRes.success) {
        setProfile(profileRes.profile);
        setStats(profileRes.stats);
      }
      if (sessionsRes.success) {
        setSessions(sessionsRes.sessions || []);
        setSecurityLogs(sessionsRes.securityLogs || []);
      }
    } catch (e: any) {
      toast.error('Failed to load settings details from the server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleProfileSave = async (updatedFields: any) => {
    const toastId = toast.loading('Saving profile changes...');
    try {
      const res = (await ApiService.put<any>('/settings/profile', updatedFields)) as any;
      if (res.success) {
        toast.success(res.message || 'Profile saved successfully!', { id: toastId });
        await refreshUser(); // sync context
        await fetchAllData(); // refresh settings profile state
      } else {
        throw new Error(res.message || 'Failed to update profile.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save profile modifications.', { id: toastId });
      throw err;
    }
  };

  const handleAvatarUpload = async (file: File) => {
    // Convert to Base64 to send to server easily
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = (await ApiService.put<any>('/settings/profile', {
            firstName: profile.firstName,
            lastName: profile.lastName,
            avatar: reader.result as string,
          })) as any;
          if (res.success) {
            await refreshUser();
            await fetchAllData();
            resolve();
          } else {
            reject(new Error(res.message || 'Upload failed.'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('File reading failed.'));
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarRemove = async () => {
    const res = (await ApiService.put<any>('/settings/profile', {
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatar: null,
    })) as any;
    if (res.success) {
      await refreshUser();
      await fetchAllData();
    } else {
      throw new Error(res.message || 'Removal failed.');
    }
  };

  const handleSettingsSave = async (updatedSettings: Partial<AIData>) => {
    const res = (await ApiService.put<any>('/settings', { settings: updatedSettings })) as any;
    if (res.success) {
      setSettings(res.settings);
    } else {
      throw new Error(res.message || 'Update failed.');
    }
  };

  const handlePreferencesSave = async (updatedPrefs: Partial<AppearanceData | NotificationData>) => {
    const res = (await ApiService.put<any>('/settings', { preferences: updatedPrefs })) as any;
    if (res.success) {
      setPreferences(res.preferences);
    } else {
      throw new Error(res.message || 'Update failed.');
    }
  };

  const handlePasswordChange = async (data: any) => {
    const res = (await ApiService.put<any>('/settings/password', data)) as any;
    if (!res.success) {
      throw new Error(res.message || 'Password update failed.');
    }
  };

  const handleRevokeSession = async (sessId: string) => {
    const res = (await ApiService.delete<any>(`/settings/sessions/${sessId}`)) as any;
    if (res.success) {
      await fetchAllData();
    } else {
      throw new Error(res.message || 'Revocation failed.');
    }
  };

  const handleRevokeAllSessions = async () => {
    const currentSess = sessions.find((s) => s.currentDevice);
    const currentSessId = currentSess ? (currentSess._id || currentSess.id) : undefined;
    
    // Direct fetch to handle DELETE body safely
    const token = localStorage.getItem('auth_token');
    const response = await fetch('/api/settings/sessions', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        keepCurrent: true,
        currentSessionId: currentSessId
      })
    });
    const res = await response.json();
    
    if (res.success) {
      await fetchAllData();
    } else {
      throw new Error(res.message || 'Revoking other sessions failed.');
    }
  };

  const handleDownloadSecurityLogs = async () => {
    const res = (await ApiService.get<any>('/settings/sessions')) as any;
    if (res.success) {
      const logs = res.securityLogs || [];
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(logs, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `security_audit_logs_${profile.email}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      throw new Error('Failed to fetch security logs.');
    }
  };

  const handleExportData = async (format: 'json' | 'csv') => {
    if (format === 'json') {
      const res = (await ApiService.post<any>('/settings/export', { format: 'json' })) as any;
      if (res.success) {
        return res.data;
      }
      throw new Error(res.message || 'Export failed.');
    } else {
      // Fetch directly from server as text csv
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/settings/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ format: 'csv' }),
      });
      if (!response.ok) {
        throw new Error('CSV Export failed.');
      }
      return await response.text();
    }
  };

  const handleImportBackup = async (backupData: any) => {
    const res = (await ApiService.post<any>('/settings/import', backupData)) as any;
    if (!res.success) {
      throw new Error(res.message || 'Import failed.');
    }
  };

  const handleClearChats = async () => {
    const res = (await ApiService.delete<any>('/settings/chats')) as any;
    if (res.success) {
      await fetchAllData();
    } else {
      throw new Error(res.message || 'Wiping chats failed.');
    }
  };

  const handleClearDocuments = async () => {
    const res = (await ApiService.delete<any>('/settings/documents')) as any;
    if (res.success) {
      await fetchAllData();
    } else {
      throw new Error(res.message || 'Wiping documents failed.');
    }
  };

  const handleDeleteAccount = async (passwordConfirm: string) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('/api/settings/account', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ passwordConfirm })
    });
    const res = await response.json();
    if (res.success) {
      // Clear token and logout
      ApiService.clearToken();
      await logout();
      window.location.href = '/';
    } else {
      throw new Error(res.message || 'Account deletion failed.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Syncing settings index...</p>
      </div>
    );
  }

  // Fallback initial structures
  const defaultProfile = profile || {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    phoneNumber: '',
    bio: '',
    avatar: null,
  };

  const defaultSettings: AIData = settings || {
    preferredModel: 'Gemini 1.5 Flash',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.95,
    streaming: true,
    defaultDocSelection: 'all',
    autoSaveConversations: true,
    citationDisplay: true,
    responseLanguage: 'en',
  };

  const defaultPreferences: AppearanceData & NotificationData = preferences || {
    theme: 'system',
    fontSize: 'base',
    compactMode: false,
    animationToggle: true,
    accentColor: 'indigo',
    emailNotifications: true,
    browserNotifications: true,
    uploadNotifications: true,
    aiCompletionNotifications: true,
    securityAlerts: true,
    systemUpdates: true,
    newsletter: false,
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <ProfileForm
            initialData={{
              id: defaultProfile.id,
              firstName: defaultProfile.firstName,
              lastName: defaultProfile.lastName,
              email: defaultProfile.email,
              username: settings?.username || '',
              phoneNumber: settings?.phoneNumber || '',
              bio: settings?.bio || '',
              avatar: defaultProfile.avatar,
            }}
            onSave={handleProfileSave}
            onAvatarUpload={handleAvatarUpload}
            onAvatarRemove={handleAvatarRemove}
          />
        );
      case 'account':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-1 pb-3 border-b border-zinc-100 dark:border-zinc-900">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Account Summary</h3>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                A birds-eye view of your account status, active service configurations, and storage statistics.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Profile Overview */}
              <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl flex items-start gap-4 text-left shadow-sm">
                <div className="p-2.5 bg-indigo-55/10 dark:bg-indigo-950/20 text-indigo-500 rounded-xl shrink-0 mt-1">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Access Tier</span>
                  <span className="text-xs font-black text-zinc-850 dark:text-zinc-200">
                    {defaultProfile.firstName} {defaultProfile.lastName}
                  </span>
                  <span className="text-[10px] text-zinc-400">{defaultProfile.email}</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase mt-1">
                    Role: {defaultProfile.role}
                  </span>
                </div>
              </div>

              {/* API and Requests */}
              <div className="p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl flex items-start gap-4 text-left shadow-sm">
                <div className="p-2.5 bg-sky-55/10 dark:bg-zinc-900/40 text-sky-500 rounded-xl shrink-0 mt-1">
                  <Settings className="w-5 h-5" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">Usage Stats</span>
                  <span className="text-xs font-black text-zinc-850 dark:text-zinc-200">
                    {stats.aiRequests} requests triggered
                  </span>
                  <span className="text-[10px] text-zinc-400">Model Engine: {defaultSettings.preferredModel}</span>
                  <span className="text-[10px] text-emerald-600 font-extrabold uppercase mt-1">
                    Status: Verified Account
                  </span>
                </div>
              </div>
            </div>

            <ExportDialog onExport={handleExportData} onImport={handleImportBackup} />
          </motion.div>
        );
      case 'appearance':
        return <AppearanceSettings initialData={defaultPreferences} onSave={handlePreferencesSave} />;
      case 'notifications':
        return <NotificationSettings initialData={defaultPreferences} onSave={handlePreferencesSave} />;
      case 'ai':
        return <AISettings initialData={defaultSettings} onSave={handleSettingsSave} />;
      case 'privacy':
        return <PrivacySettings initialData={(settings || defaultSettings) as any} onSave={handleSettingsSave as any} />;
      case 'security':
        return (
          <SecuritySettings
            onPasswordChange={handlePasswordChange}
            onDownloadSecurityLogs={handleDownloadSecurityLogs}
          />
        );
      case 'storage':
        return (
          <StorageCard
            stats={stats}
            onClearChats={handleClearChats}
            onClearDocuments={handleClearDocuments}
          />
        );
      case 'sessions':
        return (
          <SessionTable
            sessions={sessions}
            securityLogs={securityLogs}
            onRevokeSession={handleRevokeSession}
            onRevokeAllSessions={handleRevokeAllSessions}
          />
        );
      case 'danger':
        return <DangerZone onDeleteAccount={handleDeleteAccount} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full pb-16 px-4">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col gap-1 pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          <span>KnowledgeAI</span>
          <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />
          <span className="text-zinc-850 dark:text-zinc-200 font-extrabold">Settings</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          Workspace Preferences
          <Settings className="w-5 h-5 text-indigo-500 animate-spin-slow" />
        </h1>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Personalize your system algorithms, interface typography, security credentials, active sessions, and local backups.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Navigation Sidebar */}
        <div className="md:col-span-3">
          <SettingsSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        </div>

        {/* Right Active Panel */}
        <div className="md:col-span-9 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/45 shadow-sm min-h-[450px]">
          {renderActiveSection()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
