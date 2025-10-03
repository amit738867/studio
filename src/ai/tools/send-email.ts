'use server';
/**
 * @fileoverview A Genkit tool for sending emails using the Resend API.
 * This tool is designed to be used within Genkit flows to add email capabilities.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { Resend } from 'resend';

const SendEmailSchema = z.object({
  to: z.string().email().describe('The recipient email address.'),
  from: z.string().email().describe('The sender email address.'),
  subject: z.string().describe('The subject line of the email.'),
  html: z.string().describe('The HTML body of the email.'),
});

/**
 * A Genkit tool that sends an email using the Resend API.
 * It requires the RESEND_API_KEY environment variable to be set.
 */
export const sendEmailTool = ai.defineTool(
  {
    name: 'sendEmailTool',
    description: 'Sends an email to a specified recipient.',
    inputSchema: SendEmailSchema,
    outputSchema: z.object({
      id: z.string().optional().describe('The ID of the sent email.'),
      error: z.string().optional().describe('Error message if sending failed.'),
    }),
  },
  async (input) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      const errorMsg = 'RESEND_API_KEY environment variable is not set.';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    const resend = new Resend(apiKey);

    try {
      const { data, error } = await resend.emails.send({
        from: input.from,
        to: input.to,
        subject: input.subject,
        html: input.html,
      });

      if (error) {
        console.error('Resend API Error:', error);
        return { error: error.message };
      }

      console.log('Email sent successfully, ID:', data?.id);
      return { id: data?.id };
    } catch (e: any) {
      console.error('Failed to send email:', e);
      return { error: e.message || 'An unknown error occurred while sending the email.' };
    }
  }
);
