import { useState } from 'react';
import { useCV } from '@/hooks/useCV';
import { Plus, Trash2, GripVertical, Eye, EyeOff, User, GraduationCap, Phone, Briefcase, Wrench, FileText, Globe, Award, Trophy, FolderOpen, Users, Heart } from 'lucide-react';
import { SECTION_TYPES } from '@/types/cv';
import type { CustomSection } from '@/types/cv';

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
  } = useCV();

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const allSections = cvData.sections.filter(s => s.visible !== false);

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
      </div>
    </div>
  );
}
