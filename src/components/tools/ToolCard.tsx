import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  Type,
  Calculator,
  Sparkles,
  GraduationCap,
  Code,
  Star,
  ArrowRight,
  AlertCircle,
  LucideIcon,
  Layers,
  Scissors,
  RotateCw,
  Trash2,
  FilePlus,
  Minimize2,
  FileArchive,
  Maximize2,
  FlipHorizontal,
  Stamp,
  Palette,
  CheckSquare,
  Copy,
  CalendarClock,
  BookOpen,
  PenTool,
  CheckCircle,
  HelpCircle,
  UserCheck,
  Award,
  Percent,
  BarChart2,
  RefreshCw,
  Divide,
  TrendingUp,
  Tag,
  Calendar,
  Activity,
  GitCompare,
  ListFilter,
  Eraser,
  ArrowUpDown,
  RotateCcw,
  Link,
  FileCode,
} from 'lucide-react';
import { Tool } from '../../types';
import { useApp } from '../../context/AppContext';

const ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  Image: ImageIcon,
  Type,
  Calculator,
  Sparkles,
  GraduationCap,
  Code,
  Layers,
  Scissors,
  RotateCw,
  Trash2,
  FilePlus,
  Minimize2,
  FileArchive,
  Maximize2,
  FlipHorizontal,
  Stamp,
  Palette,
  CheckSquare,
  Copy,
  CalendarClock,
  BookOpen,
  PenTool,
  CheckCircle,
  HelpCircle,
  UserCheck,
  Award,
  Percent,
  BarChart2,
  RefreshCw,
  Divide,
  TrendingUp,
  Tag,
  Calendar,
  Activity,
  GitCompare,
  ListFilter,
  Eraser,
  ArrowUpDown,
  RotateCcw,
  Link,
  FileCode,
};

export const ToolCard: React.FC<{ tool: Tool }> = ({ tool }) => {
  const { navigateTo, isToolFavorite, toggleFavoriteTool } = useApp();
  const isFavorite = isToolFavorite(tool.slug);

  const IconComponent = ICON_MAP[tool.icon] || FileText;

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'ai':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800/60';
      case 'calculator':
        return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60';
      case 'pdf':
        return 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
      case 'image':
        return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
      case 'text':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/60';
      case 'study':
        return 'text-teal-600 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-800/60';
      default:
        return 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60';
    }
  };

  return (
    <div
      onClick={() => navigateTo('tool-detail', tool.slug)}
      className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 hover:border-blue-500/50 dark:hover:border-blue-500/50 hover:shadow-lg hover:shadow-neutral-200/40 dark:hover:shadow-neutral-950/40 cursor-pointer transition-all duration-200"
    >
      <div>
        {/* Top row: Icon & Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className={`size-10 sm:size-11 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105 ${getCategoryColor(
              tool.category
            )}`}
          >
            <IconComponent className="size-5" />
          </div>

          <div className="flex items-center gap-1.5">
            {tool.badge && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                {tool.badge}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavoriteTool(tool.slug);
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                isFavorite
                  ? 'text-amber-500 hover:text-amber-600'
                  : 'text-neutral-300 hover:text-neutral-500 dark:text-neutral-600 dark:hover:text-neutral-400'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label="Toggle favorite"
            >
              <Star className={`size-4 ${isFavorite ? 'fill-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Name & Description */}
        <h3 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
          {tool.name}
        </h3>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
          {tool.description}
        </p>
      </div>

      {/* Footer Status & Open Arrow */}
      <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
        <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
          {tool.category}
        </span>

        {tool.available ? (
          <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 text-[11px] group-hover:translate-x-0.5 transition-transform">
            <span>Open Tool</span>
            <ArrowRight className="size-3" />
          </span>
        ) : (
          <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400 text-[10px]">
            <AlertCircle className="size-3" />
            <span>Unconfigured</span>
          </span>
        )}
      </div>
    </div>
  );
};
