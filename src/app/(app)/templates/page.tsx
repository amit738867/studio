
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CertificateTemplate } from '@/components/certificates/certificate-template-1';

export default function TemplatesPage() {

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">
            Manage your certificate templates or create a new one.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <Card className="overflow-hidden">
             <CardHeader>
              <CardTitle className="text-lg">Modern Certificate</CardTitle>
            </CardHeader>
            <CardContent className="p-4 bg-secondary/20">
               <CertificateTemplate participantName="Jane Doe" courseName="Advanced AI" />
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/templates/modern-certificate/edit">Edit</Link>
                </Button>
                <Button variant="secondary" size="sm">Preview</Button>
            </CardFooter>
          </Card>
      </div>
    </div>
  );
}
