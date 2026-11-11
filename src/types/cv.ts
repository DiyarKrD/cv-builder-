export interface PersonalInfo {
  fullName: string;
  profession: string;
  age: string;
  photo: string | null;
}

export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  website: string;
}

export interface Education {
  id: string;
  degree: string;
  university: string;
  year: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface CustomSection {
  id: string;
  type: 'text' | 'languages' | 'certifications' | 'awards' | 'projects' | 'references' | 'hobbies';
  title: string;
  content: string;
  visible: boolean;
  order: number;
}

export type LanguageLevel = 'native' | 'fluent' | 'advanced' | 'intermediate' | 'beginner';

export interface Language {
  id: string;
  name: string;
  level: LanguageLevel;
  /**
   * Usually a 2-letter ISO country code rendered via flagcdn.com (e.g. 'gb', 'iq').
   * Can also be an emoji such as '⭐' for languages without an ISO flag (Kurdish).
   */
  flag: string;
}

export interface CVPage {
  id: string;
  sections: string[];
}

export interface PhotoStyle {
  shape: 'square' | 'rounded' | 'circle' | 'hexagon';
  size: 'sm' | 'md' | 'lg' | 'xl';
  border: 'none' | 'thin' | 'thick' | 'colored' | 'shadow';
}

export interface CVData {
  personal: PersonalInfo;
  contact: ContactInfo;
  education: Education[];
  experience: Experience[];
  skills: string[];
  languages: Language[];
  sections: CustomSection[];
  pages: CVPage[];
  professionalSummary: string;
  /** Global order of section keys: 'photo' | 'summary' | 'education' | 'experience' | 'skills' | 'languages' | custom section id */
  sectionOrder: string[];
}

export interface CVSettings {
  template: string;
  primaryColor: string;
  secondaryColor: string;
  nameColor: string;
  professionColor: string;
  cvBackgroundColor: string;
  nameFontSize: number;
  professionFontSize: number;
  fontFamily: string;
  /** Whether the photo block is shown on the CV at all. */
  photoVisible: boolean;
  photoStyle: PhotoStyle;
  sectionSpacing: number;
  pagePadding: number;
  namePosition: string;
  contactPosition: string;
  layout: string;
}
export interface FreePosition {
  x: number;
  y: number;
}
export const DEFAULT_CV_DATA: CVData = {
  personal: {
    fullName: 'Diyar KRD',
    profession: 'Electrical Engineer',
    age: '22',
    photo: null,
  },
  contact: {
    email: 'diyar.krd@email.com',
    phone: '+964 750 123 4567',
    location: 'Erbil, Iraq',
    website: 'diyarkrd.github.io',
  },
  education: [
    { id: '1', degree: 'Bachelor of Electrical Engineering', university: 'University of Technology', year: '2023' },
  ],
  experience: [
    {
      id: '1',
      title: 'Senior Electrical Engineer',
      company: 'KRD Electric Co.',
      period: '2021-Present',
      description: 'Designed electrical systems for commercial buildings\nManaged team of 5 junior engineers\nReduced energy costs by 30% through optimization',
    },
    {
      id: '2',
      title: 'Junior Engineer',
      company: 'Power Solutions',
      period: '2019-2021',
      description: 'Assisted in power distribution design\nConducted safety inspections',
    },
  ],
  skills: ['AutoCAD', 'MATLAB', 'PLC Programming', 'Electrical Design', 'Project Management', 'Power Systems', 'Renewable Energy'],
  languages: [
    { id: 'lang-1', name: 'Kurdish', level: 'native', flag: '⭐' },
    { id: 'lang-2', name: 'English', level: 'fluent', flag: 'gb' },
    { id: 'lang-3', name: 'Arabic', level: 'fluent', flag: 'iq' },
  ],
  sections: [],
  pages: [],
  professionalSummary:
    'Dedicated Electrical Engineer with 4+ years of experience in power systems design and renewable energy solutions. Proven track record in optimizing electrical systems and leading successful project teams.',
  sectionOrder: ['photo', 'summary', 'education', 'experience', 'skills', 'languages'],
  freePositions: Record<string, FreePosition>;
  freePositions: {},
};

export const DEFAULT_SETTINGS: CVSettings = {
  template: 'modern-minimalist',
  primaryColor: '#3b82f6',
  secondaryColor: '#1e40af',
  nameColor: '#111827',
  professionColor: '#3b82f6',
  cvBackgroundColor: '#ffffff',
  nameFontSize: 36,
  professionFontSize: 18,
  fontFamily: 'Inter',
  photoVisible: true,
  photoStyle: { shape: 'rounded', size: 'md', border: 'none' },
  sectionSpacing: 24,
  pagePadding: 40,
  namePosition: 'default',
  contactPosition: 'below-header',
  layout: 'default',
  moveMode: 'sequence' | 'free';
  moveMode: 'sequence',
};

/* ------------------------------------------------------------------ */
/*  Templates — 46 total, grouped into tabbed categories.              */
/*  Every template ships with a default primary/secondary palette.     */
/*  Selecting a template in the panel applies its palette to           */
/*  settings.primaryColor / secondaryColor, which CVPreview exposes    */
/*  as the CSS variables --accent and --accent2.                       */
/*                                                                     */
/*  Design languages are original CSS implementations inspired by      */
/*  openly-licensed template ecosystems (Reactive Resume — MIT,        */
/*  JSON Resume themes — MIT). Only visual patterns were taken,        */
/*  no code and no personal data.                                      */
/* ------------------------------------------------------------------ */

export type TemplateCategory = 'minimal' | 'professional' | 'creative' | 'bold' | 'dark';

export interface TemplateDef {
  id: string;
  name: string;
  icon: string;
  category: TemplateCategory;
  /** Default palette applied when the template is selected. */
  colors: { primary: string; secondary: string };
  /** True for templates with a dark page background. */
  dark?: boolean;
}

export const TEMPLATE_CATEGORIES: { id: TemplateCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'professional', label: 'Professional' },
  { id: 'creative', label: 'Creative' },
  { id: 'bold', label: 'Bold' },
  { id: 'dark', label: 'Dark' },
];

