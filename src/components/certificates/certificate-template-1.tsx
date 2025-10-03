'use client';

import { Award } from 'lucide-react';

export interface CertificateTemplateProps {
  participantName: string;
  courseName: string;
  date?: string;
  issuer?: string;
  title?: string;
  subtitle?: string;
  body?: string;
}

export function CertificateTemplate({
  participantName,
  courseName,
  date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  issuer = 'CertifyAI',
  title = 'Certificate of Completion',
  subtitle = 'This certifies that',
  body = 'has successfully completed the course',
}: CertificateTemplateProps) {
  return (
    <div className="aspect-[1.414/1] w-full bg-background text-foreground rounded-lg border shadow-2xl flex items-center justify-center p-8">
      <svg width="100%" height="100%" viewBox="0 0 800 566" className="font-body">
        {/* Ornate Border */}
        <rect x="10" y="10" width="780" height="546" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
        <rect x="15" y="15" width="770" height="536" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
        <rect x="30" y="30" width="740" height="506" fill="none" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="5,5" />

        {/* Foreign object for Award icon */}
        <foreignObject x="360" y="50" width="80" height="80">
          <div className="flex items-center justify-center h-full w-full">
            <Award className="w-20 h-20 text-primary" strokeWidth={1.5} />
          </div>
        </foreignObject>

        <text x="50%" y="170" textAnchor="middle" className="text-xl font-semibold uppercase tracking-widest fill-muted-foreground">
          {title}
        </text>

        <text x="50%" y="220" textAnchor="middle" className="text-lg fill-foreground">
          {subtitle}
        </text>

        <text x="50%" y="290" textAnchor="middle" className="text-6xl font-headline font-bold tracking-tight fill-primary-foreground">
          {participantName}
        </text>

        <text x="50%" y="350" textAnchor="middle" className="text-lg fill-foreground">
          {body}
        </text>

        <text x="50%" y="410" textAnchor="middle" className="text-4xl font-semibold fill-primary-foreground">
          {courseName}
        </text>

        {/* Signature and Date Lines */}
        <line x1="150" y1="480" x2="350" y2="480" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <text x="250" y="500" textAnchor="middle" className="text-sm fill-muted-foreground">
          {issuer}
        </text>

        <line x1="450" y1="480" x2="650" y2="480" stroke="hsl(var(--muted-foreground))" strokeWidth="1" />
        <text x="550" y="500" textAnchor="middle" className="text-sm fill-muted-foreground">
          Date
        </text>

        <text x="550" y="475" textAnchor="middle" className="text-base font-semibold fill-foreground">
          {date}
        </text>
      </svg>
    </div>
  );
}
