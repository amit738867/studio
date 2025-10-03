'use server';
/**
 * @fileoverview A Genkit tool for sending emails using Nodemailer with Gmail SMTP.
 * This tool is designed to be used within Genkit flows to add email capabilities.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import nodemailer from 'nodemailer';

const SendEmailSchema = z.object({
  to: z.string().email().describe('The recipient email address.'),
  from: z.string().email().describe('The sender email address.'),
  subject: z.string().describe('The subject line of the email.'),
  html: z.string().optional().describe('The HTML body of the email.'),
  participantName: z.string().optional().describe('Participant name for the certificate email.'),
  courseName: z.string().optional().describe('Course name for the certificate email.'),
  verificationLink: z.string().optional().describe('Verification link for the certificate.'),
});

/**
 * A Genkit tool that sends an email using Nodemailer with Gmail SMTP.
 * It requires the GMAIL_USER and GMAIL_APP_PASSWORD environment variables to be set.
 */
export const sendEmailTool = ai.defineTool(
  {
    name: 'sendEmailTool',
    description: 'Sends an email to a specified recipient using Gmail SMTP.',
    inputSchema: SendEmailSchema,
    outputSchema: z.object({
      messageId: z.string().optional().describe('The ID of the sent email.'),
      error: z.string().optional().describe('Error message if sending failed.'),
    }),
  },
  async (input) => {
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    
    if (!gmailUser || !gmailAppPassword) {
      const errorMsg = 'GMAIL_USER and GMAIL_APP_PASSWORD environment variables must be set.';
      console.error(errorMsg);
      return { error: errorMsg };
    }

    try {
      // Create transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
      });

      // Verify transporter
      await transporter.verify();
      console.log('Gmail SMTP connection verified');

      // Prepare email content
      let htmlContent = input.html;
      
      // Use React template if we have the required data
      if (input.participantName && input.courseName && input.verificationLink) {
        htmlContent = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1 style="color: #2563eb;">Congratulations, ${input.participantName}!</h1>
            <p>You have received a certificate for your participation in <strong>${input.courseName}</strong>.</p>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #2563eb;">
              <h3 style="margin-top: 0; color: #2563eb;">Certificate Details</h3>
              <p><strong>Participant:</strong> ${input.participantName}</p>
              <p><strong>Course:</strong> ${input.courseName}</p>
              <p><strong>Issued by:</strong> Pramaan</p>
            </div>
            
            <p>You can view and download your certificate by clicking the button below:</p>
            <div style="margin: 20px 0;">
              <a 
                href="${input.verificationLink}" 
                style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;"
              >
                View Certificate
              </a>
            </div>
            
            <div style="margin: 30px 0; padding: 15px; background-color: #fff7ed; border-radius: 8px; border-left: 4px solid #f97316;">
              <h3 style="margin-top: 0; color: #ea580c;">Verification</h3>
              <p>Your certificate includes a unique QR code for easy verification. You can scan the QR code on the certificate or visit the verification link to confirm its authenticity.</p>
              <p><strong>Verification Link:</strong> <a href="${input.verificationLink}" style="color: #2563eb;">${input.verificationLink}</a></p>
            </div>
            
            <hr style="margin: 30px 0; border-color: #e5e7eb;" />
            <p>
              Best regards,<br />
              <strong>Pramaan</strong><br />
              ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        `;
      } else if (!htmlContent) {
        // Default to plain text
        htmlContent = '<p>This is a certificate email from Pramaan.</p>';
      }

      // Send email
      const mailOptions = {
        from: input.from,
        to: input.to,
        subject: input.subject,
        html: htmlContent,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully, Message ID:', info.messageId);
      
      return { messageId: info.messageId };
    } catch (e: any) {
      console.error('Failed to send email:', e);
      return { error: e.message || 'An unknown error occurred while sending the email.' };
    }
  }
);