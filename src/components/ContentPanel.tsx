import { useState } from 'react';
import { useCV } from '@/hooks/useCV';
import { Plus, Trash2, GripVertical, Eye, EyeOff, User, GraduationCap, Phone, Briefcase, Wrench, FileText, Globe, Award, Trophy, FolderOpen, Users, Heart, Languages, Layers, ArrowUp, ArrowDown, X } from 'lucide-react';
import { SECTION_TYPES, LANGUAGE_LEVELS, SUGGESTED_LANGUAGES } from '@/types/cv';
import type { CustomSection, LanguageLevel } from '@/types/cv';
import { LanguageFlag } from '@/components/LanguageFlag';

const sectionTypeIcons: Record<string, React.ElementType> = {
  text: FileText,
  languages: Globe,
  certifications: Award,
  awards: Trophy,
  projects: FolderOpen,
  references: Users,
  hobbies: Heart,
};

export function ContentPanel() {
  const {
    cvData, updatePersonal, updateContact, updateProfessionalSummary,
    updateEducation, addEducation, removeEducation,
    updateExperience, addExperience, removeExperience,
    updateSkills, updateSection, addSection, removeSection, reorderSections,
    addLanguage, updateLanguage, removeLanguage,
    addPage, removePage, movePage, togglePageSection, clearPages,
  } = useCV();

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [newLangName, setNewLangName] = useState('');
  const [newLangLevel, setNewLangLevel] = useState<LanguageLevel>('intermediate');

  const allSections = cvData.sections.filter(s => s.visible !== false);
  const pagesConfig = cvData.pages ?? [];
  const languages = cvData.languages ?? [];

  // Content blocks that can be assigned to a manual page
  const contentBlocks = [
    { key: 'summary', label: 'Professional Summary' },
    { key: 'education', label: 'Education' },
    { key: 'experience', label: 'Work Experience' },
    { key: 'skills', label: 'Skills' },
    { key: 'languages', label: 'Languages' },
    ...(cvData.sections ?? []).map(s => ({ key: s.id, label: s.title || 'Untitled Section' })),
  ];
  const blockLabel = (key: string) => contentBlocks.find(b => b.key === key)?.label ?? 'Section';

  // Suggested languages not added yet (for the quick-add chips)
  const remainingSuggestions = SUGGESTED_LANGUAGES.filter(
    sl => !languages.some(al => al.name.toLowerCase() === sl.name.toLowerCase())
  );

  // Flag preview for the typed language name
  const typedMatch = SUGGESTED_LANGUAGES.find(
    sl => sl.name.toLowerCase() === newLangName.trim().toLowerCase()
  );

  const handleAddLanguage = () => {
    const name = newLangName.trim();
    if (!name) return;
    const match = SUGGESTED_LANGUAGES.find(sl => sl.name.toLowerCase() === name.toLowerCase());
    addLanguage(name, match?.flag ?? 'un', newLangLevel);
    setNewLangName('');
    setNewLangLevel('intermediate');
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    const newSections = [...cvData.sections];
    const fromIdx = newSections.findIndex(s => s.id === draggedId);
    const toIdx = newSections.findIndex(s => s.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = newSections.splice(fromIdx, 1);
    newSections.splice(toIdx, 0, moved);
    reorderSections(newSections);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  return (
    <div className="bg-white border-b border-gray-200 animate-fade-in">
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Personal Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" /> Personal Info
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={cvData.personal.fullName}
                  onChange={e => updatePersonal('fullName', e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Profession"
                  value={cvData.personal.profession}
                  onChange={e => updatePersonal('profession', e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Age"
                  value={cvData.personal.age}
                  onChange={e => updatePersonal('age', e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = ev => updatePersonal('photo', ev.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm w-full"
                  />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={cvData.contact.email}
                  onChange={e => updateContact('email', e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={cvData.contact.phone}
                  onChange={e => updateContact('phone', e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={cvData.contact.location}
                  onChange={e => updateContact('location', e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Website"
                  value={cvData.contact.website}
                  onChange={e => updateContact('website', e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Professional Summary */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Professional Summary</h3>
              <textarea
                value={cvData.professionalSummary}
                onChange={e => updateProfessionalSummary(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Education */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Education
              </h3>
              <div className="space-y-2">
                {cvData.education.map(ed => (
                  <div key={ed.id} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Degree"
                      value={ed.degree}
                      onChange={e => updateEducation(ed.id, 'degree', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="University"
                      value={ed.university}
                      onChange={e => updateEducation(ed.id, 'university', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Year"
                      value={ed.year}
                      onChange={e => updateEducation(ed.id, 'year', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={() => removeEducation(ed.id)} className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                ))}
                <button onClick={addEducation} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Education
                </button>
              </div>
            </div>

            {/* Experience */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Work Experience
              </h3>
              <div className="space-y-3">
                {cvData.experience.map(exp => (
                  <div key={exp.id} className="p-3 border border-gray-100 rounded-lg bg-gray-50 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Job Title"
                        value={exp.title}
                        onChange={e => updateExperience(exp.id, 'title', e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Company"
                        value={exp.company}
                        onChange={e => updateExperience(exp.id, 'company', e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Period"
                        value={exp.period}
                        onChange={e => updateExperience(exp.id, 'period', e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <textarea
                      placeholder="Description (one per line)"
                      value={exp.description}
                      onChange={e => updateExperience(exp.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                    />
                    <button onClick={() => removeExperience(exp.id)} className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                ))}
                <button onClick={addExperience} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Experience
                </button>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Wrench className="w-4 h-4" /> Skills
              </h3>
              <input
                type="text"
                placeholder="Comma-separated skills"
                value={cvData.skills.join(', ')}
                onChange={e => updateSkills(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Languages */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Languages className="w-4 h-4" /> Languages
              </h3>
              <div className="space-y-2">
                {languages.map(lang => (
                  <div key={lang.id} className="grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center">
                    <span className="w-7 flex justify-center shrink-0">
                      <LanguageFlag flag={lang.flag} title={lang.name} imgClassName="w-6" spanClassName="text-xl" />
                    </span>
                    <input
                      type="text"
                      placeholder="Language"
                      value={lang.name}
                      onChange={e => updateLanguage(lang.id, 'name', e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={lang.level}
                      onChange={e => updateLanguage(lang.id, 'level', e.target.value)}
                      className="px-2 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {LANGUAGE_LEVELS.map(l => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                    <button onClick={() => removeLanguage(lang.id)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Add new language */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="w-7 flex justify-center shrink-0">
                    {(typedMatch && newLangName.trim()) ? (
                      <LanguageFlag flag={typedMatch.flag} imgClassName="w-6" />
                    ) : (
                      <LanguageFlag flag="un" imgClassName="w-6" />
                    )}
                  </span>
                  <input
                    type="text"
                    list="language-suggestions"
                    placeholder="Type or pick a language"
                    value={newLangName}
                    onChange={e => setNewLangName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddLanguage(); } }}
                    className="flex-1 min-w-[140px] px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <datalist id="language-suggestions">
                    {SUGGESTED_LANGUAGES.map(sl => (
                      <option key={sl.name} value={sl.name} />
                    ))}
                  </datalist>
                  <select
                    value={newLangLevel}
                    onChange={e => setNewLangLevel(e.target.value as LanguageLevel)}
                    className="px-2 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {LANGUAGE_LEVELS.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddLanguage}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                {/* Quick-add suggested languages with flags */}
                {remainingSuggestions.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs text-gray-400 mb-1.5">Suggested languages — click to add:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {remainingSuggestions.map(sl => (
                        <button
                          key={sl.name}
                          onClick={() => addLanguage(sl.name, sl.flag, 'intermediate')}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition"
                        >
                          <LanguageFlag flag={sl.flag} imgClassName="w-4" />
                          <span>{sl.name}</span>
                          <Plus className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Custom Sections Manager */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" /> Custom Sections
          </h3>

          {allSections.length > 0 && (
            <div className="space-y-2 mb-4">
              {cvData.sections.map(section => {
                const Icon = sectionTypeIcons[section.type] || FileText;
                return (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={() => handleDragStart(section.id)}
                    onDragOver={e => handleDragOver(e, section.id)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 ${draggedId === section.id ? 'opacity-50' : ''}`}
                  >
                    <GripVertical className="w-4 h-4 text-gray-400 drag-handle shrink-0" />
                    <Icon className="w-4 h-4 text-gray-500 shrink-0" />
                    <input
                      type="text"
                      value={section.title}
                      onChange={e => updateSection(section.id, 'title', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      value={section.content}
                      onChange={e => updateSection(section.id, 'content', e.target.value)}
                      placeholder="Section content"
                      rows={1}
                      className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <button
                      onClick={() => updateSection(section.id, 'visible', !section.visible)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => removeSection(section.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Section
            </button>

            {showAddMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-20 w-56">
                {SECTION_TYPES.map(st => {
                  const Icon = sectionTypeIcons[st.value] || FileText;
                  return (
                    <button
                      key={st.value}
                      onClick={() => {
                        addSection(st.value as CustomSection['type']);
                        setShowAddMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition text-left"
                    >
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{st.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pages Manager */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Pages
              {pagesConfig.length === 0 ? (
                <span className="text-xs font-normal text-gray-400">(automatic layout)</span>
              ) : (
                <span className="text-xs font-normal text-gray-400">(manual layout)</span>
              )}
            </h3>
            {pagesConfig.length > 0 && (
              <button
                onClick={clearPages}
                className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
              >
                Back to automatic layout
              </button>
            )}
          </div>

          {pagesConfig.length === 0 && (
            <p className="text-xs text-gray-500 mb-3">
              Pages are created automatically as content grows. Switch to manual mode to add blank
              pages freely and choose exactly which sections go on each page.
            </p>
          )}

          {pagesConfig.length > 0 && (
            <div className="space-y-2 mb-4">
              {pagesConfig.map((page, idx) => (
                <div key={page.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">Page {idx + 1}</span>
                    <div className="ml-auto flex items-center gap-0.5">
                      <button
                        onClick={() => movePage(page.id, -1)}
                        disabled={idx === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="Move page up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => movePage(page.id, 1)}
                        disabled={idx === pagesConfig.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        title="Move page down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => removePage(page.id)}
                        className="p-1 text-red-400 hover:text-red-600"
                        title="Delete page"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Assigned sections as removable chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {page.sections.length === 0 && (
                      <span className="text-xs text-gray-400 italic">Blank page — assign sections below</span>
                    )}
                    {page.sections.map(key => (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                      >
                        {blockLabel(key)}
                        <button
                          onClick={() => togglePageSection(page.id, key)}
                          className="hover:text-blue-900"
                          title="Remove from this page"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add section to this page */}
                  <select
                    value=""
                    onChange={e => {
                      if (e.target.value) togglePageSection(page.id, e.target.value);
                    }}
                    className="w-full sm:w-64 px-2 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">+ Add a section to this page…</option>
                    {contentBlocks
                      .filter(b => !page.sections.includes(b.key))
                      .map(b => (
                        <option key={b.key} value={b.key}>{b.label}</option>
                      ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={addPage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> {pagesConfig.length === 0 ? 'Start Custom Pages' : 'Add Blank Page'}
          </button>
        </div>
      </div>
    </div>
  );
}
