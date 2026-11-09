import {
  Minimize2, Briefcase, Layout, Columns, Crown, Clock, Grid3x3,
  Moon, Palette, Table, AlignCenter, AlignLeft, AlignRight, FileText,
  BookOpen, BarChart3, Type, Bold, Camera, ArrowDown, Minus, Feather
} from 'lucide-react';
import { useCV } from '@/hooks/useCV';
import { TEMPLATES } from '@/types/cv';

const iconMap: Record<string, React.ElementType> = {
  Minimize2, Briefcase, Layout, Columns, Crown, Clock, Grid3x3,
  Moon, Palette, Table, AlignCenter, AlignLeft, AlignRight, FileText,
  BookOpen, BarChart3, Type, Bold, Camera, ArrowDown, Minus, Feather,
};

export function TemplatesPanel() {
  const { settings, updateSetting } = useCV();

  return (
    <div className="bg-white border-b border-gray-200 animate-fade-in">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Choose Your Style</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-3">
          {TEMPLATES.map(template => {
            const Icon = iconMap[template.icon] || FileText;
            const isActive = settings.template === template.id;
            return (
              <button
                key={template.id}
                onClick={() => updateSetting('template', template.id)}
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
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
