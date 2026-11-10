import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  DEFAULT_CV_DATA,
  DEFAULT_SETTINGS,
  SECTION_TYPES,
} from '@/types/cv';
import type {
  CVData,
  CVSettings,
  CustomSection,
  Education,
  Experience,
  Language,
  LanguageLevel,
  PersonalInfo,
  ContactInfo,
  PhotoStyle,
} from '@/types/cv';

const STORAGE_KEY_DATA = 'cv-master-builder:data';
const STORAGE_KEY_SETTINGS = 'cv-master-builder:settings';

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

type ActivePanel = 'templates' | 'customize' | 'content' | 'ai' | null;

interface CVContextValue {
  cvData: CVData;
  settings: CVSettings;
  activePanel: ActivePanel;

  setCVData: (data: CVData) => void;
  togglePanel: (panel: Exclude<ActivePanel, null>) => void;

  updatePersonal: <K extends keyof PersonalInfo>(field: K, value: PersonalInfo[K]) => void;
  updateContact: (field: keyof ContactInfo, value: string) => void;
  updateProfessionalSummary: (text: string) => void;

  updateEducation: <K extends keyof Education>(id: string, field: K, value: Education[K]) => void;
  addEducation: () => void;
  removeEducation: (id: string) => void;

  updateExperience: <K extends keyof Experience>(id: string, field: K, value: Experience[K]) => void;
  addExperience: () => void;
  removeExperience: (id: string) => void;

  updateSkills: (skills: string[]) => void;

  addSection: (type: CustomSection['type']) => string;
  updateSection: {
    (id: string, field: 'title' | 'content', value: string): void;
    (id: string, field: 'visible', value: boolean): void;
  };
  removeSection: (id: string) => void;
  reorderSections: (sections: CustomSection[]) => void;

  addLanguage: (name: string, flag: string, level: LanguageLevel) => void;
  updateLanguage: (id: string, field: 'name' | 'level', value: string) => void;
  removeLanguage: (id: string) => void;

  addPage: () => void;
  removePage: (id: string) => void;
  movePage: (id: string, dir: -1 | 1) => void;
  togglePageSection: (pageId: string, sectionKey: string) => void;
  clearPages: () => void;

  /** Move the section key `fromKey` so it sits just before `toKey` in the global order. */
  moveSection: (fromKey: string, toKey: string) => void;

  updateSetting: <K extends keyof CVSettings>(key: K, value: CVSettings[K]) => void;
  updatePhotoStyle: (patch: Partial<PhotoStyle>) => void;
}

const CVContext = createContext<CVContextValue | null>(null);

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

