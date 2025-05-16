import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function VerificationFailedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold mb-2 text-gray-900">Verification Failed</h1>
        
        <p className="text-gray-600 mb-6">
          We couldn't verify your email address. The verification link may be invalid or has already been used.
        </p>
        
        <div className="mb-6 p-4 bg-amber-50 rounded-md">
          <h2 className="font-semibold text-amber-800 mb-2">Try these steps:</h2>
          <ul className="text-amber-700 text-sm text-left list-disc list-inside space-y-2">
            <li>Make sure you're using the most recent verification link sent to your email</li>
            <li>If it's been more than 24 hours, the link may have expired</li>
            <li>Try submitting your application again</li>
            <li>Contact support if you continue having issues</li>
          </ul>
        </div>
        
        <div className="flex flex-col gap-3">
          <Link 
            href="/public-beta" 
            className="inline-flex items-center justify-center w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Apply Again
          </Link>
          
          <Link 
            href="/" 
            className="inline-flex items-center justify-center w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
          >
            Return to Homepage
          </Link>
          
          {/* <a 
            href="mailto:support@vexa.ai" 
            className="text-sm text-indigo-600 hover:text-indigo-800 transition mt-2"
          >
            Contact Support
          </a> */}
        </div>
      </div>
    </div>
  );
} 
 
 
 