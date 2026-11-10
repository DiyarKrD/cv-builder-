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
};

export const TEMPLATES = [
  { id: 'modern-minimalist', name: 'Modern Minimalist', icon: 'Minimize2' },
  { id: 'classic-pro', name: 'Classic Professional', icon: 'Briefcase' },
  { id: 'creative-sidebar', name: 'Creative Sidebar', icon: 'Layout' },
  { id: 'two-column-tech', name: 'Two Column Tech', icon: 'Columns' },
  { id: 'executive', name: 'Executive Header', icon: 'Crown' },
  { id: 'timeline', name: 'Timeline Vertical', icon: 'Clock' },
  { id: 'cards', name: 'Card Based', icon: 'Grid3x3' },
  { id: 'dark-pro', name: 'Dark Mode Pro', icon: 'Moon' },
  { id: 'colorful', name: 'Colorful Vibrant', icon: 'Palette' },
  { id: 'grid', name: 'Grid Layout', icon: 'Table' },
  { id: 'centered', name: 'Centered Focus', icon: 'AlignCenter' },
  { id: 'left-heavy', name: 'Left Heavy', icon: 'AlignLeft' },
  { id: 'right-heavy', name: 'Right Heavy', icon: 'AlignRight' },
  { id: 'compact', name: 'Compact Single Page', icon: 'FileText' },
  { id: 'magazine', name: 'Magazine Style', icon: 'BookOpen' },
  { id: 'infographic', name: 'Infographic Heavy', icon: 'BarChart3' },
  { id: 'minimal-text', name: 'Minimal Text', icon: 'Type' },
  { id: 'bold-type', name: 'Bold Typography', icon: 'Bold' },
  { id: 'photo-focus', name: 'Photo Focus', icon: 'Camera' },
  { id: 'contact-bottom', name: 'Contact Bottom', icon: 'ArrowDown' },
  { id: 'striped', name: 'Striped Sections', icon: 'Minus' },
  { id: 'elegant', name: 'Elegant Serif', icon: 'Feather' },
] as const;

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
