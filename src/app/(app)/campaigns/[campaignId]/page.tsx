'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { ParticipantValidator } from '@/components/participants/participant-validator';
import { Loader2, Users, FileText, Send, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ParticipantList } from '@/components/participants/participant-list';
import { CertificateTemplate } from '@/components/certificates/certificate-template-1';
import { useToast } from '@/hooks/use-toast';
import type { WithId } from '@/firebase';

type Campaign = {
  name: string;
  certificateTemplateId?: string;
};

export default function CampaignDetailsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const params = useParams();
  const campaignId = params.campaignId as string;
  const { toast } = useToast();

  const campaignDocRef = useMemoFirebase(() => {
    if (!user || !firestore || !campaignId) return null;
    return doc(firestore, 'users', user.uid, 'campaigns', campaignId);
  }, [user, firestore, campaignId]);

  const { data: campaign, isLoading: isCampaignLoading } = useDoc<Campaign>(campaignDocRef);

  const participantsColRef = useMemoFirebase(() => {
    if (!user || !firestore || !campaignId) return null;
    return collection(firestore, 'users', user.uid, 'campaigns', campaignId, 'participants');
  }, [user, firestore, campaignId]);

  const { data: participants, isLoading: areParticipantsLoading } = useCollection(participantsColRef);

  const isLoading = isCampaignLoading || areParticipantsLoading;

  const handleSelectTemplate = (templateId: string) => {
    if (!campaignDocRef) return;
    updateDocumentNonBlocking(campaignDocRef, { certificateTemplateId: templateId });
    toast({
      title: 'Template Selected',
      description: `Template "${templateId}" has been assigned to this campaign.`,
    });
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link href="/campaigns">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Link>
      </Button>

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && !campaign && (
        <div className="text-center p-8 text-muted-foreground">
          <p>Campaign not found.</p>
        </div>
      )}

      {!isLoading && campaign && (
        <>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
          </div>

          {participants && participants.length > 0 ? (
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Manage Participants
                    </CardTitle>
                    <CardDescription>
                      View, add, or edit participants for this campaign.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ParticipantList campaignId={campaignId} participants={participants} />
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Add More Participants</h3>
                      <ParticipantValidator campaignId={campaignId} />
                    </div>
                  </CardContent>
                </Card>
                 {campaign.certificateTemplateId && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5" />
                        Delivery Status
                      </CardTitle>
                      <CardDescription>
                        Track the delivery of certificates.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-center text-center p-8 text-muted-foreground">
                        <p>Delivery features coming soon.</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Select a Template
                    </CardTitle>
                    <CardDescription>
                      Choose a certificate template for this campaign.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-1">
                    <div className="border rounded-lg overflow-hidden group">
                      <div className="p-4 bg-secondary/20">
                          <CertificateTemplate
                            participantName="John Doe"
                            courseName="Introduction to AI"
                          />
                      </div>
                       <div className="p-2 bg-background/80 flex flex-col gap-2">
                         <Button 
                           variant={campaign.certificateTemplateId === 'modern-certificate' ? 'default' : 'secondary'} 
                           size="sm" 
                           className="w-full"
                           onClick={() => handleSelectTemplate('modern-certificate')}
                           disabled={campaign.certificateTemplateId === 'modern-certificate'}
                         >
                           {campaign.certificateTemplateId === 'modern-certificate' ? 'Selected' : 'Select'}
                         </Button>
                         {campaign.certificateTemplateId === 'modern-certificate' && (
                            <Button size="sm" className="w-full" asChild>
                               <Link href={`/templates/${campaign.certificateTemplateId}/edit`}>
                                 <CheckCircle className="mr-2 h-4 w-4" />
                                 Continue with this template
                               </Link>
                            </Button>
                         )}
                       </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
             <>
                <p className="text-muted-foreground">
                  Upload your participant list via CSV. Our AI will validate and
                  suggest corrections for names.
                </p>
                <ParticipantValidator campaignId={campaignId} />
            </>
          )}
        </>
      )}
    </div>
  );
}
