"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AlertCircle, Check, Copy, Eye, EyeOff, Key, Loader2, Plus, Shield, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Define the structure for an API key (adjust based on actual API response)
interface ApiKey {
  id: number // Assuming the token ID from the database
  token: string // The actual API token string
  user_id: number
  created_at: string // ISO date string
  name?: string // Optional name (consider adding this to the admin API/DB)
  prefix?: string // Assuming 'sk_...' prefix is standard, maybe generate on frontend or have API return it
  active?: boolean // Assuming keys are active by default, revocation needs backend support
  lastUsed?: string | null // Placeholder, needs backend support
  expiredAt?: string | null // Placeholder, needs backend support
  type?: 'live' | 'test' // Placeholder, assuming all keys are 'live' for now
}

// Define the structure for the user object in the session
interface SessionUser {
  id?: string | number; // Ensure ID is expected (next-auth adds it as string from JWT)
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// Define the structure for the session data
interface SessionData {
  user?: SessionUser;
  expires: string;
}

export default function ApiKeysPage() {
  const { data: session, status: sessionStatus } = useSession(); // Get session data
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]) 
  const [visibleKeys, setVisibleKeys] = useState<Record<number, boolean>>({}) // Use token ID as key
  const [newKeyDialogOpen, setNewKeyDialogOpen] = useState(false)
  const [copiedKey, setCopiedKey] = useState<number | "new" | null>(null) // Use token ID or "new"
  const [isLoading, setIsLoading] = useState(true) // Start loading true to fetch keys
  const [error, setError] = useState<string | null>(null) // Error state

  // *** Define fetchApiKeys function here to be callable from other functions ***
  const fetchApiKeys = async () => {
    // Only fetch if session is loaded and authenticated
    if (sessionStatus !== "authenticated" || !(session as SessionData)?.user?.id) {
      setIsLoading(false); // Stop loading if not authenticated
      setApiKeys([]); // Clear keys if not logged in
      return; // Exit if not authenticated
    }
    
    const userId = (session as SessionData).user?.id; // Get user ID from session
    if (!isLoading) setIsLoading(true); // Set loading state
    setError(null); // Clear previous errors

    try {
      const response = await fetch(`/api/admin/tokens?userId=${userId}`); 
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to parse error
        throw new Error(errorData.detail || errorData.error || 'Failed to fetch API keys');
      }
      
      const data = await response.json();
      // *** Log the received data ***
      console.log("Data received from /api/admin/tokens:", JSON.stringify(data, null, 2)); 
      
      // Assuming the GET /admin/users/{id} endpoint returns user details including a 'tokens' array.
      // *** UPDATED: Read from data.api_tokens ***
      setApiKeys(data.api_tokens || []); 
    } catch (err) {
      console.error("Error fetching keys:", err); // Log error for debugging
      setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching keys.');
      toast({
        title: "Error loading keys",
        description: err instanceof Error ? err.message : 'Could not load your API keys.',
        variant: "destructive",
      });
      setApiKeys([]); // Clear keys on error
    } finally {
      setIsLoading(false); // Turn off loading state
    }
  };

  // Fetch API keys when the component mounts and session is loaded
  useEffect(() => {
    fetchApiKeys();
  }, [sessionStatus, session]); // Re-run effect when session status or session data changes

  // Format date to relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Format date to full date (e.g., "March 15, 2024")
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Toggle key visibility
  const toggleKeyVisibility = (keyId: number) => {
    setVisibleKeys((prev: Record<number, boolean>) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }))
  }

  // Copy key to clipboard
  const copyToClipboard = (keyId: number | "new", fullKey: string) => {
    if (!fullKey) return;
    navigator.clipboard.writeText(fullKey)
    setCopiedKey(keyId)
    setTimeout(() => setCopiedKey(null), 2000)

    toast({
      title: "API key copied",
      description: "The API key has been copied to your clipboard.",
      duration: 3000,
    })
  }

  // --- Modified: Create new API key ---
  const createNewApiKey = async () => {
    // Check if user is logged in
    if (sessionStatus !== "authenticated" || !(session as SessionData)?.user?.id) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create an API key.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const userId = (session as SessionData).user?.id; // Get user ID from session

    // Consider separate loading state for creation vs fetching
    // setIsLoadingCreate(true); 
    setError(null);

    try {
      const response = await fetch('/api/admin/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
         // Send the logged-in user's ID
        body: JSON.stringify({ userId: Number(userId) }), // Convert string ID from session if necessary
      });

      // const result = await response.json(); // No longer needed here

      if (!response.ok) {
         // Try to parse error from creation response
         const errorResult = await response.json().catch(() => ({}));
        throw new Error(errorResult.detail || errorResult.error || 'Failed to create API key');
      }

      // *** Re-fetch keys after successful creation ***
      await fetchApiKeys(); // Call the shared function to refresh

      // Remove lines that manually updated local state:
      // const newKey: ApiKey = { ...result, ... }; 
      // setApiKeys([newKey, ...apiKeys]); 
      // setNewlyCreatedKey(newKey.token); 

      setNewKeyDialogOpen(false); // Close the dialog

      toast({
        title: "API key created",
        description: "Your new API key has been successfully created.",
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: "Error creating key",
        description: err instanceof Error ? err.message : 'Could not create API key.',
        variant: "destructive",
      });
    } finally {
      // setIsLoadingCreate(false);
    }
  }

  // --- Modified: Revoke API key ---
  const revokeApiKey = async (keyId: number) => {
    // Note: This requires the DELETE /api/admin/tokens/[tokenId] endpoint to be fully functional,
    // which in turn requires DELETE /admin/tokens/{token_id} in the main admin API.

    // Consider separate loading state 
    // setIsLoadingRevoke(true);
    setError(null);
    const userId = (session as SessionData)?.user?.id; // Need userId to re-fetch

    if (!userId) {
       toast({ title: "Error", description: "User session not found.", variant: "destructive" });
       return;
    }


    try {
      const response = await fetch(`/api/admin/tokens/${keyId}`, { // Assumes BFF route exists
        method: 'DELETE',
      });

      // Check for 204 No Content or other success statuses
      if (response.status === 204 || response.ok) {

        // *** Re-fetch keys after successful deletion ***
        await fetchApiKeys(); // Call the shared function to refresh

        toast({
          title: "API key revoked",
          description: "The API key has been revoked.",
        });

      } else {
         // Attempt to parse error message if available
        let errorDetail = 'Failed to revoke API key';
        try {
          const result = await response.json();
          errorDetail = result.detail || result.error || errorDetail;
        } catch (e) {
           // Ignore if response is not JSON
        }
        throw new Error(errorDetail);
      }
    } catch (err) {
       setError(err instanceof Error ? err.message : 'An unknown error occurred during revocation');
       toast({
         title: "Error revoking key",
         description: err instanceof Error ? err.message : 'Could not revoke API key.',
         variant: "destructive",
       });
    } finally {
      // setIsLoadingRevoke(false);
    }
  }

  // --- Render Logic ---

  // Handle loading state for session and initial key fetch
  if (sessionStatus === "loading" || isLoading) {
     return (
       // This component only renders the main content area, assuming layout provides structure
       <div className="flex justify-center items-center py-20">
         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
         <span className="ml-2 text-muted-foreground">Loading API Keys...</span>
       </div>
     );
   }

  // Handle unauthenticated state (middleware should prevent this, but good fallback)
   if (sessionStatus === "unauthenticated") {
     return (
       <div className="text-center py-20">
         <p className="mb-4 text-muted-foreground">Please log in to manage your API keys.</p>
         {/* You might want to add a login button here if middleware fails */}
         {/* <Button onClick={() => signIn('google')}>Login with Google</Button> */}
       </div>
     );
   }

  // Main component render (when authenticated and loaded)
  return (
    // This component now assumes it's rendered within a layout that provides
    // the overall page structure (header, sidebar, etc.)
    // It focuses only on the API key management section.
          <div className="mx-auto max-w-4xl space-y-8">
      {/* Header Section */} 
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="mt-2 text-muted-foreground">Create and manage your API keys.</p>
              </div>
        {/* --- Create Key Dialog Trigger --- */}
              <Dialog open={newKeyDialogOpen} onOpenChange={setNewKeyDialogOpen}>
                <DialogTrigger asChild>
            <Button className="gap-1.5" disabled={sessionStatus !== 'authenticated'}>
                    <Plus className="h-4 w-4" />
                    Create new API key
                  </Button>
                </DialogTrigger>
          {/* --- Create Key Dialog Content (No longer needs userId input) --- */}
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create new API key</DialogTitle>
                    <DialogDescription>
                Click create to generate a new API key. You will only be able to view the key once.
                    </DialogDescription>
                  </DialogHeader>
             {/* Removed user id input */}
            {/* Optional: Add name input? */}
                  <DialogFooter>
              <Button variant="outline" onClick={() => setNewKeyDialogOpen(false)} >
                      Cancel
                    </Button>
                    <Button
                onClick={createNewApiKey} 
                // Consider adding loading state specific to create button
                // disabled={isLoadingCreate || sessionStatus !== 'authenticated'}
                 disabled={sessionStatus !== 'authenticated'} // Disable if not logged in
              >
                {/* {isLoadingCreate ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} */}
                      Create API key
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

        {/* --- Show Newly Created Key Dialog (REMOVED - Key is now just part of the list) --- */}
              {/* 
              <Dialog open={newlyCreatedKey !== null} onOpenChange={(open) => !open && setNewlyCreatedKey(null)}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Your new API key
                    </DialogTitle>
                    <DialogDescription>
                      This is the only time your full API key will be displayed. Copy it now and store it securely.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="relative">
                      <Input value={newlyCreatedKey || ""} readOnly className="pr-10 font-mono text-sm" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-1"
                        onClick={() => newlyCreatedKey && copyToClipboard("new", newlyCreatedKey)}
                      >
                        {copiedKey === "new" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 mt-0.5" />
                        <div>
                          <strong>Important:</strong> For security reasons, we don't store your API key in a readable
                          format after creation. If you lose this key, you'll need to create a new one.
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setNewlyCreatedKey(null)}>I've saved my API key</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog> 
              */}
            </div>

      {/* Display error message if any */} 
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* --- Tabs for Active/Revoked keys --- */}
            <Tabs defaultValue="active" className="w-full">
              {/* REMOVED TabsList
              <TabsList className="mb-4">
                <TabsTrigger value="active">
                  Active Keys
                  <Badge variant="secondary" className="ml-2">
              {apiKeys.filter((key: ApiKey) => key.active !== false).length}
                  </Badge>
                </TabsTrigger>
          <TabsTrigger value="revoked" disabled> 
                  Revoked Keys
                  <Badge variant="secondary" className="ml-2">
              {apiKeys.filter((key: ApiKey) => key.active === false).length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
              */}

        {/* --- Active Keys Tab --- */}
              <TabsContent value="active" className="space-y-4">
          {/* Show message if no keys and not loading/error */}
          {!isLoading && !error && apiKeys.filter((key: ApiKey) => key.active !== false).length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                      <Key className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No active API keys</h3>
                      <p className="text-muted-foreground mb-4">
                  Create your first API key to get started.
                      </p>
                <Button onClick={() => setNewKeyDialogOpen(true)} disabled={sessionStatus !== 'authenticated'}>Create API key</Button>
                    </CardContent>
                  </Card>
                ) : (
            // Map over keys only if not loading and no error 
            !isLoading && !error && apiKeys
              .filter((key: ApiKey) => key.active !== false)
              .map((key: ApiKey) => (
                      <Card key={key.id}>
                   <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                          <div className="space-y-1">
                            <CardTitle>
                              {key.name || `API Key ${key.id}`}
                            </CardTitle>
                            <CardDescription>
                              {key.prefix || "sk_"}...{key.token.slice(-4)}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8 text-destructive" disabled={sessionStatus !== 'authenticated'}>
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Revoke key</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Revoke API key</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to revoke this API key? This action cannot be undone, and any
                                    applications using this key will no longer be able to access the API.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => revokeApiKey(key.id)}
                                    disabled={sessionStatus !== 'authenticated'}
                                  >
                                    Revoke
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <Input
                                type={visibleKeys[key.id] ? "text" : "password"}
                                value={key.token}
                                readOnly
                                className="pr-10 font-mono text-sm"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 py-1"
                                onClick={() => toggleKeyVisibility(key.id)}
                              >
                                {visibleKeys[key.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span className="sr-only">{visibleKeys[key.id] ? "Hide key" : "Show key"}</span>
                              </Button>
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => copyToClipboard(key.id, key.token)}
                            >
                              {copiedKey === key.id ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                              <span className="sr-only">Copy key</span>
                            </Button>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                           <div className="text-xs text-muted-foreground">Created: {formatDate(key.created_at)}</div>
                           <div className="text-xs text-muted-foreground">Last used: {formatRelativeTime(key.lastUsed)}</div>
                        </CardFooter>
                      </Card>
                    ))
                )}
              </TabsContent>

        {/* --- Revoked Keys Tab (Placeholder) --- */}
              <TabsContent value="revoked" className="space-y-4">
                  <Card>
             <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">Revoked key display requires backend implementation.</p>
                    </CardContent>
                  </Card>
              </TabsContent>
            </Tabs>

      {/* --- Security Best Practices Card --- */}
            <Card>
              <CardHeader>
                <CardTitle>API Key Security</CardTitle>
                <CardDescription>Best practices for managing your API keys securely.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Keep your API keys secure</h3>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Never expose your API keys in client-side code or public repositories</li>
                    <li>Store API keys in environment variables or a secure key management system</li>
                    <li>Rotate your API keys periodically, especially after team member changes</li>
                    <li>Use different API keys for different environments (development, staging, production)</li>
                    <li>Revoke unused or compromised API keys immediately</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
      <Toaster />
    </div>
  );
}

