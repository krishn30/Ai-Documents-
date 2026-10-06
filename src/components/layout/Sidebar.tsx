import React, { useState } from 'react';
import {
  Home,
  Wrench,
  Sparkles,
  GraduationCap,
  FileText,
  Image as ImageIcon,
  Type,
  Calculator,
  Code,
  Star,
  Clock,
  Plus,
  Search,
  Settings,
  User,
  Sun,
  Moon,
  Trash2,
  Edit2,
  Check,
  X,
  MessageSquare,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatSession } from '../../types';

export const Sidebar: React.FC = () => {
  const {
    activeRoute,
    activeChatId,
    navigateTo,
    createNewChat,
    selectChat,
    setIsSearchOpen,
    theme,
    toggleTheme,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    chatSessions,
    deleteChat,
    renameChat,
    toggleFavoriteChat,
    favoriteToolSlugs,
    toolHistory,
    user,
    setIsAuthModalOpen,
    signOutAuth,
  } = useApp();

  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Group chats by date
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  const todayChats: ChatSession[] = [];
  const yesterdayChats: ChatSession[] = [];
  const prevWeekChats: ChatSession[] = [];
  const olderChats: ChatSession[] = [];

  chatSessions.forEach((chat) => {
    const age = now - chat.updatedAt;
    if (age < ONE_DAY) {
      todayChats.push(chat);
    } else if (age < 2 * ONE_DAY) {
      yesterdayChats.push(chat);
    } else if (age < 7 * ONE_DAY) {
      prevWeekChats.push(chat);
    } else {
      olderChats.push(chat);
    }
  });

  const handleStartRename = (e: React.MouseEvent, chat: ChatSession) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const handleSaveRename = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    renameChat(chatId, editingTitle);
    setEditingChatId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(null);
  };

  const handleDelete = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      deleteChat(chatId);
    }
  };

  const navItems = [
    { label: 'Home', icon: Home, route: 'home' },
    { label: 'All Tools', icon: Wrench, route: 'tools' },
    { label: 'AI Tools', icon: Sparkles, route: 'tools', filter: 'ai' },
    { label: 'Study Tools', icon: GraduationCap, route: 'dashboard' },
    { label: 'PDF Tools', icon: FileText, route: 'tools', filter: 'pdf' },
    { label: 'Image Tools', icon: ImageIcon, route: 'tools', filter: 'image' },
    { label: 'Text Tools', icon: Type, route: 'tools', filter: 'text' },
    { label: 'Calculators', icon: Calculator, route: 'tools', filter: 'calculator' },
    { label: 'Developer Tools', icon: Code, route: 'tools', filter: 'developer' },
  ];

  const renderChatGroup = (title: string, chats: ChatSession[]) => {
    if (chats.length === 0) return null;
    return (
      <div className="mb-4">
        <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
          {title}
        </div>
        <div className="space-y-0.5">
          {chats.map((chat) => {
            const isActive = activeRoute === 'chat' && activeChatId === chat.id;
            const isEditing = editingChatId === chat.id;

            return (
              <div
                key={chat.id}
                onClick={() => selectChat(chat.id)}
                className={`group relative flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <MessageSquare className={`size-3.5 shrink-0 ${chat.favorite ? 'text-amber-500 fill-amber-500' : 'text-neutral-600 dark:text-neutral-400'}`} />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-white dark:bg-neutral-900 border border-blue-400 rounded px-1.5 py-0.5 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none"
                      autoFocus
                    />
                  ) : (
                    <span className="truncate">{chat.title}</span>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                  {isEditing ? (
                    <>
                      <button
                        onClick={(e) => handleSaveRename(e, chat.id)}
                        className="p-1 hover:text-emerald-600 dark:hover:text-emerald-400"
                        title="Save"
                      >
                        <Check className="size-3" />
                      </button>
                      <button
                        onClick={handleCancelRename}
                        className="p-1 hover:text-rose-600 dark:hover:text-rose-400"
                        title="Cancel"
                      >
                        <X className="size-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoriteChat(chat.id);
                        }}
                        className={`p-1 hover:text-amber-500 ${chat.favorite ? 'text-amber-500' : 'text-neutral-600 dark:text-neutral-400'}`}
                        title="Favorite"
                      >
                        <Star className="size-3" />
                      </button>
                      <button
                        onClick={(e) => handleStartRename(e, chat)}
                        className="p-1 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                        title="Rename"
                      >
                        <Edit2 className="size-3" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, chat.id)}
                        className="p-1 text-neutral-600 hover:text-rose-600 dark:text-neutral-400 dark:hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-[270px] bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 h-15 border-b border-neutral-200 dark:border-neutral-800">
          <div
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="size-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs group-hover:scale-105 transition-transform">
              🎓
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                StudentToolBox
              </div>
              <div className="text-[10px] text-neutral-600 dark:text-neutral-400 leading-none">
                All Tools in One Place
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 rounded-md"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Action Buttons: New Chat & Global Search */}
        <div className="p-3 space-y-2 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <button
            onClick={() => createNewChat()}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="size-4" />
            <span>New Chat</span>
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between py-1.5 px-3 rounded-lg bg-neutral-100 hover:bg-neutral-200/70 dark:bg-neutral-800 dark:hover:bg-neutral-700/70 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-colors"
          >
            <span className="flex items-center gap-2">
              <Search className="size-3.5 text-neutral-600 dark:text-neutral-400" />
              <span>Search tools & chats</span>
            </span>
            <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-500">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Scrollable Navigation & Chat History */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs">
          {/* Main Navigation */}
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.route && (!item.filter || activeRoute === 'tools');
              return (
                <button
                  key={item.label}
                  onClick={() => {
                    navigateTo(item.route);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-left transition-colors ${
                    isActive
                      ? 'bg-neutral-100 text-neutral-900 font-semibold dark:bg-neutral-800 dark:text-white'
                      : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="size-4 text-neutral-600 dark:text-neutral-400" />
                    <span>{item.label}</span>
                  </span>
                  <ChevronRight className="size-3.5 text-neutral-400 opacity-60" />
                </button>
              );
            })}
          </div>

          {/* Quick Access: Favorites & Tool History */}
          <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800/60 space-y-0.5">
            <button
              onClick={() => navigateTo('favorites')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-left transition-colors ${
                activeRoute === 'favorites'
                  ? 'bg-amber-50 text-amber-900 font-semibold dark:bg-amber-950/40 dark:text-amber-300'
                  : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/50'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Star className="size-4 text-amber-500" />
                <span>Favorites</span>
              </span>
              <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-full">
                {favoriteToolSlugs.length}
              </span>
            </button>

            <button
              onClick={() => navigateTo('history')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-left transition-colors ${
                activeRoute === 'history'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold dark:bg-neutral-800 dark:text-white'
                  : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/50'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Clock className="size-4 text-neutral-600 dark:text-neutral-400" />
                <span>Tool History</span>
              </span>
              <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-full">
                {toolHistory.length}
              </span>
            </button>
          </div>

          {/* Chat History Section */}
          <div className="pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Chat History
              </span>
              <span className="text-[10px] text-neutral-600 dark:text-neutral-400">
                {chatSessions.length} total
              </span>
            </div>

            {chatSessions.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-neutral-600 dark:text-neutral-400 italic">
                No conversations yet.
              </div>
            ) : (
              <>
                {renderChatGroup('Today', todayChats)}
                {renderChatGroup('Yesterday', yesterdayChats)}
                {renderChatGroup('Previous 7 Days', prevWeekChats)}
                {renderChatGroup('Older', olderChats)}
              </>
            )}
          </div>
        </div>

        {/* Sidebar Footer: Settings & Profile */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 space-y-2">
          <div className="flex items-center justify-between px-1">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white p-1 rounded-md"
              title="Toggle Light / Dark mode"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="size-3.5 text-amber-400" />
                  <span className="text-[11px]">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="size-3.5 text-blue-500" />
                  <span className="text-[11px]">Dark Mode</span>
                </>
              )}
            </button>

            <button
              onClick={() => navigateTo('settings')}
              className="flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white p-1 rounded-md"
            >
              <Settings className="size-3.5" />
              <span className="text-[11px]">Settings</span>
            </button>
          </div>

          {/* User profile strip */}
          <div
            onClick={() => {
              if (user.isGuest) {
                setIsAuthModalOpen(true);
              } else {
                navigateTo('settings');
              }
            }}
            className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="size-7 rounded-full object-cover shrink-0" />
              ) : (
                <div className="size-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                  {user.name}
                </div>
                <div className="text-[10px] text-neutral-600 dark:text-neutral-400 truncate">
                  {user.isGuest ? 'Tap to Sign In with Firebase' : user.email}
                </div>
              </div>
            </div>

            {user.isGuest ? (
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 shrink-0">
                Sign In
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  signOutAuth();
                }}
                className="p-1 text-neutral-400 hover:text-rose-500"
                title="Log Out from Firebase"
              >
                <LogOut className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
