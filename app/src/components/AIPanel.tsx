import { useState } from 'react';
import { useCV } from '@/hooks/useCV';
import { Sparkles, Loader2, Check, Wand2 } from 'lucide-react';

const FREE_AI_APIS = [
  { name: 'Pollinations (Free)', url: 'https://text.pollinations.ai/' },
];

export function AIPanel() {
  const { cvData, updateProfessionalSummary, updateExperience, updateSkills } = useCV();
  const [background, setBackground] = useState('');
  const [jobTitle, setJobTitle] = useState(cvData.personal.profession);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState<Record<string, string>>({});
  const [activeFeature, setActiveFeature] = useState<string>('summary');

  const generatePrompt = (feature: string) => {
    const base = `User background: ${background}\nTarget job title: ${jobTitle}\n\n`;
    switch (feature) {
      case 'summary':
        return base + 'Write a professional 3-4 sentence summary for a CV. Highlight key strengths and experience. Be concise and impactful. Return ONLY the summary text.';
      case 'experience':
        return base + 'Write 3 professional work experience bullet points for a CV. Use action verbs and quantify achievements where possible. Return ONLY the bullet points, one per line.';
      case 'skills':
        return base + 'List 8-12 relevant technical and soft skills for this role as comma-separated values. Return ONLY the comma-separated skills.';
      case 'education':
        return base + 'Write a brief education description. Return ONLY the text.';
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

    try {
      const prompt = generatePrompt(feature);
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}?seed=${Date.now()}&json=false`, {
        method: 'GET',
      });

      if (!response.ok) throw new Error('AI service unavailable');
      const text = await response.text();
      const cleaned = text.replace(/^["']|["']$/g, '').trim();
      setGenerated(prev => ({ ...prev, [feature]: cleaned }));
    } catch (err) {
      setError('AI service temporarily unavailable. Please try again later.');
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
          const firstExp = cvData.experience[0];
          updateExperience(firstExp.id, 'description', text);
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
        <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
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
              <p className="text-xs text-amber-600">
                The AI will generate professional CV content based on your background and target role.
                This uses a free AI service — no API key needed.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
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
                  onClick={(e) => {
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

              {/* Generated Output */}
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
          Powered by {FREE_AI_APIS[0].name} — Free, no signup required
        </div>
      </div>
    </div>
  );
}
