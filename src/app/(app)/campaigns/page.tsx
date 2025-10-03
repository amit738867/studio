import { PlusCircle } from 'lucide-react';
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

const campaigns = [
  {
    name: 'Q2 Developer Summit',
    date: '2024-06-15',
    status: 'Completed',
    recipients: 250,
    successRate: '99.2%',
  },
  {
    name: 'AI Workshop Series',
    date: '2024-05-20',
    status: 'Completed',
    recipients: 180,
    successRate: '97.8%',
  },
  {
    name: 'Annual Hackathon 2024',
    date: '2024-04-30',
    status: 'Completed',
    recipients: 520,
    successRate: '98.5%',
  },
  {
    name: 'Project Management Webinar',
    date: '2024-03-10',
    status: 'Completed',
    recipients: 300,
    successRate: '100%',
  },
];

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            Manage and track your certificate distribution campaigns.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
          <CardDescription>A list of your recent certificate distribution campaigns.</CardDescription>
        </CardHeader>
        <CardContent>
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
                <TableRow key={campaign.name}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>{campaign.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{campaign.status}</Badge>
                  </TableCell>
                  <TableCell>{campaign.recipients}</TableCell>
                  <TableCell>{campaign.successRate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
