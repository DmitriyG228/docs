import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import Link from "next/link";

export default function VerificationExpiredPage() {
  return (
    <div className="container max-w-2xl mx-auto py-16 px-4">
      <div className="text-center space-y-6 bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-center">
          <Clock className="h-20 w-20 text-amber-500" />
        </div>
        
        <h1 className="text-3xl font-bold">Verification Link Expired</h1>
        
        <p className="text-lg text-gray-600">
          This verification link has expired. For security reasons, verification links are only valid for 24 hours.
        </p>
        
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 my-6">
          <h2 className="text-xl font-semibold mb-3">What to do next</h2>
          <ul className="text-left space-y-3 text-gray-600">
            <li>• Please submit your application again to receive a new verification link</li>
            <li>• Make sure to verify your email within 24 hours</li>
            <li>• Check your spam folder if you don't see the verification email</li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <Link href="/public-beta">
              Apply Again
            </Link>
          </Button>
          
          <Button asChild variant="outline">
            <Link href="/">
              Return to Homepage
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 
 
 
 