import React from 'react';
import { Clock, Trash2, ArrowRight, Wrench } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HistoryView: React.FC = () => {
  const { toolHistory, deleteToolHistoryItem, clearToolHistory, navigateTo } = useApp();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <Clock className="size-6 text-neutral-500" />
            <span>Tool Usage History ({toolHistory.length})</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Real activity log of tools and calculators opened on your device.
          </p>
        </div>

        {toolHistory.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Clear all tool usage history?')) clearToolHistory();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <Trash2 className="size-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {toolHistory.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8">
          <Clock className="size-10 text-neutral-300 dark:text-neutral-700 mx-auto" />
          <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
            No tool history recorded yet
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Whenever you run calculations, compress images, or use AI study tools, an activity record is kept here.
          </p>
          <button
            onClick={() => navigateTo('tools')}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
          >
            <span>Explore All Tools</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl divide-y divide-neutral-100 dark:divide-neutral-800 overflow-hidden shadow-xs">
          {toolHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => navigateTo('tool-detail', item.toolSlug)}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                  <Wrench className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                    {item.toolName}
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate">
                    {item.summary ? item.summary : 'Opened tool'} • Category: {item.category}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="text-[11px] text-neutral-400 font-mono">
                  {new Date(item.timestamp).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteToolHistoryItem(item.id);
                  }}
                  className="p-1.5 text-neutral-300 hover:text-rose-600 transition-colors rounded-md"
                  title="Delete record"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
