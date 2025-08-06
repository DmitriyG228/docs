import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ApiEndpointProps {
  title: string
  description?: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  endpoint: string
  requestBody?: string
  responseBody: string
  queryParams?: Array<{
    name: string
    type: string
    description: string
    required?: boolean
    default?: string
  }>
}

export function ApiEndpoint({
  title,
  description,
  method,
  endpoint,
  requestBody,
  responseBody,
  queryParams,
}: ApiEndpointProps) {
  const methodColors = {
    GET: "text-green-600",
    POST: "text-blue-600",
    PUT: "text-yellow-600",
    DELETE: "text-red-600",
    PATCH: "text-purple-600",
  }

  const curlExample = `curl -X ${method} "https://gateway.dev.vexa.ai${endpoint}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"${requestBody ? ` \\
  -d '${requestBody}'` : ""}`

  const jsExample = `const response = await fetch('https://gateway.dev.vexa.ai${endpoint}', {
  method: '${method}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }${requestBody ? `,
  body: '${requestBody}'` : ""}
});

const data = await response.json();`

  const pythonExample = `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.${method.toLowerCase()}(
    'https://gateway.dev.vexa.ai${endpoint}',
    headers=headers${requestBody ? `,
    json=${requestBody}` : ""}
)

data = response.json()`

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>

      <div className="rounded-lg border">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <span className={methodColors[method]}>{method}</span>
            <code className="text-sm">{endpoint}</code>
          </div>
        </div>

        {queryParams && queryParams.length > 0 && (
          <div className="p-4 border-b">
            <h4 className="font-semibold mb-2">Query Parameters</h4>
            <div className="space-y-2">
              {queryParams.map((param) => (
                <div key={param.name} className="grid grid-cols-[100px_1fr] gap-2">
                  <div>
                    <code className="text-sm">{param.name}</code>
                    {param.required && <span className="text-red-500 ml-1">*</span>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="text-primary-foreground">{param.type}</span>
                    {param.default && <span className="ml-2">Default: {param.default}</span>}
                    <p>{param.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 bg-muted/50">
          <Tabs defaultValue="curl">
            <TabsList className="mb-4">
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="js">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
            <TabsContent value="curl" className="relative">
              <pre className="text-sm p-4 rounded-lg bg-muted overflow-x-auto">
                {curlExample}
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                aria-label="Copy code"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TabsContent>
            <TabsContent value="js" className="relative">
              <pre className="text-sm p-4 rounded-lg bg-muted overflow-x-auto">
                {jsExample}
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                aria-label="Copy code"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TabsContent>
            <TabsContent value="python" className="relative">
              <pre className="text-sm p-4 rounded-lg bg-muted overflow-x-auto">
                {pythonExample}
              </pre>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                aria-label="Copy code"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        <div className="p-4 border-t">
          <h4 className="font-semibold mb-2">Response</h4>
          <pre className="text-sm p-4 rounded-lg bg-muted overflow-x-auto">
            {responseBody}
          </pre>
        </div>
      </div>
    </div>
  )
} 