import { ApiEndpoint } from "@/components/api-endpoint"

export default function MeetingAudioPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Meeting Audio API</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Manage audio recordings and transcriptions from meetings.
        </p>
      </div>

      <ApiEndpoint
        title="Download Audio"
        description="Download the audio recording for a specific meeting."
        method="GET"
        endpoint="/v1/audio/{meeting_id}/download"
        queryParams={[
          {
            name: "format",
            type: "string",
            description: "Audio format to download",
            default: "webm",
          },
          {
            name: "start_time",
            type: "string",
            description: "Start timestamp for partial download (ISO 8601 format)",
          },
          {
            name: "end_time",
            type: "string",
            description: "End timestamp for partial download (ISO 8601 format)",
          },
        ]}
        responseBody="Binary audio file content"
      />

      <ApiEndpoint
        title="Delete Audio"
        description="Delete an audio recording."
        method="DELETE"
        endpoint="/v1/audio/{meeting_id}"
        responseBody={`{
  "status": "deleted",
  "meeting_id": "meeting_12345"
}`}
      />

      <ApiEndpoint
        title="List Recordings"
        description="List all available recordings."
        method="GET"
        endpoint="/v1/audio/recordings"
        queryParams={[
          {
            name: "page",
            type: "integer",
            description: "Page number for pagination",
            default: "1",
          },
          {
            name: "limit",
            type: "integer",
            description: "Number of recordings per page",
            default: "20",
          },
          {
            name: "start_date",
            type: "string",
            description: "Filter by start date (ISO 8601 format)",
          },
          {
            name: "end_date",
            type: "string",
            description: "Filter by end date (ISO 8601 format)",
          },
        ]}
        responseBody={`{
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
}`}
      />

      <ApiEndpoint
        title="Get Transcription"
        description="Get the transcription for a specific recording."
        method="GET"
        endpoint="/v1/audio/{meeting_id}/transcription"
        queryParams={[
          {
            name: "format",
            type: "string",
            description: "Response format",
            default: "json",
          },
          {
            name: "include_speaker_labels",
            type: "boolean",
            description: "Include speaker identification",
            default: "true",
          },
          {
            name: "include_timestamps",
            type: "boolean",
            description: "Include word-level timestamps",
            default: "false",
          },
        ]}
        responseBody={`{
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
}`}
      />
    </div>
  )
} 