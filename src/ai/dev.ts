import { config } from 'dotenv';
config({ path: '.env.local' });
config();

import '@/ai/flows/validate-and-correct-participant-names.ts';
import '@/ai/flows/send-certificate-emails.ts';
import '@/ai/tools/send-email.ts';
