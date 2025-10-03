import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award } from 'lucide-react';

export default async function VerificationPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch certificate data using the ID from a database.
  // We'll use mock data for this example.
  const certificateData = {
    participantName: 'Jane Doe',
    courseName: 'Advanced AI Integration',
    issueDate: '2024-07-26',
    certificateId: params.id,
    issuer: 'CertifyAI',
  };
  
  const isValid = true; // This would be determined by your backend logic.

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="p-10 bg-background">
          <div className="flex flex-col items-center text-center space-y-4">
            <Award className="w-16 h-16 text-primary"/>
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Certificate of Completion
            </p>
            <p className="text-lg">This certifies that</p>
            <h1 className="text-5xl font-bold font-headline text-primary-foreground tracking-tight">
              {certificateData.participantName}
            </h1>
            <p className="text-lg">has successfully completed the</p>
            <h2 className="text-3xl font-semibold text-primary-foreground">
              {certificateData.courseName}
            </h2>
            <p className="text-muted-foreground pt-4 max-w-md">
              This certificate was issued by {certificateData.issuer} and is recorded on our secure ledger.
            </p>
          </div>
        </div>
        <CardFooter className="flex flex-col items-center justify-center p-6 bg-secondary space-y-2">
            {isValid ? (
                <div className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    <p className="font-semibold">VERIFIED</p>
                </div>
            ) : (
                <p className="text-destructive-foreground font-semibold">NOT VALID</p>
            )}
            <div className="text-xs text-muted-foreground font-mono space-x-4">
                <span>ID: {certificateData.certificateId}</span>
                <span>ISSUED: {certificateData.issueDate}</span>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
