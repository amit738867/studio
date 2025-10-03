'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CertificateTemplate } from '@/components/certificates/certificate-template-1';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Upload } from 'lucide-react';
import type { CertificateTemplateProps } from '@/components/certificates/certificate-template-1';

export default function TemplateEditorPage() {
  const params = useParams();
  const templateId = params.templateId as string;

  const [templateState, setTemplateState] = useState<CertificateTemplateProps>({
    participantName: 'Jane Doe',
    courseName: 'Advanced AI',
    title: 'Certificate of Completion',
    subtitle: 'This certifies that',
    body: 'has successfully completed the course',
    issuer: 'CertifyAI',
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  });

  const handleContentEditableChange = (field: keyof CertificateTemplateProps, value: string) => {
    setTemplateState(prevState => ({
      ...prevState,
      [field]: value
    }));
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link href="/templates">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Templates
        </Link>
      </Button>
      <h1 className="text-3xl font-bold tracking-tight">
        Editing: <span className="capitalize">{templateId.replace('-', ' ')}</span>
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="overflow-hidden">
            <CardContent className="p-4 bg-secondary/20">
              <CertificateTemplate 
                {...templateState}
                onContentChange={handleContentEditableChange}
              />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customize</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="background-upload">Background Image</Label>
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Background
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo-upload">Logo</Label>
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Logo
                </Button>
              </div>
              
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
