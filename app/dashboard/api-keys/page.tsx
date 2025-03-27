"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertCircle, Check, Copy, Eye, EyeOff, Key, Plus, Shield, Trash2 } from "lucide-react"

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

// Mock data for API keys
const mockApiKeys = [
  {
    id: "key_1",
    name: "Production API Key",
    prefix: "sk_live_",
    value: "51NZXRLJMYTMj6Xo2CeIYl9Hs7vD8jTXQVlOI",
    type: "live",
    createdAt: "2024-03-15T10:30:00Z",
    lastUsed: "2024-03-25T15:30:00Z",
    active: true,
  },
  {
    id: "key_2",
    name: "Development API Key",
    prefix: "sk_test_",
    value: "51NZXRLJMYTMj6Xo2CeIYl9Hs7vD8jTXQVlOI",
    type: "test",
    createdAt: "2024-02-28T14:20:00Z",
    lastUsed: "2024-03-24T09:45:00Z",
    active: true,
  },
  {
    id: "key_3",
    name: "Old Production API Key",
    prefix: "sk_live_",
    value: "51MZXRLJMYTMj6Xo2CeIYl9Hs7vD8jTXQVlOI",
    type: "live",
    createdAt: "2024-01-10T08:15:00Z",
    expiredAt: "2024-03-15T10:30:00Z",
    active: false,
  },
]

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState(mockApiKeys)
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})
  const [newKeyDialogOpen, setNewKeyDialogOpen] = useState(false)
  const [newKeyData, setNewKeyData] = useState({
    name: "",
    type: "test",
    expiration: "never",
  })
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  // Format date to relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString: string) => {
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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Toggle key visibility
  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys((prev) => ({
      ...prev,
      [keyId]: !prev[keyId],
    }))
  }

  // Copy key to clipboard
  const copyToClipboard = (keyId: string, fullKey: string) => {
    navigator.clipboard.writeText(fullKey)
    setCopiedKey(keyId)
    setTimeout(() => setCopiedKey(null), 2000)

    toast({
      title: "API key copied",
      description: "The API key has been copied to your clipboard.",
      duration: 3000,
    })
  }

  // Create new API key
  const createNewApiKey = () => {
    // Generate a random key value (in a real app, this would come from the server)
    const randomKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    const prefix = newKeyData.type === "live" ? "sk_live_" : "sk_test_"
    const fullKey = `${prefix}${randomKey}`

    const newKey = {
      id: `key_${apiKeys.length + 1}`,
      name: newKeyData.name || `${newKeyData.type === "live" ? "Production" : "Development"} API Key`,
      prefix,
      value: randomKey,
      type: newKeyData.type,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      active: true,
    }

    setApiKeys([newKey, ...apiKeys])
    setNewlyCreatedKey(fullKey)
    setNewKeyData({ name: "", type: "test", expiration: "never" })
  }

  // Revoke API key
  const revokeApiKey = (keyId: string) => {
    setApiKeys(
      apiKeys.map((key) =>
        key.id === keyId
          ? {
              ...key,
              active: false,
              expiredAt: new Date().toISOString(),
            }
          : key,
      ),
    )

    toast({
      title: "API key revoked",
      description: "The API key has been revoked and can no longer be used.",
      duration: 3000,
    })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              D
            </div>
            DevPortal
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="/docs" className="text-sm font-medium transition-colors hover:text-primary">
              Documentation
            </Link>
            <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
              Dashboard
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              John Doe
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
                className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-medium transition-colors"
              >
                <Key className="h-4 w-4" />
                API Keys
              </Link>
              <Link
                href="#"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                Usage
              </Link>
              <Link
                href="#"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                Billing
              </Link>
              <Link
                href="#"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                Settings
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
                      Create a new API key for your application. You will only be able to view the key once after
                      creation.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="key-name">Key name</Label>
                      <Input
                        id="key-name"
                        placeholder="e.g., Production Backend"
                        value={newKeyData.name}
                        onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="key-type">Key type</Label>
                      <Select
                        value={newKeyData.type}
                        onValueChange={(value) => setNewKeyData({ ...newKeyData, type: value })}
                      >
                        <SelectTrigger id="key-type">
                          <SelectValue placeholder="Select key type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="test">Test key</SelectItem>
                          <SelectItem value="live">Live key</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {newKeyData.type === "live"
                          ? "Use live keys for production environments. These keys can perform real actions."
                          : "Use test keys for development and testing. These keys only work in test mode."}
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="expiration">Expiration</Label>
                      <Select
                        value={newKeyData.expiration}
                        onValueChange={(value) => setNewKeyData({ ...newKeyData, expiration: value })}
                      >
                        <SelectTrigger id="expiration">
                          <SelectValue placeholder="Select expiration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="30days">30 days</SelectItem>
                          <SelectItem value="90days">90 days</SelectItem>
                          <SelectItem value="1year">1 year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setNewKeyDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        createNewApiKey()
                        setNewKeyDialogOpen(false)
                      }}
                    >
                      Create API key
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Dialog to show newly created key */}
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
                          format. If you lose this key, you'll need to create a new one.
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

            <Tabs defaultValue="active" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="active">
                  Active Keys
                  <Badge variant="secondary" className="ml-2">
                    {apiKeys.filter((key) => key.active).length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="revoked">
                  Revoked Keys
                  <Badge variant="secondary" className="ml-2">
                    {apiKeys.filter((key) => !key.active).length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                {apiKeys.filter((key) => key.active).length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                      <Key className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No active API keys</h3>
                      <p className="text-muted-foreground mb-4">
                        You don't have any active API keys. Create one to get started.
                      </p>
                      <Button onClick={() => setNewKeyDialogOpen(true)}>Create API key</Button>
                    </CardContent>
                  </Card>
                ) : (
                  apiKeys
                    .filter((key) => key.active)
                    .map((key) => (
                      <Card key={key.id}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CardTitle>{key.name}</CardTitle>
                              <Badge variant={key.type === "live" ? "default" : "outline"}>
                                {key.type === "live" ? "Live" : "Test"}
                              </Badge>
                            </div>
                            <CardDescription>
                              {key.type === "live"
                                ? "Use this key for your production environment."
                                : "Use this key for testing and development."}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
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
                                    onClick={() => revokeApiKey(key.id)}
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
                                value={`${key.prefix}${key.value}`}
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
                              onClick={() => copyToClipboard(key.id, `${key.prefix}${key.value}`)}
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
                          <div className="text-xs text-muted-foreground">Created: {formatDate(key.createdAt)}</div>
                          <div className="text-xs text-muted-foreground">
                            {key.lastUsed ? `Last used: ${formatRelativeTime(key.lastUsed)}` : "Never used"}
                          </div>
                        </CardFooter>
                      </Card>
                    ))
                )}
              </TabsContent>

              <TabsContent value="revoked" className="space-y-4">
                {apiKeys.filter((key) => !key.active).length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                      <Key className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No revoked API keys</h3>
                      <p className="text-muted-foreground">You don't have any revoked API keys.</p>
                    </CardContent>
                  </Card>
                ) : (
                  apiKeys
                    .filter((key) => !key.active)
                    .map((key) => (
                      <Card key={key.id} className="opacity-80">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CardTitle>{key.name}</CardTitle>
                              <Badge variant="outline" className="text-muted-foreground">
                                Revoked
                              </Badge>
                            </div>
                            <CardDescription>This key has been revoked and is no longer active.</CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <Input
                                type="text"
                                value={`${key.prefix}...${key.value.substring(key.value.length - 4)}`}
                                readOnly
                                disabled
                                className="font-mono text-sm"
                              />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <div className="text-xs text-muted-foreground">Created: {formatDate(key.createdAt)}</div>
                          <div className="text-xs text-muted-foreground">
                            Revoked: {formatDate(key.expiredAt || "")}
                          </div>
                        </CardFooter>
                      </Card>
                    ))
                )}
              </TabsContent>
            </Tabs>

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

