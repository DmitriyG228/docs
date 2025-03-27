# Bots API

The Bots API allows you to manage automated meeting attendance bots for various platforms.

## Send Bots

Send a bot to attend a meeting on your behalf.

### Request

```http
POST /v1/bots/send
Content-Type: application/json
Authorization: Bearer YOUR_API_TOKEN

{
  "platform": "google_meet",  // or "microsoft_teams", "zoom"
  "meeting_link": "https://meet.google.com/xxx-yyyy-zzz",
  "duration_minutes": 60,
  "name": "Meeting Bot"  // Optional: Bot display name
}
```

### Response

```json
{
  "bot_id": "bot_12345",
  "status": "connected",
  "meeting_info": {
    "platform": "google_meet",
    "link": "https://meet.google.com/xxx-yyyy-zzz",
    "start_time": "2024-03-27T18:30:00Z"
  }
}
```

## Remove Bot

Remove a bot from an ongoing meeting.

### Request

```http
DELETE /v1/bots/{bot_id}
Authorization: Bearer YOUR_API_TOKEN
```

### Response

```json
{
  "status": "disconnected",
  "disconnect_time": "2024-03-27T19:30:00Z"
}
```

## Web Module for Audio Streaming

As an alternative to using bots, you can integrate our web module to stream audio directly from your application.

### Integration

Add the following script to your HTML:

```html
<script src="https://cdn.vexa.ai/web-module.js"></script>
```

### Usage Example

```javascript
const vexa = new VexaAudioStream({
  apiKey: 'YOUR_API_KEY'
});

// Start streaming
await vexa.startStreaming();

// Stop streaming
await vexa.stopStreaming();
```

### Events

The web module emits the following events:

- `connected`: Stream connection established
- `disconnected`: Stream connection ended
- `error`: Error occurred during streaming
- `transcription`: Real-time transcription received 