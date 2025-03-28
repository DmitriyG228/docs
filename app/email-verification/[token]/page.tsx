"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function EmailVerificationPage({ 
  params 
}: { 
  params: { token: string } 
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(true);
  const [status, setStatus] = useState("processing");
  
  useEffect(() => {
    async function verifyEmail() {
      try {
        // Directly access the token - in client components we can access it directly
        const token = params.token;
        console.log("Verifying with token:", token);
        
        if (!token) {
          console.error("No token found in URL params");
          setError("Missing verification token");
          setVerifying(false);
          setStatus("failed");
          router.push('/verification-failed');
          return;
        }
        
        // Call the API endpoint to verify the email
        console.log(`Calling API with token: ${token}`);
        const apiUrl = `/api/email-verification/${token}`;
        console.log("API URL:", apiUrl);
        
        try {
          // Instead of following redirects, let's use manual navigation after checking the result
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache',
            },
            // Prevent browser from automatically following redirects
            redirect: 'manual'
          });
          
          console.log("API response status:", response.status);
          console.log("API response type:", response.type);
          
          // Check if this is an opaqueredirect
          if (response.type === 'opaqueredirect') {
            // Success! Let's navigate manually
            console.log("Got opaqueredirect, assuming success");
            setStatus("success");
            setVerifying(false);
            router.push('/verification-success');
            return;
          }
          
          // We should not reach here in normal circumstances
          if (response.ok) {
            setStatus("success");
            setVerifying(false);
            router.push('/verification-success');
            return;
          } else {
            setStatus("failed");
            setVerifying(false);
            router.push('/verification-failed');
            return;
          }
        } catch (fetchError) {
          console.error("Fetch error:", fetchError);
          
          // If there's a fetch error, it might be due to CORS or redirect
          // Let's try checking the token directly ourselves
          try {
            // Make direct request to check token validity
            const checkResponse = await fetch(`/api/check-token?token=${token}`, {
              method: 'GET',
              headers: {
                'Cache-Control': 'no-cache',
              }
            });
            
            const checkData = await checkResponse.json();
            
            if (checkData.valid) {
              setStatus("success");
              setVerifying(false);
              router.push('/verification-success');
            } else {
              setStatus("failed");
              setError(checkData.error || "Token verification failed");
              setVerifying(false);
              router.push('/verification-failed');
            }
          } catch (checkError) {
            console.error("Token check error:", checkError);
            setStatus("failed");
            setError("Couldn't verify token status");
            setVerifying(false);
            router.push('/verification-failed');
          }
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerifying(false);
        setError('An unexpected error occurred during verification');
        setStatus("failed");
        router.push('/verification-failed');
      }
    }
    
    verifyEmail();
  }, [params.token, router]);
  
  // Decide what to render based on the status
  let content;
  
  if (verifying) {
    content = (
      <>
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Verifying your email...</h1>
        <p className="text-muted-foreground">Please wait while we verify your email address.</p>
      </>
    );
  } else if (status === "success") {
    // Redirect happened, but we'll show a message in case there's a delay
    content = (
      <>
        <h1 className="text-2xl font-bold mb-2">Verification successful!</h1>
        <p className="text-muted-foreground">Redirecting to success page...</p>
      </>
    );
  } else {
    // Failed verification
    content = (
      <>
        <h1 className="text-2xl font-bold mb-2">Verification failed</h1>
        <p className="text-muted-foreground">Redirecting to the error page...</p>
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center">
        {content}
      </div>
    </div>
  );
} 