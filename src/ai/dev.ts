import { config } from 'dotenv';
config();

import '@/ai/flows/photo-object-detection.ts';
import '@/ai/flows/pdf-summary.ts';
import '@/ai/flows/pdf-text-to-speech.ts';