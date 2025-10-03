'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CertificateTemplate } from '@/components/certificates/certificate-template-1';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Loader2, Upload } from 'lucide-react';
import type { CertificateTemplateProps } from '@/components/certificates/certificate-template-1';
import { useFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = params.templateId as string;
  const campaignId = searchParams.get('campaignId');

  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [templateState, setTemplateState] = useState<CertificateTemplateProps>({
    participantName: 'Jane Doe',
    courseName: 'Advanced AI',
    title: 'Certificate of Completion',
    subtitle: 'This certifies that',
    body: 'has successfully completed the course',
    issuer: 'Pramaan',
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

  const handleSaveChanges = () => {
    setIsSaving(true);

    if (campaignId && firestore && user) {
        // Save to campaign-specific template data
        const campaignDocRef = doc(firestore, 'users', user.uid, 'campaigns', campaignId);
        const templateDataString = JSON.stringify(templateState);
        updateDocumentNonBlocking(campaignDocRef, { 
            certificateTemplateData: templateDataString 
        });
        toast({
            title: "Template Saved",
            description: "Your customizations have been saved to the campaign.",
        });
    } else {
        // Handle saving a global template or just show a confirmation
        // For now, we'll just show a toast as we don't have a global template store
        toast({
            title: "Changes Ready",
            description: "Your template edits are ready to be used.",
        });
    }
    
    // We introduce a slight delay to allow the user to see the toast
    // before redirecting.
    setTimeout(() => {
        if (campaignId) {
            router.push(`/campaigns/${campaignId}/send`);
        } else {
            router.push('/templates');
        }
        setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link href={campaignId ? `/campaigns/${campaignId}` : '/templates'}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to {campaignId ? 'Campaign' : 'Templates'}
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
                <label htmlFor="background-upload" className="text-sm font-medium">Background Image</label>
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Background
                </Button>
              </div>
              <div className="space-y-2">
                <label htmlFor="logo-upload" className="text-sm font-medium">Logo</label>
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Logo
                </Button>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveChanges} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save and Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
