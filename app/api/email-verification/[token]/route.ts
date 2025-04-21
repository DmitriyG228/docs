import { NextRequest, NextResponse } from 'next/server';
import { getToken, deleteToken } from '@/lib/token-storage';

// Define types for the application
interface SendPulseTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface VerificationTokenData {
  email: string;
  company: string;
  companyBusiness: string;
  companySize: string;
  linkedIn?: string;
  twitter?: string;
  mainPlatform: string;
  otherPlatform?: string;
  useCase: string;
  createdAt: number;
}

// Admin API endpoint
const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:8000';
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN;

// Function to get SendPulse token
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

// Function to add contact to SendPulse
async function addContactToSendPulse(token: string, data: VerificationTokenData) {
  const mailingListId = process.env.SENDPULSE_MAILING_LIST_ID;
  
  if (!mailingListId) {
    throw new Error('SendPulse mailing list ID not configured');
  }

  const response = await fetch(`https://api.sendpulse.com/addressbooks/${mailingListId}/emails`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      emails: [
        {
          email: data.email,
          variables: {
            name: data.company,
            company_size: data.companySize,
            company_business: data.companyBusiness,
            use_case: data.useCase,
            main_platform: data.mainPlatform,
            other_platform: data.otherPlatform || '',
            linkedin: data.linkedIn || '',
            twitter: data.twitter || '',
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to add contact to SendPulse: ${errorText}`);
  }

  return response.json();
}

// Function to create user in Admin API
async function createUserInAdminAPI(data: VerificationTokenData) {
  console.log('Creating user in Admin API:', data.email);
  
  if (!ADMIN_API_TOKEN) {
    throw new Error('Admin API token not configured');
  }

  const response = await fetch(`${ADMIN_API_URL}/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-API-Key': ADMIN_API_TOKEN,
    },
    body: JSON.stringify({
      email: data.email,
      name: data.company, // Use company name as user name
    }),
  });

  if (response.status === 409) {
    // User already exists - this is fine, not an error
    console.log('User already exists in system:', data.email);
    const userData = await response.json();
    return userData;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create user in Admin API: ${errorText}`);
  }

  const userData = await response.json();
  console.log('User created successfully:', userData);
  return userData;
}

// Function to send welcome email
async function sendWelcomeEmail(token: string, data: VerificationTokenData) {
  try {
    console.log('🟢 Getting welcome email configuration...');
    const discordLink = process.env.DISCORD_INVITE_LINK || 'https://discord.gg/Ga9duGkVz9';
    
    // Import the welcome email template functions
    const { getWelcomeEmailConfig } = await import('../../../../emails/templates/welcome/welcome');
    
    const emailConfig = getWelcomeEmailConfig({
      recipient: {
        name: data.company,
        email: data.email
      },
      companyName: data.company,
      discordLink
    });
    
    // Create a proper email payload that prioritizes HTML content
    const emailPayload = {
      ...emailConfig,
      html_content_first: true,
      content_type: 'text/html'
    };
    
    console.log('Sending welcome email with payload:', JSON.stringify({
      ...emailPayload,
      email: {
        ...emailPayload.email,
        html: '[HTML CONTENT OMITTED FOR LOG SIZE]',
        text: '[TEXT CONTENT OMITTED FOR LOG SIZE]'
      }
    }, null, 2));
    
    const response = await fetch('https://api.sendpulse.com/smtp/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(emailPayload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send welcome email: ${errorText}`);
    }
    
    console.log('Welcome email sent successfully');
    return response.json();
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

// The main handler function for the route
export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  console.log(`Route handler called with URL:`, request.url);
  console.log(`Received params:`, JSON.stringify(params, null, 2));
  
  try {
    // Correctly access the token from params without awaiting
    const tokenValue = params.token;
    console.log("Verification token received:", tokenValue);

    // Retrieve verification data from token storage
    const tokenKey = `verification:${tokenValue}`;
    console.log("Looking up token key:", tokenKey);
    const verificationData = await getToken(tokenKey) as VerificationTokenData | null;
    
    if (!verificationData) {
      console.log("No verification data found for token");
      // Token not found or expired
      const baseUrl = new URL(request.url).origin;
      return NextResponse.redirect(`${baseUrl}/verification-failed`, { status: 302 });
    }

    console.log("Verification data found:", JSON.stringify(verificationData, null, 2));

    // Check token expiration (24 hours)
    const now = Date.now();
    if (now - verificationData.createdAt > 24 * 60 * 60 * 1000) {
      console.log("Token expired, created at:", new Date(verificationData.createdAt).toISOString());
      // Token expired
      await deleteToken(tokenKey);
      const baseUrl = new URL(request.url).origin;
      return NextResponse.redirect(`${baseUrl}/verification-expired`, { status: 302 });
    }

    // Get SendPulse token
    console.log("Getting SendPulse token");
    const tokenResponse = await getSendPulseToken();
    const accessToken = tokenResponse.access_token;

    // Add contact to SendPulse
    console.log("Adding contact to SendPulse:", verificationData.email);
    await addContactToSendPulse(accessToken, verificationData);
    
    // Create user in Admin API
    try {
      console.log("Creating user in Admin API:", verificationData.email);
      const userData = await createUserInAdminAPI(verificationData);
      console.log("User created/found in Admin API:", userData);
      
      // TODO: Consider creating an initial API token for the user here
      // This would require an additional API call to the Admin API token endpoint
    } catch (error) {
      console.error("Error creating user in Admin API:", error);
      // Continue with the flow even if user creation fails
      // We don't want to block the verification process due to admin API issues
    }
    
    // Send welcome email
    console.log("Sending welcome email to:", verificationData.email);
    await sendWelcomeEmail(accessToken, verificationData);

    // Delete the verification token
    console.log("Deleting verification token");
    await deleteToken(tokenKey);

    // Get base URL for redirects
    const baseUrl = new URL(request.url).origin;
    console.log("Base URL for redirect:", baseUrl);

    // Create a response with CORS headers
    const successUrl = `${baseUrl}/verification-success`;
    console.log("Redirecting to:", successUrl);
    
    const response = NextResponse.redirect(successUrl, { status: 302 });
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    console.log("Verification successful, sending redirect response with headers");
    return response;
  } catch (error) {
    console.error('Error verifying email:', error);
    const baseUrl = new URL(request.url).origin;
    
    const response = NextResponse.redirect(`${baseUrl}/verification-failed`, { status: 302 });
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
  }
} 
 
 
 