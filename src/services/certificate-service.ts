'use server';

import QRCode from 'qrcode';
import { storage } from '@/firebase/admin';
import { Readable } from 'stream';

// Conditional import for canvas to handle build time issues
let createCanvas: any;
let loadImage: any;

try {
  const canvasModule = require('canvas');
  createCanvas = canvasModule.createCanvas;
  loadImage = canvasModule.loadImage;
} catch (error) {
  console.warn('Canvas module not available, using fallback for certificate generation');
  createCanvas = null;
  loadImage = null;
}

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
      // Check if it's an SVG buffer
      if (imageBuffer.toString('utf-8').startsWith('<svg')) {
        // SVG fallback
        const base64Svg = imageBuffer.toString('base64');
        imageUrl = `data:text/svg+xml;base64,${base64Svg}`;
      } else {
        // Regular PNG image
        const base64Image = imageBuffer.toString('base64');
        imageUrl = `data:image/png;base64,${base64Image}`;
      }
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
    // Check if canvas is available
    if (!createCanvas || !loadImage) {
      // Fallback: Generate a simple text-based certificate
      return generateFallbackCertificate(certificateData);
    }
    
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
    // Fallback to simple certificate generation
    return generateFallbackCertificate(certificateData);
  }
}

/**
 * Fallback certificate generation for when canvas is not available
 */
async function generateFallbackCertificate(certificateData: CertificateData): Promise<Buffer> {
  // Create a simple SVG-based certificate as fallback
  const svgContent = `
  <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <rect x="10" y="10" width="780" height="580" fill="none" stroke="#2563eb" stroke-width="4"/>
    <text x="400" y="60" font-family="Arial" font-size="48" font-weight="bold" fill="#2563eb" text-anchor="middle">CERTIFICATE</text>
    <text x="400" y="100" font-family="Arial" font-size="24" fill="#666666" text-anchor="middle">OF COMPLETION</text>
    <line x1="50" y1="120" x2="750" y2="120" stroke="#cccccc" stroke-width="1"/>
    <text x="400" y="160" font-family="Arial" font-size="20" fill="#000000" text-anchor="middle">This certifies that</text>
    <text x="400" y="200" font-family="Arial" font-size="32" font-weight="bold" fill="#2563eb" text-anchor="middle">${certificateData.participantName}</text>
    <text x="400" y="240" font-family="Arial" font-size="20" fill="#000000" text-anchor="middle">has successfully completed the course</text>
    <text x="400" y="280" font-family="Arial" font-size="28" font-weight="bold" fill="#2563eb" text-anchor="middle">${certificateData.courseName}</text>
    <text x="400" y="330" font-family="Arial" font-size="16" fill="#666666" text-anchor="middle">Issued by: ${certificateData.issuer}</text>
    <text x="400" y="360" font-family="Arial" font-size="16" fill="#666666" text-anchor="middle">Date: ${new Date(certificateData.issueDate).toLocaleDateString()}</text>
    <text x="400" y="390" font-family="Arial" font-size="14" fill="#666666" text-anchor="middle">Certificate ID: ${certificateData.id}</text>
    <text x="400" y="580" font-family="Arial" font-size="16" fill="#999999" text-anchor="middle">Powered by Pramaan</text>
  </svg>
  `;
  
  // Convert SVG string to buffer
  return Buffer.from(svgContent.trim(), 'utf-8');
}