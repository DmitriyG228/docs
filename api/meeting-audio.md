# Meeting Audio API

The Meeting Audio API allows you to manage audio recordings from meetings.

## Download Audio

Download the audio recording for a specific meeting.

### Request

```http
GET /v1/audio/{meeting_id}/download
Authorization: Bearer YOUR_API_TOKEN
```

### Response

Returns the audio file in binary format with appropriate Content-Type header.

### Query Parameters

- `format`: Audio format to download (default: "webm")
  - Supported formats: "webm", "mp3", "wav"
- `start_time`: Start timestamp for partial download (ISO 8601 format)
- `end_time`: End timestamp for partial download (ISO 8601 format)

## Delete Audio

Delete an audio recording.

### Request

```http
DELETE /v1/audio/{meeting_id}
Authorization: Bearer YOUR_API_TOKEN
```

### Response

```json
{
  "status": "deleted",
  "meeting_id": "meeting_12345"
}
```

## List Recordings

List all available recordings.

### Request

```http
GET /v1/audio/recordings
Authorization: Bearer YOUR_API_TOKEN
```

### Query Parameters

- `page`: Page number for pagination (default: 1)
- `limit`: Number of recordings per page (default: 20)
- `start_date`: Filter by start date (ISO 8601 format)
- `end_date`: Filter by end date (ISO 8601 format)

### Response

```json
{
  "recordings": [
    {
      "meeting_id": "meeting_12345",
      "duration_seconds": 3600,
      "start_time": "2024-03-27T18:30:00Z",
      "end_time": "2024-03-27T19:30:00Z",
      "size_bytes": 15000000,
      "format": "webm"
    }
  ],
  "total": 50,
  "page": 1,
  "pages": 3
}
```

## Get Transcription

Get the transcription for a specific recording.

### Request

```http
GET /v1/audio/{meeting_id}/transcription
Authorization: Bearer YOUR_API_TOKEN
```

### Query Parameters

- `format`: Response format (default: "json")
  - Supported formats: "json", "srt", "vtt"
- `include_speaker_labels`: Include speaker identification (default: true)
- `include_timestamps`: Include word-level timestamps (default: false)

### Response

```json
{
  "meeting_id": "meeting_12345",
  "duration_seconds": 3600,
  "segments": [
    {
      "start_time": "00:00:00",
      "end_time": "00:00:05",
      "speaker": "Speaker 1",
      "text": "Hello everyone, welcome to the meeting.",
      "words": [
        {
          "word": "Hello",
          "start": 0.0,
          "end": 0.5,
          "confidence": 0.98
        }
      ]
    }
  ]
} 