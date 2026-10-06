import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ChatSession,
  ChatMessage,
  ToolHistoryItem,
  StudyTask,
  UpcomingExam,
  UserProfile,
  ThemeMode,
} from '../types';
import { TOOL_REGISTRY } from '../data/toolRegistry';
import {
  auth,
  db,
  onAuthStateChanged,
  signInWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logoutFirebase,
  doc,
  getDoc,
  setDoc,
  handleFirestoreError,
  OperationType,
  FirebaseUser,
} from '../services/firebase';

interface AppContextType {
  // Navigation
  activeRoute: string;
  activeToolSlug: string | null;
  activeChatId: string | null;
  navigateTo: (route: string, toolSlug?: string | null, chatId?: string | null) => void;

  // Search Modal
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Auth Modal
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Theme
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;

  // Mobile Drawer
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;

  // User Auth & Firebase
  user: UserProfile;
  firebaseUser: FirebaseUser | null;
  authLoading: boolean;
  signInWithGoogleAuth: () => Promise<void>;
  signInWithEmailAuth: (email: string, pass: string) => Promise<void>;
  signUpWithEmailAuth: (email: string, pass: string, displayName?: string) => Promise<void>;
  signOutAuth: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => void;

  // Favorites
  favoriteToolSlugs: string[];
  toggleFavoriteTool: (slug: string) => void;
  isToolFavorite: (slug: string) => boolean;

  // Tool History
  toolHistory: ToolHistoryItem[];
  logToolUsage: (toolSlug: string, summary?: string) => void;
  deleteToolHistoryItem: (id: string) => void;
  clearToolHistory: () => void;

