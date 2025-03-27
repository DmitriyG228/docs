"use client"

import React, { useState } from "react"
import { ApiEndpoint } from "@/components/api-endpoint"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CopyButton } from "@/components/copy-button"

type LanguageType = "curl" | "javascript" | "python"
type PlatformType = "google_meet" | "zoom" | "ms_teams"

export default function BotsPage() {
  const [platform, setPlatform] = useState<PlatformType>("google_meet")
  const [language, setLanguage] = useState<LanguageType>("curl")

  const platformOptions = [
    { value: "google_meet", label: "Google Meet" },
    { value: "zoom", label: "Zoom" },
    { value: "ms_teams", label: "Microsoft Teams" }
  ]

  const languageOptions = [
    { value: "curl", label: "cURL" },
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" }
  ]

  const meetingLink = platform === 'google_meet' 
    ? 'https://meet.google.com/xxx-yyyy-zzz' 
    : platform === 'zoom' 
      ? 'https://zoom.us/j/123456789' 
      : 'https://teams.microsoft.com/l/meetup-join/xxx'

  const requestBody = `{
  "platform": "${platform}",
  "meeting_link": "${meetingLink}",
  "duration_minutes": 60,
  "name": "Meeting Bot"
}`

  const curlCommand = `curl -X POST "https://api.vexa.ai/v1/bots/send" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${requestBody}'`

  const jsCommand = `// Using fetch API
const response = await fetch('https://api.vexa.ai/v1/bots/send', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    platform: '${platform}',
    meeting_link: '${meetingLink}',
    duration_minutes: 60,
    name: 'Meeting Bot'
  })
});

const data = await response.json();
console.log(data);`

  const pythonCommand = `import requests

response = requests.post(
    "https://api.vexa.ai/v1/bots/send",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json"
    },
    json={
        "platform": "${platform}",
        "meeting_link": "${meetingLink}",
        "duration_minutes": 60,
        "name": "Meeting Bot"
    }
)

result = response.json()
print(result)`

  const codeExamples: Record<LanguageType, string> = {
    curl: curlCommand,
    javascript: jsCommand,
    python: pythonCommand
  }

  const responseBody = `{
  "bot_id": "bot_12345",
  "status": "connected",
  "meeting_info": {
    "platform": "${platform}",
    "link": "${meetingLink}",
    "start_time": "2024-03-27T18:30:00Z"
  }
}`

  return (
    <div className="space-y-8">
      <div>
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Bots API</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Manage automated meeting attendance bots for various platforms.
        </p>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Send Bot</h2>
        <p className="text-muted-foreground">
          Send a bot to attend a meeting on your behalf.
        </p>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Platform</h3>
            <Tabs defaultValue={platform} onValueChange={(value) => setPlatform(value as PlatformType)} className="w-full">
              <TabsList className="mb-4">
                {platformOptions.map(option => (
                  <TabsTrigger key={option.value} value={option.value}>
                    {option.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="rounded-lg border">
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Request</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  POST /v1/bots/send
                </p>
              </div>
              <CopyButton value={codeExamples[language]} />
            </div>
            <div>
              <div className="flex items-center border-b px-4">
                {languageOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setLanguage(option.value as LanguageType)}
                    className={`px-4 py-2 text-sm font-medium ${
                      language === option.value
                        ? "border-b-2 border-primary text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="p-4 bg-muted/50">
                <pre className="text-sm rounded-lg overflow-x-auto p-4">
                  {codeExamples[language]}
                </pre>
              </div>
            </div>
          </div>

          <div className="rounded-lg border">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Response</h3>
              <p className="text-sm text-muted-foreground mt-1">
                200 OK
              </p>
            </div>
            <div className="p-4 bg-muted/50">
              <pre className="text-sm rounded-lg overflow-x-auto p-4">
                {responseBody}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <ApiEndpoint
        title="Remove Bot"
        description="Remove a bot from an ongoing meeting."
        method="DELETE"
        endpoint="/v1/bots/{bot_id}"
        responseBody={`{
  "status": "disconnected",
  "disconnect_time": "2024-03-27T19:30:00Z"
}`}
      />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Web Module for Audio Streaming</h2>
        <p className="text-muted-foreground">
          As an alternative to using bots, you can integrate our web module to stream audio directly from your application.
        </p>

        <div className="rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Integration</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add the following script to your HTML:
            </p>
          </div>
          <div className="p-4 bg-muted/50">
            <pre className="text-sm rounded-lg overflow-x-auto">
              {`<script src="https://cdn.vexa.ai/web-module.js"></script>`}
            </pre>
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Usage Example</h3>
          </div>
          <div className="p-4 bg-muted/50">
            <pre className="text-sm rounded-lg overflow-x-auto">
{`const vexa = new VexaAudioStream({
  apiKey: 'YOUR_API_KEY'
});

// Start streaming
await vexa.startStreaming();

// Stop streaming
await vexa.stopStreaming();`}
            </pre>
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Events</h3>
            <p className="text-sm text-muted-foreground mt-1">
              The web module emits the following events:
            </p>
          </div>
          <div className="p-4">
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><code>connected</code>: Stream connection established</li>
              <li><code>disconnected</code>: Stream connection ended</li>
              <li><code>error</code>: Error occurred during streaming</li>
              <li><code>transcription</code>: Real-time transcription received</li>
            </ul>
          </div>
        </div>

        <div className="rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Event Handling Example</h3>
          </div>
          <div className="p-4 bg-muted/50">
            <pre className="text-sm rounded-lg overflow-x-auto">
{`vexa.on('connected', () => {
  console.log('Connected to streaming service');
});

vexa.on('transcription', (data) => {
  console.log('Received transcription:', data);
});

vexa.on('error', (error) => {
  console.error('Streaming error:', error);
});`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
} 