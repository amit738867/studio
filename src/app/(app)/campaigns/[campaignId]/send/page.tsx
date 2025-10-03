'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, getDoc } from 'firebase/firestore';
import { Loader2, ChevronLeft, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { sendCertificateEmails } from '@/ai/flows/send-certificate-emails';

type Participant = {
    id: string;
    name: string;
    email: string;
    status: string;
};

export default function SendCertificatesPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();

    const campaignId = params.campaignId as string;

    const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
    const [isSending, setIsSending] = useState(false);
    const [domain, setDomain] = useState('');
    const [campaignName, setCampaignName] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setDomain(window.location.host);
        }
    }, []);

    // Fetch campaign name
    useEffect(() => {
        if (!user || !firestore || !campaignId) return;
        
        const fetchCampaignName = async () => {
            try {
                const campaignDoc = await getDoc(doc(firestore, 'users', user.uid, 'campaigns', campaignId));
                if (campaignDoc.exists()) {
                    const campaignData = campaignDoc.data();
                    setCampaignName(campaignData?.name || 'Our Event');
                }
            } catch (error) {
                console.warn('Failed to retrieve campaign name:', error);
                setCampaignName('Our Event');
            }
        };
        
        fetchCampaignName();
    }, [user, firestore, campaignId]);

    const participantsColRef = useMemoFirebase(() => {
        if (!user || !firestore || !campaignId) return null;
        return collection(firestore, 'users', user.uid, 'campaigns', campaignId, 'participants');
    }, [user, firestore, campaignId]);

    const { data: participants, isLoading } = useCollection<Participant>(participantsColRef);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const allIds = new Set(participants?.map(p => p.id) || []);
            setSelectedParticipants(allIds);
        } else {
            setSelectedParticipants(new Set());
        }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        const newSelection = new Set(selectedParticipants);
        if (checked) {
            newSelection.add(id);
        } else {
            newSelection.delete(id);
        }
        setSelectedParticipants(newSelection);
    };
    
    const handleSendCertificates = async () => {
      if (selectedParticipants.size === 0) {
        toast({
            variant: "destructive",
            title: "No participants selected",
            description: "Please select at least one participant to send a certificate.",
        });
        return;
      }
      
      if (!user) {
         toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to send certificates.",
        });
        return;
      }
      
      // Ensure domain is set
      const currentDomain = domain || (typeof window !== 'undefined' ? window.location.host : 'localhost:3000');
      if (!currentDomain) {
        toast({
            variant: "destructive",
            title: "Configuration Error",
            description: "Unable to determine the application domain. Please try again.",
        });
        return;
      }
      
      // Get selected participant data
      const selectedParticipantData = participants?.filter(p => selectedParticipants.has(p.id)) || [];
      
      console.log('Selected participants:', selectedParticipantData);
      
      if (selectedParticipantData.length === 0) {
        toast({
            variant: "destructive",
            title: "No participant data",
            description: "No participant data found for selected participants.",
        });
        return;
      }
      
      setIsSending(true);
      
      try {
        const result = await sendCertificateEmails({
            campaignId,
            campaignName,
            userId: user.uid,
            participants: selectedParticipantData,
            domain: currentDomain,
        });

        if (result.success) {
             toast({
                title: "Certificates Sent!",
                description: `${result.sentCount} certificate(s) have been queued for delivery.`,
            });
            router.push(`/campaigns/${campaignId}`);
        } else {
            throw new Error(result.error || `Failed to send ${result.failedCount} certificate(s).`);
        }

      } catch (error: any) {
        console.error('Error sending certificates:', error);
        toast({
            variant: 'destructive',
            title: "Failed to send certificates",
            description: error.message || "An unexpected error occurred while sending certificates.",
        })
      } finally {
        setIsSending(false);
      }
    }


    return (
        <div className="space-y-6">
            <Button variant="outline" asChild>
                <Link href={`/campaigns/${campaignId}`}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Campaign
                </Link>
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Send Certificates</CardTitle>
                    <CardDescription>
                        Select the participants you want to send certificates to and click "Send".
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}
                    {!isLoading && participants && participants.length > 0 ? (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <Checkbox
                                                checked={selectedParticipants.size === participants.length && participants.length > 0}
                                                onCheckedChange={handleSelectAll}
                                                aria-label="Select all"
                                            />
                                        </TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {participants.map((participant) => (
                                        <TableRow key={participant.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedParticipants.has(participant.id)}
                                                    onCheckedChange={(checked) => handleSelectOne(participant.id, !!checked)}
                                                    aria-label={`Select ${participant.name}`}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{participant.name}</TableCell>
                                            <TableCell>{participant.email}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                         !isLoading && (
                            <div className="text-center p-8 text-muted-foreground border-dashed border-2 rounded-md">
                                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                                <p>No participants found for this campaign.</p>
                                <p className="text-sm">Please add participants before sending certificates.</p>
                            </div>
                         )
                    )}
                </CardContent>
            </Card>

            {participants && participants.length > 0 && (
                <div className="flex justify-end">
                    <Button onClick={handleSendCertificates} disabled={isSending || selectedParticipants.size === 0}>
                        {isSending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="mr-2 h-4 w-4" />
                        )}
                        Send {selectedParticipants.size > 0 ? `(${selectedParticipants.size})` : ''} Certificates
                    </Button>
                </div>
            )}
        </div>
    );
}