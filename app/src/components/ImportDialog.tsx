import { useState, useRef } from 'react';
import { useCV } from '@/hooks/useCV';
import { Upload, FileText, Loader2, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ImportDialog({ open, onClose }: ImportDialogProps) {
  const { setCVData, cvData } = useCV();
  const [activeTab, setActiveTab] = useState('pdf');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      await parsePDF(file);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await parsePDF(file);
    }
  };

  const parsePDF = async (file: File) => {
    setIsLoading(true);
    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }

      const parsed = extractCVDataFromText(fullText);
      setCVData({
        ...cvData,
        ...parsed,
      });
      setImportSuccess(true);
      setTimeout(() => {
        setImportSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('PDF parse error:', err);
      alert('Could not parse PDF. Try the manual paste option instead.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteImport = () => {
    if (!pastedText.trim()) return;
    const parsed = extractCVDataFromText(pastedText);
    setCVData({
      ...cvData,
      ...parsed,
    });
    setImportSuccess(true);
    setTimeout(() => {
      setImportSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" /> Import Existing CV
          </DialogTitle>
        </DialogHeader>

        {importSuccess ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-lg font-semibold text-gray-800">CV Imported Successfully!</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pdf">Upload PDF</TabsTrigger>
              <TabsTrigger value="paste">Paste Text</TabsTrigger>
            </TabsList>

            <TabsContent value="pdf" className="mt-4">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {isLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-sm text-gray-600">Parsing PDF...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Drop your CV PDF here, or click to browse
                    </p>
                    <p className="text-xs text-gray-500">Supports PDF files only</p>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="paste" className="mt-4">
              <div className="space-y-3">
                <textarea
                  value={pastedText}
                  onChange={e => setPastedText(e.target.value)}
                  placeholder="Paste your CV content here...&#10;We'll automatically detect sections like Education, Experience, Skills, etc."
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                />
                <button
                  onClick={handlePasteImport}
                  disabled={!pastedText.trim() || isLoading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Parse and Import
                </button>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

function extractCVDataFromText(text: string): Partial<import('@/types/cv').CVData> {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Extract name (first non-empty line that's not a section header)
  const sectionKeywords = ['education', 'experience', 'skills', 'contact', 'summary', 'objective', 'projects', 'languages', 'certifications', 'awards', 'references'];
  let name = '';
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (line.length > 2 && line.length < 60 && !sectionKeywords.some(k => lower.includes(k))) {
      name = line;
      break;
    }
  }

  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const email = emailMatch ? emailMatch[0] : '';

  // Extract phone
  const phoneMatch = text.match(/[\+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}/);
  const phone = phoneMatch ? phoneMatch[0] : '';

  // Extract sections
  const sections: import('@/types/cv').CustomSection[] = [];

  // Find education section
  const education: import('@/types/cv').Education[] = [];
  const eduStart = findSectionIndex(lines, ['education', 'academic', 'degree', 'university', 'college']);
  if (eduStart >= 0) {
    for (let i = eduStart + 1; i < lines.length && !isSectionHeader(lines[i]); i++) {
      const line = lines[i];
      if (line.length > 5 && !line.includes('@') && !line.match(/^\d{4}$/)) {
        const yearMatch = line.match(/\b(19|20)\d{2}\b/);
        education.push({
          id: `edu-${i}`,
          degree: line,
          university: lines[i + 1] && !isSectionHeader(lines[i + 1]) ? lines[i + 1] : '',
          year: yearMatch ? yearMatch[0] : '',
        });
        if (lines[i + 1] && !isSectionHeader(lines[i + 1])) i++;
      }
    }
  }

  // Find experience section
  const experience: import('@/types/cv').Experience[] = [];
  const expStart = findSectionIndex(lines, ['experience', 'work', 'employment', 'career', 'professional']);
  if (expStart >= 0) {
    let currentExp: import('@/types/cv').Experience | null = null;
    for (let i = expStart + 1; i < lines.length && !isSectionHeader(lines[i]); i++) {
      const line = lines[i];
      if (line.length > 5) {
        if (!currentExp || line.match(/^(19|20)\d{2}/) || line.match(/\b(19|20)\d{2}\b.*\b(19|20)\d{2}\b/)) {
          if (currentExp) experience.push(currentExp);
          const parts = line.split(/[|,]/).map(p => p.trim());
          currentExp = {
            id: `exp-${i}`,
            title: parts[0] || line,
            company: parts[1] || '',
            period: line.match(/\b(19|20)\d{2}\b.*?\b(19|20)\d{2}\b|present|current/i)?.[0] || '',
            description: '',
          };
        } else if (currentExp) {
          currentExp.description += (currentExp.description ? '\n' : '') + line;
        }
      }
    }
    if (currentExp) experience.push(currentExp);
  }

  // Find skills
  let skills: string[] = [];
  const skillsStart = findSectionIndex(lines, ['skills', 'expertise', 'competencies', 'technologies']);
  if (skillsStart >= 0) {
    const skillsText = lines.slice(skillsStart + 1, skillsStart + 5).join(' ');
    skills = skillsText.split(/[,;|]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 30);
    if (skills.length === 0) {
      // Try bullet points
      for (let i = skillsStart + 1; i < lines.length && !isSectionHeader(lines[i]); i++) {
        const clean = lines[i].replace(/^[•\-\*]\s*/, '').trim();
        if (clean.length > 1 && clean.length < 30) skills.push(clean);
      }
    }
  }

  // Professional summary
  let professionalSummary = '';
  const summaryStart = findSectionIndex(lines, ['summary', 'objective', 'profile', 'about']);
  if (summaryStart >= 0) {
    const summaryLines: string[] = [];
    for (let i = summaryStart + 1; i < lines.length && !isSectionHeader(lines[i]) && summaryLines.length < 5; i++) {
      if (lines[i].length > 10) summaryLines.push(lines[i]);
    }
    professionalSummary = summaryLines.join(' ');
  }

  // Extract location
  const locationMatch = text.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?,\s*(?:[A-Z][a-z]+|[A-Z]{2}))\b/);
  const location = locationMatch ? locationMatch[0] : '';

  return {
    personal: {
      fullName: name,
      profession: '',
      age: '',
      photo: null,
    },
    contact: {
      email,
      phone,
      location,
      website: '',
    },
    education: education.slice(0, 5),
    experience: experience.slice(0, 8),
    skills: skills.slice(0, 20),
    professionalSummary,
    sections,
  };
}

function findSectionIndex(lines: string[], keywords: string[]): number {
  for (let i = 0; i < lines.length; i++) {
    const lower = lines[i].toLowerCase();
    if (keywords.some(k => lower.includes(k)) && lines[i].length < 40) {
      return i;
    }
  }
  return -1;
}

function isSectionHeader(line: string): boolean {
  const keywords = ['education', 'experience', 'skills', 'contact', 'summary', 'objective', 'projects', 'languages', 'certifications', 'awards', 'references', 'hobbies', 'interests'];
  const lower = line.toLowerCase().replace(/[:\s]/g, '');
  return keywords.some(k => lower === k || lower === k + 's');
}
