'use client';

import { useMemo } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { NewCampaignForm } from '@/components/campaigns/new-campaign-form';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';

export default function CampaignsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const campaignsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'campaigns'), orderBy('createdAt', 'desc'));
  }, [user, firestore]);

  const { data: campaigns, isLoading } = useCollection(campaignsQuery);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            Manage and track your certificate distribution campaigns.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Enter the details for your new campaign below.
              </DialogDescription>
            </DialogHeader>
            <NewCampaignForm />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
          <CardDescription>A list of your certificate distribution campaigns.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
             <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
          )}
          {!isLoading && campaigns && campaigns.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Success Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>
                      {campaign.createdAt ? format(new Date(campaign.createdAt.toDate()), 'yyyy-MM-dd') : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{campaign.status || 'Draft'}</Badge>
                    </TableCell>
                    <TableCell>{campaign.participantIds?.length || 0}</TableCell>
                    <TableCell>N/A</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
           {!isLoading && (!campaigns || campaigns.length === 0) && (
            <div className="text-center p-8 text-muted-foreground">
                <p>No campaigns found.</p>
                <p>Click "New Campaign" to get started.</p>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
