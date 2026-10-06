import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Wrench, MessageSquare, Star, Clock, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TOOL_REGISTRY } from '../../data/toolRegistry';
import { Tool, ChatSession, ToolHistoryItem } from '../../types';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    navigateTo,
    selectChat,
    chatSessions,
    toolHistory,
    favoriteToolSlugs,
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.trim().toLowerCase();

  // Search real tools
  const matchingTools: Tool[] = q
    ? TOOL_REGISTRY.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.toLowerCase().includes(q))
      )
    : TOOL_REGISTRY.slice(0, 6);

  // Search real chats
  const matchingChats: ChatSession[] = q
    ? chatSessions.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.messages.some((m) => m.content.toLowerCase().includes(q))
      )
    : chatSessions.slice(0, 3);

  // Search real history
  const matchingHistory: ToolHistoryItem[] = q
    ? toolHistory.filter(
        (h) =>
          h.toolName.toLowerCase().includes(q) ||
          (h.summary && h.summary.toLowerCase().includes(q))
      )
    : toolHistory.slice(0, 3);

  // Combined selectable list
  type SearchResultItem =
    | { type: 'tool'; item: Tool }
    | { type: 'chat'; item: ChatSession }
    | { type: 'history'; item: ToolHistoryItem };

  const allResults: SearchResultItem[] = [
    ...matchingTools.map((t) => ({ type: 'tool' as const, item: t })),
    ...matchingChats.map((c) => ({ type: 'chat' as const, item: c })),
    ...matchingHistory.map((h) => ({ type: 'history' as const, item: h })),
  ];

  const handleSelect = (result: SearchResultItem) => {
    setIsSearchOpen(false);
    if (result.type === 'tool') {
      navigateTo('tool-detail', result.item.slug);
    } else if (result.type === 'chat') {
      selectChat(result.item.id);
    } else if (result.type === 'history') {
      navigateTo('tool-detail', result.item.toolSlug);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allResults[selectedIndex]) {
        handleSelect(allResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  return (
    <div
      onClick={() => setIsSearchOpen(false)}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Input box */}
        <div className="relative flex items-center px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <Search className="size-5 text-neutral-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search tools, chats, or anything..."
            className="w-full bg-transparent text-sm sm:text-base text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="size-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-mono">
              ESC
            </kbd>
          )}
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {allResults.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-500">
              No results found for <span className="font-semibold text-neutral-800 dark:text-neutral-200">"{query}"</span>.
            </div>
          ) : (
            <>
              {/* Tools Section */}
              {matchingTools.length > 0 && (
                <div>
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
                    <span>Tools ({matchingTools.length})</span>
                    <span className="text-[10px] text-neutral-400">Press Enter to open</span>
                  </div>
                  <div className="space-y-1">
                    {matchingTools.map((tool, idx) => {
                      const isSelected = selectedIndex === idx;
                      const isFav = favoriteToolSlugs.includes(tool.slug);

                      return (
                        <div
                          key={tool.id}
                          onClick={() => handleSelect({ type: 'tool', item: tool })}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200'
                              : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="size-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-blue-600 shrink-0">
                              <Wrench className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                                <span className="truncate">{tool.name}</span>
                                {isFav && <Star className="size-3 text-amber-500 fill-amber-500 shrink-0" />}
                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                                  {tool.category}
                                </span>
                              </div>
                              <div className="text-xs text-neutral-500 truncate">
                                {tool.description}
                              </div>
                            </div>
                          </div>
                          {isSelected && <CornerDownLeft className="size-4 text-blue-500 shrink-0 ml-2" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Chats Section */}
              {matchingChats.length > 0 && (
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Conversations ({matchingChats.length})
                  </div>
                  <div className="space-y-1">
                    {matchingChats.map((chat, idx) => {
                      const itemIdx = matchingTools.length + idx;
                      const isSelected = selectedIndex === itemIdx;

                      return (
                        <div
                          key={chat.id}
                          onClick={() => handleSelect({ type: 'chat', item: chat })}
                          onMouseEnter={() => setSelectedIndex(itemIdx)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200'
                              : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="size-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-indigo-500 shrink-0">
                              <MessageSquare className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-semibold truncate">
                                {chat.title}
                              </div>
                              <div className="text-xs text-neutral-400 truncate">
                                {chat.messages.length} messages • Updated {new Date(chat.updatedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          {isSelected && <CornerDownLeft className="size-4 text-blue-500 shrink-0 ml-2" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* History Section */}
              {matchingHistory.length > 0 && (
                <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Recent History ({matchingHistory.length})
                  </div>
                  <div className="space-y-1">
                    {matchingHistory.map((hist, idx) => {
                      const itemIdx = matchingTools.length + matchingChats.length + idx;
                      const isSelected = selectedIndex === itemIdx;

                      return (
                        <div
                          key={hist.id}
                          onClick={() => handleSelect({ type: 'history', item: hist })}
                          onMouseEnter={() => setSelectedIndex(itemIdx)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200'
                              : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Clock className="size-4 text-neutral-400 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">
                                {hist.toolName} {hist.summary ? `• ${hist.summary}` : ''}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] text-neutral-400 shrink-0">
                            {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950/50 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">↵</kbd>
              <span>to open</span>
            </span>
          </div>
          <span>StudentToolBox Global Search</span>
        </div>
      </div>
    </div>
  );
};
