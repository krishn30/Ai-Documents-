import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  RotateCcw,
  Copy,
  Check,
  Download,
  AlertCircle,
  Brain,
  HelpCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { generateWithGemini } from '../../services/geminiService';
import { useApp } from '../../context/AppContext';

export const AiToolsView: React.FC<{ toolSlug: string }> = ({ toolSlug }) => {
  const { logToolUsage, recordQuizScore } = useApp();

  const [inputPrompt, setInputPrompt] = useState(
    toolSlug === 'ai-quiz-generator'
      ? 'Cellular Respiration and ATP Synthesis in Biology'
      : toolSlug === 'ai-flashcards'
      ? 'Key Concepts in Microeconomics (Supply, Demand, Elasticity)'
      : toolSlug === 'ai-topic-explainer'
      ? 'Schrödinger’s Cat and Quantum Superposition'
      : 'Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy that, through cellular respiration, can later be released to fuel the organism’s activities. Some of this chemical energy is stored in carbohydrate molecules, such as sugars and starches, which are synthesized from carbon dioxide and water.'
  );

  const [useThinking, setUseThinking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [outputResult, setOutputResult] = useState('');
  const [copied, setCopied] = useState(false);

  // Quiz-specific state
  interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    selectedAnswer?: number;
  }
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Flashcards state
  interface Flashcard {
    front: string;
    back: string;
  }
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);

  // Helper options
  const [summaryFormat, setSummaryFormat] = useState<'bullets' | 'executive' | 'tldr'>('bullets');
  const [explainerLevel, setExplainerLevel] = useState<'eli5' | 'highschool' | 'college'>('eli5');

  const handleGenerate = async () => {
    if (!inputPrompt.trim()) {
      setErrorMsg('Please enter a topic or text to process.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setOutputResult('');
    setQuizQuestions([]);
    setQuizSubmitted(false);
    setFlashcards([]);

    let systemInstruction = '';
    let finalPrompt = inputPrompt;
    let responseMimeType: string | undefined = undefined;

    if (toolSlug === 'ai-summarizer') {
      systemInstruction =
        'You are an expert academic summarizer. Provide a crisp, structured summary of the text provided. Use markdown headings, bullet points, and highlight critical key terms.';
      finalPrompt = `Summarize this text in format "${summaryFormat}":\n\n${inputPrompt}`;
    } else if (toolSlug === 'ai-quiz-generator') {
      systemInstruction =
        'You are an expert test creator. Generate a 4-question multiple choice quiz on the topic. Return ONLY a valid JSON array of objects with keys: "question" (string), "options" (array of 4 strings), "correctIndex" (integer 0-3), and "explanation" (string).';
      responseMimeType = 'application/json';
      finalPrompt = `Generate 4 multiple choice questions for:\n\n${inputPrompt}`;
    } else if (toolSlug === 'ai-flashcards') {
      systemInstruction =
        'You are an active-recall study coach. Generate 5 high-yield study flashcards. Return ONLY a valid JSON array of objects with keys: "front" (the question, term, or prompt) and "back" (the concise definition, answer, or formula).';
      responseMimeType = 'application/json';
      finalPrompt = `Generate 5 flashcards for:\n\n${inputPrompt}`;
    } else if (toolSlug === 'ai-notes-generator') {
      systemInstruction =
        'You are an Ivy League academic coach. Organize the lecture notes into the Cornell Note-Taking System: 1. Main Objectives, 2. Cue Questions & Key Vocabulary, 3. Detailed Outline Notes, 4. 2-sentence Summary.';
      finalPrompt = `Transform these notes into Cornell Notes format:\n\n${inputPrompt}`;
    } else if (toolSlug === 'ai-essay-helper') {
      systemInstruction =
        'You are a college writing center mentor. Help the student brainstorm for their essay: provide 1. Three strong arguable Thesis Statements, 2. A 5-section essay outline, 3. Two potential counter-arguments and how to rebut them.';
      finalPrompt = `Essay prompt / topic:\n\n${inputPrompt}`;
    } else if (toolSlug === 'ai-grammar-checker') {
      systemInstruction =
        'You are an academic copyeditor. Review the provided text. Provide: 1. The Polished/Corrected Version, 2. Key grammar, clarity, and tone improvements made.';
      finalPrompt = `Proofread and polish this text:\n\n${inputPrompt}`;
    } else if (toolSlug === 'ai-study-planner') {
      systemInstruction =
        'You are an academic productivity advisor. Create a realistic day-by-day revision and study timetable with milestones, break intervals, and active recall sessions.';
      finalPrompt = `Create a study timetable for:\n\n${inputPrompt}`;
    } else if (toolSlug === 'ai-topic-explainer') {
      systemInstruction =
        'You are a physics Nobel laureate and master educator using the Feynman Technique. Explain complex concepts using intuitive analogies, zero jargon, and clear real-world examples.';
      finalPrompt = `Explain this concept at level "${explainerLevel}":\n\n${inputPrompt}`;
    }

    try {
      const res = await generateWithGemini({
        prompt: finalPrompt,
        systemInstruction,
        useThinking,
        responseMimeType,
      });

      if (toolSlug === 'ai-quiz-generator') {
        try {
          const parsed = JSON.parse(res.text);
          if (Array.isArray(parsed)) {
            setQuizQuestions(parsed);
          } else {
            setOutputResult(res.text);
          }
        } catch {
          setOutputResult(res.text);
        }
      } else if (toolSlug === 'ai-flashcards') {
        try {
          const parsed = JSON.parse(res.text);
          if (Array.isArray(parsed)) {
            setFlashcards(parsed);
            setCurrentCardIndex(0);
            setCardFlipped(false);
          } else {
            setOutputResult(res.text);
          }
        } catch {
          setOutputResult(res.text);
        }
      } else {
        setOutputResult(res.text);
      }

      logToolUsage(toolSlug, useThinking ? 'Thinking Mode enabled' : undefined);
    } catch (err: any) {
      setErrorMsg(
        err.message || 'AI service is not configured. Add the GEMINI_API_KEY to enable this feature.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuizAnswer = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizQuestions((prev) =>
      prev.map((q, idx) => (idx === qIdx ? { ...q, selectedAnswer: optIdx } : q))
    );
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    let correctCount = 0;
    quizQuestions.forEach((q) => {
      if (q.selectedAnswer === q.correctIndex) correctCount++;
    });
    const percent = Math.round((correctCount / (quizQuestions.length || 1)) * 100);
    recordQuizScore(percent);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            {toolSlug === 'ai-quiz-generator' || toolSlug === 'ai-flashcards' || toolSlug === 'ai-topic-explainer'
              ? 'Enter Topic or Concepts to Study:'
              : 'Enter Notes, Lecture Transcript, or Text:'}
          </label>

          {/* High Thinking Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseThinking(!useThinking)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                useThinking
                  ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800 shadow-xs'
                  : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-300'
              }`}
            >
              <Brain className={`size-3.5 ${useThinking ? 'text-purple-600' : 'text-neutral-400'}`} />
              <span>High Thinking Mode</span>
              {useThinking && (
                <span className="text-[10px] px-1 rounded bg-purple-200 dark:bg-purple-900 font-mono">
                  PRO
                </span>
              )}
            </button>
          </div>
        </div>

        <textarea
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          rows={5}
          className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type or paste academic notes here..."
        />

        {/* Options Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {toolSlug === 'ai-summarizer' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-medium">Format:</span>
              {(['bullets', 'executive', 'tldr'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setSummaryFormat(fmt)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize ${
                    summaryFormat === fmt
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          )}

          {toolSlug === 'ai-topic-explainer' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 font-medium">Audience:</span>
              {[
                { id: 'eli5', label: 'Like I’m 5' },
                { id: 'highschool', label: 'High School' },
                { id: 'college', label: 'Undergrad' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setExplainerLevel(lvl.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    explainerLevel === lvl.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="ml-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            {loading ? (
              <>
                <RotateCcw className="size-3.5 animate-spin" />
                <span>Thinking with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-3.5" />
                <span>Generate with Gemini</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200 border border-rose-200 dark:border-rose-800 text-xs flex items-start gap-2.5">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold">{errorMsg}</div>
            <div className="text-neutral-600 dark:text-neutral-400">
              Per our zero dummy functionality policy, AI features require a configured Gemini API key on the backend.
            </div>
          </div>
        </div>
      )}

      {/* --- 2. INTERACTIVE QUIZ PLAYER --- */}
      {quizQuestions.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                Interactive Practice Quiz ({quizQuestions.length} Questions)
              </h4>
              <p className="text-xs text-neutral-500 mt-0.5">Test your recall and get immediate feedback</p>
            </div>
            {quizSubmitted && (
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 font-bold text-xs">
                Score: {quizQuestions.filter((q) => q.selectedAnswer === q.correctIndex).length} / {quizQuestions.length}
              </span>
            )}
          </div>

          <div className="space-y-5">
            {quizQuestions.map((q, qIdx) => (
              <div key={qIdx} className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/80 space-y-3">
                <div className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white">
                  {qIdx + 1}. {q.question}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = q.selectedAnswer === optIdx;
                    const isCorrect = q.correctIndex === optIdx;

                    let btnStyle = 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 hover:border-blue-400 text-neutral-800 dark:text-neutral-200';
                    if (quizSubmitted) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold';
                      } else if (isSelected && !isCorrect) {
                        btnStyle = 'bg-rose-50 dark:bg-rose-950/60 border-rose-400 text-rose-900 dark:text-rose-200 font-medium';
                      }
                    } else if (isSelected) {
                      btnStyle = 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 font-semibold';
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectQuizAnswer(qIdx, optIdx)}
                        className={`p-3 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {quizSubmitted && isCorrect && <CheckCircle className="size-4 text-emerald-500 shrink-0 ml-2" />}
                        {quizSubmitted && isSelected && !isCorrect && <XCircle className="size-4 text-rose-500 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-300">
                    <span className="font-bold text-neutral-800 dark:text-neutral-200">Explanation:</span> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            {!quizSubmitted ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={quizQuestions.some((q) => q.selectedAnswer === undefined)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold"
              >
                Submit Answers & Grade
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                className="px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-xs font-semibold"
              >
                Generate New Quiz
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- 3. 3D FLIP FLASHCARDS DECK --- */}
      {flashcards.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
            <span>Card {currentCardIndex + 1} of {flashcards.length}</span>
            <span>Click card to flip</span>
          </div>

          {/* Interactive Flip Card */}
          <div
            onClick={() => setCardFlipped(!cardFlipped)}
            className="w-full min-h-[220px] rounded-2xl p-8 cursor-pointer flex flex-col items-center justify-center text-center transition-all bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-800/60 border border-neutral-200 dark:border-neutral-700 hover:shadow-md"
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
              {cardFlipped ? 'Answer / Definition' : 'Prompt / Concept'}
            </div>
            <div className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white leading-relaxed max-w-lg">
              {cardFlipped
                ? flashcards[currentCardIndex].back
                : flashcards[currentCardIndex].front}
            </div>
            <div className="text-[10px] text-neutral-400 mt-4">
              [ Tap anywhere to flip ]
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                setCardFlipped(false);
              }}
              disabled={currentCardIndex === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => {
                const csv = flashcards.map((f) => `"${f.front.replace(/"/g, '""')}","${f.back.replace(/"/g, '""')}"`).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'study_flashcards_anki.csv';
                a.click();
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              Export to Anki (CSV)
            </button>

            <button
              onClick={() => {
                setCurrentCardIndex((prev) => Math.min(flashcards.length - 1, prev + 1));
                setCardFlipped(false);
              }}
              disabled={currentCardIndex === flashcards.length - 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold disabled:opacity-30"
            >
              <span>Next</span>
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* --- 4. GENERAL TEXT / NOTES RESULT --- */}
      {outputResult && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-purple-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Generated Academic Result
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(outputResult)}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Result'}</span>
              </button>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed font-sans max-h-[500px] overflow-y-auto">
            {outputResult}
          </div>
        </div>
      )}
    </div>
  );
};
