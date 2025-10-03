import { ParticipantValidator } from '@/components/participants/participant-validator';

export default function ParticipantsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Participants</h1>
        <p className="text-muted-foreground">
          Upload your participant list via CSV. Our AI will validate and
          suggest corrections for names.
        </p>
      </div>
      <ParticipantValidator />
    </div>
  );
}
