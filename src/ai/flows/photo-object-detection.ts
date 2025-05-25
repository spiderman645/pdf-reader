// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Identifies objects present in an uploaded photo.
 *
 * - photoObjectDetection - A function that handles the object detection process.
 * - PhotoObjectDetectionInput - The input type for the photoObjectDetection function.
 * - PhotoObjectDetectionOutput - The return type for the photoObjectDetection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PhotoObjectDetectionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type PhotoObjectDetectionInput = z.infer<typeof PhotoObjectDetectionInputSchema>;

const PhotoObjectDetectionOutputSchema = z.object({
  objects: z
    .array(z.string())
    .describe('A list of objects identified in the photo.'),
});
export type PhotoObjectDetectionOutput = z.infer<typeof PhotoObjectDetectionOutputSchema>;

export async function photoObjectDetection(
  input: PhotoObjectDetectionInput
): Promise<PhotoObjectDetectionOutput> {
  return photoObjectDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'photoObjectDetectionPrompt',
  input: {schema: PhotoObjectDetectionInputSchema},
  output: {schema: PhotoObjectDetectionOutputSchema},
  prompt: `You are an expert AI object detection specialist.

You will analyze the photo provided and identify the objects present in the image.

Photo: {{media url=photoDataUri}}

List the objects identified in the photo:
`,
});

const photoObjectDetectionFlow = ai.defineFlow(
  {
    name: 'photoObjectDetectionFlow',
    inputSchema: PhotoObjectDetectionInputSchema,
    outputSchema: PhotoObjectDetectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
