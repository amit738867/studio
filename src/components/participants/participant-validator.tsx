'use client';

import { useState, useRef, useActionState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, CheckCircle, FileUp, Loader2, RefreshCw } from 'lucide-react';
import { collection } from 'firebase/firestore';
import { useFirebase, addDocumentNonBlocking } from '@/firebase';

import { validateParticipantsAction } from '@/app/(app)/participants/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '../ui/badge';
import type { ValidateAndCorrectParticipantNamesOutput } from '@/ai/flows/validate-and-correct-participant-names';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  results: [] as ValidateAndCorrectParticipantNamesOutput,
  error: null as string | null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
      Validate Names
    </Button>
  );
}

export function ParticipantValidator({ campaignId }: { campaignId: string }) {
  const [formState, formAction] = useActionState(validateParticipantsAction, initialState);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [selectedNameColumn, setSelectedNameColumn] = useState<string>('');
  const [selectedEmailColumn, setSelectedEmailColumn] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const text = await selectedFile.text();
      const firstLine = text.split('\n')[0];
      const parsedHeaders = firstLine.split(',').map((h) => h.trim());
      setHeaders(parsedHeaders);
      setSelectedNameColumn('');
      setSelectedEmailColumn('');
      if (formState.results.length > 0) {
        formState.results = [];
      }
    }
  };

  const handleReset = () => {
    setFile(null);
    setHeaders([]);
    setSelectedNameColumn('');
    setSelectedEmailColumn('');
    formState.results = [];
    formState.error = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleAcceptAndContinue = () => {
    if (!firestore || !user || formState.results.length === 0) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not save participants. Firebase not available or no results to save.",
        });
        return;
    }

    startTransition(() => {
        const participantsColRef = collection(firestore, 'users', user.uid, 'campaigns', campaignId, 'participants');
        
        let successCount = 0;
        formState.results.forEach((result) => {
            if (result.isValid) {
                const participantData = {
                    name: result.correctedName,
                    email: result.email, // Assuming email is on the result
                    status: result.isValid ? 'valid' : 'invalid',
                    originalName: result.originalName,
                };
                addDocumentNonBlocking(participantsColRef, participantData);
                successCount++;
            }
        });
        toast({
            title: "Participants Saved",
            description: `${successCount} valid participants have been added to the campaign.`,
        });
        handleReset(); // Clear the form
    });
  }

  return (
    <Card>
      <form action={formAction}>
        <input type="hidden" name="campaignId" value={campaignId} />
        <CardHeader>
          <CardTitle>Upload Participants</CardTitle>
          <CardDescription>
            Select a CSV file and choose the columns for participant names and emails for validation.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="csvFile">CSV File</Label>
            <Input
              id="csvFile"
              name="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              ref={fileInputRef}
              required
            />
            <p className="text-sm text-muted-foreground">
              Note: Simple CSV parsing is used. Names and emails should not contain commas.
            </p>
          </div>
          {headers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="grid w-full items-center gap-2">
                    <Label htmlFor="nameColumn">Name Column</Label>
                    <Select
                        name="nameColumn"
                        value={selectedNameColumn}
                        onValueChange={setSelectedNameColumn}
                        required
                    >
                        <SelectTrigger>
                        <SelectValue placeholder="Select name column" />
                        </SelectTrigger>
                        <SelectContent>
                        {headers.map((header) => (
                            <SelectItem key={`name-${header}`} value={header}>
                            {header}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="grid w-full items-center gap-2">
                    <Label htmlFor="emailColumn">Email Column</Label>
                    <Select
                        name="emailColumn"
                        value={selectedEmailColumn}
                        onValueChange={setSelectedEmailColumn}
                        required
                    >
                        <SelectTrigger>
                        <SelectValue placeholder="Select email column" />
                        </SelectTrigger>
                        <SelectContent>
                        {headers.map((header) => (
                            <SelectItem key={`email-${header}`} value={header}>
                            {header}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                 </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          {file && selectedNameColumn && selectedEmailColumn && <SubmitButton />}
        </CardFooter>
      </form>

      {formState.error && (
        <div className="p-6 pt-0">
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-md text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <p>{formState.error}</p>
            </div>
        </div>
      )}

      {formState.results.length > 0 && (
        <div className="p-6 pt-0">
          <h3 className="text-lg font-semibold mb-4">Validation Results</h3>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Original Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Corrected Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formState.results.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell>{result.originalName}</TableCell>
                    <TableCell>{result.email}</TableCell>
                    <TableCell className="font-medium">
                      {result.correctedName !== result.originalName ? (
                        <span className="text-primary-foreground">{result.correctedName}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {result.isValid ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                          <CheckCircle className="mr-1 h-3 w-3" /> Valid
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertCircle className="mr-1 h-3 w-3" /> Invalid
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{result.reason || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
           <div className="flex justify-end mt-4">
              <Button onClick={handleAcceptAndContinue} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Accept & Save Participants
              </Button>
            </div>
        </div>
      )}
    </Card>
  );
}
