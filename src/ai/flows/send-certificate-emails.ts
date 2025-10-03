'use server';
/**
 * @fileOverview A flow to send certificate emails to participants.
 *
 * - sendCertificateEmails - Sends certificate emails to a list of participants.
 * - SendCertificateEmailsInput - The input type for the sendCertificateEmails function.
 * - SendCertificateEmailsOutput - The return type for the sendCertificateEmails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { sendEmailTool } from '@/ai/tools/send-email';
import { generateAndStoreCertificate } from '@/services/certificate-service';

// Define the participant data structure
const ParticipantSchema = z.object({
  id: z.string().describe('The ID of the participant.'),
  name: z.string().describe('The name of the participant.'),
  email: z.string().email().describe('The email of the participant.'),
});

const SendCertificateEmailsInputSchema = z.object({
  campaignId: z.string().describe('The ID of the campaign.'),
  campaignName: z.string().describe('The name of the campaign.'),
  userId: z.string().describe('The ID of the user who owns the campaign.'),
  participants: z.array(ParticipantSchema).describe('An array of participants to send certificates to.'),
  domain: z.string().describe('The domain of the application to construct verification links.'),
});
export type SendCertificateEmailsInput = z.infer<typeof SendCertificateEmailsInputSchema>;

const SendCertificateEmailsOutputSchema = z.object({
  success: z.boolean().describe('Whether the emails were sent successfully.'),
  sentCount: z.number().describe('The number of emails sent.'),
  failedCount: z.number().describe('The number of emails that failed to send.'),
  error: z.string().optional().describe('Any error that occurred during the process.'),
});
export type SendCertificateEmailsOutput = z.infer<typeof SendCertificateEmailsOutputSchema>;

export async function sendCertificateEmails(
  input: SendCertificateEmailsInput
): Promise<SendCertificateEmailsOutput> {
  return sendCertificateEmailsFlow(input);
}

const sendCertificateEmailsFlow = ai.defineFlow(
  {
    name: 'sendCertificateEmailsFlow',
    inputSchema: SendCertificateEmailsInputSchema,
    outputSchema: SendCertificateEmailsOutputSchema,
  },
  async (input) => {
    console.log(`Starting to send emails for campaign: ${input.campaignId}`);
    console.log('Participants to send emails to:', input.participants);
    
    let sentCount = 0;
    let failedCount = 0;
    // Using Gmail sender address
    const fromAddress = process.env.GMAIL_USER || 'noreply@example.com';

    for (const participant of input.participants) {
      try {
        console.log(`Processing certificate for participant: ${participant.name} (${participant.email})`);
        
        // Generate unique certificate ID
        const certificateId = `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Generate and store certificate with QR code
        const certificateResult = await generateAndStoreCertificate({
          id: certificateId,
          participantName: participant.name,
          courseName: input.campaignName,
          issueDate: new Date().toISOString(),
          issuer: 'Pramaan',
          campaignId: input.campaignId,
          userId: input.userId,
          verificationLink: `https://${input.domain}/verify/${input.campaignId}-${participant.id}`,
          domain: input.domain // Pass the domain to the certificate service
        });

        if (!certificateResult.success) {
          throw new Error(`Failed to generate certificate: ${certificateResult.error}`);
        }

        console.log(`Certificate generated successfully for ${participant.name} with ID: ${certificateResult.certificateId}`);
        
        // Construct email subject
        const subject = `Congratulations, ${participant.name}! Here is your certificate.`;
        
        // Send the email using the tool with React template
        const emailResult = await sendEmailTool({
          to: participant.email,
          from: fromAddress,
          subject: subject,
          participantName: participant.name,
          courseName: input.campaignName,
          verificationLink: certificateResult.certificateUrl,
        });

        if (emailResult.error) {
            throw new Error(emailResult.error);
        }

        sentCount++;
        console.log(`Successfully sent email to ${participant.email}`);
      } catch (e: any) {
        failedCount++;
        console.error(`Failed to send email for participant ${participant.id}:`, e.message);
      }
    }

    console.log(`Finished sending emails. Sent: ${sentCount}, Failed: ${failedCount}.`);
    
    return {
      success: failedCount === 0,
      sentCount: sentCount,
      failedCount: failedCount,
      error: failedCount > 0 ? `Failed to send ${failedCount} email(s). Check server logs for details.` : undefined,
    };
  }
);