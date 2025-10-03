'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirebase } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { DialogClose } from '@/components/ui/dialog';

async function createCampaignAction(prevState: any, formData: FormData) {
  // This server action is a bit of a pass-through now,
  // the client-side form submission handles the logic.
  // We can keep it for progressive enhancement if needed, but for now it does little.
  return { success: true, message: 'Campaign creation initiated.' };
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Create Campaign
    </Button>
  );
}

export function NewCampaignForm() {
  const { firestore, user } = useFirebase();
  const [state, formAction] = useActionState(createCampaignAction, { success: false, message: '' });
  const [campaignName, setCampaignName] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!firestore || !user || !campaignName.trim()) {
        // Handle error: not logged in or no name
        // You can set an error message in a local state here
        return;
    }

    const campaignsColRef = collection(firestore, 'users', user.uid, 'campaigns');

    const newCampaign = {
        name: campaignName.trim(),
        certificateTemplateId: '', // You'll need to select a template later
        participantIds: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'Draft',
    };
    
    addDocumentNonBlocking(campaignsColRef, newCampaign);

    // Close the dialog by finding and clicking the close button
    const closeButton = document.querySelector('[data-radix-dialog-close]') as HTMLElement;
    closeButton?.click();

    // Optionally, you can still call the formAction if needed
    // formAction(new FormData(event.currentTarget));
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
      <SubmitButton />
      {state.message && !state.success && (
        <p className={'text-sm text-red-600'}>
          {state.message}
        </p>
      )}
    </form>
  );
}
