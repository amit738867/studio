'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

async function createCampaignAction(prevState: any, formData: FormData) {
  // TODO: Implement actual campaign creation logic (e.g., save to a database)
  const campaignName = formData.get('campaignName') as string;
  console.log('Creating campaign:', campaignName);
  // For now, we'll just log it and pretend it was successful.
  // In a real app, you would handle success/error states and maybe close the dialog.
  return { success: true, message: `Campaign "${campaignName}" created.` };
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
  const [state, formAction] = useActionState(createCampaignAction, { success: false, message: '' });

  return (
    <form action={formAction} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="campaignName" className="text-right">
          Name
        </Label>
        <Input
          id="campaignName"
          name="campaignName"
          className="col-span-3"
          placeholder="e.g. Q3 Developer Meetup"
          required
        />
      </div>
      <SubmitButton />
      {state.message && (
        <p className={`text-sm ${state.success ? 'text-green-600' : 'text-red-600'}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
