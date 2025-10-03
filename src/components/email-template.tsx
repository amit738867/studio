import * as React from 'react';

interface EmailTemplateProps {
  participantName: string;
  courseName: string;
  verificationLink: string;
  date?: string;
  issuer?: string;
}

export function EmailTemplate({ 
  participantName, 
  courseName, 
  verificationLink,
  date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  issuer = 'Pramaan'
}: EmailTemplateProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: 1.6, color: '#333' }}>
      <h1 style={{ color: '#2563eb' }}>Congratulations, {participantName}!</h1>
      <p>You have received a certificate for your participation in <strong>{courseName}</strong>.</p>
      <p>You can view and download your certificate by clicking the button below:</p>
      <div style={{ margin: '20px 0' }}>
        <a 
          href={verificationLink} 
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}
        >
          View Certificate
        </a>
      </div>
      <p>
        If the button doesn't work, you can also copy and paste this link into your browser:<br />
        <span style={{ color: '#2563eb' }}>{verificationLink}</span>
      </p>
      <hr style={{ margin: '30px 0', borderColor: '#e5e7eb' }} />
      <p>
        Best regards,<br />
        <strong>{issuer}</strong><br />
        {date}
      </p>
    </div>
  );
}