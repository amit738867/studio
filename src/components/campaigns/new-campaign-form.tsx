'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirebase } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { DialogClose } from '@/components/ui/dialog';

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Create Campaign
    </Button>
  );
}

export function NewCampaignForm() {
  const { firestore, user } = useFirebase();
  const [campaignName, setCampaignName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!firestore || !user) {
      setError('You must be logged in to create a campaign.');
      setIsSubmitting(false);
      return;
    }

    if (!campaignName.trim()) {
        setError('Campaign name cannot be empty.');
        setIsSubmitting(false);
        return;
    }

    const campaignsColRef = collection(firestore, 'users', user.uid, 'campaigns');

    const newCampaign = {
        name: campaignName.trim(),
        certificateTemplateId: '', // Placeholder
        participantIds: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'Draft',
    };
    
    // This function is non-blocking, but the `useCollection` hook on the parent
    // page will pick up the change in real-time.
    addDocumentNonBlocking(campaignsColRef, newCampaign);

    // Optimistically close the dialog.
    const closeButton = document.querySelector('[data-radix-dialog-close]') as HTMLElement;
    closeButton?.click();

    // Reset form state
    setCampaignName('');
    setIsSubmitting(false);
  };


  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="campaignName" className="text-right">
          Name
        </Label>
        <Input
          id="campaignName"
          name="campaignName"
          className="col-span-3"
          placeholder="e.g. Q3 Developer Meetup"
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          required
        />
      </div>
       <DialogClose asChild>
        <button type="button" className="hidden" data-radix-dialog-close>Close</button>
       </DialogClose>
      <SubmitButton pending={isSubmitting} />
      {error && (
        <p className={'text-sm text-red-600 text-center pt-2'}>
          {error}
        </p>
      )}
    </form>
  );
}
