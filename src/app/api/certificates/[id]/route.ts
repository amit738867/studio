import { NextRequest, NextResponse } from 'next/server';
import { getCertificateById } from '@/services/certificate-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const certificateId = params.id;
    
    // Retrieve certificate from storage
    const certificate = await getCertificateById(certificateId);
    
    if (!certificate) {
      return NextResponse.json(
        { error: 'Certificate not found' },
        { status: 404 }
      );
    }
    
    // For development: return base64 image data
    if (certificate.imageUrl.startsWith('data:image')) {
      // Extract base64 data
      const base64Data = certificate.imageUrl.split(',')[1];
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      // Return the image as a response
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `inline; filename="certificate-${certificateId}.png"`,
        },
      });
    }
    
    // For SVG fallback certificates
    if (certificate.imageUrl.startsWith('data:text/svg')) {
      // Extract SVG data
      const svgData = certificate.imageUrl.split(',')[1];
      const svgBuffer = Buffer.from(svgData, 'base64');
      
      // Return the SVG as a response
      return new NextResponse(svgBuffer, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Content-Disposition': `inline; filename="certificate-${certificateId}.svg"`,
        },
      });
    }
    
    // For production: redirect to the Firebase Storage URL
    return NextResponse.redirect(certificate.imageUrl, 302);
  } catch (error) {
    console.error('Error retrieving certificate:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve certificate' },
      { status: 500 }
    );
  }
}