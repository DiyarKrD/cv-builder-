import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { DEFAULT_CV_DATA, DEFAULT_SETTINGS, type CVData, type CVSettings, type CustomSection, type PhotoStyle, type LanguageLevel } from '@/types/cv';

interface CVContextType {
  cvData: CVData;
  settings: CVSettings;
  activePanel: string | null;
  updatePersonal: (field: string, value: string) => void;
  updateContact: (field: string, value: string) => void;
  updateProfessionalSummary: (value: string) => void;
  updateEducation: (id: string, field: string, value: string) => void;
  addEducation: () => void;
  removeEducation: (id: string) => void;
  updateExperience: (id: string, field: string, value: string) => void;
  addExperience: () => void;
  removeExperience: (id: string) => void;
  updateSkills: (skills: string[]) => void;
  addLanguage: (name: string, flag: string, level?: LanguageLevel) => void;
  updateLanguage: (id: string, field: string, value: string) => void;
  removeLanguage: (id: string) => void;
  updateSection: (id: string, field: string, value: string | boolean) => void;
  addSection: (type: CustomSection['type']) => string;
  removeSection: (id: string) => void;
  reorderSections: (sections: CustomSection[]) => void;
  updateSectionOrder: (order: string[]) => void;
  moveSection: (key: string, targetKey: string) => void;
  addPage: () => void;
  removePage: (id: string) => void;
  movePage: (id: string, direction: -1 | 1) => void;
  togglePageSection: (pageId: string, sectionKey: string) => void;
  clearPages: () => void;
  updateSetting: <K extends keyof CVSettings>(key: K, value: CVSettings[K]) => void;
  updatePhotoStyle: (style: Partial<PhotoStyle>) => void;
  setActivePanel: (panel: string | null) => void;
  setCVData: (data: CVData) => void;
  setSettings: (settings: CVSettings) => void;
  togglePanel: (panel: string) => void;
}

const CVContext = createContext<CVContextType | undefined>(undefined);