export const TEMPLATES: TemplateDef[] = [
  /* ---------- Minimal ---------- */
  { id: 'modern-minimalist', name: 'Modern Minimalist', icon: 'Minimize2', category: 'minimal', colors: { primary: '#3b82f6', secondary: '#1e40af' } },
  { id: 'minimal-text', name: 'Minimal Text', icon: 'Type', category: 'minimal', colors: { primary: '#111827', secondary: '#6b7280' } },
  { id: 'swiss-minimal', name: 'Swiss Minimal', icon: 'Hash', category: 'minimal', colors: { primary: '#111111', secondary: '#3b82f6' } },
  { id: 'compact', name: 'Compact Single Page', icon: 'FileText', category: 'minimal', colors: { primary: '#3b82f6', secondary: '#1e40af' } },
  { id: 'centered', name: 'Centered Focus', icon: 'AlignCenter', category: 'minimal', colors: { primary: '#3b82f6', secondary: '#8b5cf6' } },
  { id: 'outline-frame', name: 'Outline Frame', icon: 'Frame', category: 'minimal', colors: { primary: '#111111', secondary: '#3b82f6' } },
  { id: 'left-heavy', name: 'Left Heavy', icon: 'AlignLeft', category: 'minimal', colors: { primary: '#3b82f6', secondary: '#93c5fd' } },
  { id: 'right-heavy', name: 'Right Heavy', icon: 'AlignRight', category: 'minimal', colors: { primary: '#3b82f6', secondary: '#93c5fd' } },

  /* ---------- Professional ---------- */
  { id: 'classic-pro', name: 'Classic Professional', icon: 'Briefcase', category: 'professional', colors: { primary: '#1e40af', secondary: '#3b82f6' } },
  { id: 'executive', name: 'Executive Header', icon: 'Crown', category: 'professional', colors: { primary: '#1e293b', secondary: '#d4af37' } },
  { id: 'two-column-tech', name: 'Two Column Tech', icon: 'Columns', category: 'professional', colors: { primary: '#0891b2', secondary: '#164e63' } },
  { id: 'magazine', name: 'Magazine Style', icon: 'BookOpen', category: 'professional', colors: { primary: '#111827', secondary: '#dc2626' } },
  { id: 'academic', name: 'Academic', icon: 'GraduationCap', category: 'professional', colors: { primary: '#111111', secondary: '#3b82f6' } },
  { id: 'elegant', name: 'Elegant Serif', icon: 'Feather', category: 'professional', colors: { primary: '#1c1917', secondary: '#9a3412' } },
  { id: 'warm-elegant', name: 'Warm Elegant', icon: 'Sun', category: 'professional', colors: { primary: '#96733f', secondary: '#d8c9ac' } },
  { id: 'editorial-serif', name: 'Editorial', icon: 'Newspaper', category: 'professional', colors: { primary: '#9a3412', secondary: '#1c1917' } },
  { id: 'grid', name: 'Grid Layout', icon: 'Table', category: 'professional', colors: { primary: '#0f766e', secondary: '#115e59' } },
  { id: 'contact-bottom', name: 'Contact Bottom', icon: 'ArrowDown', category: 'professional', colors: { primary: '#0f4c81', secondary: '#3b82f6' } },
  { id: 'sidebar-pro', name: 'Pro Sidebar', icon: 'PanelLeft', category: 'professional', colors: { primary: '#0f4c81', secondary: '#3b82f6' } },
  { id: 'corporate-navy', name: 'Corporate Navy', icon: 'Building2', category: 'professional', colors: { primary: '#1e40af', secondary: '#64748b' } },

  /* ---------- Creative ---------- */
  { id: 'creative-sidebar', name: 'Creative Sidebar', icon: 'Layout', category: 'creative', colors: { primary: '#7c3aed', secondary: '#ec4899' } },
  { id: 'timeline', name: 'Timeline Vertical', icon: 'Clock', category: 'creative', colors: { primary: '#3b82f6', secondary: '#8b5cf6' } },
  { id: 'infographic', name: 'Infographic Heavy', icon: 'BarChart3', category: 'creative', colors: { primary: '#f97316', secondary: '#0ea5e9' } },
  { id: 'photo-focus', name: 'Photo Focus', icon: 'Camera', category: 'creative', colors: { primary: '#3b82f6', secondary: '#1e40af' } },
  { id: 'photo-banner', name: 'Photo Banner', icon: 'IdCard', category: 'creative', colors: { primary: '#0ea5e9', secondary: '#6366f1' } },
  { id: 'colorful', name: 'Colorful Vibrant', icon: 'Palette', category: 'creative', colors: { primary: '#667eea', secondary: '#764ba2' } },
  { id: 'gradient-header', name: 'Gradient Header', icon: 'Sparkles', category: 'creative', colors: { primary: '#6366f1', secondary: '#d946ef' } },
  { id: 'soft-ui', name: 'Soft UI', icon: 'Layers', category: 'creative', colors: { primary: '#3b82f6', secondary: '#8b5cf6' } },
  { id: 'cards', name: 'Card Based', icon: 'Grid3x3', category: 'creative', colors: { primary: '#3b82f6', secondary: '#10b981' } },
  { id: 'striped', name: 'Striped Sections', icon: 'Minus', category: 'creative', colors: { primary: '#3b82f6', secondary: '#8b5cf6' } },
  { id: 'glassmorphism', name: 'Glassmorphism', icon: 'Droplets', category: 'creative', colors: { primary: '#6366f1', secondary: '#ec4899' } },
  { id: 'bento-grid', name: 'Bento Grid', icon: 'LayoutGrid', category: 'creative', colors: { primary: '#0ea5e9', secondary: '#f59e0b' }, dark: true },
  { id: 'duotone-split', name: 'Duotone Split', icon: 'Split', category: 'creative', colors: { primary: '#1e3a8a', secondary: '#3b82f6' } },
  { id: 'gradient-mesh', name: 'Gradient Mesh', icon: 'Rainbow', category: 'creative', colors: { primary: '#8b5cf6', secondary: '#06b6d4' } },
  { id: 'paper-layer', name: 'Paper Layer', icon: 'Files', category: 'creative', colors: { primary: '#d97706', secondary: '#92400e' } },
  { id: 'nature-organic', name: 'Nature Organic', icon: 'Leaf', category: 'creative', colors: { primary: '#16a34a', secondary: '#84cc16' } },
  { id: 'art-deco', name: 'Art Deco', icon: 'Landmark', category: 'creative', colors: { primary: '#b8860b', secondary: '#1c1917' } },

  /* ---------- Bold ---------- */
  { id: 'bold-type', name: 'Bold Typography', icon: 'Bold', category: 'bold', colors: { primary: '#111111', secondary: '#ff3b30' } },
  { id: 'brutalist', name: 'Brutalist', icon: 'Box', category: 'bold', colors: { primary: '#ffe600', secondary: '#111111' } },
  { id: 'neo-brutal', name: 'Neo Brutalism', icon: 'Zap', category: 'bold', colors: { primary: '#ffe600', secondary: '#ff4d8d' } },
  { id: 'stripes-playful', name: 'Stripes Playful', icon: 'PartyPopper', category: 'bold', colors: { primary: '#f97316', secondary: '#14b8a6' } },
  { id: 'big-type', name: 'Big Type Poster', icon: 'Heading1', category: 'bold', colors: { primary: '#111111', secondary: '#3b82f6' } },

  /* ---------- Dark ---------- */
  { id: 'dark-pro', name: 'Dark Mode Pro', icon: 'Moon', category: 'dark', colors: { primary: '#3b82f6', secondary: '#8b5cf6' }, dark: true },
  { id: 'midnight-executive', name: 'Midnight Executive', icon: 'Gem', category: 'dark', colors: { primary: '#d4af37', secondary: '#0b1220' }, dark: true },
  { id: 'terminal-dev', name: 'Terminal', icon: 'SquareTerminal', category: 'dark', colors: { primary: '#7ee787', secondary: '#58a6ff' }, dark: true },
  { id: 'neo-tokyo', name: 'Neo Tokyo', icon: 'MoonStar', category: 'dark', colors: { primary: '#22d3ee', secondary: '#f471b5' }, dark: true },
];

