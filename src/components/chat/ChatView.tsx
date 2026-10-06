import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Brain,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Star,
  Wrench,
  ArrowRight,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { chatWithGemini, extractToolLinks, cleanToolMarkup } from '../../services/geminiService';
import { TOOL_REGISTRY } from '../../data/toolRegistry';

export const ChatView: React.FC = () => {
  const {
    activeChatId,
    chatSessions,
    createNewChat,
    addMessageToChat,
    deleteChat,
    toggleFavoriteChat,
    navigateTo,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [useThinking, setUseThinking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = chatSessions.find((c) => c.id === activeChatId) || null;

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    let chatId = activeChatId;
    if (!chatId || !currentChat) {
      chatId = createNewChat();
    }

    // Add user message
    addMessageToChat(chatId, {
      role: 'user',
      content: text,
    });

    setInputMessage('');
    setLoading(true);
    setErrorMsg('');

    try {
      // Build history
      const history = (currentChat?.messages || []).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      history.push({ role: 'user', content: text });

      const res = await chatWithGemini(history, useThinking);

      // Extract recommended tool links
      const toolLinks = extractToolLinks(res.text);

      addMessageToChat(chatId, {
        role: 'assistant',
        content: res.text,
        modelUsed: res.modelUsed,
        thinkingEnabled: res.thinkingEnabled,
        recommendedTools: toolLinks.map((tl) => tl.slug),
      });
    } catch (err: any) {
      setErrorMsg(
        err.message || 'AI service is not configured. Add the GEMINI_API_KEY to enable this feature.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestedPrompts = [
    'My attendance is 68%. How many classes do I need to attend to reach 75%?',
    'I need to combine lecture slides into a single PDF document.',
    'Explain the concept of entropy like I am five years old.',
    'Make a 7-day study and revision schedule for my exams.',
    'Calculate my semester GPA: 3 courses with 4, 3, 3 credits and grades A, B+, A-.',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-61px)] bg-neutral-50/50 dark:bg-neutral-950/50">
      {/* Top Chat Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate max-w-[200px] sm:max-w-md">
              {currentChat ? currentChat.title : 'New AI Conversation'}
            </h2>
            <div className="text-[10px] text-neutral-500">
              Gemini AI • Academic Tutor & Integrated Tool Assistant
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Thinking Mode Toggle */}
          <button
            onClick={() => setUseThinking(!useThinking)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              useThinking
                ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800 shadow-xs'
                : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
            }`}
            title="Toggle Thinking Mode (gemini-3.1-pro-preview with high reasoning)"
          >
            <Brain className={`size-3.5 ${useThinking ? 'text-purple-600' : 'text-neutral-400'}`} />
            <span className="hidden sm:inline">Thinking Mode</span>
            {useThinking && <span className="text-[9px] px-1 rounded bg-purple-200 font-mono">HIGH</span>}
          </button>

          {currentChat && (
            <>
              <button
                onClick={() => toggleFavoriteChat(currentChat.id)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  currentChat.favorite
                    ? 'text-amber-500 border-amber-300 dark:border-amber-800'
                    : 'text-neutral-400 border-neutral-200 dark:border-neutral-700'
                }`}
                title="Favorite conversation"
              >
                <Star className={`size-3.5 ${currentChat.favorite ? 'fill-amber-500' : ''}`} />
              </button>
              <button
                onClick={() => {
                  if (confirm('Delete this conversation?')) deleteChat(currentChat.id);
                }}
                className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-rose-600 transition-colors"
                title="Delete conversation"
              >
                <Trash2 className="size-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 max-w-4xl w-full mx-auto">
        {!currentChat || currentChat.messages.length === 0 ? (
          <div className="py-12 text-center space-y-6">
            <div className="size-14 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center shadow-xs">
              🎓
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                How can StudentToolBox help you today?
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto mt-1">
                Ask any academic question, paste messy lecture notes, or ask for help with calculators and document tools.
              </p>
            </div>

            {/* Suggested Starter Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl mx-auto text-left">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-blue-400 dark:hover:border-blue-500 text-xs text-neutral-700 dark:text-neutral-300 font-medium transition-colors text-left flex items-center justify-between group"
                >
                  <span className="line-clamp-2">{prompt}</span>
                  <ArrowRight className="size-3.5 text-neutral-400 group-hover:text-blue-500 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          currentChat.messages.map((msg) => {
            const isUser = msg.role === 'user';
            const toolLinks = !isUser ? extractToolLinks(msg.content) : [];
            const cleanText = !isUser ? cleanToolMarkup(msg.content) : msg.content;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="size-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    🎓
                  </div>
                )}

                <div className={`space-y-2 max-w-[85%] sm:max-w-2xl`}>
                  <div
                    className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                        : 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border border-neutral-200/90 dark:border-neutral-800/90 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{cleanText}</div>

                    {!isUser && (
                      <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400">
                        <div className="flex items-center gap-1 font-mono">
                          {msg.thinkingEnabled && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">
                              Thinking Level: HIGH
                            </span>
                          )}
                          <span>{msg.modelUsed || 'gemini-3.8-flash'}</span>
                        </div>
                        <button
                          onClick={() => handleCopyMessage(msg.id, cleanText)}
                          className="hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center gap-1"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="size-3 text-emerald-500" />
                              <span className="text-emerald-500">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="size-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Integrated Recommended Tool Action Buttons */}
                  {toolLinks.length > 0 && (
                    <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1">
                        <Wrench className="size-3" />
                        <span>Recommended Student Tools:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {toolLinks.map((tl) => (
                          <button
                            key={tl.slug}
                            onClick={() => navigateTo('tool-detail', tl.slug)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-blue-300 dark:border-blue-700 text-xs font-semibold text-blue-700 dark:text-blue-300 hover:bg-blue-50 transition-colors shadow-xs"
                          >
                            <span>Open {tl.title}</span>
                            <ArrowRight className="size-3" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="size-7 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    U
                  </div>
                )}
              </div>
            );
          })
        )}

        {loading && (
          <div className="flex gap-3">
            <div className="size-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              🎓
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 flex items-center gap-2 shadow-xs">
              <RotateCcw className="size-3.5 animate-spin text-blue-600" />
              <span>
                {useThinking
                  ? 'Gemini 3.1 Pro is reasoning with High Thinking mode...'
                  : 'Gemini is drafting response...'}
              </span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Bar */}
      <div className="p-3 sm:p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="max-w-4xl mx-auto relative flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask a question or request a tool (e.g. 'Help me calculate my GPA')..."
            disabled={loading}
            className="flex-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white shadow-xs transition-colors"
          >
            <Send className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
