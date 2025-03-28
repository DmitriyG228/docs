import { NextResponse } from 'next/server';
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
export async function sendVerificationEmail(email: string, companyName: string, verificationToken: string): Promise<boolean> {
  try {
    console.log('🔵 Creating verification URL...');
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/email-verification/${verificationToken}`;
    
    console.log('🔵 Getting email configuration...');
    const emailConfig = getVerifyEmailConfig({
      recipient: {
        name: email.split('@')[0],
        email: email
      },
      companyName,
      verificationLink
    });
    
    console.log('🔵 Getting SendPulse token...');
    const token = await getSendPulseToken();
    
    // Create a proper email payload that prioritizes HTML content
    const emailPayload = {
      ...emailConfig,
      html_content_first: true,
      content_type: 'text/html'
    };
    
    console.log('🔵 Sending verification email...');
    const response = await fetch('https://api.sendpulse.com/smtp/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(emailPayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendPulse response:', errorText);
      throw new Error(`Failed to send verification email: ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error('Error in sendVerificationEmail:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    // Parse form data
    const formData: BetaSignupFormData = await request.json();
    console.log('📝 Received form data:', formData);

    // Basic validation
    if (!formData.email || !formData.company) {
      return Response.json({ error: 'Email and company name are required' }, { status: 400 });
    }

    // Generate verification token
    const verificationToken = crypto.randomUUID();
    console.log('🔑 Generated verification token');

    // Store data for verification
    const storageData: VerificationTokenData = {
      email: formData.email,
      company: formData.company,
      companyBusiness: formData.companyBusiness,
      companySize: formData.companySize,
      linkedIn: formData.linkedIn,
      twitter: formData.twitter,
      mainPlatform: formData.mainPlatform,
      otherPlatform: formData.otherPlatform,
      useCase: formData.useCase,
      createdAt: Date.now(),
    };
    const tokenKey = `verification:${verificationToken}`;
    await setToken(tokenKey, storageData);
    console.log('Token stored successfully');

    // Send verification email
    console.log('Sending verification email');
    const success = await sendVerificationEmail(formData.email, formData.company, verificationToken);
    
    if (!success) {
      return Response.json({ error: 'Failed to send verification email' }, { status: 500 });
    }
    
    console.log('Verification email sent successfully');

    // Return success
    return Response.json({
      message: 'Signup successful! Please check your email for verification.'
    });
  } catch (error) {
    console.error('Error in beta signup:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
} 