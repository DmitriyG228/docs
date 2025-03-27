# Authentication

The Vexa API uses token-based authentication. All API requests must include an API token in the Authorization header.

## API Key Authentication

To authenticate your requests, include your API key in the request headers:

```bash
Authorization: Bearer YOUR_API_TOKEN
```

## Example Request

```bash
curl -X GET "https://api.vexa.ai/v1/data" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

## Managing API Keys

API keys can be generated and managed through the dashboard at [https://vexa.ai/dashboard/api-keys](https://vexa.ai/dashboard/api-keys).

### API Key Best Practices

1. Never expose your API keys in client-side code or public repositories
2. Store API keys in environment variables or a secure key management system
3. Rotate your API keys periodically, especially after team member changes
4. Use different API keys for different environments (development, staging, production)
5. Revoke unused or compromised API keys immediately

## Token Types

The API supports two types of authentication tokens:

1. **User Tokens**: For client applications and end-user requests
2. **Service Tokens**: For internal service-to-service communication

## Error Responses

Authentication errors will return appropriate HTTP status codes:

- `401 Unauthorized`: Invalid or missing API token
- `403 Forbidden`: Valid token but insufficient permissions 