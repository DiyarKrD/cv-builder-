import { useState } from 'react';
import { useCV } from '@/hooks/useCV';
import { Sparkles, Loader2, Check, Wand2, KeyRound } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Free AI provider chain — no key required, optional key as fallback */
/* ------------------------------------------------------------------ */

declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (prompt: string, opts?: { model?: string }) => Promise<unknown>;
      };
    };
  }
}

function loadPuter(): Promise<NonNullable<Window['puter']>> {
  return new Promise((resolve, reject) => {
    if (window.puter) return resolve(window.puter);
    const s = document.createElement('script');
    s.src = 'https://js.puter.com/v2/';
    s.onload = () => (window.puter ? resolve(window.puter) : reject(new Error('Puter failed to load')));
    s.onerror = () => reject(new Error('Puter failed to load'));
    document.head.appendChild(s);
  });
}

async function askPuter(prompt: string): Promise<string> {
  const puter = await loadPuter();
  const res = await puter.ai.chat(prompt, { model: 'gpt-4o-mini' });
  const msg =
    (res as { message?: { content?: string } })?.message?.content ??
    (res as { text?: string })?.text ??
    String(res);
  const text = String(msg).trim();
  if (!text) throw new Error('Empty Puter response');
  return text;
}

async function askPollinationsPost(prompt: string): Promise<string> {
  const res = await fetch('https://text.pollinations.ai/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      model: 'openai',
      private: true,
    }),
  });
  if (!res.ok) throw new Error(`Pollinations HTTP ${res.status}`);
  const data = await res.json();
  const text = String(data?.choices?.[0]?.message?.content ?? '').trim();
  if (!text) throw new Error('Empty Pollinations response');
  return text;
}

