'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, ChevronRight, TrendingUp, Mail, Users, CheckCircle } from 'lucide-react';
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
import { DeliveryChart } from '@/components/dashboard/delivery-chart';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';

export default function CombinedDashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'campaigns'>('dashboard');

  const campaignsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'campaigns'), orderBy('createdAt', 'desc'));
  }, [user, firestore]);

  const { data: campaigns, isLoading } = useCollection(campaignsQuery);

  const handleCampaignClick = (campaignId: string) => {
    router.push(`/campaigns/${campaignId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header with animated background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 p-6 md:p-8">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white animate-fade-in">
            Dashboard & Campaigns
          </h1>
          <p className="text-gray-300 mt-2 animate-fade-in-delayed">
            Manage your certificate distribution campaigns and track performance
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-gray-700">
        <Button
          variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('dashboard')}
          className="px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-gray-800"
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
        <Button
          variant={activeTab === 'campaigns' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('campaigns')}
          className="px-4 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-gray-800"
        >
          <Mail className="mr-2 h-4 w-4" />
          Campaigns
        </Button>
      </div>

      {/* Dashboard Content */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          <StatsCards />
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Delivery Status Overview</CardTitle>
              <CardDescription className="text-gray-400">
                Track the performance of your certificate distributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeliveryChart />
            </CardContent>
          </Card>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-500/20 p-3">
                    <CheckCircle className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Certificates Sent</p>
                    <p className="text-2xl font-bold text-white">1,248</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="rounded-full bg-green-500/20 p-3">
                    <Users className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Active Recipients</p>
                    <p className="text-2xl font-bold text-white">892</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="rounded-full bg-purple-500/20 p-3">
                    <TrendingUp className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Success Rate</p>
                    <p className="text-2xl font-bold text-white">98.5%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Campaigns Content */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Campaigns</h2>
              <p className="text-gray-400">
                Manage and track your certificate distribution campaigns.
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Campaign</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Enter the details for your new campaign below.
                  </DialogDescription>
                </DialogHeader>
                <NewCampaignForm />
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Campaigns</CardTitle>
              <CardDescription className="text-gray-400">
                A list of your certificate distribution campaigns.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && <LoadingSpinner />}
              {!isLoading && campaigns && campaigns.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-750">
                      <TableHead className="text-gray-300">Campaign</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Recipients</TableHead>
                      <TableHead className="text-gray-300"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow 
                        key={campaign.id} 
                        onClick={() => handleCampaignClick(campaign.id)} 
                        className="cursor-pointer border-gray-700 hover:bg-gray-750 transition-colors duration-200"
                      >
                        <TableCell className="font-medium text-white">{campaign.name}</TableCell>
                        <TableCell className="text-gray-300">
                          {campaign.createdAt ? format(new Date(campaign.createdAt.toDate()), 'yyyy-MM-dd') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {campaign.status || 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">{campaign.participantIds?.length || 0}</TableCell>
                        <TableCell>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {!isLoading && (!campaigns || campaigns.length === 0) && (
                <div className="text-center p-8 text-gray-400">
                  <p>No campaigns found.</p>
                  <p>Click "New Campaign" to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}