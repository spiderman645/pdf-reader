import { PhotoAnalyzerClient } from '@/components/photo-analyzer-client';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PhotoAnalyzerPage() {
  return (
    <div className="container mx-auto py-8">
       <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Photo Analyzer</CardTitle>
          <CardDescription className="text-lg">
            Upload your photos to identify objects, scenes, and text within them using AI.
          </CardDescription>
        </CardHeader>
      </Card>
      <PhotoAnalyzerClient />
    </div>
  );
}
