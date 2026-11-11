import { useState } from 'react';
import {
  Minimize2, Briefcase, Layout, Columns, Crown, Clock, Grid3x3,
  Moon, Palette, Table, AlignCenter, AlignLeft, AlignRight, FileText,
  BookOpen, BarChart3, Type, Bold, Camera, ArrowDown, Minus, Feather,
  Hash, PanelLeft, Gem, Sparkles, Box, Newspaper, SquareTerminal,
  GraduationCap, Layers, Frame, Sun, IdCard,
  Zap, Droplets, LayoutGrid, Split, Rainbow, Landmark, MoonStar,
  Files, PartyPopper, Heading1, Building2, Leaf,
} from 'lucide-react';
import { useCV } from '@/hooks/useCV';
import { TEMPLATES, TEMPLATE_CATEGORIES } from '@/types/cv';
import type { TemplateCategory, TemplateDef } from '@/types/cv';

const iconMap: Record<string, React.ElementType> = {
  Minimize2, Briefcase, Layout, Columns, Crown, Clock, Grid3x3,
  Moon, Palette, Table, AlignCenter, AlignLeft, AlignRight, FileText,
  BookOpen, BarChart3, Type, Bold, Camera, ArrowDown, Minus, Feather,
  Hash, PanelLeft, Gem, Sparkles, Box, Newspaper, SquareTerminal,
  GraduationCap, Layers, Frame, Sun, IdCard,
  Zap, Droplets, LayoutGrid, Split, Rainbow, Landmark, MoonStar,
  Files, PartyPopper, Heading1, Building2, Leaf,
};

export function TemplatesPanel() {
  const { settings, updateSetting } = useCV();
  const [category, setCategory] = useState<TemplateCategory | 'all'>('all');

  const visible: TemplateDef[] =
    category === 'all' ? TEMPLATES : TEMPLATES.filter(t => t.category === category);

  const countFor = (id: TemplateCategory | 'all') =>
    id === 'all' ? TEMPLATES.length : TEMPLATES.filter(t => t.category === id).length;

  const selectTemplate = (t: TemplateDef) => {
    updateSetting('template', t.id);
    // Apply the template's default primary/secondary palette so each
    // template shows up in its intended colors out of the box. The user
    // can still override both colors afterwards in the Customize panel.
    updateSetting('primaryColor', t.colors.primary);
    updateSetting('secondaryColor', t.colors.secondary);
  };

  return (
    <div className="bg-white border-b border-gray-200 animate-fade-in">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Choose Your Style
          </h3>
          <span className="text-xs text-gray-400">
            {visible.length} template{visible.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {TEMPLATE_CATEGORIES.map(cat => {
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/25 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {countFor(cat.id)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Template cards */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-3">
          {visible.map(template => {
            const Icon = iconMap[template.icon] || FileText;
            const isActive = settings.template === template.id;
            return (
              <button
                key={template.id}
                onClick={() => selectTemplate(template)}
                className={`template-card flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 active'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-12 h-10 rounded-lg flex items-center justify-center ${
                  isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-gray-700 text-center leading-tight">{template.name}</span>
                {/* Default palette dots: primary + secondary */}
                <span className="flex items-center gap-1" title="Default palette — applied on select">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/10"
                    style={{ background: template.colors.primary }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/10"
                    style={{ background: template.colors.secondary }}
                  />
                  {template.dark && <Moon className="w-2.5 h-2.5 text-gray-500" />}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-gray-400 mt-3">
          Picking a template applies its default primary/secondary colors — fine-tune them anytime in the Customize tab.
        </p>
      </div>
    </div>
  );
}
