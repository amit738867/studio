'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { ParticipantValidator } from '@/components/participants/participant-validator';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function CampaignDetailsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const params = useParams();
  const campaignId = params.campaignId as string;

  const campaignDocRef = useMemoFirebase(() => {
    if (!user || !firestore || !campaignId) return null;
    return doc(firestore, 'users', user.uid, 'campaigns', campaignId);
  }, [user, firestore, campaignId]);

  const { data: campaign, isLoading } = useDoc(campaignDocRef);

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
            <p className="text-muted-foreground">
              Upload your participant list via CSV. Our AI will validate and
              suggest corrections for names.
            </p>
          </div>
          <ParticipantValidator campaignId={campaignId} />
        </>
      )}
    </div>
  );
}
