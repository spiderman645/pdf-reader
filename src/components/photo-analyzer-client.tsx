"use client";

import type { ChangeEvent } from 'react';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Terminal, Loader2, ScanSearch, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { readFileAsDataURI } from "@/lib/file-utils";
import { photoObjectDetection, type PhotoObjectDetectionOutput } from "@/ai/flows/photo-object-detection";

export function PhotoAnalyzerClient() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PhotoObjectDetectionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (!selectedFile.type.startsWith("image/")) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload an image file (e.g., JPG, PNG, GIF).",
        });
        setFile(null);
        setPreviewUrl(null);
        event.target.value = ""; 
        return;
      }
      setFile(selectedFile);
      setAnalysisResult(null);
      setError(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No File Selected",
        description: "Please select an image file to analyze.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const photoDataUri = await readFileAsDataURI(file);
      const result = await photoObjectDetection({ photoDataUri });
      setAnalysisResult(result);
      toast({
        title: "Analysis Complete",
        description: "Photo analyzed successfully.",
      });
    } catch (err) {
      console.error("Error analyzing photo:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Upload Photo</CardTitle>
          <CardDescription>Select an image file to identify objects.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-2">
            <Label htmlFor="photo-file" className="sr-only">Upload Photo</Label>
            <Input id="photo-file" type="file" accept="image/*" onChange={handleFileChange} className="cursor-pointer file:text-primary file:font-semibold" />
          </div>
          {previewUrl && (
            <div className="mt-4 relative w-full max-w-md h-64 rounded-md overflow-hidden border border-border">
              <Image src={previewUrl} alt="Selected preview" layout="fill" objectFit="contain" data-ai-hint="uploaded image" />
            </div>
          )}
          {file && <p className="mt-2 text-sm text-muted-foreground">Selected: {file.name}</p>}
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isLoading || !file} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <ScanSearch className="mr-2 h-4 w-4" />
                Analyze Photo
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {isLoading && (
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Analyzing your photo, please wait...</p>
          <Progress value={undefined} className="w-full max-w-md h-2 mt-2 animate-pulse" />
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="shadow-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysisResult && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Identified Objects</CardTitle>
          </CardHeader>
          <CardContent>
            {analysisResult.objects.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analysisResult.objects.map((obj, index) => (
                  <Badge key={index} variant="secondary" className="text-sm px-3 py-1">{obj}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No objects identified or the AI could not determine them.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
