import { createContext, useContext, useState, type ReactNode } from 'react';
import { DEFAULT_CV_DATA, DEFAULT_SETTINGS } from '@/types/cv';
import type { CVData, CVSettings, Education, Experience, CustomSection, Language, LanguageLevel, CVPage } from '@/types/cv';

export type PanelType = 'templates' | 'customize' | 'content' | 'ai';

interface CVContextValue {
  cvData: CVData;
  settings: CVSettings;
  activePanel: PanelType;
  setActivePanel: (panel: PanelType) => void;
  updateSetting: <K extends keyof CVSettings>(key: K, value: CVSettings[K]) => void;
  updatePersonal: (field: keyof CVData['personal'], value: string | null) => void;
  updateContact: (field: keyof CVData['contact'], value: string) => void;
  updateProfessionalSummary: (value: string) => void;
  updateEducation: (id: string, field: keyof Education, value: string) => void;
  addEducation: () => void;
  removeEducation: (id: string) => void;
  updateExperience: (id: string, field: keyof Experience, value: string) => void;
  addExperience: () => void;
  removeExperience: (id: string) => void;
  updateSkills: (skills: string[]) => void;
  updateSection: (id: string, field: keyof CustomSection, value: string | boolean) => void;
  addSection: (type: CustomSection['type']) => void;
  removeSection: (id: string) => void;
  reorderSections: (sections: CustomSection[]) => void;
  addLanguage: (name: string, flag: string, level: LanguageLevel) => void;
  updateLanguage: (id: string, field: keyof Language, value: string) => void;
  removeLanguage: (id: string) => void;
  addPage: () => void;
  removePage: (id: string) => void;
  movePage: (id: string, direction: -1 | 1) => void;
  togglePageSection: (pageId: string, sectionKey: string) => void;
  clearPages: () => void;
  updateCVData: (data: CVData) => void;
  resetCV: () => void;
}

const CVContext = createContext<CVContextValue | null>(null);

let idCounter = 0;
const genId = (prefix: string) => `${prefix}-${Date.now()}-${idCounter++}`;

export function CVProvider({ children }: { children: ReactNode }) {
  const [cvData, setCVData] = useState<CVData>(DEFAULT_CV_DATA);
  const [settings, setSettings] = useState<CVSettings>(DEFAULT_SETTINGS);
  const [activePanel, setActivePanel] = useState<PanelType>('content');

  const updateSetting = <K extends keyof CVSettings>(key: K, value: CVSettings[K]) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  const updatePersonal = (field: keyof CVData['personal'], value: string | null) =>
    setCVData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));

  const updateContact = (field: keyof CVData['contact'], value: string) =>
    setCVData(prev => ({ ...prev, contact: { ...prev.contact, [field]: value } }));

  const updateProfessionalSummary = (value: string) =>
    setCVData(prev => ({ ...prev, professionalSummary: value }));

  const updateEducation = (id: string, field: keyof Education, value: string) =>
    setCVData(prev => ({
      ...prev,
      education: prev.education.map(ed => (ed.id === id ? { ...ed, [field]: value } : ed)),
    }));

  const addEducation = () =>
    setCVData(prev => ({
      ...prev,
      education: [...prev.education, { id: genId('edu'), degree: '', university: '', year: '' }],
    }));

  const removeEducation = (id: string) =>
    setCVData(prev => ({ ...prev, education: prev.education.filter(ed => ed.id !== id) }));

  const updateExperience = (id: string, field: keyof Experience, value: string) =>
    setCVData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => (exp.id === id ? { ...exp, [field]: value } : exp)),
    }));

  const addExperience = () =>
    setCVData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { id: genId('exp'), title: '', company: '', period: '', description: '' },
      ],
    }));

  const removeExperience = (id: string) =>
    setCVData(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }));

  const updateSkills = (skills: string[]) => setCVData(prev => ({ ...prev, skills }));

  const updateSection = (id: string, field: keyof CustomSection, value: string | boolean) =>
    setCVData(prev => ({
      ...prev,
      sections: prev.sections.map(s => (s.id === id ? { ...s, [field]: value } : s)),
    }));

  const addSection = (type: CustomSection['type']) =>
    setCVData(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: genId('sec'),
          type,
          title: 'New Section',
          content: '',
          visible: true,
          order: prev.sections.length,
        },
      ],
    }));

  const removeSection = (id: string) =>
    setCVData(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== id) }));

  const reorderSections = (sections: CustomSection[]) =>
    setCVData(prev => ({ ...prev, sections }));

  const addLanguage = (name: string, flag: string, level: LanguageLevel) =>
    setCVData(prev => ({
      ...prev,
      languages: [...prev.languages, { id: genId('lang'), name, flag, level }],
    }));

  const updateLanguage = (id: string, field: keyof Language, value: string) =>
    setCVData(prev => ({
      ...prev,
      languages: prev.languages.map(l => (l.id === id ? { ...l, [field]: value } : l)),
    }));

  const removeLanguage = (id: string) =>
    setCVData(prev => ({ ...prev, languages: prev.languages.filter(l => l.id !== id) }));

  const addPage = () =>
    setCVData(prev => ({
      ...prev,
      pages: [...prev.pages, { id: genId('page'), sections: [] } satisfies CVPage],
    }));

  const removePage = (id: string) =>
    setCVData(prev => ({ ...prev, pages: prev.pages.filter(p => p.id !== id) }));

  const movePage = (id: string, direction: -1 | 1) =>
    setCVData(prev => {
      const idx = prev.pages.findIndex(p => p.id === id);
      const target = idx + direction;
      if (idx === -1 || target < 0 || target >= prev.pages.length) return prev;
      const pages = [...prev.pages];
      const [moved] = pages.splice(idx, 1);
      pages.splice(target, 0, moved);
      return { ...prev, pages };
    });

  const togglePageSection = (pageId: string, sectionKey: string) =>
    setCVData(prev => ({
      ...prev,
      pages: prev.pages.map(p => {
        if (p.id !== pageId) return p;
        return {
          ...p,
          sections: p.sections.includes(sectionKey)
            ? p.sections.filter(k => k !== sectionKey)
            : [...p.sections, sectionKey],
        };
      }),
    }));

  const clearPages = () => setCVData(prev => ({ ...prev, pages: [] }));

  const updateCVData = (data: CVData) => setCVData(data);

  const resetCV = () => {
    setCVData(DEFAULT_CV_DATA);
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <CVContext.Provider
      value={{
        cvData,
        settings,
        activePanel,
        setActivePanel,
        updateSetting,
        updatePersonal,
        updateContact,
        updateProfessionalSummary,
        updateEducation,
        addEducation,
        removeEducation,
        updateExperience,
        addExperience,
        removeExperience,
        updateSkills,
        updateSection,
        addSection,
        removeSection,
        reorderSections,
        addLanguage,
        updateLanguage,
        removeLanguage,
        addPage,
        removePage,
        movePage,
        togglePageSection,
        clearPages,
        updateCVData,
        resetCV,
      }}
    >
      {children}
    </CVContext.Provider>
  );
}

export function useCV() {
  const ctx = useContext(CVContext);
  if (!ctx) throw new Error('useCV must be used within a CVProvider');
  return ctx;
}
