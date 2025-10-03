import { config } from 'dotenv';
config();

import '@/ai/flows/validate-and-correct-participant-names.ts';
import '@/ai/flows/send-certificate-emails.ts';