export const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (Modern)' },
  { value: 'Playfair', label: 'Playfair (Elegant)' },
  { value: 'Poppins', label: 'Poppins (Geometric)' },
  { value: 'Roboto Mono', label: 'Roboto Mono (Technical)' },
  { value: 'Oswald', label: 'Oswald (Condensed)' },
  { value: 'Raleway', label: 'Raleway (Clean)' },
  { value: 'Bebas Neue', label: 'Bebas Neue (Bold)' },
  { value: 'Space Grotesk', label: 'Space Grotesk (Futuristic)' },
];

export const SECTION_TYPES = [
  { value: 'text', label: 'Custom Text Section', icon: 'FileText' },
  { value: 'languages', label: 'Languages', icon: 'Globe' },
  { value: 'certifications', label: 'Certifications', icon: 'Award' },
  { value: 'awards', label: 'Awards', icon: 'Trophy' },
  { value: 'projects', label: 'Projects', icon: 'FolderOpen' },
  { value: 'references', label: 'References', icon: 'Users' },
  { value: 'hobbies', label: 'Hobbies & Interests', icon: 'Heart' },
];

export const LANGUAGE_LEVELS: { value: LanguageLevel; label: string; dots: number }[] = [
  { value: 'native', label: 'Native', dots: 5 },
  { value: 'fluent', label: 'Fluent', dots: 4 },
  { value: 'advanced', label: 'Advanced', dots: 3 },
  { value: 'intermediate', label: 'Intermediate', dots: 2 },
  { value: 'beginner', label: 'Beginner', dots: 1 },
];

