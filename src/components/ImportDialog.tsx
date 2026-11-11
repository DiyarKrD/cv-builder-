
import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { useCV } from '@/hooks/useCV';
import { Upload, FileText, Loader2, Check } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import type { CVData } from '@/types/cv';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ImportStatus = 'idle' | 'loading' | 'success' | 'error';

type ParsedCV = Partial<CVData>;

export function ImportDialog({
  open,
  onOpenChange,
}: ImportDialogProps) {
  const { cvData, setCVData } = useCV();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<ImportStatus>('idle');
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');

  const resetState = () => {
    setStatus('idle');
    setError('');
    setFileName('');
    setDragging(false);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetState();
    }

    onOpenChange(nextOpen);
  };

  const applyParsed = (parsed: ParsedCV) => {
    setCVData({
      ...cvData,
      ...parsed,

      personal: {
        ...(cvData.personal ?? {}),
        ...(parsed.personal ?? {}),
        photo: cvData.personal?.photo ?? '',
      },

      contact: {
        ...(cvData.contact ?? {}),
        ...(parsed.contact ?? {}),
      },

      education: parsed.education ?? cvData.education,
      experience: parsed.experience ?? cvData.experience,
      skills: parsed.skills ?? cvData.skills,

      professionalSummary:
        parsed.professionalSummary ?? cvData.professionalSummary,

      sections: parsed.sections ?? cvData.sections,
    });

    setStatus('success');
  };

  const extractCVDataFromText = (text: string): ParsedCV => {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const fullText = lines.join('\n');

    const email =
      fullText.match(
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
      )?.[0] ?? '';

    const phone =
      fullText.match(
        /(?:\+?\d[\d\s().-]{7,}\d)/,
      )?.[0]?.trim() ?? '';

    const name = lines.find((line) => {
      const hasLetters = /[a-zA-Z]/.test(line);
      const isNotEmail = !line.includes('@');
      const isNotPhone = !/^\+?[\d\s().-]+$/.test(line);
      const isShort = line.length <= 60;

      return hasLetters && isNotEmail && isNotPhone && isShort;
    }) ?? '';

    const skillsHeading = /^(skills|technical skills|core competencies)$/i;
    const educationHeading = /^(education|academic background)$/i;
    const experienceHeading =
      /^(experience|work experience|employment history|professional experience)$/i;
    const summaryHeading =
      /^(summary|professional summary|profile|objective)$/i;

    const getSection = (
      headingPattern: RegExp,
    ): string[] => {
      const headingIndex = lines.findIndex((line) =>
        headingPattern.test(line),
      );

      if (headingIndex === -1) return [];

      const nextHeading = lines.findIndex(
        (line, index) =>
          index > headingIndex &&
          (
            skillsHeading.test(line) ||
            educationHeading.test(line) ||
            experienceHeading.test(line) ||
            summaryHeading.test(line)
          ),
      );

      const endIndex =
        nextHeading === -1 ? lines.length : nextHeading;

      return lines.slice(headingIndex + 1, endIndex);
    };

    const skills = getSection(skillsHeading)
      .join(' ')
      .split(/[,;•|]/)
      .map((skill) => skill.trim())
      .filter(Boolean);

    const education = getSection(educationHeading).join('\n');
    const experience = getSection(experienceHeading).join('\n');
    const summary = getSection(summaryHeading).join(' ');

    const location =
      lines.find((line) =>
        /\b(city|country|iraq|erbil|kurdistan)\b/i.test(line),
      ) ?? '';

    return {
      personal: {
        ...(cvData.personal ?? {}),
        fullName: name || cvData.personal.fullName,
      },

      contact: {
        ...(cvData.contact ?? {}),
        email,
        phone,
        location,
      },

      skills: skills.length > 0 ? skills : undefined,

      professionalSummary: summary || undefined,

      education:
        education.length > 0
          ? [
              {
                id: `${Date.now()}-import-edu`,
                degree: education.split('\n')[0] ?? '',
                university: education.split('\n').slice(1).join('\n'),
                year: '',
              },
            ]
          : undefined,

      experience:
        experience.length > 0
          ? [
              {
                id: `${Date.now()}-import-exp`,
                title: '',
                company: '',
                period: '',
                description: experience,
              },
            ]
          : undefined,
    };
  };

  const parsePDF = async (file: File): Promise<string> => {
    const pdfjs = await import('pdfjs-dist');

    try {
      const workerUrl = await import(
        'pdfjs-dist/build/pdf.worker.min.mjs?url'
      );

      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl.default;
    } catch {
      // Fallback for environments where Vite cannot resolve the worker URL.
      pdfjs.GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
    }

    const buffer = await file.arrayBuffer();

    const pdf = await pdfjs.getDocument({
      data: new Uint8Array(buffer),
    }).promise;

    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();

      const pageText = content.items
        .map((item) => {
          if ('str' in item) return item.str;
          return '';
        })
        .join(' ');

      pages.push(pageText);
    }

    return pages.join('\n');
  };

  const processFile = async (file: File) => {
    resetState();

    if (!file) return;

    const isPDF =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    const isText =
      file.type === 'text/plain' ||
      file.name.toLowerCase().endsWith('.txt');

    if (!isPDF && !isText) {
      setStatus('error');
      setError('Please upload a PDF or TXT file.');
      return;
    }

    setFileName(file.name);
    setStatus('loading');

    try {
      let extractedText = '';

      if (isPDF) {
        extractedText = await parsePDF(file);
      } else {
        extractedText = await file.text();
      }

      if (!extractedText.trim()) {
        throw new Error(
          'No readable text was found. Your PDF may contain scanned images.',
        );
      }

      const parsedData = extractCVDataFromText(extractedText);

      applyParsed(parsedData);
    } catch (err) {
      console.error('CV import failed:', err);

      setStatus('error');

      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while importing your CV.',
      );
    }
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      void processFile(file);
    }

    // Allows selecting the same file again.
    event.target.value = '';
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      void processFile(file);
    }
  };

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    setDragging(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Import your CV
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              Upload File
            </TabsTrigger>

            <TabsTrigger value="instructions">
              Instructions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4 pt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              className="hidden"
              onChange={handleFileChange}
            />

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' ||
                  event.key === ' '
                ) {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className={`
                flex min-h-[190px] cursor-pointer flex-col
                items-center justify-center rounded-xl border-2
                border-dashed p-6 text-center transition-colors
                ${
                  dragging
                    ? 'border-primary bg-primary/10'
                    : 'border-muted-foreground/30 hover:border-primary'
                }
              `}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="mb-3 h-10 w-10 animate-spin text-primary" />
                  <p className="font-medium">
                    Processing your CV...
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {fileName}
                  </p>
                </>
              ) : status === 'success' ? (
                <>
                  <Check className="mb-3 h-10 w-10 text-green-500" />
                  <p className="font-medium">
                    CV imported successfully!
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your extracted information has been added.
                  </p>
                </>
              ) : (
                <>
                  <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="font-medium">
                    Drop your CV here or click to browse
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Supports PDF and TXT files
                  </p>
                </>
              )}
            </div>

            {status === 'error' && (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            {status === 'success' && (
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="w-full rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
              >
                Done
              </button>
            )}
          </TabsContent>

          <TabsContent value="instructions" className="pt-4">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Upload an existing CV to extract information
                and populate your CV builder.
              </p>

              <p>
                For best results, use a text-based PDF rather
                than a scanned document.
              </p>

              <p>
                After importing, review your details and
                correct any information that was not extracted
                accurately.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
