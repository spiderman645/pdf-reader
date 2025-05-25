import { PdfStudioClient } from '@/components/pdf-studio-client';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpenCheck } from 'lucide-react';

export default function PdfStudioPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <BookOpenCheck className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl font-bold">PDF Studio</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Upload a PDF to generate summaries, extract text, and listen to content with text-to-speech.
          </CardDescription>
        </CardHeader>
      </Card>
      <PdfStudioClient />
    </div>
  );
}