export function CVProvider({ children }: { children: ReactNode }) {
  const [cvData, setCVDataState] = useState<CVData>(() => loadStored(STORAGE_KEY_DATA, DEFAULT_CV_DATA));
  const [settings, setSettings] = useState<CVSettings>(() => loadStored(STORAGE_KEY_SETTINGS, DEFAULT_SETTINGS));
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(cvData));
    } catch { /* storage full or unavailable — ignore */ }
  }, [cvData]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch { /* ignore */ }
  }, [settings]);

  const patchCV = useCallback((patch: Partial<CVData>) => {
    setCVDataState(prev => ({ ...prev, ...patch }));
  }, []);

  const setCVData = useCallback((data: CVData) => {
    setCVDataState(data);
  }, []);

  const togglePanel = useCallback((panel: Exclude<ActivePanel, null>) => {
    setActivePanel(prev => (prev === panel ? null : panel));
  }, []);

  const updatePersonal = useCallback(<K extends keyof PersonalInfo>(field: K, value: PersonalInfo[K]) => {
    setCVDataState(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
  }, []);

  const updateContact = useCallback((field: keyof ContactInfo, value: string) => {
    setCVDataState(prev => ({ ...prev, contact: { ...prev.contact, [field]: value } }));
  }, []);

  const updateProfessionalSummary = useCallback((text: string) => {
    patchCV({ professionalSummary: text });
  }, [patchCV]);

  const updateEducation = useCallback(<K extends keyof Education>(id: string, field: K, value: Education[K]) => {
    setCVDataState(prev => ({
      ...prev,
      education: prev.education.map(ed => (ed.id === id ? { ...ed, [field]: value } : ed)),
    }));
  }, []);

  const addEducation = useCallback(() => {
    setCVDataState(prev => ({
      ...prev,
      education: [...prev.education, { id: uid(), degree: '', university: '', year: '' }],
    }));
  }, []);

  const removeEducation = useCallback((id: string) => {
    setCVDataState(prev => ({ ...prev, education: prev.education.filter(ed => ed.id !== id) }));
  }, []);

  const updateExperience = useCallback(<K extends keyof Experience>(id: string, field: K, value: Experience[K]) => {
    setCVDataState(prev => ({
      ...prev,
      experience: prev.experience.map(exp => (exp.id === id ? { ...exp, [field]: value } : exp)),
    }));
  }, []);

  const addExperience = useCallback(() => {
    setCVDataState(prev => ({
      ...prev,
      experience: [...prev.experience, { id: uid(), title: '', company: '', period: '', description: '' }],
    }));
  }, []);

  const removeExperience = useCallback((id: string) => {
    setCVDataState(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }));
  }, []);

  const updateSkills = useCallback((skills: string[]) => {
    patchCV({ skills });
  }, [patchCV]);

  const addSection = useCallback((type: CustomSection['type']) => {
    const id = uid();
    const label = SECTION_TYPES.find(t => t.value === type)?.label ?? 'Custom Section';
    setCVDataState(prev => ({
      ...prev,
      sections: [...prev.sections, { id, type, title: label, content: '', visible: true, order: prev.sections.length }],
      sectionOrder: [...(prev.sectionOrder ?? []), id],
    }));
    return id;
  }, []);

  const updateSection = useCallback((
    id: string,
    field: 'title' | 'content' | 'visible',
    value: string | boolean,
  ) => {
    setCVDataState(prev => ({
      ...prev,
      sections: prev.sections.map(s => (s.id === id ? { ...s, [field]: value } : s)),
    }));
  }, []) as CVContextValue['updateSection'];

  const removeSection = useCallback((id: string) => {
    setCVDataState(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== id),
      sectionOrder: (prev.sectionOrder ?? []).filter(k => k !== id),
      pages: (prev.pages ?? []).map(p => ({ ...p, sections: p.sections.filter(k => k !== id) })),
    }));
  }, []);

  const reorderSections = useCallback((sections: CustomSection[]) => {
    setCVDataState(prev => {
      const oldIds = new Set(prev.sections.map(s => s.id));
      const newIds = sections.map(s => s.id);
      // Rebuild sectionOrder: keep base keys where they are, drop removed ids,
      // and place reordered custom ids into the slots custom ids used to occupy.
      let slot = 0;
      const sectionOrder = (prev.sectionOrder ?? []).map(k => {
        if (!oldIds.has(k)) return k;          // base key — keep
        return newIds[slot++] ?? null;         // custom slot — fill in new order
      }).filter((k): k is string => k !== null);
      for (const id of newIds) {
        if (!sectionOrder.includes(id)) sectionOrder.push(id);
      }
      return { ...prev, sections, sectionOrder };
    });
  }, []);

  const addLanguage = useCallback((name: string, flag: string, level: LanguageLevel) => {
    setCVDataState(prev => ({
      ...prev,
      languages: [...(prev.languages ?? []), { id: uid(), name, level, flag }],
    }));
  }, []);

  const updateLanguage = useCallback((id: string, field: 'name' | 'level', value: string) => {
    setCVDataState(prev => ({
      ...prev,
      languages: (prev.languages ?? []).map(l =>
        l.id === id ? { ...l, [field]: field === 'level' ? (value as LanguageLevel) : value } : l
      ),
    }));
  }, []);

  const removeLanguage = useCallback((id: string) => {
    setCVDataState(prev => ({ ...prev, languages: (prev.languages ?? []).filter(l => l.id !== id) }));
  }, []);

  const addPage = useCallback(() => {
    setCVDataState(prev => {
      const pages = prev.pages ?? [];
      if (pages.length > 0) {
        return { ...prev, pages: [...pages, { id: uid(), sections: [] }] };
      }
      // "Start Custom Pages" — seed the first page with everything currently
      // on the CV so no content disappears when switching to manual layout.
      const allKeys = [
        ...(prev.sectionOrder ?? []),
        ...prev.sections.map(s => s.id),
      ].filter((k, i, arr) => arr.indexOf(k) === i);
      return { ...prev, pages: [{ id: uid(), sections: allKeys }] };
    });
  }, []);

  const removePage = useCallback((id: string) => {
    setCVDataState(prev => ({ ...prev, pages: (prev.pages ?? []).filter(p => p.id !== id) }));
  }, []);

  const movePage = useCallback((id: string, dir: -1 | 1) => {
    setCVDataState(prev => {
      const pages = [...(prev.pages ?? [])];
      const idx = pages.findIndex(p => p.id === id);
      const to = idx + dir;
      if (idx === -1 || to < 0 || to >= pages.length) return prev;
      [pages[idx], pages[to]] = [pages[to], pages[idx]];
      return { ...prev, pages };
    });
  }, []);

  const togglePageSection = useCallback((pageId: string, sectionKey: string) => {
    setCVDataState(prev => ({
      ...prev,
      pages: (prev.pages ?? []).map(p => {
        if (p.id !== pageId) return p;
        return p.sections.includes(sectionKey)
          ? { ...p, sections: p.sections.filter(k => k !== sectionKey) }
          : { ...p, sections: [...p.sections, sectionKey] };
      }),
    }));
  }, []);

  const clearPages = useCallback(() => {
    patchCV({ pages: [] });
  }, [patchCV]);

  const moveSection = useCallback((fromKey: string, toKey: string) => {
    if (fromKey === toKey) return;
    setCVDataState(prev => {
      const order = [...(prev.sectionOrder ?? [])];
      const fromIdx = order.indexOf(fromKey);
      const toIdx = order.indexOf(toKey);
      if (fromIdx === -1 || toIdx === -1) return prev;
      order.splice(fromIdx, 1);
      order.splice(order.indexOf(toKey), 0, fromKey);
      return { ...prev, sectionOrder: order };
    });
  }, []);

  const updateSetting = useCallback(<K extends keyof CVSettings>(key: K, value: CVSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const updatePhotoStyle = useCallback((patch: Partial<PhotoStyle>) => {
    setSettings(prev => ({ ...prev, photoStyle: { ...prev.photoStyle, ...patch } }));
  }, []);

  const value: CVContextValue = {
    cvData,
    settings,
    activePanel,
    setCVData,
    togglePanel,
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
    addSection,
    updateSection,
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
    moveSection,
    updateSetting,
    updatePhotoStyle,
  };

  return <CVContext.Provider value={value}>{children}</CVContext.Provider>;
}

export function useCV(): CVContextValue {
  const ctx = useContext(CVContext);
  if (!ctx) throw new Error('useCV must be used within a <CVProvider>');
  return ctx;
}
