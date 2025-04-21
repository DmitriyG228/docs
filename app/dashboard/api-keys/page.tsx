"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AlertCircle, Check, Copy, Eye, EyeOff, Key, Loader2, Plus, Shield, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

export default function ApiKeysPage() {
  // Remove mock data, start with empty array
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]) 
  const [visibleKeys, setVisibleKeys] = useState<Record<number, boolean>>({}) // Use token ID as key
  const [newKeyDialogOpen, setNewKeyDialogOpen] = useState(false)
  const [newKeyData, setNewKeyData] = useState({
    name: "",
    // type: "test", // We'll ignore type for now as API doesn't support it
    // expiration: "never", // We'll ignore expiration for now
    userId: "" // Add userId field
  })
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<number | "new" | null>(null) // Use token ID or "new"
  const [isLoading, setIsLoading] = useState(false) // Loading state for API calls
  const [error, setError] = useState<string | null>(null) // Error state

  // TODO: Implement fetching existing keys when backend API supports it
  // useEffect(() => {
  //   const fetchApiKeys = async () => {
  //     setIsLoading(true);
  //     setError(null);
  //     try {
  //       // This needs the current user's ID
  //       // const response = await fetch(`/api/admin/tokens?userId=YOUR_USER_ID_HERE`); 
  //       // if (!response.ok) {
  //       //   throw new Error('Failed to fetch API keys');
  //       // }
  //       // const data = await response.json();
  //       // setApiKeys(data.tokens || []); // Adjust based on actual API response structure
  //       
  //       // For now, just set loading to false
  //       setApiKeys([]); // Start empty as we can't fetch
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : 'An unknown error occurred');
  //       toast({
  //         title: "Error fetching keys",
  //         description: err instanceof Error ? err.message : 'Could not load API keys.',
  //         variant: "destructive",
  //       });
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchApiKeys();
  // }, []);


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
    if (!newKeyData.userId) {
      toast({
        title: "User ID required",
        description: "Please enter the User ID to create a key for.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: parseInt(newKeyData.userId, 10) }), // Send userId
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || result.error || 'Failed to create API key');
      }

      // Assuming the API returns the created token object matching our ApiKey interface
      const newKey: ApiKey = {
        ...result,
        // Add frontend-specific fields if needed (like prefix)
        // name: newKeyData.name || `API Key ${result.id}`, // Use name from input or generate one
        prefix: "sk_", // Assume a standard prefix for display
        active: true, // Assume active on creation
        type: 'live' // Assume live type for now
      };

      setApiKeys([newKey, ...apiKeys]);
      setNewlyCreatedKey(newKey.token); // Show the full token value after creation
      setNewKeyData({ name: "", userId: "" }); // Reset form
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
      setIsLoading(false);
    }
  }

  // --- Modified: Revoke API key ---
  const revokeApiKey = async (keyId: number) => {
    // Note: This requires the DELETE /api/admin/tokens/[tokenId] endpoint to be fully functional,
    // which in turn requires DELETE /admin/tokens/{token_id} in the main admin API.

    setIsLoading(true); // Consider separate loading state per key if needed
    setError(null);

    try {
      const response = await fetch(`/api/admin/tokens/${keyId}`, {
        method: 'DELETE',
      });

      // Check for 204 No Content or other success statuses
      if (response.status === 204 || response.ok) {
        // Remove the key from the frontend state
        setApiKeys(apiKeys.filter((key) => key.id !== keyId));

        toast({
          title: "API key revoked",
          description: "The API key has been revoked and can no longer be used.",
          duration: 3000,
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
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              V
            </div>
            Vexa DevPortal
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="/docs" className="text-sm font-medium transition-colors hover:text-primary">
              Documentation
            </Link>
            <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary text-primary">
              Dashboard
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              Account
            </Button>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden lg:flex w-64 flex-col border-r">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Dashboard</h2>
            <nav className="grid gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                Overview
              </Link>
              <Link
                href="/dashboard/api-keys"
                className="flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm font-medium transition-colors"
              >
                <Key className="h-4 w-4" />
                API Keys
              </Link>
            </nav>
          </div>
        </aside>
        <main className="flex-1 p-6 lg:p-10">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
                <p className="mt-2 text-muted-foreground">Create and manage API keys to authenticate your requests.</p>
              </div>
              <Dialog open={newKeyDialogOpen} onOpenChange={setNewKeyDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    Create new API key
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create new API key</DialogTitle>
                    <DialogDescription>
                      Create a new API key for a specific user. You will only be able to view the key once.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="user-id">User ID</Label>
                      <Input
                        id="user-id"
                        type="number"
                        placeholder="Enter the User ID"
                        value={newKeyData.userId}
                        onChange={(e) => setNewKeyData({ ...newKeyData, userId: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the ID of the user you want to generate this key for.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNewKeyDialogOpen(false)} disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button
                      onClick={createNewApiKey}
                      disabled={isLoading || !newKeyData.userId}
                    >
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Create API key
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

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
            </div>

            {/* Display error message if any */}
            {error && (
               <div className="p-4 bg-destructive/10 text-destructive rounded-md text-sm">
                 <strong>Error:</strong> {error}
               </div>
             )}
            
            {/* Display loading indicator */}
             {isLoading && !newKeyDialogOpen && ( // Don't show global loading when dialog is open and loading
               <div className="flex justify-center items-center py-10">
                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                 <span className="ml-2 text-muted-foreground">Loading keys...</span>
               </div>
             )}

            {/* --- Tabs for Active/Revoked keys --- */}
            {/* Note: Revoked keys tab won't work until backend supports fetching/status */}
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="active">
                  Active Keys
                  <Badge variant="secondary" className="ml-2">
                    {/* Calculate count based on actual state */}
                    {apiKeys.filter((key: ApiKey) => key.active !== false).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="revoked" disabled> {/* Disable until backend ready */}
                  Revoked Keys
                  <Badge variant="secondary" className="ml-2">
                     {apiKeys.filter((key: ApiKey) => key.active === false).length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {/* --- Active Keys Tab --- */}
              <TabsContent value="active" className="space-y-4">
                 {/* Show message if no keys and not loading */}
                 {!isLoading && apiKeys.filter((key: ApiKey) => key.active !== false).length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                      <Key className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No active API keys</h3>
                      <p className="text-muted-foreground mb-4">
                         Create a new API key to get started.
                      </p>
                      <Button onClick={() => setNewKeyDialogOpen(true)}>Create API key</Button>
                    </CardContent>
                  </Card>
                ) : (
                  // Map over actual API keys
                  apiKeys
                    .filter((key: ApiKey) => key.active !== false) // Filter for active keys
                    .map((key: ApiKey) => ( // Map over active keys
                      <Card key={key.id}>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                          <div className="space-y-1">
                            <CardTitle>
                              {/* Use generated name or default */}
                              {key.name || `API Key ${key.id}`}
                            </CardTitle>
                            <CardDescription>
                              {/* Display prefix and last 4 chars */}
                              {key.prefix || "sk_"}...{key.token.slice(-4)}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Revoke Key Dialog */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8 text-destructive">
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
                                    onClick={() => revokeApiKey(key.id)} // Call revoke function
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
                                value={key.token} // Display the full token here
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
                              onClick={() => copyToClipboard(key.id, key.token)} // Copy full token
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
                          {/* Last used requires backend implementation */}
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
                {/* Map over revoked keys when data is available */}
              </TabsContent>
            </Tabs>

            {/* Security Best Practices Card remains the same */}
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
          </div>
        </main>
      </div>
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} DevPortal. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
      <Toaster />
    </div>
  )
}