export function CVProvider({ children }: { children: ReactNode }) {
  const [cvData, setCVData] = useState<CVData>(DEFAULT_CV_DATA);
  const [settings, setSettings] = useState<CVSettings>(DEFAULT_SETTINGS);
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const updatePersonal = useCallback((field: string, value: string) => {
    setCVData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
  }, []);

  const updateContact = useCallback((field: string, value: string) => {
    setCVData(prev => ({ ...prev, contact: { ...prev.contact, [field]: value } }));
  }, []);

  const updateProfessionalSummary = useCallback((value: string) => {
    setCVData(prev => ({ ...prev, professionalSummary: value }));
  }, []);

  const updateEducation = useCallback((id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      education: prev.education.map(ed => (ed.id === id ? { ...ed, [field]: value } : ed)),
    }));
  }, []);

  const addEducation = useCallback(() => {
    setCVData(prev => ({
      ...prev,
      education: [...prev.education, { id: Date.now().toString(), degree: '', university: '', year: '' }],
    }));
  }, []);

  const removeEducation = useCallback((id: string) => {
    setCVData(prev => ({ ...prev, education: prev.education.filter(ed => ed.id !== id) }));
  }, []);

  const updateExperience = useCallback((id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => (exp.id === id ? { ...exp, [field]: value } : exp)),
    }));
  }, []);

  const addExperience = useCallback(() => {
    setCVData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { id: Date.now().toString(), title: '', company: '', period: '', description: '' },
      ],
    }));
  }, []);

  const removeExperience = useCallback((id: string) => {
    setCVData(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }));
  }, []);

  const updateSkills = useCallback((skills: string[]) => {
    setCVData(prev => ({ ...prev, skills }));
  }, []);

  const addLanguage = useCallback((name: string, flag: string, level: LanguageLevel = 'intermediate') => {
    setCVData(prev => ({
      ...prev,
      languages: [...(prev.languages ?? []), { id: Date.now().toString(), name, flag, level }],
    }));
  }, []);

  const updateLanguage = useCallback((id: string, field: string, value: string) => {
    setCVData(prev => ({
      ...prev,
      languages: (prev.languages ?? []).map(lang => (lang.id === id ? { ...lang, [field]: value } : lang)),
    }));
  }, []);

  const removeLanguage = useCallback((id: string) => {
    setCVData(prev => ({ ...prev, languages: (prev.languages ?? []).filter(lang => lang.id !== id) }));
  }, []);

  const updateSection = useCallback((id: string, field: string, value: string | boolean) => {
    setCVData(prev => ({
      ...prev,
      sections: prev.sections.map(s => (s.id === id ? { ...s, [field]: value } : s)),
    }));
  }, []);

  const addSection = useCallback((type: CustomSection['type']) => {
    const titles: Record<CustomSection['type'], string> = {
      text: 'Custom Section',
      languages: 'Languages',
      certifications: 'Certifications',
      awards: 'Awards',
      projects: 'Projects',
      references: 'References',
      hobbies: 'Hobbies & Interests',
    };
    const id = Date.now().toString();
    setCVData(prev => ({
      ...prev,
      sections: [...prev.sections, { id, type, title: titles[type], content: '', visible: true, order: prev.sections.length }],
      sectionOrder: [...(prev.sectionOrder ?? []), id],
    }));
    return id;
  }, []);

  const removeSection = useCallback((id: string) => {
    setCVData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== id),
      pages: (prev.pages ?? []).map(p => ({ ...p, sections: p.sections.filter(k => k !== id) })),
      sectionOrder: (prev.sectionOrder ?? []).filter(k => k !== id),
    }));
  }, []);

  const reorderSections = useCallback((sections: CustomSection[]) => {
    setCVData(prev => ({ ...prev, sections: sections.map((s, i) => ({ ...s, order: i })) }));
  }, []);

  const updateSectionOrder = useCallback((order: string[]) => {
    setCVData(prev => ({ ...prev, sectionOrder: order }));
  }, []);

  const moveSection = useCallback((key: string, targetKey: string) => {
    if (key === targetKey) return;
    setCVData(prev => {
      const order = [...(prev.sectionOrder ?? [])];
      let from = order.indexOf(key);
      const to = order.indexOf(targetKey);
      if (to === -1) return prev;
      if (from === -1) {
        order.push(key);
        from = order.length - 1;
      }
      order.splice(from, 1);
      order.splice(order.indexOf(targetKey), 0, key);
      return { ...prev, sectionOrder: order };
    });
  }, []);

  const addPage = useCallback(() => {
    setCVData(prev => ({
      ...prev,
      pages: [...(prev.pages ?? []), { id: Date.now().toString(), sections: [] }],
    }));
  }, []);

  const removePage = useCallback((id: string) => {
    setCVData(prev => ({ ...prev, pages: (prev.pages ?? []).filter(p => p.id !== id) }));
  }, []);

  const movePage = useCallback((id: string, direction: -1 | 1) => {
    setCVData(prev => {
      const pages = [...(prev.pages ?? [])];
      const idx = pages.findIndex(p => p.id === id);
      const target = idx + direction;
      if (idx === -1 || target < 0 || target >= pages.length) return prev;
      [pages[idx], pages[target]] = [pages[target], pages[idx]];
      return { ...prev, pages };
    });
  }, []);

  const togglePageSection = useCallback((pageId: string, sectionKey: string) => {
    setCVData(prev => ({
      ...prev,
      pages: (prev.pages ?? []).map(p =>
        p.id === pageId
          ? {
              ...p,
              sections: p.sections.includes(sectionKey)
                ? p.sections.filter(k => k !== sectionKey)
                : [...p.sections, sectionKey],
            }
          : p
      ),
    }));
  }, []);

  const clearPages = useCallback(() => {
    setCVData(prev => ({ ...prev, pages: [] }));
  }, []);

  const updateSetting = useCallback(<K extends keyof CVSettings>(key: K, value: CVSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const updatePhotoStyle = useCallback((style: Partial<PhotoStyle>) => {
    setSettings(prev => ({ ...prev, photoStyle: { ...prev.photoStyle, ...style } }));
  }, []);

  const togglePanel = useCallback((panel: string) => {
    setActivePanel(prev => (prev === panel ? null : panel));
  }, []);

  return (
    <CVContext.Provider
      value={{
        cvData,
        settings,
        activePanel,
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
        addLanguage,
        updateLanguage,
        removeLanguage,
        updateSection,
        addSection,
        removeSection,
        reorderSections,
        updateSectionOrder,
        moveSection,
        addPage,
        removePage,
        movePage,
        togglePageSection,
        clearPages,
        updateSetting,
        updatePhotoStyle,
        setActivePanel,
        setCVData,
        setSettings,
        togglePanel,
      }}
    >
      {children}
    </CVContext.Provider>
  );
}

export function useCV() {
  const context = useContext(CVContext);
  if (!context) throw new Error('useCV must be used within a CVProvider');
  return context;
}
