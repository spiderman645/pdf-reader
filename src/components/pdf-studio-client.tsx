
"use client";

import type { ChangeEvent } from 'react';
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Loader2, Volume2, Play, Pause, Square, BookOpenText, FileText, Newspaper, AudioLines } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { readFileAsDataURI } from "@/lib/file-utils";
import { pdfSummary, type PdfSummaryOutput } from "@/ai/flows/pdf-summary";
import { pdfTextToSpeech, type PdfTextToSpeechOutput } from "@/ai/flows/pdf-text-to-speech";

export function PdfStudioClient() {
  const [file, setFile] = useState<File | null>(null);
  
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryResult, setSummaryResult] = useState<PdfSummaryOutput | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  
  const { toast } = useToast();

  // State for full PDF text-to-speech
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // State for summary text-to-speech
  const [isSpeakingSummary, setIsSpeakingSummary] = useState(false);
  const [isPausedSummary, setIsPausedSummary] = useState(false);
  const summaryUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      setIsBrowserSupported(false);
      toast({
        variant: "destructive",
        title: "Unsupported Browser",
        description: "Text-to-speech is not supported in this browser.",
      });
    }
    
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [toast]);

  const stopAllSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    utteranceRef.current = null;
    setIsSpeakingSummary(false);
    setIsPausedSummary(false);
    summaryUtteranceRef.current = null;
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a PDF file.",
        });
        setFile(null);
        event.target.value = ""; 
        return;
      }
      setFile(selectedFile);
      setSummaryResult(null);
      setSummaryError(null);
      setExtractedText(null);
      setTtsError(null);
      stopAllSpeech();
    }
  };

  const handleGetSummary = async () => {
    if (!file) {
      toast({ variant: "destructive", title: "No File Selected", description: "Please select a PDF file." });
      return;
    }
    setIsLoadingSummary(true);
    setSummaryError(null);
    setSummaryResult(null);
    stopAllSpeech(); // Stop any ongoing speech before generating new summary
    try {
      const pdfDataUri = await readFileAsDataURI(file);
      const result = await pdfSummary({ pdfDataUri });
      setSummaryResult(result);
      toast({ title: "Summary Generated", description: "PDF summary generated successfully." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An unknown error occurred during summary generation.";
      setSummaryError(msg);
      toast({ variant: "destructive", title: "Summary Failed", description: msg });
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handlePrepareForReading = async () => {
    if (!file) {
      toast({ variant: "destructive", title: "No File Selected", description: "Please select a PDF file." });
      return;
    }
    setIsLoadingTTS(true);
    setTtsError(null);
    setExtractedText(null);
    stopAllSpeech(); // Stop any ongoing speech before preparing new audio
    try {
      const pdfDataUri = await readFileAsDataURI(file);
      const result: PdfTextToSpeechOutput = await pdfTextToSpeech({ pdfDataUri });
      setExtractedText(result.speechText);
      toast({ title: "Text Extracted", description: "PDF text ready for playback." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An unknown error occurred during text extraction.";
      setTtsError(msg);
      toast({ variant: "destructive", title: "Text Extraction Failed", description: msg });
    } finally {
      setIsLoadingTTS(false);
    }
  };

  // Handlers for full PDF text
  const handlePlay = () => {
    if (!extractedText || !window.speechSynthesis || !isBrowserSupported) return;
    if (isSpeakingSummary || isPausedSummary) stopSummarySpeech(); // Stop summary speech if playing

    if (isPaused && utteranceRef.current) {
      window.speechSynthesis.resume();
      setIsSpeaking(true);
      setIsPaused(false);
    } else {
      utteranceRef.current = new SpeechSynthesisUtterance(extractedText);
      utteranceRef.current.onstart = () => { setIsSpeaking(true); setIsPaused(false); };
      utteranceRef.current.onend = () => { setIsSpeaking(false); setIsPaused(false); utteranceRef.current = null; };
      utteranceRef.current.onerror = (event) => {
        toast({ variant: "destructive", title: "Speech Error", description: `Could not play audio: ${event.error}`});
        setIsSpeaking(false); setIsPaused(false);
      };
      window.speechSynthesis.speak(utteranceRef.current);
    }
  };

  const handlePause = () => {
    if (!window.speechSynthesis || !isSpeaking || !isBrowserSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsSpeaking(false);
  };

  const handleStop = () => {
    if (!window.speechSynthesis || !isBrowserSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    utteranceRef.current = null;
  };

  // Handlers for summary text
  const playSummary = () => {
    if (!summaryResult?.summary || !window.speechSynthesis || !isBrowserSupported) return;
    if (isSpeaking || isPaused) handleStop(); // Stop full PDF speech if playing

    if (isPausedSummary && summaryUtteranceRef.current) {
      window.speechSynthesis.resume();
      setIsSpeakingSummary(true);
      setIsPausedSummary(false);
    } else {
      summaryUtteranceRef.current = new SpeechSynthesisUtterance(summaryResult.summary);
      summaryUtteranceRef.current.onstart = () => { setIsSpeakingSummary(true); setIsPausedSummary(false); };
      summaryUtteranceRef.current.onend = () => { setIsSpeakingSummary(false); setIsPausedSummary(false); summaryUtteranceRef.current = null; };
      summaryUtteranceRef.current.onerror = (event) => {
        toast({ variant: "destructive", title: "Speech Error", description: `Could not play summary audio: ${event.error}`});
        setIsSpeakingSummary(false); setIsPausedSummary(false);
      };
      window.speechSynthesis.speak(summaryUtteranceRef.current);
    }
  };

  const pauseSummarySpeech = () => {
    if (!window.speechSynthesis || !isSpeakingSummary || !isBrowserSupported) return;
    window.speechSynthesis.pause();
    setIsPausedSummary(true);
    setIsSpeakingSummary(false);
  };

  const stopSummarySpeech = () => {
    if (!window.speechSynthesis || !isBrowserSupported) return;
    window.speechSynthesis.cancel(); // This will cancel all speech, so reset both states
    setIsSpeaking(false); 
    setIsPaused(false);
    utteranceRef.current = null;
    setIsSpeakingSummary(false);
    setIsPausedSummary(false);
    summaryUtteranceRef.current = null;
  };


  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Upload PDF</CardTitle>
          <CardDescription>Select a PDF file to use with PDF Studio tools.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-2">
            <Label htmlFor="pdf-file" className="sr-only">Upload PDF</Label>
            <Input id="pdf-file" type="file" accept="application/pdf" onChange={handleFileChange} className="cursor-pointer file:text-primary file:font-semibold"/>
          </div>
          {file && <p className="mt-2 text-sm text-muted-foreground">Selected: {file.name}</p>}
        </CardContent>
        {file && (
          <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <Button onClick={handleGetSummary} disabled={isLoadingSummary || isLoadingTTS} className="w-full sm:w-auto">
              {isLoadingSummary ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Summary...</>
              ) : (
                <><Newspaper className="mr-2 h-4 w-4" /> Generate Summary</>
              )}
            </Button>
            <Button onClick={handlePrepareForReading} disabled={isLoadingSummary || isLoadingTTS} className="w-full sm:w-auto">
              {isLoadingTTS ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing Audio...</>
              ) : (
                <><Volume2 className="mr-2 h-4 w-4" /> Prepare for Reading</>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>

      {(isLoadingSummary || isLoadingTTS) && (
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Processing your PDF, please wait...</p>
          <Progress value={undefined} className="w-full max-w-md h-2 mt-2 animate-pulse" />
        </div>
      )}

      {summaryError && (
        <Alert variant="destructive" className="shadow-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Summary Error</AlertTitle>
          <AlertDescription>{summaryError}</AlertDescription>
        </Alert>
      )}

      {summaryResult && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-60 w-full rounded-md border p-4 bg-muted/20 shadow-inner">
                <p className="text-foreground/90 whitespace-pre-wrap">{summaryResult.summary}</p>
            </ScrollArea>
          </CardContent>
          {isBrowserSupported && summaryResult.summary && (
            <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
              {!isSpeakingSummary && !isPausedSummary && (
                <Button onClick={playSummary} disabled={isLoadingSummary || isSpeaking || isPaused} aria-label="Play Summary">
                  <AudioLines className="mr-2 h-4 w-4" /> Play Summary
                </Button>
              )}
              {isSpeakingSummary && !isPausedSummary && (
                <Button onClick={pauseSummarySpeech} disabled={isLoadingSummary} aria-label="Pause Summary">
                  <Pause className="mr-2 h-4 w-4" /> Pause Summary
                </Button>
              )}
              {isPausedSummary && (
                 <Button onClick={playSummary} disabled={isLoadingSummary} aria-label="Resume Summary">
                  <Play className="mr-2 h-4 w-4" /> Resume Summary
                </Button>
              )}
              <Button onClick={stopSummarySpeech} variant="outline" disabled={isLoadingSummary || (!isSpeakingSummary && !isPausedSummary)} aria-label="Stop Summary">
                <Square className="mr-2 h-4 w-4" /> Stop Summary
              </Button>
            </CardFooter>
          )}
        </Card>
      )}

      {ttsError && (
         <Alert variant="destructive" className="shadow-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Text-to-Speech Error</AlertTitle>
          <AlertDescription>{ttsError}</AlertDescription>
        </Alert>
      )}

      {extractedText && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenText className="h-6 w-6 text-primary" />
              Read Full PDF
            </CardTitle>
            {!isBrowserSupported && <AlertDescription className="text-destructive">Text-to-speech is not supported by your browser.</AlertDescription>}
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-72 w-full rounded-md border p-4 bg-muted/20 shadow-inner">
              <p className="text-foreground/90 whitespace-pre-wrap">{extractedText}</p>
            </ScrollArea>
          </CardContent>
          {isBrowserSupported && (
            <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                {!isSpeaking && !isPaused && (
                  <Button onClick={handlePlay} disabled={isLoadingTTS || !extractedText || isSpeakingSummary || isPausedSummary} aria-label="Play Text">
                    <Play className="mr-2 h-4 w-4" /> Play Full Text
                  </Button>
                )}
                {isSpeaking && !isPaused && (
                  <Button onClick={handlePause} disabled={isLoadingTTS} aria-label="Pause Text">
                    <Pause className="mr-2 h-4 w-4" /> Pause Full Text
                  </Button>
                )}
                {isPaused && (
                   <Button onClick={handlePlay} disabled={isLoadingTTS} aria-label="Resume Text">
                    <Play className="mr-2 h-4 w-4" /> Resume Full Text
                  </Button>
                )}
                <Button onClick={handleStop} variant="outline" disabled={isLoadingTTS || (!isSpeaking && !isPaused)} aria-label="Stop Text">
                  <Square className="mr-2 h-4 w-4" /> Stop Full Text
                </Button>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );

    