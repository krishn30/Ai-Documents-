export type ToolCategory =
  | 'pdf'
  | 'image'
  | 'text'
  | 'calculator'
  | 'ai'
  | 'study'
  | 'developer';

export interface Tool {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string; // Lucide icon name
  badge?: string;
  popular?: boolean;
  available: boolean;
  unavailabilityReason?: string;
  requiredDependency?: string;
  requiresAI?: boolean;
  keywords: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  modelUsed?: string;
  thinkingEnabled?: boolean;
  recommendedTools?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  favorite?: boolean;
  userId?: string;
}

export interface ToolHistoryItem {
  id: string;
  toolSlug: string;
  toolName: string;
  category: ToolCategory;
  timestamp: number;
  summary?: string;
}

export interface SavedResult {
  id: string;
  title: string;
  toolSlug: string;
  toolName: string;
  category: ToolCategory;
  timestamp: number;
  content: string;
  metadata?: Record<string, any>;
}

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
}

export interface UpcomingExam {
  id: string;
  subject: string;
  examName: string;
  examDate: string; // YYYY-MM-DD
  targetScore?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isGuest: boolean;
  schoolOrUniversity?: string;
  studyStreakDays: number;
  totalStudyMinutes: number;
  lastStudyDate?: string;
  completedTasksCount: number;
  quizScores: number[]; // Array of quiz percentages e.g. [80, 100, 90]
  createdAt: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';
