import { useMemo, useEffect, useState, useRef } from 'react';
import { useCV } from '@/hooks/useCV';
import { Mail, Phone, MapPin, Globe, Calendar, GripVertical, Plus, X } from 'lucide-react';
import { LANGUAGE_LEVELS } from '@/types/cv';
import type { CVSettings } from '@/types/cv';
import { LanguageFlag } from '@/components/LanguageFlag';

const A4_WIDTH_PX = 794;   // 210mm @ 96dpi
const A4_HEIGHT_PX = 1123; // 297mm @ 96dpi
const BASE_ORDER = ['photo', 'summary', 'education', 'experience', 'skills', 'languages'];

/* ------------------------------------------------------------------ */
/*  Click-to-edit text                                                 */
/* ------------------------------------------------------------------ */
function Editable({
  value, onCommit, className = '', style, placeholder, multiline = false,
}: {
  value: string;
  onCommit: (text: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  multiline?: boolean;
  tag?: 'span' | 'p' | 'h1' | 'h3' | 'div';
}) {
  return (
    <span
      className={`editable ${className}`}
      style={style}
      contentEditable
      suppressContentEditableWarning
      data-placeholder={placeholder}
      role="textbox"
      aria-multiline={multiline}
      onBlur={e => {
        const t = e.currentTarget.textContent ?? '';
        if (t !== value) onCommit(t);
      }}
      onKeyDown={e => {
        if (e.key === 'Enter' && !multiline) {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
    >{value}</span>
  );
}

/* ------------------------------------------------------------------ */
/*  Main preview                                                       */
/* ------------------------------------------------------------------ */
export function CVPreview() {
  const { cvData, settings } = useCV();
  const [scale, setScale] = useState(1);

  // Drag & drop state
  const dragKey = useRef<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);

  // Fit-to-screen scale
  useEffect(() => {
    const update = () => {
      const available = window.innerWidth - 32;
      setScale(Math.min(1, available / A4_WIDTH_PX));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const keyExists = (k: string) =>
    BASE_ORDER.includes(k) || cvData.sections.some(s => s.id === k);

  const rank = (k: string) => {
    const order = cvData.sectionOrder ?? [];
    const i = order.indexOf(k);
    if (i >= 0) return i;
    const b = BASE_ORDER.indexOf(k);
    if (b >= 0) return 100 + b;
    return 200;
  };
  const sortKeys = (keys: string[]) => [...keys].sort((a, b) => rank(a) - rank(b));

  // Build pages as lists of section keys
  const pages = useMemo(() => {
    const manual = cvData.pages ?? [];
    if (manual.length > 0) {
      return manual.map(p => sortKeys(p.sections.filter(keyExists)));
    }

    const keys: string[] = [];
    if (settings.photoVisible && cvData.personal.photo) keys.push('photo');
    if (cvData.professionalSummary) keys.push('summary');
    if (cvData.education.length > 0) keys.push('education');
    if (cvData.experience.length > 0) keys.push('experience');
    if (cvData.skills.length > 0) keys.push('skills');
    if ((cvData.languages ?? []).length > 0) keys.push('languages');
    for (const s of cvData.sections.filter(s => s.visible)) keys.push(s.id);

    const ordered = sortKeys(keys);
    const maxH = A4_HEIGHT_PX - settings.pagePadding * 2;
    const out: string[][] = [];
    let cur: string[] = [];
    let h = headerHeight(settings);
    for (const k of ordered) {
      const kh = estimateKeyHeight(k, cvData, settings);
      if (cur.length > 0 && h + kh > maxH) {
        out.push(cur);
        cur = [];
        h = 0;
      }
      cur.push(k);
      h += kh + settings.sectionSpacing;
    }
    if (cur.length > 0) out.push(cur);
    return out.length > 0 ? out : [[]];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvData, settings]);

  const { moveSection } = useCV();

  const drag = {
    start: (k: string) => { dragKey.current = k; },
    end: () => { dragKey.current = null; setOverKey(null); },
    setOver: (k: string | null) => setOverKey(k),
    dropOn: (k: string) => {
      if (dragKey.current && dragKey.current !== k) moveSection(dragKey.current, k);
      dragKey.current = null;
      setOverKey(null);
    },
    dropAtEnd: () => {
      const lastPage = pages[pages.length - 1];
      if (dragKey.current && lastPage && lastPage.length > 0) {
        moveSection(dragKey.current, lastPage[lastPage.length - 1]);
      }
      dragKey.current = null;
      setOverKey(null);
    },
  };

  const fontClass = useMemo(() => {
    const map: Record<string, string> = {
      Inter: 'font-inter', Playfair: 'font-playfair', Poppins: 'font-poppins',
      'Roboto Mono': 'font-mono', Oswald: 'font-oswald', Raleway: 'font-raleway',
      'Bebas Neue': 'font-bebas', 'Space Grotesk': 'font-space',
    };
    return map[settings.fontFamily] || 'font-inter';
  }, [settings.fontFamily]);

  const templateClass = `template-${settings.template}`;

  return (
    <div id="cv-root" className="cv-wrapper flex flex-col items-center">
      {pages.map((keys, pageIdx) => (
        <div key={pageIdx} className="page-outer">
          {pageIdx > 0 && (
            <div className="page-break-indicator no-print">
              <span className="page-break-line" />
              <span>Page {pageIdx + 1}</span>
              <span className="page-break-line" />
            </div>
          )}
          <div
            className="page-shell"
            style={{ width: A4_WIDTH_PX * scale, height: A4_HEIGHT_PX * scale }}
          >
            <div
              className={`cv-page shadow-lg ${templateClass} ${fontClass}`}
              style={{
                background: settings.cvBackgroundColor,
                padding: `${settings.pagePadding}px`,
                '--accent': settings.primaryColor,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              } as React.CSSProperties}
            >
              <div className="cv-content h-full" style={{ display: 'flex', flexDirection: 'column' }}>
                {pageIdx === 0 && <PageHeader />}
                <div className="cv-body flex-1">
                  {keys.map(k => (
                    <SectionBlock
                      key={k}
                      k={k}
                      drag={drag}
                      overKey={overKey}
                    />
                  ))}
                </div>

                {/* Drop zone + add-section at the bottom of every page */}
                <div
                  className="page-dropzone no-print"
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); drag.dropAtEnd(); }}
                >
                  <AddSectionButton pageId={(cvData.pages ?? [])[pageIdx]?.id ?? null} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Header (page 1 only) — fully inline editable                       */
/* ------------------------------------------------------------------ */
function PageHeader() {
  const { cvData, settings, updatePersonal, updateContact } = useCV();
  const isDark =
    settings.template === 'dark-pro' ||
    settings.template === 'executive' ||
    settings.template === 'midnight-executive' ||
    settings.template === 'terminal-dev';

  const nameColor = isDark ? '#ffffff' : settings.nameColor;
  const profColor = isDark ? '#cbd5e1' : settings.professionColor;
  const mutedColor = isDark ? '#94a3b8' : '#6b7280';

  const contactItems = [
    { field: 'email', icon: Mail, value: cvData.contact.email },
    { field: 'phone', icon: Phone, value: cvData.contact.phone },
    { field: 'location', icon: MapPin, value: cvData.contact.location },
    { field: 'website', icon: Globe, value: cvData.contact.website },
  ].filter(c => c.value || true);

  return (
    <>
      <div className="cv-header mb-5 flex items-center gap-5">
        <div className="flex-1">
          <h1 className="cv-name font-bold" style={{ fontSize: settings.nameFontSize, color: nameColor, lineHeight: 1.1 }}>
            <Editable value={cvData.personal.fullName} placeholder="Your Name" onCommit={t => updatePersonal('fullName', t)} />
          </h1>
          <p className="cv-profession font-medium mt-1" style={{ fontSize: settings.professionFontSize, color: profColor }}>
            <Editable value={cvData.personal.profession} placeholder="Your Profession" onCommit={t => updatePersonal('profession', t)} />
          </p>
          {cvData.personal.age && (
            <p className="text-sm mt-1" style={{ color: mutedColor }}>
              Age: <Editable value={cvData.personal.age} onCommit={t => updatePersonal('age', t)} /> years
            </p>
          )}
        </div>
      </div>

      <div className="contact-section mb-5">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {contactItems.map(({ field, icon: Icon, value }) => (
            <span key={field} className="flex items-center gap-1.5" style={{ color: isDark ? '#d1d5db' : '#4b5563' }}>
              <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: settings.primaryColor }} />
              <Editable value={value} onCommit={t => updateContact(field, t)} />
              {value !== '' && (
                <button className="contact-remove no-print" title="Clear" onClick={() => updateContact(field, '')}>
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  One draggable / editable section block                             */
/* ------------------------------------------------------------------ */
function SectionBlock({ k, drag, overKey }: {
  k: string;
  drag: { start: (k: string) => void; end: () => void; setOver: (k: string | null) => void; dropOn: (k: string) => void };
  overKey: string | null;
}) {
  const { settings } = useCV();
  const isCards = settings.template === 'cards';

  return (
    <div
      className={`cv-block ${overKey === k ? 'drop-before' : ''}`}
      onDragOver={e => { e.preventDefault(); drag.setOver(k); }}
      onDragLeave={() => drag.setOver(null)}
      onDrop={e => { e.preventDefault(); drag.dropOn(k); }}
    >
      <div
        className="block-handle no-print"
        draggable
        title="Drag to move this section"
        onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; drag.start(k); }}
        onDragEnd={drag.end}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>
      <SectionContent sectionKey={k} isCards={isCards} />
    </div>
  );
}

function SectionTitle({ title, onCommit }: { title: string; onCommit?: (t: string) => void }) {
  const { settings } = useCV();
  return (
    <h2
      className="section-title text-base font-semibold mb-3 flex items-center gap-2 border-b-2 pb-1"
      style={{ color: settings.primaryColor, borderColor: settings.primaryColor }}
    >
      {onCommit ? (
        <Editable value={title} onCommit={onCommit} />
      ) : (
        <Editable value={title} onCommit={() => {}} />
      )}
    </h2>
  );
}

function SectionContent({ sectionKey, isCards }: { sectionKey: string; isCards: boolean }) {
  const { cvData, settings } = useCV();
  const isDark =
    settings.template === 'dark-pro' ||
    settings.template === 'midnight-executive' ||
    settings.template === 'terminal-dev';

  if (sectionKey === 'photo') return <PhotoSection />;
  if (sectionKey === 'summary') {
    return (
      <section className={`mb-5 summary-section ${isCards ? 'section-card' : ''}`}>
        <SectionTitle title="Professional Summary" />
        <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          <SummaryEditable />
        </p>
      </section>
    );
  }
  if (sectionKey === 'education') return <EducationSection isCards={isCards} isDark={isDark} />;
  if (sectionKey === 'experience') return <ExperienceSection isCards={isCards} isDark={isDark} />;
  if (sectionKey === 'skills') return <SkillsSection isCards={isCards} />;
  if (sectionKey === 'languages') return <LanguagesSection isCards={isCards} isDark={isDark} />;

  const section = cvData.sections.find(s => s.id === sectionKey);
  if (!section || !section.visible) return null;
  return <CustomSectionBlock section={section} isCards={isCards} isDark={isDark} />;
}

/* ---------------- Photo (movable block) ---------------- */
function PhotoSection() {
  const { cvData, settings } = useCV();
  if (!settings.photoVisible || !cvData.personal.photo) return null;

  const photoClasses = [
    `photo-${settings.photoStyle.shape}`,
    settings.photoStyle.border !== 'none' ? `photo-border-${settings.photoStyle.border}` : '',
  ].filter(Boolean).join(' ');
  const photoSizeMap: Record<string, number> = { sm: 80, md: 120, lg: 160, xl: 200 };
  const photoSize = photoSizeMap[settings.photoStyle.size] || 120;

  return (
    <section className="mb-5 photo-section">
      <img
        src={cvData.personal.photo}
        alt="Profile"
        className={photoClasses}
        style={{ width: photoSize, height: photoSize, objectFit: 'cover' }}
        draggable={false}
      />
    </section>
  );
}

function SummaryEditable() {
  const { cvData, updateProfessionalSummary } = useCV();
  return (
    <Editable multiline value={cvData.professionalSummary} onCommit={updateProfessionalSummary} placeholder="Write a short professional summary..." />
  );
}

/* ---------------- Education ---------------- */
function EducationSection({ isCards, isDark }: { isCards: boolean; isDark: boolean }) {
  const { cvData, settings, updateEducation, addEducation, removeEducation } = useCV();
  if (cvData.education.length === 0) return null;
  return (
    <section className={`mb-5 education-section ${isCards ? 'section-card' : ''}`}>
      <SectionTitle title="Education" />
      <div className="space-y-3">
        {cvData.education.map(ed => (
          <div key={ed.id} className="relative group/edu">
            <button
              className="row-remove no-print"
              title="Delete this entry"
              onClick={() => removeEducation(ed.id)}
            >
              <X className="w-3 h-3" />
            </button>
            <h3 className="font-semibold text-sm" style={{ color: isDark ? '#f8fafc' : '#1f2937' }}>
              <Editable value={ed.degree} placeholder="Degree" onCommit={t => updateEducation(ed.id, 'degree', t)} />
            </h3>
            <p className={`text-sm flex items-center gap-1 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <Editable value={ed.university} placeholder="University" onCommit={t => updateEducation(ed.id, 'university', t)} />
              <Calendar className="w-3 h-3 ml-2 shrink-0" style={{ color: settings.primaryColor }} />
              <Editable value={ed.year} placeholder="Year" onCommit={t => updateEducation(ed.id, 'year', t)} />
            </p>
          </div>
        ))}
      </div>
      <button className="row-add no-print" onClick={addEducation}>
        <Plus className="w-3 h-3" /> Add education
      </button>
    </section>
  );
}

/* ---------------- Experience ---------------- */
function ExperienceSection({ isCards, isDark }: { isCards: boolean; isDark: boolean }) {
  const { cvData, settings, updateExperience, addExperience, removeExperience } = useCV();
  if (cvData.experience.length === 0) return null;
  return (
    <section className={`mb-5 experience-section ${isCards ? 'section-card' : ''}`}>
      <SectionTitle title="Work Experience" />
      <div className="space-y-4">
        {cvData.experience.map(exp => (
          <div key={exp.id} className="relative group/exp">
            <button
              className="row-remove no-print"
              title="Delete this job"
              onClick={() => removeExperience(exp.id)}
            >
              <X className="w-3 h-3" />
            </button>
            <h3 className="font-semibold text-sm" style={{ color: isDark ? '#f8fafc' : '#1f2937' }}>
              <Editable value={exp.title} placeholder="Job title" onCommit={t => updateExperience(exp.id, 'title', t)} />
              <span className="mx-1.5" style={{ color: settings.primaryColor }}>|</span>
              <Editable value={exp.company} placeholder="Company" onCommit={t => updateExperience(exp.id, 'company', t)} />
              <span className="mx-1.5" style={{ color: settings.primaryColor }}>|</span>
              <Editable value={exp.period} placeholder="Period" onCommit={t => updateExperience(exp.id, 'period', t)} />
            </h3>
            <ul className="mt-1.5 space-y-0.5">
              {exp.description.split('\n').filter(Boolean).map((line, i) => (
                <BulletRow
                  key={i}
                  line={line}
                  onCommit={t => {
                    const lines = exp.description.split('\n');
                    lines[i] = t;
                    updateExperience(exp.id, 'description', lines.join('\n'));
                  }}
                  onDelete={() => {
                    const lines = exp.description.split('\n').filter((_, j) => j !== i);
                    updateExperience(exp.id, 'description', lines.join('\n'));
                  }}
                />
              ))}
            </ul>
            <button
              className="row-add no-print"
              onClick={() => updateExperience(exp.id, 'description', (exp.description ? exp.description + '\n' : '') + 'New achievement')}
            >
              <Plus className="w-3 h-3" /> Add bullet point
            </button>
          </div>
        ))}
      </div>
      <button className="row-add no-print" onClick={addExperience}>
        <Plus className="w-3 h-3" /> Add experience
      </button>
    </section>
  );
}

function BulletRow({ line, onCommit, onDelete }: { line: string; onCommit: (t: string) => void; onDelete: () => void }) {
  const { settings } = useCV();
  return (
    <li className="text-sm flex items-start gap-1.5 text-gray-600">
      <span className="exp-bullet" style={{ color: settings.primaryColor }}>•</span>
      <span className="flex-1">
        <Editable value={line} onCommit={onCommit} />
      </span>
      <button className="tag-remove no-print" title="Delete bullet" onClick={onDelete}>
        <X className="w-3 h-3" />
      </button>
    </li>
  );
}

/* ---------------- Skills ---------------- */
function SkillsSection({ isCards }: { isCards: boolean }) {
  const { cvData, settings, updateSkills } = useCV();
  if (cvData.skills.length === 0) return null;
  return (
    <section className={`mb-5 skills-section ${isCards ? 'section-card' : ''}`}>
      <SectionTitle title="Skills & Expertise" />
      <div className="flex flex-wrap gap-2">
        {cvData.skills.map((skill, i) => (
          <span key={i} className="skill-tag" style={{ background: `${settings.primaryColor}15`, color: settings.primaryColor }}>
            <Editable
              value={skill}
              onCommit={t => {
                const next = [...cvData.skills];
                next[i] = t;
                updateSkills(next);
              }}
            />
            <button
              className="tag-remove"
              title="Remove skill"
              onClick={() => updateSkills(cvData.skills.filter((_, j) => j !== i))}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          className="skill-input no-print"
          placeholder="+ Add skill, Enter"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              const v = (e.target as HTMLInputElement).value.trim();
              if (v) {
                updateSkills([...cvData.skills, v]);
                (e.target as HTMLInputElement).value = '';
              }
            }
          }}
        />
      </div>
    </section>
  );
}

/* ---------------- Languages ---------------- */
function LanguagesSection({ isCards, isDark }: { isCards: boolean; isDark: boolean }) {
  const { cvData, settings, updateLanguage, removeLanguage, addLanguage } = useCV();
  const langs = cvData.languages ?? [];
  if (langs.length === 0) return null;
  return (
    <section className={`mb-5 languages-section ${isCards ? 'section-card' : ''}`}>
      <SectionTitle title="Languages" />
      <div className="space-y-2">
        {langs.map(lang => {
          const lvl = LANGUAGE_LEVELS.find(l => l.value === lang.level);
          const filled = lvl?.dots ?? 0;
          return (
            <div key={lang.id} className="flex items-center gap-2 text-sm">
              <button className="tag-remove no-print" title="Remove language" onClick={() => removeLanguage(lang.id)}>
                <X className="w-3 h-3" />
              </button>
              {lang.flag && (
                <LanguageFlag
                  flag={lang.flag}
                  title={lang.name}
                  imgClassName="w-5"
                  spanClassName="text-base leading-none w-6 text-center shrink-0"
                />
              )}
              <span className={isDark ? 'text-gray-200' : 'text-gray-800'}>
                <Editable value={lang.name} onCommit={t => updateLanguage(lang.id, 'name', t)} />
              </span>
              <span className="ml-auto flex items-center gap-2 shrink-0">
                <span className="flex items-center gap-1">
                  {LANGUAGE_LEVELS.map((l, i) => (
                    <span
                      key={l.value}
                      className="lang-dot"
                      style={{ background: i < filled ? settings.primaryColor : (isDark ? '#334155' : '#e5e7eb') }}
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
      <button className="row-add no-print" onClick={() => addLanguage('English', 'gb', 'fluent')}>
        <Plus className="w-3 h-3" /> Add language
      </button>
    </section>
  );
}

/* ---------------- Custom sections ---------------- */
function CustomSectionBlock({ section, isCards, isDark }: {
  section: { id: string; title: string; content: string };
  isCards: boolean;
  isDark: boolean;
}) {
  const { updateSection, removeSection } = useCV();
  return (
    <section className={`mb-5 ${isCards ? 'section-card' : ''}`}>
      <SectionTitle title={section.title} onCommit={t => updateSection(section.id, 'title', t)} />
      <div className={`text-sm whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        <Editable multiline value={section.content} placeholder="Write content..." onCommit={t => updateSection(section.id, 'content', t)} />
      </div>
      <button className="row-add no-print" onClick={() => removeSection(section.id)}>
        <X className="w-3 h-3" /> Delete this section
      </button>
    </section>
  );
}

/* ---------------- Add-section button ---------------- */
function AddSectionButton({ pageId }: { pageId: string | null }) {
  const { addSection, togglePageSection } = useCV();
  return (
    <button
      className="add-section-btn"
      onClick={() => {
        const id = addSection('text');
        if (pageId) togglePageSection(pageId, id);
      }}
    >
      <Plus className="w-3.5 h-3.5" /> Add section
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Height estimation (auto pagination)                                */
/* ------------------------------------------------------------------ */
function headerHeight(s: CVSettings): number {
  let h = 60;
  h += s.nameFontSize + s.professionFontSize + 30;
  return h;
}

function estimateTextHeight(text: string, fontSize: number, lineHeight: number, charsPerLine: number): number {
  const lines = Math.ceil(text.length / charsPerLine) + (text.split('\n').length - 1);
  return Math.max(1, lines) * fontSize * lineHeight;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function estimateKeyHeight(k: string, cvData: any, settings: CVSettings): number  {
  switch (k) {
    case 'photo': {
      const photoSizeMap: Record<string, number> = { sm: 80, md: 120, lg: 160, xl: 200 };
      return (photoSizeMap[settings.photoStyle.size] || 120) + 30;
    }
    case 'summary':
      return estimateTextHeight(cvData.professionalSummary || ' ', 14, 1.6, 60) + 30;
    case 'education':
      return cvData.education.length * 50 + 30;
    case 'experience': {
      let h = 40;
      for (const exp of cvData.experience) h += estimateTextHeight(exp.description || ' ', 13, 1.5, 50) + 40;
      return h;
    }
    case 'skills':
      return Math.ceil(cvData.skills.length / 4) * 32 + 30;
    case 'languages':
      return (cvData.languages ?? []).length * 28 + 34;
    default: {
      const sec = cvData.sections.find((x: { id: string }) => x.id === k);
      return estimateTextHeight(sec?.content || ' ', 13, 1.5, 50) + 40;
    }
  }
}
