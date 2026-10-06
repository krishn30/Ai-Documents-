import React from 'react';
import { Star, ArrowRight, Wrench } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TOOL_REGISTRY } from '../../data/toolRegistry';
import { ToolCard } from '../tools/ToolCard';

export const FavoritesView: React.FC = () => {
  const { favoriteToolSlugs, navigateTo } = useApp();

  const favoriteTools = favoriteToolSlugs
    .map((slug) => TOOL_REGISTRY.find((t) => t.slug === slug))
    .filter(Boolean) as typeof TOOL_REGISTRY;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <Star className="size-6 text-amber-500 fill-amber-500" />
            <span>Saved & Favorite Tools ({favoriteTools.length})</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Quickly access your starred calculators, converters, and AI helpers.
          </p>
        </div>

        <button
          onClick={() => navigateTo('tools')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
        >
          Browse All Tools
        </button>
      </div>

      {favoriteTools.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8">
          <Star className="size-10 text-neutral-300 dark:text-neutral-700 mx-auto" />
          <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
            No favorite tools saved yet
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Click the star icon on any tool card or detail page to pin your most frequently used academic tools here.
          </p>
          <button
            onClick={() => navigateTo('tools')}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-xs font-semibold"
          >
            <span>Explore All Tools</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {favoriteTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
};
