'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { WithId } from '@/firebase';

type Participant = {
  name: string;
  email: string;
  status: 'valid' | 'invalid' | 'corrected';
  originalName: string;
};

interface ParticipantListProps {
  campaignId: string;
  participants: WithId<Participant>[];
}

export function ParticipantList({
  campaignId,
  participants,
}: ParticipantListProps) {
  if (!participants || participants.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground p-4 border rounded-md">
        No participants have been added to this campaign yet.
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((participant) => (
            <TableRow key={participant.id}>
              <TableCell className="font-medium">{participant.name}</TableCell>
              <TableCell>{participant.email}</TableCell>
              <TableCell>
                <Badge variant={participant.status === 'valid' ? 'secondary' : 'destructive'}>
                  {participant.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
