import React, { useState } from 'react';
import { Search, Filter, Sparkles, Wrench } from 'lucide-react';
import { TOOL_REGISTRY, CATEGORIES_METADATA } from '../../data/toolRegistry';
import { ToolCard } from './ToolCard';
import { ToolCategory } from '../../types';
import { useApp } from '../../context/AppContext';

export const AllToolsView: React.FC = () => {
  const { favoriteToolSlugs, toolHistory } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'alpha' | 'favorites'>('popular');

  const categories = [
    { id: 'all', label: 'All Tools' },
    { id: 'pdf', label: 'PDF' },
    { id: 'image', label: 'Image' },
    { id: 'text', label: 'Text' },
    { id: 'calculator', label: 'Calculator' },
    { id: 'ai', label: 'AI' },
    { id: 'study', label: 'Study' },
    { id: 'developer', label: 'Developer' },
  ];

  const q = searchQuery.trim().toLowerCase();

  let filtered = TOOL_REGISTRY.filter((tool) => {
    const matchCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchQuery =
      !q ||
      tool.name.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.keywords.some((k) => k.toLowerCase().includes(q));
    return matchCategory && matchQuery;
  });

  if (sortBy === 'popular') {
    filtered = [...filtered].sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
  } else if (sortBy === 'alpha') {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'favorites') {
    filtered = [...filtered].sort(
      (a, b) => (favoriteToolSlugs.includes(b.slug) ? 1 : 0) - (favoriteToolSlugs.includes(a.slug) ? 1 : 0)
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
            All Student Tools
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Browse our full catalog of mathematically verified and genuinely functional utilities.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="size-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools by name or keyword..."
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Filter and Sort Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        {/* Categories */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-2.5 py-1 text-xs font-semibold text-neutral-800 dark:text-neutral-200"
          >
            <option value="popular">Popular First</option>
            <option value="alpha">Alphabetical (A-Z)</option>
            <option value="favorites">My Favorites</option>
          </select>
        </div>
      </div>

      {/* Tools Grid */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <Wrench className="size-8 text-neutral-400 mx-auto" />
          <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
            No tools found matching your search.
          </h3>
          <p className="text-xs text-neutral-500">
            Try checking for spelling or resetting the category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
};
