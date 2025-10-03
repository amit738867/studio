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
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, App, deleteApp } from 'firebase-admin/app';

const SendCertificateEmailsInputSchema = z.object({
  campaignId: z.string().describe('The ID of the campaign.'),
  userId: z.string().describe('The ID of the user who owns the campaign.'),
  participantIds: z.array(z.string()).describe('An array of participant IDs to send certificates to.'),
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
    tools: [sendEmailTool],
  },
  async (input) => {
    // Initialize Firebase Admin SDK within the flow
    let adminApp: App;
    if (!getApps().length) {
      adminApp = initializeApp();
    } else {
      adminApp = getApps()[0];
    }
    const db = getFirestore(adminApp);
    
    console.log(`Starting to send emails for campaign: ${input.campaignId}`);
    
    let sentCount = 0;
    let failedCount = 0;
    // IMPORTANT: You must use a verified domain in Resend for the 'from' address.
    // Replace this with your own verified sender email.
    const fromAddress = 'noreply@certifyai.pro';

    const campaignRef = db.collection('users').doc(input.userId).collection('campaigns').doc(input.campaignId);
    
    for (const participantId of input.participantIds) {
      try {
        const participantRef = campaignRef.collection('participants').doc(participantId);
        const participantDoc = await participantRef.get();

        if (!participantDoc.exists) {
          console.warn(`Participant with ID ${participantId} not found. Skipping.`);
          failedCount++;
          continue;
        }
        const participant = participantDoc.data()!;
        
        // Generate unique certificate link
        const certificateId = `${input.campaignId}-${participantId}`;
        const verificationLink = `https://${input.domain}/verify/${certificateId}`;
        
        // Construct email body
        const subject = `Congratulations, ${participant.name}! Here is your certificate.`;
        const body = `
          <p>Hello ${participant.name},</p>
          <p>Congratulations! You have received a certificate for your participation in our event.</p>
          <p>You can view and download your certificate by clicking the link below:</p>
          <p><a href="${verificationLink}">${verificationLink}</a></p>
          <p>Best regards,<br/>The CertifyAI Team</p>
        `;
        
        // Send the email using the tool
        const emailResult = await sendEmailTool({
          to: participant.email,
          from: fromAddress,
          subject: subject,
          html: body,
        });

        if (emailResult.error) {
            throw new Error(emailResult.error);
        }

        // Update the DeliveryStatus in Firestore
        const deliveryRef = campaignRef.collection('deliveries').doc(participantId);
        await deliveryRef.set({
            campaignId: input.campaignId,
            participantId: participantId,
            status: 'sent',
            lastUpdated: new Date().toISOString(),
        }, { merge: true });

        sentCount++;
        console.log(`Successfully sent email to ${participant.email}`);
      } catch (e: any) {
        failedCount++;
        console.error(`Failed to send email for participant ${participantId}:`, e.message);

        // Optionally, log the failure to Firestore
         const deliveryRef = campaignRef.collection('deliveries').doc(participantId);
         await deliveryRef.set({
            campaignId: input.campaignId,
            participantId: participantId,
            status: 'failed',
            lastUpdated: new Date().toISOString(),
            deliveryDetails: JSON.stringify({ error: e.message }),
        }, { merge: true });
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
