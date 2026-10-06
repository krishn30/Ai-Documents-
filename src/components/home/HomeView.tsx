import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  Type,
  Calculator,
  GraduationCap,
  Code,
  Clock,
  MessageSquare,
  Star,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TOOL_REGISTRY, CATEGORIES_METADATA } from '../../data/toolRegistry';
import { ToolCard } from '../tools/ToolCard';
import { ToolCategory } from '../../types';

export const HomeView: React.FC = () => {
  const {
    navigateTo,
    selectChat,
    chatSessions,
    toolHistory,
    favoriteToolSlugs,
    setIsSearchOpen,
  } = useApp();

  const [heroSearch, setHeroSearch] = useState('');

  const suggestions = [
    { label: 'Calculate my attendance', slug: 'attendance-calculator' },
    { label: 'Compress a PDF', slug: 'pdf-compressor' },
    { label: 'Make an AI practice quiz', slug: 'ai-quiz-generator' },
    { label: 'Calculate semester GPA', slug: 'gpa-calculator' },
    { label: 'Convert JPG to PDF', slug: 'jpg-to-pdf' },
    { label: 'Summarize academic article', slug: 'ai-summarizer' },
  ];

  const popularTools = TOOL_REGISTRY.filter((t) => t.popular && t.available).slice(0, 8);

  const recentTools = toolHistory
    .slice(0, 4)
    .map((h) => TOOL_REGISTRY.find((t) => t.slug === h.toolSlug))
    .filter(Boolean);

  const categoriesList: { id: ToolCategory; label: string; icon: string; count: number }[] = [
    { id: 'calculator', label: 'Calculators', icon: 'Calculator', count: 12 },
    { id: 'ai', label: 'AI Study Tools', icon: 'Sparkles', count: 8 },
    { id: 'pdf', label: 'PDF Tools', icon: 'FileText', count: 7 },
    { id: 'image', label: 'Image Tools', icon: 'Image', count: 7 },
    { id: 'text', label: 'Text Tools', icon: 'Type', count: 10 },
    { id: 'study', label: 'Study Tools', icon: 'GraduationCap', count: 4 },
  ];

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSearch.trim()) return;
    setIsSearchOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 pt-4 sm:pt-8 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 text-xs font-semibold shadow-xs">
          <span>🎓</span>
          <span>StudentToolBox</span>
          <span className="text-neutral-300 dark:text-neutral-700">•</span>
          <span>Zero Dummy Tools</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-neutral-900 dark:text-white leading-tight">
          Every Tool a Student Needs —{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            In One Place.
          </span>
        </h1>

        <p className="text-xs sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Study smarter, work faster, and complete everyday tasks without opening dozens of websites.
        </p>

        {/* Hero Search Box */}
        <div className="pt-2 max-w-2xl mx-auto">
          <form
            onSubmit={handleHeroSubmit}
            className="relative flex items-center shadow-lg rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-2"
          >
            <Search className="size-5 text-neutral-400 ml-3 shrink-0" />
            <input
              type="text"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              placeholder="What do you want to do? (e.g., 'Compress PDF', 'Calculate GPA')..."
              className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shrink-0 shadow-xs"
            >
              Search
            </button>
          </form>

          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
            <span className="text-[11px] text-neutral-400 font-medium mr-1">Suggestions:</span>
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => navigateTo('tool-detail', s.slug)}
                className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categoriesList.map((cat) => (
          <div
            key={cat.id}
            onClick={() => {
              if (cat.id === 'study') navigateTo('dashboard');
              else navigateTo('tools');
            }}
            className="group p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all hover:shadow-md text-center space-y-2"
          >
            <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform font-bold">
              {cat.id === 'calculator' && '🧮'}
              {cat.id === 'ai' && '🤖'}
              {cat.id === 'pdf' && '📄'}
              {cat.id === 'image' && '🖼️'}
              {cat.id === 'text' && '📝'}
              {cat.id === 'study' && '📚'}
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 transition-colors">
                {cat.label}
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">{cat.count} verified tools</div>
            </div>
          </div>
        ))}
      </div>

      {/* Popular Tools Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Sparkles className="size-5 text-blue-600" />
              <span>Most Popular Student Tools</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Ranked dynamically by daily student usage and importance.
            </p>
          </div>

          <button
            onClick={() => navigateTo('tools')}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
          >
            <span>View All ({TOOL_REGISTRY.length})</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </div>

      {/* User's History & Conversations Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Used Tools */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Clock className="size-4 text-neutral-500" />
              <span>Recently Used by You</span>
            </h3>
            <button
              onClick={() => navigateTo('history')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              History
            </button>
          </div>

          {toolHistory.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400 italic">
              No recent tools yet. Use any tool above and it will be stored here.
            </div>
          ) : (
            <div className="space-y-2">
              {toolHistory.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigateTo('tool-detail', item.toolSlug)}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700 cursor-pointer hover:border-blue-400 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {item.toolName}
                    </div>
                    {item.summary && (
                      <div className="text-[10px] text-neutral-400 truncate">{item.summary}</div>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 shrink-0 ml-2">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Continue AI Chat */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="size-4 text-purple-600" />
              <span>Continue AI Chat</span>
            </h3>
            <button
              onClick={() => navigateTo('chat')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              Open Chat
            </button>
          </div>

          {chatSessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400 italic">
              No previous conversations. Start a new chat to ask questions or get study tips!
            </div>
          ) : (
            <div className="space-y-2">
              {chatSessions.slice(0, 4).map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => selectChat(chat.id)}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700 cursor-pointer hover:border-purple-400 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {chat.title}
                    </div>
                    <div className="text-[10px] text-neutral-400 truncate">
                      {chat.messages.length} messages • Last active {new Date(chat.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <ArrowRight className="size-3.5 text-neutral-400 shrink-0 ml-2" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
