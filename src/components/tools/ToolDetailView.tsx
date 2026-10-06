import React, { useEffect } from 'react';
import { ArrowLeft, Star, AlertCircle, Wrench, Sparkles, Share2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TOOL_REGISTRY } from '../../data/toolRegistry';
import { TextToolsView } from './TextToolsView';
import { CalculatorToolsView } from './CalculatorToolsView';
import { PdfToolsView } from './PdfToolsView';
import { ImageToolsView } from './ImageToolsView';
import { AiToolsView } from './AiToolsView';

export const ToolDetailView: React.FC<{ toolSlug: string }> = ({ toolSlug }) => {
  const { navigateTo, isToolFavorite, toggleFavoriteTool, logToolUsage } = useApp();

  const tool = TOOL_REGISTRY.find((t) => t.slug === toolSlug);

  useEffect(() => {
    if (tool && tool.available) {
      logToolUsage(tool.slug, 'Opened tool');
    }
  }, [toolSlug]);

  if (!tool) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto space-y-4">
        <div className="size-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto font-bold">
          !
        </div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Tool Not Found</h2>
        <p className="text-xs text-neutral-500">
          The requested tool "{toolSlug}" does not exist in the registry.
        </p>
        <button
          onClick={() => navigateTo('tools')}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
        >
          Back to All Tools
        </button>
      </div>
    );
  }

  const isFav = isToolFavorite(tool.slug);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Top Navigation & Tool Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('tools')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          <span>All Tools</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFavoriteTool(tool.slug)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              isFav
                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
            }`}
          >
            <Star className={`size-3.5 ${isFav ? 'fill-amber-500 text-amber-500' : ''}`} />
            <span>{isFav ? 'Favorited' : 'Favorite'}</span>
          </button>
        </div>
      </div>

      {/* Tool Title Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-bold">
            {tool.category}
          </span>
          {tool.badge && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {tool.badge}
            </span>
          )}
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white">
          {tool.name}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed">
          {tool.description}
        </p>
      </div>

      {/* Unconfigured Tool Honest Fallback */}
      {!tool.available ? (
        <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="size-5 text-amber-600" />
            <span>Service Not Configured in Current Environment</span>
          </div>
          <p className="text-xs leading-relaxed">
            {tool.unavailabilityReason || 'This tool requires a backend processing daemon that is not installed.'}
          </p>
          {tool.requiredDependency && (
            <div className="p-3 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-inherit text-xs font-mono">
              Missing Dependency: <span className="font-bold">{tool.requiredDependency}</span>
            </div>
          )}
          <p className="text-xs text-neutral-500">
            Per our Zero Dummy Functionality rule, we do not fake results or return mock downloads.
          </p>
        </div>
      ) : (
        /* Render Genuine Interactive Tool */
        <div>
          {tool.category === 'text' && <TextToolsView toolSlug={tool.slug} />}
          {tool.category === 'calculator' && <CalculatorToolsView toolSlug={tool.slug} />}
          {tool.category === 'pdf' && <PdfToolsView toolSlug={tool.slug} />}
          {tool.category === 'image' && <ImageToolsView toolSlug={tool.slug} />}
          {tool.category === 'ai' && <AiToolsView toolSlug={tool.slug} />}
        </div>
      )}
    </div>
  );
};
