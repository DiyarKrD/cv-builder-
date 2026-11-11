import { useState } from 'react';
import { CVProvider, useCV } from '@/hooks/useCV';
import { Toolbar } from '@/components/Toolbar';
import { TemplatesPanel } from '@/components/TemplatesPanel';
import { CustomizePanel } from '@/components/CustomizePanel';
import { ContentPanel } from '@/components/ContentPanel';
import { AIPanel } from '@/components/AIPanel';
import { CVPreview } from '@/components/CVPreview';
import { ImportDialog } from '@/components/ImportDialog';
import './App.css';

function Builder() {
  const { activePanel } = useCV();
  const [importOpen, setImportOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <Toolbar onImportClick={() => setImportOpen(true)} />

      {/* Panels */}
      <div className="no-print">
        {activePanel === 'templates' && <TemplatesPanel />}
        {activePanel === 'customize' && <CustomizePanel />}
        {activePanel === 'content' && <ContentPanel />}
        {activePanel === 'ai' && <AIPanel />}
      </div>

      {/* CV Preview */}
      <div className="flex justify-center py-8 px-4">
        <CVPreview />
      </div>

      {/* Import Dialog */}
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}

function App() {
  return (
    <CVProvider>
      <Builder />
    </CVProvider>
  );
}

export default App;
