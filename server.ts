import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY || '';
const hasApiKey = Boolean(apiKey && apiKey.trim().length > 0 && apiKey !== 'MY_GEMINI_API_KEY');

let ai: GoogleGenAI | null = null;
if (hasApiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));

  // Status endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey,
      supportedModels: ['gemini-3.8-flash', 'gemini-3.1-pro-preview'],
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Backend tool capabilities
  app.get('/api/tools/capabilities', (req, res) => {
    res.json({
      aiEnabled: hasApiKey,
      clientPdfProcessing: true, // pdf-lib in browser
      clientImageProcessing: true, // Canvas in browser
      serverDocxConverter: false, // LibreOffice daemon not configured
      serverOcrEngine: false, // Tesseract binary not configured
    });
  });

  // Gemini Generation API Endpoint
  app.post('/api/gemini/generate', async (req, res) => {
    try {
      if (!hasApiKey || !ai) {
        return res.status(503).json({
          error: 'AI service is not configured. Add the GEMINI_API_KEY to enable this feature.',
          code: 'GEMINI_KEY_MISSING',
        });
      }

      const {
        prompt,
        systemInstruction,
        useThinking = false,
        model: requestedModel,
        responseMimeType,
        temperature,
      } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt is required and must be a string.' });
      }

      // Determine model: if thinking is requested, use gemini-3.1-pro-preview with ThinkingLevel.HIGH
      // Otherwise default to gemini-3.8-flash
      const selectedModel = requestedModel || (useThinking ? 'gemini-3.1-pro-preview' : 'gemini-3.8-flash');

      const config: Record<string, unknown> = {};

      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }

      if (responseMimeType) {
        config.responseMimeType = responseMimeType;
      }

      if (typeof temperature === 'number') {
        config.temperature = temperature;
      }

      if (useThinking || selectedModel === 'gemini-3.1-pro-preview') {
        config.thinkingConfig = {
          thinkingLevel: ThinkingLevel.HIGH,
        };
        // Per instruction: do NOT set maxOutputTokens when thinking is active
      }

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: prompt,
        config: config as any,
      });

      const text = response.text || '';
      return res.json({
        text,
        modelUsed: selectedModel,
        thinkingEnabled: Boolean(useThinking || selectedModel === 'gemini-3.1-pro-preview'),
      });
    } catch (err: any) {
      console.error('Gemini generate error:', err);
      const errorMessage = err?.message || 'Failed to generate response from Gemini API';
      return res.status(500).json({
        error: errorMessage,
        code: 'GEMINI_GENERATION_ERROR',
      });
    }
  });

  // Gemini Multi-turn Chat API Endpoint
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      if (!hasApiKey || !ai) {
        return res.status(503).json({
          error: 'AI service is not configured. Add the GEMINI_API_KEY to enable this feature.',
          code: 'GEMINI_KEY_MISSING',
        });
      }

      const { messages, useThinking = false, systemInstruction } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required.' });
      }

      const selectedModel = useThinking ? 'gemini-3.1-pro-preview' : 'gemini-3.8-flash';

      // Format history contents
      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const defaultSystemPrompt = `You are StudentToolBox Assistant, an expert AI tutor, academic mentor, and tool guide built into the StudentToolBox platform.
You help students with high school, college, and university coursework, revision, concepts, exam prep, and daily student tasks.

IMPORTANT CAPABILITY - TOOL RECOMMENDATION:
StudentToolBox has real built-in tools. When a student query relates to one of these tasks, recommend the tool explicitly using the markdown syntax [TOOL:tool-slug:Tool Name]:
Available tools:
- [TOOL:pdf-compressor:PDF Compressor] - Compress and reduce PDF file sizes
- [TOOL:pdf-merger:PDF Merger] - Merge multiple PDF files into one
- [TOOL:pdf-splitter:PDF Splitter] - Split and extract pages from PDF
- [TOOL:pdf-rotator:PDF Rotator] - Rotate PDF pages
- [TOOL:pdf-page-delete:Delete PDF Pages] - Remove specific pages from PDF
- [TOOL:pdf-to-text:PDF Text Extractor] - Extract raw text from PDF
- [TOOL:jpg-to-pdf:Images to PDF] - Convert JPG/PNG images into a PDF document
- [TOOL:image-compressor:Image Compressor] - Compress and resize images
- [TOOL:image-resizer:Image Resizer] - Resize image dimensions
- [TOOL:image-cropper:Image Cropper] - Crop images
- [TOOL:image-converter:Image Format Converter] - Convert between JPG, PNG, WebP
- [TOOL:color-picker:Color Picker & Palette] - Extract color palette & hex codes from images
- [TOOL:word-counter:Word & Character Counter] - Detailed text statistics, reading time, keyword density
- [TOOL:case-converter:Case Converter] - UPPERCASE, lowercase, titleCase, camelCase, slug
- [TOOL:text-diff:Text Diff Checker] - Compare two texts side-by-side
- [TOOL:remove-duplicates:Remove Duplicate Lines] - Clean repetitive list lines
- [TOOL:lorem-ipsum:Lorem Ipsum Generator] - Dummy placeholder text
- [TOOL:markdown-formatter:Markdown Formatter & Preview] - Format and preview markdown
- [TOOL:gpa-calculator:GPA Calculator] - Calculate semester Grade Point Average
- [TOOL:cgpa-calculator:CGPA Calculator] - Calculate cumulative GPA across semesters
- [TOOL:attendance-calculator:Attendance Calculator] - Calculate minimum attendance % and safe classes to miss or needed
- [TOOL:percentage-calculator:Percentage Calculator] - All-in-one percentage computations
- [TOOL:scientific-calculator:Scientific Calculator] - Advanced trigonometric and mathematical calculator
- [TOOL:unit-converter:Unit Converter] - Convert length, weight, temperature, speed, time
- [TOOL:discount-calculator:Discount & Savings Calculator] - Calculate discounts, sales tax, final price
- [TOOL:compound-interest:Compound Interest Calculator] - Investment, loans, and interest growth
- [TOOL:fraction-calculator:Fraction Calculator] - Add, subtract, multiply, divide fractions with step-by-step simplification
- [TOOL:bmi-calculator:BMI Calculator] - Body Mass Index and healthy weight
- [TOOL:age-calculator:Age & Date Calculator] - Exact age and days difference
- [TOOL:ai-summarizer:AI Summarizer] - Summarize long articles or chapters
- [TOOL:ai-quiz-generator:AI Quiz Generator] - Generate multiple-choice quizzes
- [TOOL:ai-flashcards:AI Flashcards Generator] - Generate study flashcards
- [TOOL:ai-study-planner:AI Study Planner] - Create revision and study timetables
- [TOOL:ai-notes-generator:AI Notes Generator] - Format messy lecture notes into structured study notes
- [TOOL:ai-essay-helper:AI Essay Helper] - Outlines, thesis statements, arguments
- [TOOL:ai-grammar-checker:AI Grammar & Style Checker] - Improve writing clarity and correctness

Always be encouraging, precise, mathematically rigorous, and helpful. Use clean Markdown formatting with clear headings, lists, and code blocks where applicable.`;

      const config: Record<string, unknown> = {
        systemInstruction: systemInstruction || defaultSystemPrompt,
      };

      if (useThinking || selectedModel === 'gemini-3.1-pro-preview') {
        config.thinkingConfig = {
          thinkingLevel: ThinkingLevel.HIGH,
        };
      }

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: config as any,
      });

      const text = response.text || '';
      return res.json({
        text,
        modelUsed: selectedModel,
        thinkingEnabled: Boolean(useThinking || selectedModel === 'gemini-3.1-pro-preview'),
      });
    } catch (err: any) {
      console.error('Gemini chat error:', err);
      const errorMessage = err?.message || 'Failed to chat with Gemini API';
      return res.status(500).json({
        error: errorMessage,
        code: 'GEMINI_CHAT_ERROR',
      });
    }
  });

  // In development, hook Vite middleware; in production, serve built dist files
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudentToolBox server listening on http://0.0.0.0:${PORT} (env: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
