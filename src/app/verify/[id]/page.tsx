'use client';

import { CheckCircle2, Download, FileText } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function VerificationPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch certificate data using the ID from a database.
  // We'll use mock data for this example.
  const [certificateData, setCertificateData] = useState({
    participantName: 'Jane Doe',
    courseName: 'Advanced AI Integration',
    issueDate: '2024-07-26',
    certificateId: params.id,
    issuer: 'Pramaan',
    verificationLink: `https://yourdomain.com/verify/${params.id}`,
  });
  
  const [isValid, setIsValid] = useState(true);
  const [certificateUrl, setCertificateUrl] = useState('');

  // In a real implementation, you would fetch the actual certificate data from your database
  useEffect(() => {
    // Simulate fetching certificate data
    const fetchCertificateData = async () => {
      // This would be an API call to your backend
      // const response = await fetch(`/api/certificates/${params.id}`);
      // const data = await response.json();
      // setCertificateData(data);
      // setIsValid(data.isValid);
      
      // For now, we'll just update the verification link and certificate URL
      const verificationLink = `https://${window.location.host}/verify/${params.id}`;
      const certUrl = `https://${window.location.host}/api/certificates/${params.id}`;
      
      setCertificateData(prev => ({
        ...prev,
        verificationLink: verificationLink
      }));
      
      setCertificateUrl(certUrl);
    };
    
    fetchCertificateData();
  }, [params.id]);

  const handleDownloadCertificate = () => {
    if (certificateUrl) {
      window.open(certificateUrl, '_blank');
    }
  };

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
            
            {/* QR Code for verification */}
            <div className="mt-8 p-4 bg-white rounded-lg">
              <QRCodeSVG 
                value={certificateData.verificationLink} 
                size={200} 
                level="H" 
                includeMargin={true}
              />
              <p className="mt-2 text-sm text-muted-foreground">Scan to verify</p>
            </div>
          </div>
        </div>
        <CardFooter className="flex flex-col items-center justify-center p-6 bg-secondary space-y-4">
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
            <Button 
              onClick={handleDownloadCertificate}
              className="flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Certificate
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}