  // Chat Sessions
  chatSessions: ChatSession[];
  createNewChat: () => string;
  selectChat: (chatId: string) => void;
  addMessageToChat: (chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  renameChat: (chatId: string, title: string) => void;
  deleteChat: (chatId: string) => void;
  toggleFavoriteChat: (chatId: string) => void;

  // Dashboard Data
  tasks: StudyTask[];
  addTask: (title: string, subject: string, dueDate: string, priority?: 'low' | 'medium' | 'high') => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  exams: UpcomingExam[];
  addExam: (exam: UpcomingExam) => void;
  deleteExam: (id: string) => void;
  recordStudyTime: (minutes: number) => void;
  recordQuizScore: (percent: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: 'stb_theme',
  USER: 'stb_user',
  FAVORITES: 'stb_favorite_tools',
  TOOL_HISTORY: 'stb_tool_history',
  CHATS: 'stb_chat_sessions',
  TASKS: 'stb_tasks',
  EXAMS: 'stb_exams',
};

const DEFAULT_GUEST_USER: UserProfile = {
  id: 'guest',
  name: 'Student Guest',
  email: 'student@example.edu',
  isGuest: true,
  studyStreakDays: 1,
  totalStudyMinutes: 25,
  lastStudyDate: new Date().toISOString().split('T')[0],
  completedTasksCount: 0,
  quizScores: [],
  createdAt: Date.now(),
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State
  const [activeRoute, setActiveRoute] = useState<string>('home');
  const [activeToolSlug, setActiveToolSlug] = useState<string | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Theme (default light)
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode) || 'light';
  });

  // User & Firebase Auth
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : DEFAULT_GUEST_USER;
    } catch {
      return DEFAULT_GUEST_USER;
    }
  });

  // Favorites
  const [favoriteToolSlugs, setFavoriteToolSlugs] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return stored ? JSON.parse(stored) : ['attendance-calculator', 'pdf-merger', 'ai-quiz-generator'];
    } catch {
      return ['attendance-calculator', 'pdf-merger', 'ai-quiz-generator'];
    }
  });

  // Tool History
  const [toolHistory, setToolHistory] = useState<ToolHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TOOL_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Chat Sessions
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHATS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Tasks
  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Upcoming Exams
  const [exams, setExams] = useState<UpcomingExam[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXAMS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      setAuthLoading(false);

      if (fbUser) {
        // Authenticated with Firebase
        const displayName = fbUser.displayName || fbUser.email?.split('@')[0] || 'Student';
        const userEmail = fbUser.email || '';

        const profile: UserProfile = {
          id: fbUser.uid,
          name: displayName,
          email: userEmail,
          avatar: fbUser.photoURL || undefined,
          isGuest: false,
          studyStreakDays: Math.max(1, user.studyStreakDays),
          totalStudyMinutes: user.totalStudyMinutes,
          lastStudyDate: user.lastStudyDate || new Date().toISOString().split('T')[0],
          completedTasksCount: user.completedTasksCount,
          quizScores: user.quizScores,
          createdAt: Date.now(),
        };

        setUser(profile);

        // Sync to Firestore /users/{uid}
        const userDocPath = `users/${fbUser.uid}`;
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const existingSnap = await getDoc(userDocRef);
          if (existingSnap.exists()) {
            const data = existingSnap.data();
            setUser((prev) => ({
              ...prev,
              name: data.name || prev.name,
              studyStreakDays: data.studyStreakDays || prev.studyStreakDays,
              totalStudyMinutes: data.totalStudyMinutes || prev.totalStudyMinutes,
              completedTasksCount: data.completedTasksCount || prev.completedTasksCount,
            }));
          } else {
            await setDoc(userDocRef, {
              id: fbUser.uid,
              name: displayName,
              email: userEmail,
              studyStreakDays: profile.studyStreakDays,
              totalStudyMinutes: profile.totalStudyMinutes,
              completedTasksCount: profile.completedTasksCount,
              createdAt: new Date().toISOString(),
            });
          }
        } catch (err: any) {
          console.warn('Could not sync user profile to Firestore:', err);
        }
      } else {
        // Not authenticated with Firebase: Keep or reset to Guest
        if (!user.isGuest) {
          setUser(DEFAULT_GUEST_USER);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Apply Theme to document root (.dark class)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Persist User locally
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [user]);

  // Persist Favorites
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favoriteToolSlugs));
  }, [favoriteToolSlugs]);

  // Persist Tool History
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TOOL_HISTORY, JSON.stringify(toolHistory));
  }, [toolHistory]);

  // Persist Chats
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chatSessions));
  }, [chatSessions]);

  // Persist Tasks
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  // Persist Exams
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  }, [exams]);

  // Keyboard shortcut for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen to popstate or direct path changes
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path === '/' || path === '') {
        setActiveRoute('home');
      } else if (path.startsWith('/tools/')) {
        const slug = path.replace('/tools/', '');
        setActiveRoute('tool-detail');
        setActiveToolSlug(slug);
      } else if (path === '/tools') {
        setActiveRoute('tools');
      } else if (path === '/chat') {
        setActiveRoute('chat');
      } else if (path === '/dashboard') {
        setActiveRoute('dashboard');
      } else if (path === '/favorites') {
        setActiveRoute('favorites');
      } else if (path === '/history') {
        setActiveRoute('history');
      } else if (path === '/settings') {
        setActiveRoute('settings');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    handleLocationChange();
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (route: string, toolSlug: string | null = null, chatId: string | null = null) => {
    setActiveRoute(route);
    setActiveToolSlug(toolSlug);
    if (chatId !== undefined) {
      setActiveChatId(chatId);
    }
    setIsMobileSidebarOpen(false);

    let url = '/';
    if (route === 'tools') url = '/tools';
    else if (route === 'tool-detail' && toolSlug) url = `/tools/${toolSlug}`;
    else if (route === 'chat') url = '/chat';
    else if (route === 'dashboard') url = '/dashboard';
    else if (route === 'favorites') url = '/favorites';
    else if (route === 'history') url = '/history';
    else if (route === 'settings') url = '/settings';

    if (window.location.pathname !== url) {
      window.history.pushState({}, '', url);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Firebase Auth methods
  const signInWithGoogleAuth = async () => {
    try {
      await signInWithGoogle();
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      throw err;
    }
  };

  const signInWithEmailAuth = async (email: string, pass: string) => {
    try {
      await loginWithEmail(email, pass);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Email Sign In error:', err);
      throw err;
    }
  };

  const signUpWithEmailAuth = async (email: string, pass: string, displayName?: string) => {
    try {
      const cred = await registerWithEmail(email, pass);
      if (cred.user && displayName) {
        // Will trigger onAuthStateChanged
      }
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Email Sign Up error:', err);
      throw err;
    }
  };

  const signOutAuth = async () => {
    await logoutFirebase();
    setUser(DEFAULT_GUEST_USER);
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  // Favorites
  const toggleFavoriteTool = (slug: string) => {
    setFavoriteToolSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const isToolFavorite = (slug: string) => favoriteToolSlugs.includes(slug);

  // Tool History
  const logToolUsage = (toolSlug: string, summary?: string) => {
    const tool = TOOL_REGISTRY.find((t) => t.slug === toolSlug);
    if (!tool) return;

    const newItem: ToolHistoryItem = {
      id: 'th-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      toolSlug,
      toolName: tool.name,
      category: tool.category,
      timestamp: Date.now(),
      summary,
    };

    setToolHistory((prev) => [newItem, ...prev.filter((i) => i.toolSlug !== toolSlug || Date.now() - i.timestamp > 300000)].slice(0, 50));
  };

  const deleteToolHistoryItem = (id: string) => {
    setToolHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearToolHistory = () => {
    setToolHistory([]);
  };

  // Chat Sessions
  const createNewChat = (): string => {
    const newChatId = 'chat-' + Date.now();
    const newChat: ChatSession = {
      id: newChatId,
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      favorite: false,
    };

    setChatSessions((prev) => [newChat, ...prev]);
    setActiveChatId(newChatId);
    navigateTo('chat', null, newChatId);
    return newChatId;
  };

  const selectChat = (chatId: string) => {
    setActiveChatId(chatId);
    navigateTo('chat', null, chatId);
  };

  const addMessageToChat = (chatId: string, messageData: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...messageData,
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      timestamp: Date.now(),
    };

    setChatSessions((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          const updatedMessages = [...chat.messages, newMessage];
          let updatedTitle = chat.title;
          if (chat.title === 'New Conversation' && messageData.role === 'user') {
            updatedTitle = messageData.content.slice(0, 36) + (messageData.content.length > 36 ? '...' : '');
          }
          return {
            ...chat,
            title: updatedTitle,
            messages: updatedMessages,
            updatedAt: Date.now(),
          };
        }
        return chat;
      })
    );
  };

  const renameChat = (chatId: string, title: string) => {
    setChatSessions((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, title: title.trim() || 'Untitled Chat' } : chat))
    );
  };

  const deleteChat = (chatId: string) => {
    setChatSessions((prev) => prev.filter((chat) => chat.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
    }
  };

  const toggleFavoriteChat = (chatId: string) => {
    setChatSessions((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, favorite: !chat.favorite } : chat))
    );
  };

  // Tasks & Dashboard
  const addTask = (title: string, subject: string, dueDate: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    const newTask: StudyTask = {
      id: 'task-' + Date.now(),
      title,
      subject,
      dueDate,
      priority,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextState = !t.completed;
          if (nextState) {
            setUser((u) => ({ ...u, completedTasksCount: u.completedTasksCount + 1 }));
          }
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const addExam = (exam: UpcomingExam) => {
    setExams((prev) => [...prev, exam]);
  };

  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  const recordStudyTime = (minutes: number) => {
    setUser((prev) => {
      const todayStr = new Date().toISOString().split('T')[0];
      let newStreak = prev.studyStreakDays;
      if (prev.lastStudyDate !== todayStr) {
        newStreak += 1;
      }
      return {
        ...prev,
        totalStudyMinutes: prev.totalStudyMinutes + minutes,
        studyStreakDays: newStreak,
        lastStudyDate: todayStr,
      };
    });
  };

  const recordQuizScore = (percent: number) => {
    setUser((prev) => ({
      ...prev,
      quizScores: [...prev.quizScores, percent],
    }));
  };

  return (
    <AppContext.Provider
      value={{
        activeRoute,
        activeToolSlug,
        activeChatId,
        navigateTo,
        isSearchOpen,
        setIsSearchOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        theme,
        setTheme,
        toggleTheme,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        user,
        firebaseUser,
        authLoading,
        signInWithGoogleAuth,
        signInWithEmailAuth,
        signUpWithEmailAuth,
        signOutAuth,
        updateUserProfile,
        favoriteToolSlugs,
        toggleFavoriteTool,
        isToolFavorite,
        toolHistory,
        logToolUsage,
        deleteToolHistoryItem,
        clearToolHistory,
        chatSessions,
        createNewChat,
        selectChat,
        addMessageToChat,
        renameChat,
        deleteChat,
        toggleFavoriteChat,
        tasks,
        addTask,
        toggleTask,
        deleteTask,
        exams,
        addExam,
        deleteExam,
        recordStudyTime,
        recordQuizScore,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
