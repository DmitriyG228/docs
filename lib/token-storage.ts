/**
 * Simple token storage utility for local development
 * Provides an in-memory fallback when Vercel KV is not available
 */

import { kv } from '@vercel/kv';

// In-memory storage for tokens when Vercel KV is not available
const localTokens = new Map<string, { data: any, expiry: number }>();

/**
 * Store token data with expiration
 */
export async function storeToken(token: string, data: any, expirySeconds: number): Promise<boolean> {
  try {
    console.log(`[token-storage] Attempting to store token: ${token.substring(0, 8)}...`);
    // Try to use Vercel KV first
    try {
      console.log('[token-storage] Trying to use Vercel KV');
      await kv.set(token, {
        ...data,
        createdAt: Date.now()
      }, { ex: expirySeconds });
      console.log('[token-storage] Successfully stored token in Vercel KV');
      return true;
    } catch (error) {
      // Fall back to local storage if Vercel KV fails
      console.log('[token-storage] Vercel KV not available, using local storage for tokens');
      console.log(`[token-storage] Error with Vercel KV: ${error instanceof Error ? error.message : String(error)}`);
      
      localTokens.set(token, {
        data: {
          ...data,
          createdAt: Date.now()
        },
        expiry: Date.now() + (expirySeconds * 1000)
      });
      console.log(`[token-storage] Token stored in local storage, will expire at: ${new Date(Date.now() + expirySeconds * 1000).toISOString()}`);
      console.log(`[token-storage] Currently stored tokens: ${localTokens.size}`);
      return true;
    }
  } catch (error) {
    console.error('[token-storage] Failed to store token:', error);
    return false;
  }
}

/**
 * Retrieve token data
 */
export async function getToken(token: string): Promise<any | null> {
  try {
    console.log(`[token-storage] Attempting to retrieve token: ${token.substring(0, 8)}...`);
    // Try to use Vercel KV first
    try {
      console.log('[token-storage] Trying to get token from Vercel KV');
      const data = await kv.get(token);
      console.log('[token-storage] Vercel KV response:', data ? 'Data found' : 'No data found');
      return data;
    } catch (error) {
      // Fall back to local storage if Vercel KV fails
      console.log('[token-storage] Vercel KV not available, checking local storage');
      console.log(`[token-storage] Error with Vercel KV: ${error instanceof Error ? error.message : String(error)}`);
      
      const storedData = localTokens.get(token);
      
      if (!storedData) {
        console.log('[token-storage] Token not found in local storage');
        return null;
      }
      
      console.log('[token-storage] Token found in local storage');
      // Check if token has expired
      if (storedData.expiry < Date.now()) {
        console.log('[token-storage] Token has expired, expiry was:', new Date(storedData.expiry).toISOString());
        localTokens.delete(token); // Clean up expired token
        return null;
      }
      
      console.log('[token-storage] Token is valid, returning data');
      return storedData.data;
    }
  } catch (error) {
    console.error('[token-storage] Failed to retrieve token:', error);
    return null;
  }
}

/**
 * Delete token
 */
export async function deleteToken(token: string): Promise<boolean> {
  try {
    console.log(`[token-storage] Attempting to delete token: ${token.substring(0, 8)}...`);
    // Try to use Vercel KV first
    try {
      console.log('[token-storage] Trying to delete token from Vercel KV');
      await kv.del(token);
      console.log('[token-storage] Successfully deleted token from Vercel KV');
      return true;
    } catch (error) {
      // Fall back to local storage if Vercel KV fails
      console.log('[token-storage] Vercel KV not available, using local storage');
      console.log(`[token-storage] Error with Vercel KV: ${error instanceof Error ? error.message : String(error)}`);
      
      console.log('[token-storage] Deleting token from local storage');
      const existed = localTokens.has(token);
      localTokens.delete(token);
      console.log('[token-storage] Token deleted:', existed ? 'existed' : 'did not exist');
      return true;
    }
  } catch (error) {
    console.error('[token-storage] Failed to delete token:', error);
    return false;
  }
} 
 
 
 