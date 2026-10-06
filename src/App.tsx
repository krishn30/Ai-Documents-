import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { HomeView } from './components/home/HomeView';
import { AllToolsView } from './components/tools/AllToolsView';
import { ToolDetailView } from './components/tools/ToolDetailView';
import { ChatView } from './components/chat/ChatView';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { FavoritesView } from './components/views/FavoritesView';
import { HistoryView } from './components/views/HistoryView';
import { SettingsView } from './components/views/SettingsView';
import { AuthModal } from './components/auth/AuthModal';

function AppContent() {
  const { activeRoute, activeToolSlug } = useApp();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors">
      {/* Sidebar (Desktop fixed + Mobile Drawer) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="lg:pl-[270px] flex flex-col flex-1 min-h-screen transition-all">
        {/* Sticky Header */}
        <Header />

        {/* Dynamic Route View */}
        <main className="flex-1">
          {activeRoute === 'home' && <HomeView />}
          {activeRoute === 'tools' && <AllToolsView />}
          {activeRoute === 'tool-detail' && activeToolSlug && (
            <ToolDetailView toolSlug={activeToolSlug} />
          )}
          {activeRoute === 'chat' && <ChatView />}
          {activeRoute === 'dashboard' && <StudentDashboard />}
          {activeRoute === 'favorites' && <FavoritesView />}
          {activeRoute === 'history' && <HistoryView />}
          {activeRoute === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Search Modal (Ctrl+K) */}
      <GlobalSearchModal />

      {/* Firebase Auth Modal */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
