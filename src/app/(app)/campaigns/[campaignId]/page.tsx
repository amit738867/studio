'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { ParticipantValidator } from '@/components/participants/participant-validator';
import { Loader2, Users, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { ParticipantList } from '@/components/participants/participant-list';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function CampaignDetailsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const params = useParams();
  const campaignId = params.campaignId as string;

  const templates = PlaceHolderImages.filter(img => img.imageHint.includes('template'));

  const campaignDocRef = useMemoFirebase(() => {
    if (!user || !firestore || !campaignId) return null;
    return doc(firestore, 'users', user.uid, 'campaigns', campaignId);
  }, [user, firestore, campaignId]);

  const { data: campaign, isLoading: isCampaignLoading } = useDoc(campaignDocRef);

  const participantsColRef = useMemoFirebase(() => {
    if (!user || !firestore || !campaignId) return null;
    return collection(firestore, 'users', user.uid, 'campaigns', campaignId, 'participants');
  }, [user, firestore, campaignId]);

  const { data: participants, isLoading: areParticipantsLoading } = useCollection(participantsColRef);

  const isLoading = isCampaignLoading || areParticipantsLoading;

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
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    {templates.slice(0, 2).map((template) => (
                      <div key={template.id} className="border rounded-lg overflow-hidden group cursor-pointer">
                        <Image
                          src={template.imageUrl}
                          alt={template.description}
                          width={300}
                          height={210}
                          className="w-full h-auto object-cover aspect-[1.42]"
                          data-ai-hint={template.imageHint}
                        />
                         <div className="p-2 bg-background/80">
                           <Button variant="secondary" size="sm" className="w-full">Select</Button>
                         </div>
                      </div>
                    ))}
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
