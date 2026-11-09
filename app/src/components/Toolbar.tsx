import { FileText, Layout, Sliders, Edit, Sparkles, Upload, Printer } from 'lucide-react';
import { useCV } from '@/hooks/useCV';

interface ToolbarProps {
  onImportClick: () => void;
}

export function Toolbar({ onImportClick }: ToolbarProps) {
  const { togglePanel, activePanel } = useCV();

  const buttons = [
    { id: 'templates', label: 'Styles (22)', icon: Layout, color: 'blue' },
    { id: 'customize', label: 'Customize', icon: Sliders, color: 'purple' },
    { id: 'content', label: 'Content', icon: Edit, color: 'green' },
    { id: 'ai', label: 'AI Assistant', icon: Sparkles, color: 'amber' },
  ];

  const getColorClasses = (color: string, isActive: boolean) => {
    const map: Record<string, { active: string; inactive: string }> = {
      blue: {
        active: 'bg-blue-600 text-white',
        inactive: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      },
      purple: {
        active: 'bg-purple-600 text-white',
        inactive: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      },
      green: {
        active: 'bg-green-600 text-white',
        inactive: 'bg-green-100 text-green-700 hover:bg-green-200',
      },
      amber: {
        active: 'bg-amber-600 text-white',
        inactive: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
      },
    };
    return isActive ? map[color].active : map[color].inactive;
  };

  return (
    <div className="no-print sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <FileText className="w-6 h-6 text-blue-600" />
          <h1 className="font-bold text-lg text-gray-800 hidden sm:block">CV Master Builder</h1>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {buttons.map(btn => {
            const Icon = btn.icon;
            const isActive = activePanel === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => togglePanel(btn.id)}
                className={`px-3 py-2 rounded-lg transition flex items-center gap-2 text-sm font-medium whitespace-nowrap ${getColorClasses(btn.color, isActive)}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{btn.label}</span>
              </button>
            );
          })}

          <button
            onClick={onImportClick}
            className="px-3 py-2 rounded-lg transition flex items-center gap-2 text-sm font-medium whitespace-nowrap border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden md:inline">Import CV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2 text-sm font-medium whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden md:inline">Print / PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
