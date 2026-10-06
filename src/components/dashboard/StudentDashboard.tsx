import React, { useState, useEffect } from 'react';
import {
  Flame,
  Clock,
  Award,
  CheckCircle2,
  Plus,
  Trash2,
  Calendar,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TOOL_REGISTRY } from '../../data/toolRegistry';

export const StudentDashboard: React.FC = () => {
  const {
    user,
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    exams,
    addExam,
    deleteExam,
    recordStudyTime,
    toolHistory,
    navigateTo,
  } = useApp();

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState('Computer Science');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Exam form state
  const [examSubject, setExamSubject] = useState('');
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');

  // Pomodoro / Study Timer state
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerType, setTimerType] = useState<'focus' | 'break'>('focus');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false);
      // Auto-record completed session
      if (timerType === 'focus') {
        recordStudyTime(25);
        alert('🎉 Focus session complete! 25 minutes logged to your study streak.');
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerSeconds, timerType, recordStudyTime]);

  const handleStartTimer = () => setTimerRunning(true);
  const handlePauseTimer = () => setTimerRunning(false);
  const handleResetTimer = (minutes = 25, type: 'focus' | 'break' = 'focus') => {
    setTimerRunning(false);
    setTimerType(type);
    setTimerSeconds(minutes * 60);
  };

  const handleLogManualMinutes = () => {
    const min = parseInt(prompt('How many minutes of study did you complete?') || '0', 10);
    if (min > 0) {
      recordStudyTime(min);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addTask(taskTitle.trim(), taskSubject, taskDueDate || 'Today', taskPriority);
    setTaskTitle('');
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examSubject.trim() || !examName.trim() || !examDate) return;
    addExam({
      id: 'exam-' + Date.now(),
      subject: examSubject.trim(),
      examName: examName.trim(),
      examDate,
    });
    setExamSubject('');
    setExamName('');
    setExamDate('');
  };

  // Calculate real quiz average from actual recorded scores
  const quizAverage =
    user.quizScores.length > 0
      ? Math.round(user.quizScores.reduce((a, b) => a + b, 0) / user.quizScores.length)
      : 0;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
            Student Productivity Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            Track your study streaks, manage assignment checklists, and prepare for upcoming exams.
          </p>
        </div>

        <button
          onClick={() => navigateTo('chat')}
          className="px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold flex items-center gap-2 shadow-xs transition-colors shrink-0"
        >
          <Sparkles className="size-4 text-purple-600" />
          <span>Ask AI Assistant</span>
        </button>
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Study Streak
            </span>
            <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
              <Flame className="size-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-2">
            {user.studyStreakDays} <span className="text-sm font-normal text-neutral-500">days</span>
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">
            {user.studyStreakDays > 0 ? 'Active streak maintained' : '0 sessions logged'}
          </div>
        </div>

        {/* Study Time */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Study Time
            </span>
            <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-2">
            {user.totalStudyMinutes} <span className="text-sm font-normal text-neutral-500">min</span>
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">
            {(user.totalStudyMinutes / 60).toFixed(1)} focus hours total
          </div>
        </div>

        {/* Quiz Average */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Quiz Average
            </span>
            <div className="size-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-500 flex items-center justify-center">
              <Award className="size-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-2">
            {user.quizScores.length > 0 ? `${quizAverage}%` : '0%'}
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">
            {user.quizScores.length} quizzes completed
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Tasks Done
            </span>
            <div className="size-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-white mt-2">
            {user.completedTasksCount}
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">
            {tasks.filter((t) => !t.completed).length} pending tasks
          </div>
        </div>
      </div>

      {/* Main Grid: Pomodoro Focus Timer + Tasks Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pomodoro Timer */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Clock className="size-4 text-blue-600" />
                <span>Pomodoro Study Timer</span>
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => handleResetTimer(25, 'focus')}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                    timerType === 'focus' ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  25m
                </button>
                <button
                  onClick={() => handleResetTimer(5, 'break')}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                    timerType === 'break' ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  5m
                </button>
              </div>
            </div>

            {/* Circular / Large timer display */}
            <div className="py-8 text-center">
              <div className="text-6xl font-mono font-extrabold tracking-tight text-neutral-900 dark:text-white">
                {formatTimer(timerSeconds)}
              </div>
              <div className="text-xs text-neutral-400 uppercase font-semibold mt-2 tracking-wider">
                {timerType === 'focus' ? 'Deep Study Session' : 'Rest & Refresh Break'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              {!timerRunning ? (
                <button
                  onClick={handleStartTimer}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                >
                  <Play className="size-4" />
                  <span>Start Focus Session</span>
                </button>
              ) : (
                <button
                  onClick={handlePauseTimer}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                >
                  <Pause className="size-4" />
                  <span>Pause Timer</span>
                </button>
              )}
              <button
                onClick={() => handleResetTimer(25, 'focus')}
                className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600"
                title="Reset timer"
              >
                <RotateCcw className="size-4" />
              </button>
            </div>

            <button
              onClick={handleLogManualMinutes}
              className="w-full text-center text-[11px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 py-1"
            >
              + Log offline study minutes manually
            </button>
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>Today's Study Checklist ({tasks.length})</span>
              </h3>
            </div>

            {/* Add Task Input Form */}
            <form onSubmit={handleCreateTask} className="flex flex-wrap gap-2 mb-4">
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="What do you need to study or complete?"
                className="flex-1 min-w-[200px] bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none"
              />
              <input
                type="text"
                value={taskSubject}
                onChange={(e) => setTaskSubject(e.target.value)}
                placeholder="Subject"
                className="w-28 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-2.5 py-2 text-xs"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="size-3.5" />
                <span>Add Task</span>
              </button>
            </form>

            {/* Tasks List */}
            {tasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400 italic">
                No active tasks. Add a study item above to get started!
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      t.completed
                        ? 'bg-neutral-50/60 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 opacity-60'
                        : 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => toggleTask(t.id)}
                        className="rounded size-4 text-blue-600 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <div
                          className={`text-xs font-semibold truncate ${
                            t.completed ? 'line-through text-neutral-400' : 'text-neutral-900 dark:text-white'
                          }`}
                        >
                          {t.title}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {t.subject} • {t.dueDate}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(t.id)}
                      className="p-1 text-neutral-400 hover:text-rose-600"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Exams Tracker & Recently Used Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exams Tracker */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Calendar className="size-4 text-purple-600" />
            <span>Upcoming Exams & Deadlines</span>
          </h3>

          <form onSubmit={handleCreateExam} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={examSubject}
              onChange={(e) => setExamSubject(e.target.value)}
              placeholder="Subject (e.g. Physics)"
              className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2 text-xs"
            />
            <input
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="Exam Name (e.g. Midterm)"
              className="bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2 text-xs"
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="flex-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-2 text-xs"
              />
              <button
                type="submit"
                className="px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
              >
                Add
              </button>
            </div>
          </form>

          {exams.length === 0 ? (
            <div className="py-6 text-center text-xs text-neutral-400 italic">
              No upcoming exams logged. Add your syllabus dates to track countdowns.
            </div>
          ) : (
            <div className="space-y-2">
              {exams.map((ex) => {
                const diffDays = Math.ceil(
                  (new Date(ex.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 text-xs"
                  >
                    <div>
                      <div className="font-bold text-neutral-900 dark:text-white">
                        {ex.subject}: {ex.examName}
                      </div>
                      <div className="text-[10px] text-neutral-400">Date: {ex.examDate}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded-full text-[11px] ${
                          diffDays <= 3
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {diffDays > 0 ? `${diffDays} days left` : 'Today!'}
                      </span>
                      <button
                        onClick={() => deleteExam(ex.id)}
                        className="text-neutral-400 hover:text-rose-600"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recently Used Tools */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Recently Used Tools
            </h3>
            <button
              onClick={() => navigateTo('history')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              View Full History
            </button>
          </div>

          {toolHistory.length === 0 ? (
            <div className="py-6 text-center text-xs text-neutral-400 italic">
              No tools used yet in this session.
            </div>
          ) : (
            <div className="space-y-2">
              {toolHistory.slice(0, 4).map((hist) => (
                <div
                  key={hist.id}
                  onClick={() => navigateTo('tool-detail', hist.toolSlug)}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:border-blue-400 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                      {hist.toolName}
                    </div>
                    {hist.summary && (
                      <div className="text-[10px] text-neutral-400 truncate">{hist.summary}</div>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-400 shrink-0 ml-2">
                    {new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