/**
 * Flag values are usually 2-letter ISO country codes (flagcdn.com), not emojis —
 * emoji flags don't render on Windows and show as "GB"/"TR" text instead.
 * Exception: Kurdish uses the ⭐ star emoji because Kurdistan has no ISO code.
 */
export const SUGGESTED_LANGUAGES: { name: string; flag: string }[] = [
  { name: 'English', flag: 'gb' },
  { name: 'Kurdish', flag: '⭐' },
  { name: 'Arabic', flag: 'iq' },
  { name: 'Turkish', flag: 'tr' },
  { name: 'Persian', flag: 'ir' },
  { name: 'German', flag: 'de' },
  { name: 'French', flag: 'fr' },
  { name: 'Spanish', flag: 'es' },
  { name: 'Italian', flag: 'it' },
  { name: 'Portuguese', flag: 'pt' },
  { name: 'Dutch', flag: 'nl' },
  { name: 'Swedish', flag: 'se' },
  { name: 'Norwegian', flag: 'no' },
  { name: 'Danish', flag: 'dk' },
  { name: 'Finnish', flag: 'fi' },
  { name: 'Polish', flag: 'pl' },
  { name: 'Russian', flag: 'ru' },
  { name: 'Ukrainian', flag: 'ua' },
  { name: 'Greek', flag: 'gr' },
  { name: 'Czech', flag: 'cz' },
  { name: 'Hungarian', flag: 'hu' },
  { name: 'Romanian', flag: 'ro' },
  { name: 'Chinese', flag: 'cn' },
  { name: 'Japanese', flag: 'jp' },
  { name: 'Korean', flag: 'kr' },
  { name: 'Hindi', flag: 'in' },
  { name: 'Urdu', flag: 'pk' },
  { name: 'Bengali', flag: 'bd' },
  { name: 'Thai', flag: 'th' },
  { name: 'Vietnamese', flag: 'vn' },
  { name: 'Indonesian', flag: 'id' },
  { name: 'Malay', flag: 'my' },
  { name: 'Swahili', flag: 'ke' },
];
