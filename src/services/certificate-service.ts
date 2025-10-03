'use server';

import QRCode from 'qrcode';
import { storage } from '@/firebase/admin';
import { Readable } from 'stream';
import { createCanvas, loadImage } from 'canvas';

export interface CertificateData {
  id: string;
  participantName: string;
  courseName: string;
  issueDate: string;
  issuer: string;
  campaignId: string;
  userId: string;
  verificationLink: string;
  domain?: string;
}

// In-memory storage for development
const certificateStorage = new Map<string, { data: CertificateData, imageUrl: string }>();

/**
 * Generates a certificate with QR code and stores it in memory
 */
export async function generateAndStoreCertificate(certificateData: CertificateData): Promise<{ 
  success: boolean; 
  certificateId: string;
  certificateUrl: string;
  error?: string 
}> {
  try {
    // Use the provided certificate ID
    const certificateId = certificateData.id;
    
    // Generate the certificate as an image
    const imageBuffer = await generateCertificateImage(certificateData);
    
    let imageUrl: string;
    
    // Upload to Firebase Storage in production, store in memory in development
    if (storage && process.env.NODE_ENV === 'production') {
      // Production: Upload to Firebase Storage
      try {
        const bucket = storage.bucket();
        const fileName = `certificates/${certificateId}.png`;
        const file = bucket.file(fileName);
        
        // Convert buffer to readable stream
        const bufferStream = new Readable();
        bufferStream.push(imageBuffer);
        bufferStream.push(null);
        
        // Upload the file
        await new Promise((resolve, reject) => {
          const writeStream = file.createWriteStream({
            metadata: {
              contentType: 'image/png',
            },
          });
          
          bufferStream.pipe(writeStream)
            .on('error', reject)
            .on('finish', resolve);
        });
        
        // Get the public URL
        await file.makePublic();
        imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        console.log(`Certificate uploaded to Firebase Storage: ${imageUrl}`);
      } catch (storageError: any) {
        console.error('Failed to upload to Firebase Storage:', storageError);
        return { 
          success: false, 
          certificateId: '',
          certificateUrl: '',
          error: `Failed to upload certificate to Firebase Storage: ${storageError.message}` 
        };
      }
    } else {
      // Development: Store in memory
      const base64Image = imageBuffer.toString('base64');
      imageUrl = `data:image/png;base64,${base64Image}`;
      console.log('Certificate stored in memory (development mode)');
    }
    
    // Store in memory for retrieval
    const certificateRecord = {
      ...certificateData,
      id: certificateId,
      createdAt: new Date().toISOString(),
    };
    
    certificateStorage.set(certificateId, {
      data: certificateRecord,
      imageUrl
    });
    
    console.log(`Certificate generated and stored successfully with ID: ${certificateId}`);
    console.log(`Certificate URL: ${imageUrl}`);
    
    return { 
      success: true, 
      certificateId,
      certificateUrl: imageUrl
    };
  } catch (error: any) {
    console.error('Error generating/storing certificate:', error);
    return { 
      success: false, 
      certificateId: '',
      certificateUrl: '',
      error: error.message || 'Failed to generate and store certificate' 
    };
  }
}

/**
 * Retrieves a certificate URL from memory
 */
export async function getCertificateById(certificateId: string): Promise<{ imageUrl: string } | null> {
  try {
    const certificate = certificateStorage.get(certificateId);
    if (certificate) {
      return { imageUrl: certificate.imageUrl };
    }
    return null;
  } catch (error) {
    console.error('Error retrieving certificate:', error);
    return null;
  }
}

/**
 * Generates a certificate image with embedded QR code
 */
export async function generateCertificateImage(certificateData: CertificateData): Promise<Buffer> {
  try {
    // Create canvas
    const width = 800;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Draw background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    // Draw border
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, width - 20, height - 20);
    
    // Draw title
    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE', width / 2, 60);
    
    // Draw subtitle
    ctx.fillStyle = '#666666';
    ctx.font = '24px Arial';
    ctx.fillText('OF COMPLETION', width / 2, 100);
    
    // Draw decorative line
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 120);
    ctx.lineTo(width - 50, 120);
    ctx.stroke();
    
    // Draw presentation text
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    ctx.fillText('This certifies that', width / 2, 160);
    
    // Draw participant name
    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(certificateData.participantName, width / 2, 200);
    
    // Draw completion text
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    ctx.fillText('has successfully completed the course', width / 2, 240);
    
    // Draw course name
    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(certificateData.courseName, width / 2, 280);
    
    // Draw issuer and date
    ctx.fillStyle = '#666666';
    ctx.font = '16px Arial';
    ctx.fillText(`Issued by: ${certificateData.issuer}`, width / 2, 330);
    ctx.fillText(`Date: ${new Date(certificateData.issueDate).toLocaleDateString()}`, width / 2, 360);
    
    // Draw certificate ID
    ctx.font = '14px Arial';
    ctx.fillText(`Certificate ID: ${certificateData.id}`, width / 2, 390);
    
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(certificateData.verificationLink, {
      width: 150,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    
    // Load and draw QR code
    const qrImage = await loadImage(qrCodeDataUrl);
    ctx.drawImage(qrImage, width - 170, height - 170, 150, 150);
    
    // Draw QR code label
    ctx.fillStyle = '#666666';
    ctx.font = '14px Arial';
    ctx.fillText('Scan to verify', width - 95, height - 15);
    
    // Draw footer
    ctx.fillStyle = '#999999';
    ctx.font = '16px Arial';
    ctx.fillText('Powered by Pramaan', width / 2, height - 20);
    
    // Convert to buffer
    return canvas.toBuffer('image/png');
  } catch (error) {
    console.error('Error generating certificate image:', error);
    throw error;
  }
}