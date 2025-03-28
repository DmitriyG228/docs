import { NextResponse } from 'next/server';
import { getToken } from '@/lib/token-storage';

export async function GET(request: Request) {
  try {
    // Get the token from the URL
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    
    console.log('Checking token validity:', token);
    
    if (!token) {
      console.log('No token provided');
      return NextResponse.json(
        { valid: false, error: 'No token provided' },
        { status: 400 }
      );
    }
    
    // Retrieve verification data from token storage
    const tokenKey = `verification:${token}`;
    console.log("Looking up token key:", tokenKey);
    const verificationData = await getToken(tokenKey);
    
    if (!verificationData) {
      console.log("No verification data found for token");
      return NextResponse.json(
        { valid: false, error: 'Invalid or expired token' },
        { status: 200 }
      );
    }
    
    // Check token expiration (24 hours)
    const now = Date.now();
    if (now - verificationData.createdAt > 24 * 60 * 60 * 1000) {
      console.log("Token expired, created at:", new Date(verificationData.createdAt).toISOString());
      return NextResponse.json(
        { valid: false, error: 'Token expired' },
        { status: 200 }
      );
    }
    
    // Token is valid
    console.log("Token is valid");
    return NextResponse.json(
      { valid: true },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  } catch (error) {
    console.error('Error checking token:', error);
    return NextResponse.json(
      { valid: false, error: 'Server error while checking token' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  }
} 