'use server';

/**
 * @fileOverview A PDF summarization AI agent.
 *
 * - pdfSummary - A function that handles the PDF summarization process.
 * - PdfSummaryInput - The input type for the pdfSummary function.
 * - PdfSummaryOutput - The return type for the pdfSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PdfSummaryInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      'A PDF file as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type PdfSummaryInput = z.infer<typeof PdfSummaryInputSchema>;

const PdfSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the PDF content.'),
});
export type PdfSummaryOutput = z.infer<typeof PdfSummaryOutputSchema>;

export async function pdfSummary(input: PdfSummaryInput): Promise<PdfSummaryOutput> {
  return pdfSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pdfSummaryPrompt',
  input: {schema: PdfSummaryInputSchema},
  output: {schema: PdfSummaryOutputSchema},
  prompt: `You are an expert summarizer.

You will be provided with the content of a PDF document.
Your task is to create a concise summary of the document's main points.

Use the following PDF content:

{{media url=pdfDataUri}}`,
});

const pdfSummaryFlow = ai.defineFlow(
  {
    name: 'pdfSummaryFlow',
    inputSchema: PdfSummaryInputSchema,
    outputSchema: PdfSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
