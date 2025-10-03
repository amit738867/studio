import { NextRequest } from 'next/server';
import { sendEmailTool } from '@/ai/tools/send-email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { participantName, courseName, verificationLink, recipientEmail } = body;

    // Use the existing sendEmailTool which uses Nodemailer
    const result = await sendEmailTool({
      to: recipientEmail,
      from: process.env.GMAIL_USER || 'noreply@example.com',
      subject: `Congratulations, ${participantName}! Here is your certificate.`,
      participantName: participantName,
      courseName: courseName,
      verificationLink: verificationLink,
    });

    if (result.error) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json({ messageId: result.messageId });
  } catch (error) {
    console.error('API Route Error:', error);
    return Response.json({ error: 'Failed to send email' }, { status: 500 });
  }
}