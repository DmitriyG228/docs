import { NextRequest, NextResponse } from 'next/server';
import { getVerifyEmailConfig } from '@/emails/templates/verification/verify';
import { storeToken } from '@/lib/token-storage';
import crypto from 'crypto';

interface SendPulseTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface BetaSignupFormData {
  email: string;
  company: string;
  companyBusiness: string;
  companySize: string;
  linkedIn?: string;
  twitter?: string;
  mainPlatform: string;
  otherPlatform?: string;
  useCase: string;
}

// Function to get SendPulse access token
async function getSendPulseToken() {
  const userId = process.env.SENDPULSE_USER_ID;
  const secret = process.env.SENDPULSE_SECRET;

  if (!userId || !secret) {
    throw new Error('SendPulse credentials not configured');
  }

  const response = await fetch('https://api.sendpulse.com/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: userId,
      client_secret: secret,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get SendPulse token: ${errorText}`);
  }

  return response.json() as Promise<SendPulseTokenResponse>;
}

// Function to send verification email
async function sendVerificationEmail(token: string, formData: BetaSignupFormData, verificationToken: string) {
  const recipientName = formData.company;
  const recipientEmail = formData.email;
  
  // Construct the verification URL - fix the duplicate /api/ issue
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  // Ensure we don't have /api/ duplicated in the URL
  const verificationLink = `${baseUrl}/email-verification/${verificationToken}`;
  
  // Get email configuration from the template
  const emailConfig = getVerifyEmailConfig({
    companyName: recipientName,
    recipientEmail: recipientEmail,
    verificationLink: verificationLink
  });

  const response = await fetch('https://api.sendpulse.com/smtp/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(emailConfig),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('SendPulse response:', errorText);
    throw new Error(`Failed to send verification email: ${errorText}`);
  }

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const formData: BetaSignupFormData = await request.json();

    // Basic validation
    if (!formData.email || !formData.company) {
      return NextResponse.json(
        { error: 'Email and company name are required' },
        { status: 400 }
      );
    }

    // Generate a unique verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Store the form data with the token (expires in 24 hours)
    const tokenKey = `verification:${verificationToken}`;
    const stored = await storeToken(tokenKey, formData, 60 * 60 * 24);
    
    if (!stored) {
      throw new Error('Failed to store verification token');
    }

    // Get SendPulse token
    const tokenResponse = await getSendPulseToken();
    const token = tokenResponse.access_token;
    
    // Send verification email
    await sendVerificationEmail(token, formData, verificationToken);

    // Return success response
    return NextResponse.json({ 
      success: true,
      message: 'Verification email sent. Please check your inbox to complete your application.'
    });
  } catch (error) {
    console.error('Error in beta signup API:', error);
    
    return NextResponse.json(
      { error: 'Failed to process signup. Please try again later.' },
      { status: 500 }
    );
  }
} 