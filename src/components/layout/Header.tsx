import React from 'react';
import { Menu, Search, Plus, Sun, Moon, Sparkles, Star, User, LogIn } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TOOL_REGISTRY } from '../../data/toolRegistry';

export const Header: React.FC = () => {
  const {
    activeRoute,
    activeToolSlug,
    navigateTo,
    createNewChat,
    setIsSearchOpen,
    setIsAuthModalOpen,
    setIsMobileSidebarOpen,
    theme,
    toggleTheme,
    user,
  } = useApp();

  const activeTool = activeToolSlug ? TOOL_REGISTRY.find((t) => t.slug === activeToolSlug) : null;

  const getPageTitle = () => {
    if (activeRoute === 'home') return 'Dashboard & Tools';
    if (activeRoute === 'tools') return 'All Student Tools';
    if (activeRoute === 'tool-detail') return activeTool ? activeTool.name : 'Tool';
    if (activeRoute === 'chat') return 'AI Student Assistant';
    if (activeRoute === 'dashboard') return 'Student Study Dashboard';
    if (activeRoute === 'favorites') return 'Saved & Favorite Tools';
    if (activeRoute === 'history') return 'Tool Usage History';
    if (activeRoute === 'settings') return 'Settings & Account';
    return 'StudentToolBox';
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-15 px-4 sm:px-6 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      {/* Left: Mobile hamburger & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="size-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-900 dark:text-white">
            {getPageTitle()}
          </span>
          {activeTool && activeTool.badge && (
            <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {activeTool.badge}
            </span>
          )}
        </div>
      </div>

      {/* Right: Search, Chat & Quick Actions */}
      <div className="flex items-center gap-2">
        {/* Global Search trigger */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200/70 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs text-neutral-600 dark:text-neutral-300 font-medium transition-colors"
        >
          <Search className="size-3.5 text-neutral-600 dark:text-neutral-400" />
          <span className="hidden sm:inline">Search anything...</span>
          <kbd className="hidden md:inline text-[10px] px-1 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400">
            Ctrl+K
          </kbd>
        </button>

        {/* New Chat Button */}
        <button
          onClick={() => createNewChat()}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="size-3.5" />
          <span>New Chat</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="size-4 text-amber-400" />
          ) : (
            <Moon className="size-4 text-blue-600" />
          )}
        </button>

        {/* Sign In / User Profile Button */}
        {user.isGuest ? (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <LogIn className="size-3.5" />
            <span>Sign In</span>
          </button>
        ) : (
          <button
            onClick={() => navigateTo('settings')}
            className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-full sm:rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors border border-neutral-200 dark:border-neutral-700"
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="size-6 rounded-full object-cover" />
            ) : (
              <div className="size-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[11px]">
                {user.name.charAt(0)}
              </div>
            )}
            <span className="hidden md:inline font-semibold">{user.name.split(' ')[0]}</span>
          </button>
        )}
      </div>
    </header>
  );
};
