// src/ai/flows/pdf-text-to-speech.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for converting PDF content to speech.
 *
 * - pdfTextToSpeech: A function that takes a PDF data URI and converts the text content to speech.
 * - PdfTextToSpeechInput: The input type for the pdfTextToSpeech function.
 * - PdfTextToSpeechOutput: The output type for the pdfTextToSpeech function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PdfTextToSpeechInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      'A PDF file as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
});
export type PdfTextToSpeechInput = z.infer<typeof PdfTextToSpeechInputSchema>;

const PdfTextToSpeechOutputSchema = z.object({
  speechText: z.string().describe('The extracted text content from the PDF for text-to-speech conversion.'),
});
export type PdfTextToSpeechOutput = z.infer<typeof PdfTextToSpeechOutputSchema>;

export async function pdfTextToSpeech(input: PdfTextToSpeechInput): Promise<PdfTextToSpeechOutput> {
  return pdfTextToSpeechFlow(input);
}

const pdfToTextPrompt = ai.definePrompt({
  name: 'pdfToTextPrompt',
  input: {schema: PdfTextToSpeechInputSchema},
  output: {schema: PdfTextToSpeechOutputSchema},
  prompt: `You are an AI assistant specialized in extracting text from PDF documents for text-to-speech conversion.

  Extract all the text content from the following PDF document.

  PDF Content: {{media url=pdfDataUri}}`,
});

const pdfTextToSpeechFlow = ai.defineFlow(
  {
    name: 'pdfTextToSpeechFlow',
    inputSchema: PdfTextToSpeechInputSchema,
    outputSchema: PdfTextToSpeechOutputSchema,
  },
  async input => {
    const {output} = await pdfToTextPrompt(input);
    return output!;
  }
);
