import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { DEFAULT_CV_DATA, DEFAULT_SETTINGS, type CVData, type CVSettings, type CustomSection, type PhotoStyle } from '@/types/cv';

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
  updateSection: (id: string, field: string, value: string | boolean) => void;
  addSection: (type: CustomSection['type']) => void;
  removeSection: (id: string) => void;
  reorderSections: (sections: CustomSection[]) => void;
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
    const newSection: CustomSection = {
      id: Date.now().toString(),
      type,
      title: titles[type],
      content: '',
      visible: true,
      order: cvData.sections.length,
    };
    setCVData(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
  }, [cvData.sections.length]);

  const removeSection = useCallback((id: string) => {
    setCVData(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== id) }));
  }, []);

  const reorderSections = useCallback((sections: CustomSection[]) => {
    setCVData(prev => ({ ...prev, sections: sections.map((s, i) => ({ ...s, order: i })) }));
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
        updateSection,
        addSection,
        removeSection,
        reorderSections,
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
