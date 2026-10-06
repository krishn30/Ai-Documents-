import React, { useState } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  Download,
  Trash2,
  FileText,
  ListFilter,
  Type,
  GitCompare,
  Code,
  Link,
  ArrowUpDown,
  Eraser,
} from 'lucide-react';
import {
  analyzeText,
  convertCase,
  removeDuplicateLines,
  cleanWhitespace,
  sortLines,
  reverseText,
  generateSlug,
  generateLoremIpsum,
  computeLineDiff,
} from '../../utils/textUtils';
import { useApp } from '../../context/AppContext';

export const TextToolsView: React.FC<{ toolSlug: string }> = ({ toolSlug }) => {
  const { logToolUsage } = useApp();

  const [inputText, setInputText] = useState(
    'StudentToolBox is the all-in-one productivity platform for students worldwide. It brings together powerful calculators, document converters, image tools, and an AI study assistant. Every student deserves fast, reliable, and privacy-respecting academic utilities.'
  );
  const [copied, setCopied] = useState(false);

  // Diff checker state
  const [diffOriginal, setDiffOriginal] = useState(
    'The quick brown fox jumps over the lazy dog.\nThis is the first draft of the essay.\nRemember to cite your sources properly.'
  );
  const [diffModified, setDiffModified] = useState(
    'The quick brown fox jumps over the sleeping dog.\nThis is the revised second draft of the essay.\nRemember to cite all academic sources properly.\nExtra concluding sentence added.'
  );

  // Lorem state
  const [loremCount, setLoremCount] = useState(3);
  const [loremType, setLoremType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');

  // Slug state
  const [slugInput, setSlugInput] = useState('How to Prepare for College Semester Finals 2026');

  // Duplicates state
  const [dupCaseSensitive, setDupCaseSensitive] = useState(true);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTextFile = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- 1. WORD COUNTER ---
  if (toolSlug === 'word-counter') {
    const stats = analyzeText(inputText);

    return (
      <div className="space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40">
            <div className="text-[11px] font-semibold uppercase text-blue-700 dark:text-blue-300">Words</div>
            <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mt-1">{stats.words}</div>
          </div>
          <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-900/40">
            <div className="text-[11px] font-semibold uppercase text-purple-700 dark:text-purple-300">Characters</div>
            <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mt-1">{stats.characters}</div>
            <div className="text-[10px] text-neutral-500 mt-0.5">{stats.charactersNoSpaces} without spaces</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/40">
            <div className="text-[11px] font-semibold uppercase text-emerald-700 dark:text-emerald-300">Sentences</div>
            <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mt-1">{stats.sentences}</div>
            <div className="text-[10px] text-neutral-500 mt-0.5">{stats.paragraphs} paragraphs</div>
          </div>
          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40">
            <div className="text-[11px] font-semibold uppercase text-amber-700 dark:text-amber-300">Reading Time</div>
            <div className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mt-1">{stats.readingTimeMinutes}m</div>
            <div className="text-[10px] text-neutral-500 mt-0.5">Speaking: ~{stats.speakingTimeMinutes}m</div>
          </div>
        </div>

        {/* Text Area */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Enter or paste text to analyze:
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInputText('')}
                className="text-xs text-neutral-500 hover:text-rose-500 flex items-center gap-1"
              >
                <Trash2 className="size-3.5" />
                <span>Clear</span>
              </button>
              <button
                onClick={() => copyToClipboard(inputText)}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
              >
                {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              logToolUsage('word-counter', `${stats.words} words`);
            }}
            rows={8}
            className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
            placeholder="Type or paste text here..."
          />
        </div>

        {/* Keyword Frequency Table */}
        {stats.keywordDensity.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
              Top Keywords & Density
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {stats.keywordDensity.map((item) => (
                <div
                  key={item.word}
                  className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">{item.word}</span>
                  <span className="text-neutral-500">
                    {item.count}x ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- 2. CASE CONVERTER ---
  if (toolSlug === 'case-converter') {
    const handleConvert = (c: any) => {
      const res = convertCase(inputText, c);
      setInputText(res);
      logToolUsage('case-converter', `Converted to ${c}`);
    };

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Input Text:
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(inputText)}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
              >
                {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={6}
            className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type or paste text..."
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => handleConvert('upper')}
              className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              UPPERCASE
            </button>
            <button
              onClick={() => handleConvert('lower')}
              className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              lowercase
            </button>
            <button
              onClick={() => handleConvert('title')}
              className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              Title Case
            </button>
            <button
              onClick={() => handleConvert('sentence')}
              className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              Sentence case
            </button>
            <button
              onClick={() => handleConvert('camel')}
              className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors font-mono"
            >
              camelCase
            </button>
            <button
              onClick={() => handleConvert('pascal')}
              className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors font-mono"
            >
              PascalCase
            </button>
            <button
              onClick={() => handleConvert('snake')}
              className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors font-mono"
            >
              snake_case
            </button>
            <button
              onClick={() => handleConvert('kebab')}
              className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors font-mono"
            >
              kebab-case
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. TEXT DIFF CHECKER ---
  if (toolSlug === 'text-diff') {
    const diff = computeLineDiff(diffOriginal, diffModified);
    const addedCount = diff.filter((d) => d.type === 'added').length;
    const removedCount = diff.filter((d) => d.type === 'removed').length;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
              Original Draft (Text 1)
            </h4>
            <textarea
              value={diffOriginal}
              onChange={(e) => setDiffOriginal(e.target.value)}
              rows={6}
              className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-xs sm:text-sm font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none"
            />
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
              Modified Draft (Text 2)
            </h4>
            <textarea
              value={diffModified}
              onChange={(e) => setDiffModified(e.target.value)}
              rows={6}
              className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-xs sm:text-sm font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none"
            />
          </div>
        </div>

        {/* Diff Result */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-neutral-900 dark:text-white">Comparison Diff</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono text-[11px]">
                +{addedCount} additions
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-mono text-[11px]">
                -{removedCount} deletions
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800 font-mono text-xs overflow-hidden">
            {diff.map((line, idx) => {
              if (line.type === 'added') {
                return (
                  <div key={idx} className="flex bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 py-1.5 px-3">
                    <span className="w-8 select-none text-emerald-600 font-bold shrink-0">+</span>
                    <span className="break-all">{line.text}</span>
                  </div>
                );
              }
              if (line.type === 'removed') {
                return (
                  <div key={idx} className="flex bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 py-1.5 px-3">
                    <span className="w-8 select-none text-rose-600 font-bold shrink-0">-</span>
                    <span className="break-all">{line.text}</span>
                  </div>
                );
              }
              return (
                <div key={idx} className="flex bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 py-1.5 px-3">
                  <span className="w-8 select-none text-neutral-400 shrink-0"> </span>
                  <span className="break-all">{line.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- 4. REMOVE DUPLICATE LINES ---
  if (toolSlug === 'remove-duplicates') {
    const handleDedupe = () => {
      const { cleaned, removedCount } = removeDuplicateLines(inputText, dupCaseSensitive);
      setInputText(cleaned);
      logToolUsage('remove-duplicates', `Removed ${removedCount} duplicates`);
    };

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              List or Text Lines:
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dupCaseSensitive}
                  onChange={(e) => setDupCaseSensitive(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Case Sensitive</span>
              </label>
              <button
                onClick={handleDedupe}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                Remove Duplicates
              </button>
            </div>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={10}
            className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-sm font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none"
            placeholder="Paste lines with duplicates here..."
          />
        </div>
      </div>
    );
  }

  // --- 5. TEXT CLEANER & WHITESPACE ---
  if (toolSlug === 'text-cleaner') {
    const handleClean = () => {
      const res = cleanWhitespace(inputText, {
        collapseSpaces: true,
        removeEmptyLines: true,
        trimLines: true,
      });
      setInputText(res);
      logToolUsage('text-cleaner', 'Cleaned whitespace and redundant lines');
    };

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Text to Clean:
            </span>
            <button
              onClick={handleClean}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            >
              Clean & Normalize
            </button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={10}
            className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none"
          />
        </div>
      </div>
    );
  }

  // --- 6. TEXT SORTER ---
  if (toolSlug === 'text-sorter') {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Text to Sort:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setInputText(sortLines(inputText, 'az'))}
                className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-xs font-medium"
              >
                Sort A → Z
              </button>
              <button
                onClick={() => setInputText(sortLines(inputText, 'za'))}
                className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-xs font-medium"
              >
                Sort Z → A
              </button>
              <button
                onClick={() => setInputText(sortLines(inputText, 'length-asc'))}
                className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-xs font-medium"
              >
                Shortest First
              </button>
              <button
                onClick={() => setInputText(sortLines(inputText, 'length-desc'))}
                className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-xs font-medium"
              >
                Longest First
              </button>
            </div>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={10}
            className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-sm font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none"
          />
        </div>
      </div>
    );
  }

  // --- 7. TEXT REVERSER ---
  if (toolSlug === 'text-reverser') {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Text to Reverse:
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setInputText(reverseText(inputText, 'chars'))}
                className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-xs font-medium"
              >
                Reverse Characters
              </button>
              <button
                onClick={() => setInputText(reverseText(inputText, 'words'))}
                className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-xs font-medium"
              >
                Reverse Words
              </button>
              <button
                onClick={() => setInputText(reverseText(inputText, 'lines'))}
                className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-xs font-medium"
              >
                Reverse Lines
              </button>
            </div>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={8}
            className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none"
          />
        </div>
      </div>
    );
  }

  // --- 8. SLUG GENERATOR ---
  if (toolSlug === 'slug-generator') {
    const slug = generateSlug(slugInput);

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2 block">
            Headline / Article Title:
          </label>
          <input
            type="text"
            value={slugInput}
            onChange={(e) => setSlugInput(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none"
          />

          <div className="mt-4 p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-300">Generated URL Slug</div>
              <div className="text-sm font-mono font-bold text-neutral-900 dark:text-white mt-1 break-all">
                {slug}
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(slug)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0"
            >
              {copied ? 'Copied!' : 'Copy Slug'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- 9. LOREM IPSUM GENERATOR ---
  if (toolSlug === 'lorem-ipsum') {
    const lorem = generateLoremIpsum(loremCount, loremType);

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Generate:</label>
              <input
                type="number"
                min={1}
                max={20}
                value={loremCount}
                onChange={(e) => setLoremCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-1.5 text-xs text-center font-bold"
              />
            </div>
            <div className="flex items-center gap-2">
              {(['paragraphs', 'sentences', 'words'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setLoremType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                    loremType === t
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={() => copyToClipboard(lorem)}
              className="ml-auto px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Copy className="size-3.5" />
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed max-h-96 overflow-y-auto whitespace-pre-wrap">
            {lorem}
          </div>
        </div>
      </div>
    );
  }

  // --- 10. MARKDOWN FORMATTER & PREVIEW ---
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
          Markdown Editor
        </h4>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={12}
          className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-xs sm:text-sm font-mono text-neutral-900 dark:text-neutral-100 focus:outline-none"
        />
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
          Rendered Preview
        </h4>
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/30 rounded-xl border border-neutral-200 dark:border-neutral-700 min-h-[250px] text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 prose dark:prose-invert max-w-none">
          {inputText}
        </div>
      </div>
    </div>
  );
};
