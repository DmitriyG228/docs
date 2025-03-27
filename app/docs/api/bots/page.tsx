import { ApiEndpoint } from "@/components/api-endpoint"

export default function BotsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Bots API</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Manage automated meeting attendance bots for various platforms.
        </p>
      </div>

      <ApiEndpoint
        title="Send Bot"
        description="Send a bot to attend a meeting on your behalf."
        method="POST"
        endpoint="/v1/bots/send"
        requestBody={`{
  "platform": "google_meet",
  "meeting_link": "https://meet.google.com/xxx-yyyy-zzz",
  "duration_minutes": 60,
  "name": "Meeting Bot"
}`}
        responseBody={`{
  "bot_id": "bot_12345",
  "status": "connected",
  "meeting_info": {
    "platform": "google_meet",
    "link": "https://meet.google.com/xxx-yyyy-zzz",
    "start_time": "2024-03-27T18:30:00Z"
  }
}`}
      />

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