async function askPollinationsGet(prompt: string): Promise<string> {
  const res = await fetch(
    `https://text.pollinations.ai/${encodeURIComponent(prompt)}?seed=${Date.now()}&model=openai&json=false`
  );
  if (!res.ok) throw new Error(`Pollinations GET HTTP ${res.status}`);
  const text = (await res.text()).replace(/^["']|["']$/g, '').trim();
  if (!text) throw new Error('Empty Pollinations response');
  return text;
}

async function askOpenRouter(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter HTTP ${res.status}`);
  const data = await res.json();
  const text = String(data?.choices?.[0]?.message?.content ?? '').trim();
  if (!text) throw new Error('Empty OpenRouter response');
  return text;
}

async function askAI(prompt: string, apiKey: string, onProvider: (name: string) => void): Promise<string> {
  // 1) Puter — free, no key
  try {
    onProvider('Puter AI (free)');
    return await askPuter(prompt);
  } catch {
    /* continue */
  }
  // 2) Pollinations — free, no key (POST then GET)
  try {
    onProvider('Pollinations (free)');
    return await askPollinationsPost(prompt);
  } catch {
    /* continue */
  }
  try {
    onProvider('Pollinations (free, legacy)');
    return await askPollinationsGet(prompt);
  } catch {
    /* continue */
  }
  // 3) User's own free OpenRouter key
  if (apiKey.trim()) {
    onProvider('OpenRouter (your free key)');
    return await askOpenRouter(prompt, apiKey.trim());
  }
  throw new Error(
    'All free AI providers are unreachable right now. For a permanent fix, paste a free API key from openrouter.ai/keys (models ending in ":free" cost nothing).'
  );
}

/* ------------------------------------------------------------------ */
/*  Panel                                                              */
/* ------------------------------------------------------------------ */
export function AIPanel() {
  const { cvData, updateProfessionalSummary, updateExperience, updateSkills } = useCV();
  const [background, setBackground] = useState('');
  const [jobTitle, setJobTitle] = useState(cvData.personal.profession);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState('');
  const [generated, setGenerated] = useState<Record<string, string>>({});
  const [activeFeature, setActiveFeature] = useState<string>('summary');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('cv_ai_key') ?? '');
  const [showKey, setShowKey] = useState(false);

  const generatePrompt = (feature: string) => {
    const base = `User background: ${background}\nTarget job title: ${jobTitle}\n\n`;
    switch (feature) {
      case 'summary':
        return base + 'Write a professional 3-4 sentence summary for a CV. Highlight key strengths and experience. Be concise and impactful. Return ONLY the summary text.';
      case 'experience':
        return base + 'Write 3 professional work experience bullet points for a CV. Use action verbs and quantify achievements where possible. Return ONLY the bullet points, one per line.';
      case 'skills':
        return base + 'List 8-12 relevant technical and soft skills for this role as comma-separated values. Return ONLY the comma-separated skills.';
      case 'improve':
        return base + `Improve and rewrite this CV content to be more professional and impactful:\n\n${cvData.professionalSummary}\n\nReturn ONLY the improved text.`;
      default:
        return base;
    }
  };

  const callAI = async (feature: string) => {
    if (!background.trim()) {
      setError('Please tell us about yourself first.');
      return;
    }
    setLoading(true);
    setError('');
    setProvider('');
    try {
      const prompt = generatePrompt(feature);
      const text = await askAI(prompt, apiKey, setProvider);
      setGenerated(prev => ({ ...prev, [feature]: text }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI service unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const applyToCV = (feature: string) => {
    const text = generated[feature];
    if (!text) return;
    switch (feature) {
      case 'summary':
      case 'improve':
        updateProfessionalSummary(text);
        break;
      case 'experience':
        if (cvData.experience.length > 0) {
          updateExperience(cvData.experience[0].id, 'description', text);
        }
        break;
      case 'skills':
        updateSkills(text.split(',').map(s => s.trim()).filter(Boolean));
        break;
    }
  };

  const features = [
    { id: 'summary', label: 'Generate Professional Summary', desc: 'Create a compelling summary based on your background' },
    { id: 'experience', label: 'Generate Experience Bullet Points', desc: 'Write impactful work experience descriptions' },
    { id: 'skills', label: 'Generate Skills List', desc: 'Get relevant skills for your target role' },
    { id: 'improve', label: 'Improve Existing Content', desc: 'Rewrite and enhance your current CV content' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 animate-fade-in">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        {/* Input Area */}
        <div className="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
          <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Tell AI About Yourself
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-amber-700 mb-1">Your Background *</label>
              <textarea
                value={background}
                onChange={e => setBackground(e.target.value)}
                placeholder="I am an electrical engineer with 4 years of experience in power systems, renewable energy, and project management..."
                rows={4}
                className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-vertical bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-amber-700 mb-1">Target Job Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="e.g. Electrical Engineer"
                className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 mb-3 bg-white"
              />
              <button
                onClick={() => setShowKey(v => !v)}
                className="flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-900 font-medium mb-1"
              >
                <KeyRound className="w-3.5 h-3.5" />
                {showKey ? 'Hide optional API key' : 'Add optional free API key (permanent backup)'}
              </button>
              {showKey && (
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => {
                    setApiKey(e.target.value);
                    localStorage.setItem('cv_ai_key', e.target.value);
                  }}
                  placeholder="sk-or-v1-... from openrouter.ai/keys (free models)"
                  className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                />
              )}
              <p className="text-xs text-amber-600 mt-1">
                Works without a key using free providers. A key is only used as a backup and is stored in your browser.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
        {provider && !error && (
          <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" /> Answered by {provider}
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {features.map(feature => (
            <div
              key={feature.id}
              className={`p-4 rounded-xl border transition cursor-pointer ${
                activeFeature === feature.id
                  ? 'border-amber-400 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
              onClick={() => setActiveFeature(feature.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-amber-500" />
                    {feature.label}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    callAI(feature.id);
                  }}
                  disabled={loading}
                  className="ml-3 px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-xs font-medium disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  {loading && activeFeature === feature.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  Generate
                </button>
              </div>

              {generated[feature.id] && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 whitespace-pre-line">{generated[feature.id]}</p>
                  <button
                    onClick={() => applyToCV(feature.id)}
                    className="mt-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs font-medium flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Apply to CV
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Free AI — no signup required. Providers: Puter → Pollinations → your optional OpenRouter key.
        </div>
      </div>
    </div>
  );
}
