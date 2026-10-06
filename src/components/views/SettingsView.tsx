import React, { useState } from 'react';
import {
  User,
  Sun,
  Moon,
  Shield,
  CreditCard,
  Download,
  LogOut,
  Check,
  CheckCircle2,
  Lock,
  Mail,
  GraduationCap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SettingsView: React.FC = () => {
  const {
    user,
    signInWithGoogleAuth,
    signInWithEmailAuth,
    signUpWithEmailAuth,
    signOutAuth,
    theme,
    setTheme,
    tasks,
    exams,
    chatSessions,
    toolHistory,
    favoriteToolSlugs,
  } = useApp();

  // Auth form state
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      await signInWithGoogleAuth();
      setAuthSuccessMsg('Signed in with Google successfully!');
      setTimeout(() => setAuthSuccessMsg(''), 3000);
    } catch (err: any) {
      setAuthError(err.message || 'Google sign in failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPassword.trim()) return;
    setAuthLoading(true);
    setAuthError('');
    try {
      if (isRegistering) {
        await signUpWithEmailAuth(authEmail.trim(), authPassword, authName.trim() || undefined);
        setAuthSuccessMsg('Firebase account created successfully!');
      } else {
        await signInWithEmailAuth(authEmail.trim(), authPassword);
        setAuthSuccessMsg('Signed in to Firebase successfully!');
      }
      setTimeout(() => setAuthSuccessMsg(''), 3000);
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('operation-not-allowed')) {
        setAuthError('Email/Password provider not enabled in Firebase console. Please use Google Sign-in.');
      } else {
        setAuthError(msg || 'Authentication failed. Please verify credentials.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleExportData = () => {
    const backupData = {
      user,
      tasks,
      exams,
      chatSessions,
      toolHistory,
      favoriteToolSlugs,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studenttoolbox_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
          Settings & Account
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Manage your account profile, preferences, and data privacy.
        </p>
      </div>

      {authSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{authSuccessMsg}</span>
        </div>
      )}

      {/* Account Section */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <User className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Student Account
            </h3>
            <p className="text-xs text-neutral-500">
              {user.isGuest ? 'Currently using Guest Mode on this device' : 'Authenticated student account'}
            </p>
          </div>
        </div>

        {!user.isGuest ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 text-xs">
              <div>
                <span className="text-neutral-500">Full Name:</span>
                <div className="font-bold text-neutral-900 dark:text-white mt-0.5">{user.name}</div>
              </div>
              <div>
                <span className="text-neutral-500">Email Address:</span>
                <div className="font-bold text-neutral-900 dark:text-white mt-0.5">{user.email}</div>
              </div>
              <div>
                <span className="text-neutral-500">Study Streak:</span>
                <div className="font-bold text-neutral-900 dark:text-white mt-0.5">{user.studyStreakDays} days</div>
              </div>
              <div>
                <span className="text-neutral-500">Account Type:</span>
                <div className="font-bold text-emerald-600 mt-0.5">Active Free Student Tier</div>
              </div>
            </div>

            <button
              onClick={signOutAuth}
              className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="size-3.5" />
              <span>Sign Out from Firebase</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-w-md">
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Sign in or create a student account to sync your study tasks, exam countdowns, and chat history across devices with Firebase.
            </p>

            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200 border border-rose-200 dark:border-rose-800 text-xs flex items-start gap-2">
                <span>{authError}</span>
              </div>
            )}

            {/* Google 1-Click Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              type="button"
              className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 font-semibold text-xs text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-2.5 transition-colors shadow-xs"
            >
              <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-neutral-200 dark:border-neutral-800 w-full" />
              <span className="bg-white dark:bg-neutral-900 px-3 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider shrink-0">
                Or with email
              </span>
              <div className="border-t border-neutral-200 dark:border-neutral-800 w-full" />
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {isRegistering && (
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Name</label>
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Email Address</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="alex@university.edu"
                  required
                  className="w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Password</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full mt-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2.5 text-xs text-neutral-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  {isRegistering ? 'Create Account' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  {isRegistering ? 'Already have an account? Sign in' : 'New student? Register'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          Appearance & Theme
        </h3>
        <p className="text-xs text-neutral-500">
          Switch between crisp light mode and dark mode for late-night study sessions.
        </p>

        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            onClick={() => setTheme('light')}
            className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              theme === 'light'
                ? 'bg-blue-50 text-blue-700 border-blue-400 dark:bg-blue-950/60 shadow-xs'
                : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
            }`}
          >
            <Sun className="size-4 text-amber-500" />
            <span>Light Mode</span>
            {theme === 'light' && <Check className="size-3.5 text-blue-600 ml-1" />}
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              theme === 'dark'
                ? 'bg-blue-50 text-blue-700 border-blue-400 dark:bg-blue-950/60 dark:text-blue-300 shadow-xs'
                : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
            }`}
          >
            <Moon className="size-4 text-blue-500" />
            <span>Dark Mode</span>
            {theme === 'dark' && <Check className="size-3.5 text-blue-600 ml-1" />}
          </button>
        </div>
      </div>

      {/* File Security & Privacy */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-white">
          <Shield className="size-4 text-emerald-600" />
          <span>File Security & Sandbox Disclosure</span>
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          StudentToolBox processes all PDF, Image, and Text files directly inside your browser memory sandbox using WebAssembly and HTML5 Canvas. Your documents and sensitive homework assignments are never uploaded to third-party file hosting servers or retained in databases.
        </p>
      </div>

      {/* Data Export & Backup */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          Backup & Export Data
        </h3>
        <p className="text-xs text-neutral-500">
          Download a complete JSON export of your study tasks, upcoming exams, chat sessions, and favorite tools.
        </p>
        <button
          onClick={handleExportData}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors"
        >
          <Download className="size-3.5" />
          <span>Download Student Data JSON</span>
        </button>
      </div>
    </div>
  );
};
