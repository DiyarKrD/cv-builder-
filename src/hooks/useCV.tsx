
import { useCV } from '@/hooks/useCV';
import { FONT_OPTIONS } from '@/types/cv';
import { Type, Image, Layout, Palette } from 'lucide-react';

export function CustomizePanel() {
  const { settings, updateSetting, updatePhotoStyle } = useCV();

  const fontClassMap: Record<string, string> = {
    Inter: 'font-inter',
    Playfair: 'font-playfair',
    Poppins: 'font-poppins',
    'Roboto Mono': 'font-mono',
    Oswald: 'font-oswald',
    Raleway: 'font-raleway',
    'Bebas Neue': 'font-bebas',
    'Space Grotesk': 'font-space',
  };

  return (
    <div className="bg-white border-b border-gray-200 animate-fade-in">
      <div className="max-w-[1400px] mx-auto px-4 py-4">

        {/* Colors */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Palette className="w-4 h-4" /> Colors
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <ColorPicker label="Primary Color" value={settings.primaryColor} onChange={v => updateSetting('primaryColor', v)} />
            <ColorPicker label="Secondary Color" value={settings.secondaryColor} onChange={v => updateSetting('secondaryColor', v)} />
            <ColorPicker label="Name Color" value={settings.nameColor} onChange={v => updateSetting('nameColor', v)} />
            <ColorPicker label="Profession Color" value={settings.professionColor} onChange={v => updateSetting('professionColor', v)} />
            <ColorPicker label="CV Background" value={settings.cvBackgroundColor} onChange={v => updateSetting('cvBackgroundColor', v)} />
          </div>
        </section>

        {/* Typography */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Type className="w-4 h-4" /> Typography
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <RangeSlider
              label="Name Font Size"
              value={settings.nameFontSize}
              min={24}
              max={96}
              unit="px"
              onChange={v => updateSetting('nameFontSize', v)}
            />

            <RangeSlider
              label="Profession Font Size"
              value={settings.professionFontSize}
              min={14}
              max={48}
              unit="px"
              onChange={v => updateSetting('professionFontSize', v)}
            />

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Font Family
              </label>
              <select
                value={settings.fontFamily}
                onChange={e => updateSetting('fontFamily', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {FONT_OPTIONS.map(font => (
                  <option
                    key={font.value}
                    value={font.value}
                    className={fontClassMap[font.value]}
                  >
                    {font.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Photo */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Image className="w-4 h-4" /> Photo
          </h3>

          <p className="text-xs text-gray-400 mb-3">
            The photo is a movable block. Drag it by its grip handle in the CV preview to place it between sections.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Visibility
              </label>
              <button
                type="button"
                onClick={() => updateSetting('photoVisible', !settings.photoVisible)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition ${
                  settings.photoVisible
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {settings.photoVisible ? 'Visible' : 'Hidden'}
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Shape
              </label>
              <select
                value={settings.photoStyle.shape}
                onChange={e =>
                  updatePhotoStyle({
                    shape: e.target.value as 'square' | 'rounded' | 'circle' | 'hexagon',
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="square">Square</option>
                <option value="rounded">Rounded</option>
                <option value="circle">Circle</option>
                <option value="hexagon">Hexagon</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Size
              </label>
              <select
                value={settings.photoStyle.size}
                onChange={e =>
                  updatePhotoStyle({
                    size: e.target.value as 'sm' | 'md' | 'lg' | 'xl',
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sm">Small (80px)</option>
                <option value="md">Medium (120px)</option>
                <option value="lg">Large (160px)</option>
                <option value="xl">Extra Large (200px)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Border
              </label>
              <select
                value={settings.photoStyle.border}
                onChange={e =>
                  updatePhotoStyle({
                    border: e.target.value as 'none' | 'thin' | 'thick' | 'colored' | 'shadow',
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">None</option>
                <option value="thin">Thin</option>
                <option value="thick">Thick</option>
                <option value="colored">Colored</option>
                <option value="shadow">Shadow</option>
              </select>
            </div>
          </div>
        </section>

        {/* Layout */}
        <section>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layout className="w-4 h-4" /> Layout
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            <RangeSlider
              label="Section Spacing"
              value={settings.sectionSpacing}
              min={0}
              max={60}
              unit="px"
              onChange={v => updateSetting('sectionSpacing', v)}
            />

            <RangeSlider
              label="Page Padding"
              value={settings.pagePadding}
              min={20}
              max={80}
              unit="px"
              onChange={v => updateSetting('pagePadding', v)}
            />

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Name Position
              </label>
              <select
                value={settings.namePosition}
                onChange={e => updateSetting('namePosition', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="default">Default</option>
                <option value="center">Center</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Contact Position
              </label>
              <select
                value={settings.contactPosition}
                onChange={e => updateSetting('contactPosition', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="below-header">Below Header</option>
                <option value="sidebar">Sidebar Style</option>
                <option value="bottom">Bottom of CV</option>
                <option value="top">Top (Above Name)</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Layout Positioning
            </label>

            <div className="flex flex-wrap gap-2">
              {['default', 'split', 'center', 'wide'].map(layout => (
                <button
                  type="button"
                  key={layout}
                  onClick={() => updateSetting('layout', layout)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                    settings.layout === layout
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {layout === 'default'
                    ? 'Default Flow'
                    : layout === 'split'
                    ? 'Split View'
                    : layout === 'center'
                    ? 'Center Aligned'
                    : 'Wide Stretch'}
                </button>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>

      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          title={label}
        />
        <span className="text-xs text-gray-500 font-mono">{value}</span>
      </div>
    </div>
  );
}

function RangeSlider({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1"
        />

        <span className="text-xs text-gray-500 font-mono w-12 text-right">
          {value}{unit}
        </span>
      </div>
    </div>
  );
}
