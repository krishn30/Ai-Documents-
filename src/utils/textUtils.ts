// Real text analysis and transformation utilities for StudentToolBox

export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
  keywordDensity: { word: string; count: number; percentage: number }[];
}

export function analyzeText(text: string): TextStats {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;

  const trimmed = text.trim();
  const words = trimmed ? (trimmed.match(/\b[\w'-]+\b/g) || []).length : 0;
  const sentences = trimmed ? (trimmed.match(/[^.!?]+[.!?]+(\s|$)/g) || [trimmed]).length : 0;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length : 0;

  // Reading time at ~200 WPM, speaking time at ~130 WPM
  const readingTimeMinutes = Number((words / 200).toFixed(1));
  const speakingTimeMinutes = Number((words / 130).toFixed(1));

  // Keyword density
  const wordTokens = (text.toLowerCase().match(/\b[a-z]{3,}\b/g) || []);
  const stopWords = new Set([
    'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'were', 'which',
    'they', 'will', 'about', 'there', 'what', 'their', 'when', 'them', 'more',
    'been', 'some', 'than', 'into', 'would', 'could', 'other', 'your'
  ]);
  const frequencies: Record<string, number> = {};

  for (const w of wordTokens) {
    if (!stopWords.has(w)) {
      frequencies[w] = (frequencies[w] || 0) + 1;
    }
  }

  const keywordDensity = Object.entries(frequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word, count]) => ({
      word,
      count,
      percentage: Number(((count / (words || 1)) * 100).toFixed(1)),
    }));

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingTimeMinutes,
    speakingTimeMinutes,
    keywordDensity,
  };
}

export function convertCase(
  text: string,
  targetCase: 'upper' | 'lower' | 'title' | 'camel' | 'snake' | 'kebab' | 'pascal' | 'sentence'
): string {
  if (!text) return '';

  switch (targetCase) {
    case 'upper':
      return text.toUpperCase();
    case 'lower':
      return text.toLowerCase();
    case 'title':
      return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    case 'sentence':
      return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
    case 'camel': {
      const words = text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) || [];
      return words
        .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
        .join('');
    }
    case 'pascal': {
      const words = text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) || [];
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    }
    case 'snake': {
      const words = text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) || [];
      return words.map((w) => w.toLowerCase()).join('_');
    }
    case 'kebab': {
      const words = text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g) || [];
      return words.map((w) => w.toLowerCase()).join('-');
    }
    default:
      return text;
  }
}

export function removeDuplicateLines(text: string, caseSensitive = true): { cleaned: string; removedCount: number } {
  const lines = text.split('\n');
  const seen = new Set<string>();
  const uniqueLines: string[] = [];
  let removedCount = 0;

  for (const line of lines) {
    const key = caseSensitive ? line : line.toLowerCase();
    if (seen.has(key)) {
      removedCount++;
    } else {
      seen.add(key);
      uniqueLines.push(line);
    }
  }

  return {
    cleaned: uniqueLines.join('\n'),
    removedCount,
  };
}

export function cleanWhitespace(
  text: string,
  options: { removeEmptyLines?: boolean; trimLines?: boolean; collapseSpaces?: boolean }
): string {
  let result = text;

  if (options.trimLines) {
    result = result
      .split('\n')
      .map((l) => l.trim())
      .join('\n');
  }

  if (options.collapseSpaces) {
    result = result.replace(/[ \t]+/g, ' ');
  }

  if (options.removeEmptyLines) {
    result = result
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .join('\n');
  }

  return result;
}

export function sortLines(text: string, order: 'az' | 'za' | 'length-asc' | 'length-desc'): string {
  const lines = text.split('\n');
  if (order === 'az') {
    lines.sort((a, b) => a.localeCompare(b));
  } else if (order === 'za') {
    lines.sort((a, b) => b.localeCompare(a));
  } else if (order === 'length-asc') {
    lines.sort((a, b) => a.length - b.length || a.localeCompare(b));
  } else if (order === 'length-desc') {
    lines.sort((a, b) => b.length - a.length || a.localeCompare(b));
  }
  return lines.join('\n');
}

export function reverseText(text: string, mode: 'chars' | 'words' | 'lines'): string {
  if (mode === 'chars') {
    return text.split('').reverse().join('');
  } else if (mode === 'words') {
    return text
      .split('\n')
      .map((line) => line.split(/\s+/).reverse().join(' '))
      .join('\n');
  } else {
    return text.split('\n').reverse().join('\n');
  }
}

export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // normalize accents
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes
}

export function generateLoremIpsum(count: number, type: 'paragraphs' | 'sentences' | 'words'): string {
  const loremBank =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi.';

  const words = loremBank.replace(/[.,]/g, '').toLowerCase().split(' ');

  if (type === 'words') {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      list.push(words[i % words.length]);
    }
    return list.join(' ') + '.';
  }

  if (type === 'sentences') {
    const sentences = loremBank.split('. ');
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      list.push(sentences[i % sentences.length].trim() + '.');
    }
    return list.join(' ');
  }

  // Paragraphs
  const paragraphs: string[] = [];
  for (let i = 0; i < count; i++) {
    paragraphs.push(loremBank);
  }
  return paragraphs.join('\n\n');
}

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
  lineNumberOriginal?: number;
  lineNumberModified?: number;
}

export function computeLineDiff(original: string, modified: string): DiffLine[] {
  const origLines = original.split('\n');
  const modLines = modified.split('\n');
  const result: DiffLine[] = [];

  let i = 0;
  let j = 0;
  let lineO = 1;
  let lineM = 1;

  while (i < origLines.length || j < modLines.length) {
    if (i < origLines.length && j < modLines.length && origLines[i] === modLines[j]) {
      result.push({
        type: 'unchanged',
        text: origLines[i],
        lineNumberOriginal: lineO++,
        lineNumberModified: lineM++,
      });
      i++;
      j++;
    } else if (
      j < modLines.length &&
      (i >= origLines.length || !origLines.slice(i).includes(modLines[j]))
    ) {
      result.push({
        type: 'added',
        text: modLines[j],
        lineNumberModified: lineM++,
      });
      j++;
    } else if (i < origLines.length) {
      result.push({
        type: 'removed',
        text: origLines[i],
        lineNumberOriginal: lineO++,
      });
      i++;
    }
  }

  return result;
}
