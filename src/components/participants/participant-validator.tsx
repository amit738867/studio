'use client';

import { useState, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { AlertCircle, CheckCircle, FileUp, Loader2, RefreshCw } from 'lucide-react';

import { validateNamesAction } from '@/app/(app)/participants/actions';
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

export function ParticipantValidator() {
  const [formState, formAction] = useFormState(validateNamesAction, initialState);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const text = await selectedFile.text();
      const firstLine = text.split('\n')[0];
      const parsedHeaders = firstLine.split(',').map((h) => h.trim());
      setHeaders(parsedHeaders);
      setSelectedColumn('');
      if (formState.results.length > 0) {
        formState.results = [];
      }
    }
  };

  const handleReset = () => {
    setFile(null);
    setHeaders([]);
    setSelectedColumn('');
    formState.results = [];
    formState.error = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Upload Participants</CardTitle>
          <CardDescription>
            Select a CSV file and choose the column with participant names for validation.
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
              Note: Simple CSV parsing is used. Names should not contain commas.
            </p>
          </div>
          {headers.length > 0 && (
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="nameColumn">Name Column</Label>
              <Select
                name="nameColumn"
                value={selectedColumn}
                onValueChange={setSelectedColumn}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column with names" />
                </SelectTrigger>
                <SelectContent>
                  {headers.map((header) => (
                    <SelectItem key={header} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          {file && selectedColumn && <SubmitButton />}
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
                  <TableHead>Corrected Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formState.results.map((result, index) => (
                  <TableRow key={index}>
                    <TableCell>{result.originalName}</TableCell>
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
              <Button>Accept & Continue</Button>
            </div>
        </div>
      )}
    </Card>
  );
}
