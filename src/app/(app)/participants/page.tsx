import { ParticipantValidator } from '@/components/participants/participant-validator';

export default function ParticipantsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Participants</h1>
        <p className="text-muted-foreground">
          This is a standalone participant validator. To add participants
          to a campaign, go to the campaign's page.
        </p>
      </div>
    </div>
  );
}
