'use client';

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export default function VerificationSuccessPage() {
  // Track verification success on page load
  useEffect(() => {
    trackEvent('email_verification_success');
  }, []);

  const handleDiscordClick = () => {
    trackEvent('discord_join_click', { location: 'verification_success' });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Email Verified Successfully!</h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for verifying your email address. Your application to join the Vexa beta program has been received.
        </p>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-md">
          <h2 className="font-semibold text-blue-800 mb-2">What happens next?</h2>
          <p className="text-blue-700 text-sm">
            We're reviewing applications and will reach out soon with access details. 
            In the meantime, you can join our Discord community to connect with other beta users.
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <Link 
            href="https://discord.gg/Ga9duGkVz9" 
            className="inline-flex items-center justify-center w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleDiscordClick}
          >
            Join Our Discord
          </Link>
          
          <Link 
            href="/" 
            className="inline-flex items-center justify-center w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
} 