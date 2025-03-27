import { ApiEndpoint } from "@/components/api-endpoint"

export default function AuthenticationPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Authentication</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Learn how to authenticate your API requests using API keys.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">API Key Authentication</h2>
        <p className="text-muted-foreground">
          The Vexa API uses token-based authentication. All API requests must include an API token in the Authorization header.
        </p>
        <pre className="text-sm p-4 rounded-lg bg-muted overflow-x-auto">
          Authorization: Bearer YOUR_API_TOKEN
        </pre>
      </div>

      <ApiEndpoint
        title="Validate API Key"
        description="Check if an API key is valid and get its associated permissions."
        method="GET"
        endpoint="/v1/auth/validate"
        responseBody={`{
  "valid": true,
  "permissions": ["read:meetings", "write:meetings"],
  "type": "user_token",
  "expires_at": "2025-03-27T18:30:00Z"
}`}
      />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Managing API Keys</h2>
        <p className="text-muted-foreground">
          API keys can be generated and managed through the dashboard at{" "}
          <a href="https://vexa.ai/dashboard/api-keys" className="text-primary hover:underline">
            vexa.ai/dashboard/api-keys
          </a>
          .
        </p>

        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="font-semibold">API Key Best Practices</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Never expose your API keys in client-side code or public repositories</li>
            <li>Store API keys in environment variables or a secure key management system</li>
            <li>Rotate your API keys periodically, especially after team member changes</li>
            <li>Use different API keys for different environments (development, staging, production)</li>
            <li>Revoke unused or compromised API keys immediately</li>
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Token Types</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">User Tokens</h3>
            <p className="text-sm text-muted-foreground">
              For client applications and end-user requests. These tokens have limited permissions based on the user's role.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-semibold mb-2">Service Tokens</h3>
            <p className="text-sm text-muted-foreground">
              For internal service-to-service communication. These tokens have elevated permissions and are used for backend services.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Error Responses</h2>
        <div className="space-y-2">
          <h3 className="font-semibold">401 Unauthorized</h3>
          <pre className="text-sm p-4 rounded-lg bg-muted overflow-x-auto">
{`{
  "error": "unauthorized",
  "message": "Invalid or missing API token"
}`}
          </pre>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">403 Forbidden</h3>
          <pre className="text-sm p-4 rounded-lg bg-muted overflow-x-auto">
{`{
  "error": "forbidden",
  "message": "Valid token but insufficient permissions"
}`}
          </pre>
        </div>
      </div>
    </div>
  )
} 