import { useMemo, useEffect, useState } from 'react';
import { useCV } from '@/hooks/useCV';
import { Mail, Phone, MapPin, Globe, Calendar, User } from 'lucide-react';
import { LANGUAGE_LEVELS } from '@/types/cv';
import type { CVData, CVSettings } from '@/types/cv';

const A4_WIDTH_PX = 794;  // 210mm at 96 DPI
const A4_HEIGHT_PX = 1123; // 297mm at 96 DPI

export function CVPreview() {
  const { cvData, settings } = useCV();
  const [pages, setPages] = useState<CVData[]>([]);

  // Scale the preview to fit small screens
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const available = window.innerWidth - 32; // 16px padding on each side
      setScale(Math.min(1, available / A4_WIDTH_PX));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Build pages: manual layout (if custom pages exist) or automatic split
  useEffect(() => {
    const buildPages = () => {
      // ---------- MANUAL MODE: user-defined pages ----------
      const manualPages = cvData.pages ?? [];
      if (manualPages.length > 0) {
        const result: CVData[] = manualPages.map(page => {
          const pageData = createEmptyCVData();
          // Header info travels with every page, but only renders on the first
          pageData.personal = cvData.personal;
          pageData.contact = cvData.contact;
          if (page.sections.includes('summary')) pageData.professionalSummary = cvData.professionalSummary;
          if (page.sections.includes('education')) pageData.education = cvData.education;
          if (page.sections.includes('experience')) pageData.experience = cvData.experience;
          if (page.sections.includes('skills')) pageData.skills = cvData.skills;
          if (page.sections.includes('languages')) pageData.languages = cvData.languages;
          pageData.sections = (cvData.sections ?? []).filter(s => page.sections.includes(s.id));
          return pageData;
        });
        setPages(result);
        return;
      }

      // ---------- AUTOMATIC MODE: split content across pages ----------
      const maxContentHeight = A4_HEIGHT_PX - settings.pagePadding * 2;

      const result: CVData[] = [];
      let currentPageData = createEmptyCVData();
      let currentHeight = estimateHeaderHeight(settings);

      // Always include personal, contact on first page
      currentPageData.personal = cvData.personal;
      currentPageData.contact = cvData.contact;

      // Professional summary
      if (cvData.professionalSummary) {
        const summaryHeight = estimateTextHeight(cvData.professionalSummary, 14, 1.6, 60);
        if (currentHeight + summaryHeight > maxContentHeight && currentHeight > estimateHeaderHeight(settings)) {
          result.push(currentPageData);
          currentPageData = createEmptyCVData();
          currentHeight = 0;
        }
        currentPageData.professionalSummary = cvData.professionalSummary;
        currentHeight += summaryHeight + settings.sectionSpacing;
      }

      // Education
      if (cvData.education.length > 0) {
        const eduHeight = cvData.education.length * 50 + 30;
        if (currentHeight + eduHeight > maxContentHeight) {
          result.push(currentPageData);
          currentPageData = createEmptyCVData();
          currentHeight = 0;
        }
        currentPageData.education = cvData.education;
        currentHeight += eduHeight + settings.sectionSpacing;
      }

      // Experience
      for (const exp of cvData.experience) {
        const expHeight = estimateTextHeight(exp.description, 13, 1.5, 50) + 40;
        if (currentHeight + expHeight > maxContentHeight) {
          result.push(currentPageData);
          currentPageData = createEmptyCVData();
          currentHeight = 0;
        }
        if (currentPageData.experience.length === 0) {
          currentPageData.experience = [exp];
        } else {
          currentPageData.experience.push(exp);
        }
        currentHeight += expHeight;
      }
      currentHeight += settings.sectionSpacing;

      // Skills
      if (cvData.skills.length > 0) {
        const skillsHeight = Math.ceil(cvData.skills.length / 4) * 32 + 30;
        if (currentHeight + skillsHeight > maxContentHeight) {
          result.push(currentPageData);
          currentPageData = createEmptyCVData();
          currentHeight = 0;
        }
        currentPageData.skills = cvData.skills;
        currentHeight += skillsHeight + settings.sectionSpacing;
      }

      // Languages
      if ((cvData.languages ?? []).length > 0) {
        const langHeight = cvData.languages.length * 28 + 34;
        if (currentHeight + langHeight > maxContentHeight) {
          result.push(currentPageData);
          currentPageData = createEmptyCVData();
          currentHeight = 0;
        }
        currentPageData.languages = cvData.languages;
        currentHeight += langHeight + settings.sectionSpacing;
      }

      // Custom sections
      for (const section of cvData.sections.filter(s => s.visible)) {
        const sectionHeight = estimateTextHeight(section.content, 13, 1.5, 50) + 40;
        if (currentHeight + sectionHeight > maxContentHeight) {
          result.push(currentPageData);
          currentPageData = createEmptyCVData();
          currentHeight = 0;
        }
        currentPageData.sections.push(section);
        currentHeight += sectionHeight;
      }

      result.push(currentPageData);
      setPages(result);
    };

    buildPages();
  }, [cvData, settings]);

  const fontClass = useMemo(() => {
    const map: Record<string, string> = {
      Inter: 'font-inter',
      Playfair: 'font-playfair',
      Poppins: 'font-poppins',
      'Roboto Mono': 'font-mono',
      Oswald: 'font-oswald',
      Raleway: 'font-raleway',
      'Bebas Neue': 'font-bebas',
      'Space Grotesk': 'font-space',
    };
    return map[settings.fontFamily] || 'font-inter';
  }, [settings.fontFamily]);

  const templateClass = `template-${settings.template}`;

  const photoClasses = [
    `photo-${settings.photoStyle.shape}`,
    `photo-${settings.photoStyle.size}`,
    settings.photoStyle.border !== 'none' ? `photo-border-${settings.photoStyle.border}` : '',
  ].filter(Boolean).join(' ');

  const photoSizeMap: Record<string, number> = { sm: 80, md: 120, lg: 160, xl: 200 };
  const photoSize = photoSizeMap[settings.photoStyle.size] || 120;

  return (
    <div className="cv-wrapper flex flex-col items-center gap-0">
      {pages.map((pageData, pageIdx) => (
        <div key={pageIdx}>
          {pageIdx > 0 && (
            <div className="page-break-indicator no-print">
              <span className="page-break-line" />
              <span>Page {pageIdx + 1}</span>
              <span className="page-break-line" />
            </div>
          )}
          <div
            className="overflow-hidden"
            style={{ width: A4_WIDTH_PX * scale, height: A4_HEIGHT_PX * scale }}
          >
            <div
              className={`cv-page shadow-lg ${templateClass} ${fontClass} no-print`}
              style={{
                background: settings.cvBackgroundColor,
                padding: `${settings.pagePadding}px`,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
            >
              <CVPageContent
                cvData={pageData}
                settings={settings}
                isFirstPage={pageIdx === 0}
                photoClasses={photoClasses}
                photoSize={photoSize}
              />
            </div>
          </div>
        </div>
      ))}

      {/* Print version — all content on proper A4 pages */}
      <div className="hidden print:block">
        {pages.map((pageData, pageIdx) => (
          <div
            key={`print-${pageIdx}`}
            className={`cv-page ${templateClass} ${fontClass}`}
            style={{
              background: settings.cvBackgroundColor,
              padding: `${settings.pagePadding}px`,
            }}
          >
            <CVPageContent
              cvData={pageData}
              settings={settings}
              isFirstPage={pageIdx === 0}
              photoClasses={photoClasses}
              photoSize={photoSize}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function CVPageContent({
  cvData, settings, isFirstPage, photoClasses, photoSize,
}: {
  cvData: CVData;
  settings: CVSettings;
  isFirstPage: boolean;
  photoClasses: string;
  photoSize: number;
}) {
  const isDark = settings.template === 'dark-pro';
  const isColorful = settings.template === 'colorful';
  const isExecutive = settings.template === 'executive';
  const isMagazine = settings.template === 'magazine';
  const isBold = settings.template === 'bold-type';
  const isMinimal = settings.template === 'minimal-text';
  const isSidebar = settings.template === 'creative-sidebar';
  const isTimeline = settings.template === 'timeline';
  const isCards = settings.template === 'cards';
  const isInfographic = settings.template === 'infographic';
  const isCentered = settings.template === 'centered';
  const isPhotoFocus = settings.template === 'photo-focus';
  const isContactBottom = settings.template === 'contact-bottom';
  const isTwoColumn = settings.template === 'two-column-tech';
  const isGrid = settings.template === 'grid';

  const renderPhoto = () => {
    if (settings.photoPosition === 'hidden') return null;
    if (!cvData.personal.photo && !isPhotoFocus) return null;

    const photoEl = cvData.personal.photo ? (
      <img
        src={cvData.personal.photo}
        alt="Profile"
        className={photoClasses}
        style={{ width: photoSize, height: photoSize, objectFit: 'cover' }}
      />
    ) : (
      <div
        className={`${photoClasses} bg-gray-200 flex items-center justify-center`}
        style={{ width: photoSize, height: photoSize }}
      >
        <User className="w-8 h-8 text-gray-400" />
      </div>
    );

    if (isPhotoFocus) {
      return <div className="photo-container mb-4">{photoEl}</div>;
    }

    return <div className="shrink-0">{photoEl}</div>;
  };

  const renderHeader = () => {
    const nameStyle: React.CSSProperties = {
      fontSize: `${settings.nameFontSize}px`,
      color: isExecutive || isDark ? '#ffffff' : settings.nameColor,
      lineHeight: 1.1,
    };
    const profStyle: React.CSSProperties = {
      fontSize: `${settings.professionFontSize}px`,
      color: isExecutive || isDark ? '#cbd5e1' : settings.professionColor,
    };

    const headerContent = (
      <>
        {renderPhoto()}
        <div className={`flex-1 ${isCentered || isPhotoFocus ? 'text-center' : ''}`}>
          <h1 className="cv-name font-bold" style={nameStyle}>
            {cvData.personal.fullName || 'Your Name'}
          </h1>
          <p className="cv-profession font-medium mt-1" style={profStyle}>
            {cvData.personal.profession || 'Your Profession'}
          </p>
          {cvData.personal.age && (
            <p className="text-sm mt-1" style={{ color: isExecutive || isDark ? '#94a3b8' : '#6b7280' }}>
              Age: {cvData.personal.age} years
            </p>
          )}
        </div>
      </>
    );

    if (isMagazine) {
      return (
        <div className="cv-header mb-6 pb-4 border-b-2 border-gray-900">
          <h1 className="headline text-4xl font-black uppercase tracking-tight text-gray-900">
            {cvData.personal.fullName || 'Your Name'}
          </h1>
          <p className="text-lg text-blue-600 mt-1 font-medium">{cvData.personal.profession || 'Your Profession'}</p>
        </div>
      );
    }

    if (isBold) {
      return (
        <div className={`cv-header mb-6 flex items-center gap-4 ${isCentered ? 'justify-center' : ''}`}>
          {headerContent}
        </div>
      );
    }

    return (
      <div className={`cv-header mb-5 flex items-center gap-5 ${isCentered || isPhotoFocus ? 'justify-center' : ''}`}>
        {headerContent}
      </div>
    );
  };

  const renderContact = () => {
    const items = [
      cvData.contact.email && { icon: Mail, text: cvData.contact.email, href: `mailto:${cvData.contact.email}` },
      cvData.contact.phone && { icon: Phone, text: cvData.contact.phone, href: `tel:${cvData.contact.phone}` },
      cvData.contact.location && { icon: MapPin, text: cvData.contact.location },
      cvData.contact.website && { icon: Globe, text: cvData.contact.website, href: `https://${cvData.contact.website}` },
    ].filter(Boolean) as { icon: React.ElementType; text: string; href?: string }[];

    if (items.length === 0) return null;

    const textColor = isDark || isExecutive ? 'text-gray-300' : 'text-gray-600';

    return (
      <div className={`contact-section mb-5 ${isCentered || isPhotoFocus ? 'text-center' : ''} ${isContactBottom ? 'contact-section mt-auto' : ''}`}>
        <div className={`flex flex-wrap gap-x-5 gap-y-2 ${isCentered || isPhotoFocus ? 'justify-center' : ''} text-sm`}>
          {items.map((item, i) => {
            const Icon = item.icon;
            const content = (
              <span className={`flex items-center gap-1.5 ${textColor}`}>
                <Icon className="w-3.5 h-3.5" style={{ color: settings.primaryColor }} />
                <span>{item.text}</span>
              </span>
            );
            return item.href ? (
              <a key={i} href={item.href} className="hover:underline">{content}</a>
            ) : (
              <span key={i}>{content}</span>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSectionTitle = (title: string) => {
    if (isTimeline) {
      return (
        <h2 className="section-title text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: settings.primaryColor }}>
          {title}
        </h2>
      );
    }
    if (isMinimal) {
      return (
        <h2 className="section-title text-xs font-normal uppercase tracking-widest mb-4 text-gray-400 border-b border-gray-200 pb-1">
          {title}
        </h2>
      );
    }
    return (
      <h2 className="section-title text-base font-semibold mb-3 flex items-center gap-2 border-b-2 pb-1" style={{ color: settings.primaryColor, borderColor: settings.primaryColor }}>
        {title}
      </h2>
    );
  };

  const renderProfessionalSummary = () => {
    if (!cvData.professionalSummary) return null;
    return (
      <section className="mb-5 summary-section">
        {renderSectionTitle('Professional Summary')}
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-sm leading-relaxed`}>
          {cvData.professionalSummary}
        </p>
      </section>
    );
  };

  const renderEducation = () => {
    if (cvData.education.length === 0) return null;
    return (
      <section className={`mb-5 education-section ${isCards ? 'section-card' : ''}`}>
        {renderSectionTitle('Education')}
        <div className="space-y-3">
          {cvData.education.map(ed => (
            <div key={ed.id}>
              <h3 className="font-semibold text-sm" style={{ color: isDark ? '#f8fafc' : '#1f2937' }}>{ed.degree}</h3>
              <p className={`text-sm flex items-center gap-1 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <span>{ed.university}</span>
                {ed.year && (
                  <>
                    <Calendar className="w-3 h-3 ml-2" style={{ color: settings.primaryColor }} />
                    <span>{ed.year}</span>
                  </>
                )}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderExperience = () => {
    if (cvData.experience.length === 0) return null;
    return (
      <section className={`mb-5 experience-section ${isCards ? 'section-card' : ''}`}>
        {renderSectionTitle('Work Experience')}
        <div className="space-y-4">
          {cvData.experience.map(exp => (
            <div key={exp.id}>
              <h3 className="font-semibold text-sm" style={{ color: isDark ? '#f8fafc' : '#1f2937' }}>
                {exp.title} {exp.company && `| ${exp.company}`} {exp.period && `| ${exp.period}`}
              </h3>
              {exp.description && (
                <ul className="mt-1.5 space-y-0.5">
                  {exp.description.split('\n').filter(Boolean).map((line, i) => (
                    <li key={i} className={`text-sm flex items-start gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span style={{ color: settings.primaryColor }}>•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const renderSkills = () => {
    if (cvData.skills.length === 0) return null;
    return (
      <section className={`mb-5 skills-section ${isCards ? 'section-card' : ''}`}>
        {renderSectionTitle('Skills & Expertise')}
        {isInfographic ? (
          <div className="space-y-2">
            {cvData.skills.map((skill, i) => (
              <div key={i} className="skill-item">
                <div className="flex justify-between text-sm mb-0.5">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{skill}</span>
                </div>
                <div className="skill-bar">
                  <div className="skill-fill" style={{ width: `${60 + Math.random() * 40}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {cvData.skills.map((skill, i) => (
              <span
                key={i}
                className="skill-tag"
                style={{
                  background: `${settings.primaryColor}15`,
                  color: settings.primaryColor,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </section>
    );
  };

  const renderLanguages = () => {
    const langs = cvData.languages ?? [];
    if (langs.length === 0) return null;
    return (
      <section className={`mb-5 languages-section ${isCards ? 'section-card' : ''}`}>
        {renderSectionTitle('Languages')}
        <div className="space-y-2">
          {langs.map(lang => {
            const lvl = LANGUAGE_LEVELS.find(l => l.value === lang.level);
            const filled = lvl?.dots ?? 0;
            return (
              <div key={lang.id} className="flex items-center gap-2 text-sm">
                {lang.flag && <span className="text-base leading-none w-6 text-center shrink-0">{lang.flag}</span>}
                <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>{lang.name}</span>
                <span className="ml-auto flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1">
                    {LANGUAGE_LEVELS.map((l, i) => (
                      <span
                        key={l.value}
                        className="lang-dot"
                        style={{
                          background: i < filled
                            ? settings.primaryColor
                            : (isDark ? '#334155' : '#e5e7eb'),
                        }}
                      />
                    ))}
                  </span>
                  <span className={`text-xs w-20 text-right ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {lvl?.label ?? lang.level}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  const renderCustomSections = () => {
    const sections = cvData.sections.filter(s => s.visible);
    if (sections.length === 0) return null;
    return (
      <>
        {sections.map(section => (
          <section key={section.id} className={`mb-5 ${isCards ? 'section-card' : ''}`}>
            {renderSectionTitle(section.title)}
            <div className={`text-sm whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {section.content}
            </div>
          </section>
        ))}
      </>
    );
  };

  // For sidebar template
  if (isSidebar) {
    return (
      <div className="cv-content h-full">
        <div className="template-creative-sidebar">
          <div className="cv-sidebar">
            {cvData.personal.photo && (
              <img src={cvData.personal.photo} alt="" className={`${photoClasses} mb-4`} style={{ width: 120, height: 120, objectFit: 'cover' }} />
            )}
            <h1 className="text-xl font-bold text-white mb-1">{cvData.personal.fullName}</h1>
            <p className="text-blue-200 text-sm mb-4">{cvData.personal.profession}</p>
            <div className="space-y-2 text-sm">
              {cvData.contact.email && <p>{cvData.contact.email}</p>}
              {cvData.contact.phone && <p>{cvData.contact.phone}</p>}
              {cvData.contact.location && <p>{cvData.contact.location}</p>}
            </div>
            {cvData.skills.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-2 border-b border-blue-400 pb-1">Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {cvData.skills.map((s, i) => <span key={i} className="text-xs bg-blue-700 px-2 py-0.5 rounded">{s}</span>)}
                </div>
              </div>
            )}
          </div>
          <div className="cv-main">
            {renderProfessionalSummary()}
            {renderEducation()}
            {renderExperience()}
            {renderLanguages()}
            {renderCustomSections()}
          </div>
        </div>
      </div>
    );
  }

  // For colorful template
  if (isColorful) {
    return (
      <div className="cv-content h-full">
        <div className="cv-content">
          {renderHeader()}
          {renderContact()}
          {renderProfessionalSummary()}
          {renderEducation()}
          {renderExperience()}
          {renderSkills()}
          {renderLanguages()}
          {renderCustomSections()}
        </div>
      </div>
    );
  }

  // For grid template
  if (isGrid) {
    return (
      <div className="cv-content h-full">
        <div className="cv-body">
          <div className="grid-header col-span-12">
            {renderHeader()}
            {renderContact()}
          </div>
          <div className="grid-summary col-span-12">
            {renderProfessionalSummary()}
          </div>
          <div className="grid-education col-span-5">
            {renderEducation()}
          </div>
          <div className="grid-experience col-span-7">
            {renderExperience()}
          </div>
          <div className="grid-skills col-span-12">
            {renderSkills()}
            {renderLanguages()}
          </div>
          <div className="grid-sections col-span-12">
            {renderCustomSections()}
          </div>
        </div>
      </div>
    );
  }

  // For two-column template
  if (isTwoColumn) {
    return (
      <div className="cv-content h-full">
        {renderHeader()}
        {renderContact()}
        <div className="cv-body">
          {renderProfessionalSummary()}
          {renderEducation()}
          {renderExperience()}
          {renderSkills()}
          {renderLanguages()}
          {renderCustomSections()}
        </div>
      </div>
    );
  }

  // For timeline template
  if (isTimeline) {
    return (
      <div className="cv-content h-full">
        {renderHeader()}
        {renderContact()}
        <div className="cv-body">
          {renderProfessionalSummary()}
          {renderEducation()}
          {renderExperience()}
          {renderSkills()}
          {renderLanguages()}
          {renderCustomSections()}
        </div>
      </div>
    );
  }

  // Default layout
  return (
    <div className="cv-content h-full" style={{ display: 'flex', flexDirection: 'column' }}>
      {isFirstPage && (
        <>
          {renderHeader()}
          {renderContact()}
        </>
      )}
      <div className="cv-body flex-1">
        {renderProfessionalSummary()}
        {renderEducation()}
        {renderExperience()}
        {renderSkills()}
        {renderLanguages()}
        {renderCustomSections()}
      </div>
    </div>
  );
}

// Helper functions
function createEmptyCVData(): CVData {
  return {
    personal: { fullName: '', profession: '', age: '', photo: null },
    contact: { email: '', phone: '', location: '', website: '' },
    education: [],
    experience: [],
    skills: [],
    languages: [],
    sections: [],
    pages: [],
    professionalSummary: '',
  };
}

function estimateHeaderHeight(settings: CVSettings): number {
  let h = 60; // base header
  if (settings.photoPosition !== 'hidden') h += 20;
  h += settings.nameFontSize;
  h += settings.professionFontSize;
  h += 30; // contact
  return h;
}

function estimateTextHeight(text: string, fontSize: number, lineHeight: number, charsPerLine: number): number {
  const lines = Math.ceil(text.length / charsPerLine) + (text.split('\n').length - 1);
  return lines * fontSize * lineHeight;
}
