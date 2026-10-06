// Client-side service to communicate with full-stack Gemini API endpoints

export interface GenerateOptions {
  prompt: string;
  systemInstruction?: string;
  useThinking?: boolean;
  model?: string;
  responseMimeType?: string;
}

export interface ChatMessagePayload {
  role: 'user' | 'assistant';
  content: string;
}

export interface ServiceHealth {
  status: string;
  hasApiKey: boolean;
  supportedModels: string[];
}

export async function checkAiHealth(): Promise<ServiceHealth> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error(`Health check returned HTTP ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      status: 'error',
      hasApiKey: false,
      supportedModels: [],
    };
  }
}

export async function generateWithGemini(options: GenerateOptions): Promise<{
  text: string;
  modelUsed: string;
  thinkingEnabled: boolean;
}> {
  const res = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Gemini API call failed');
  }

  return data;
}

export async function chatWithGemini(
  messages: ChatMessagePayload[],
  useThinking = false,
  systemInstruction?: string
): Promise<{
  text: string;
  modelUsed: string;
  thinkingEnabled: boolean;
}> {
  const res = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      useThinking,
      systemInstruction,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Chat request failed');
  }

  return data;
}

export interface ExtractedToolLink {
  slug: string;
  title: string;
}

export function extractToolLinks(markdownText: string): ExtractedToolLink[] {
  const links: ExtractedToolLink[] = [];
  // Match [TOOL:slug:Name]
  const pattern = /\[TOOL:([a-z0-9-]+):([^\]]+)\]/g;
  let match;
  const seen = new Set<string>();

  while ((match = pattern.exec(markdownText)) !== null) {
    const slug = match[1];
    const title = match[2];
    if (!seen.has(slug)) {
      seen.add(slug);
      links.push({ slug, title });
    }
  }

  return links;
}

export function cleanToolMarkup(markdownText: string): string {
  // Replace [TOOL:slug:Title] with bold text "**Title**" in rendered view
  return markdownText.replace(/\[TOOL:([a-z0-9-]+):([^\]]+)\]/g, '**$2**');
}
