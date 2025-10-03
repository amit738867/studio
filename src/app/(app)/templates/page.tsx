import Image from 'next/image';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function TemplatesPage() {
  const templates = PlaceHolderImages.filter(img => img.imageHint.includes('template'));

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template, index) => (
          <Card key={template.id} className="overflow-hidden">
            <CardHeader className="p-0">
              <div className="aspect-[1.42] w-full">
                <Image
                  src={template.imageUrl}
                  alt={template.description}
                  width={600}
                  height={420}
                  className="w-full h-full object-cover"
                  data-ai-hint={template.imageHint}
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-lg">Template {index + 1}</CardTitle>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="secondary" size="sm">Preview</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
