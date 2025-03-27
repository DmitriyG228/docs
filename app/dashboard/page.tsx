import Link from "next/link"
import { Copy, Key, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">API Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your API keys and view usage statistics
        </p>
            </div>

      <div className="grid gap-6 lg:grid-cols-2">
                <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>API Keys</span>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Create Key
                      </Button>
            </CardTitle>
            <CardDescription>
              Manage keys used to authenticate API requests
            </CardDescription>
                  </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Production</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                        vx_prod_***********************
                      </code>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" className="h-8 gap-1">
                      <RefreshCw className="h-3 w-3" />
                      Rotate
                      </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Development</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                        vx_dev_************************
                      </code>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" className="h-8 gap-1">
                      <RefreshCw className="h-3 w-3" />
                      Rotate
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
                  </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            API keys should be kept secure and never shared publicly.
                  </CardFooter>
                </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Usage</CardTitle>
            <CardDescription>
              Monitor your API requests and usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="text-sm font-medium">Current Billing Period</div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">2,435</span>
                    <span className="text-sm text-muted-foreground">API Calls</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">42</span>
                    <span className="text-sm text-muted-foreground">Bots Created</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold">16h</span>
                    <span className="text-sm text-muted-foreground">Recording Time</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Plan Limits</div>
                <div className="space-y-2">
                    <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>API Calls</span>
                      <span>2,435 / 10,000</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: "24%" }}></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Recording Hours</span>
                      <span>16 / 50</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: "32%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
                  </div>
                </CardContent>
                <CardFooter>
            <Link href="/pricing">
              <Button variant="outline">Upgrade Plan</Button>
            </Link>
                </CardFooter>
              </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent API Activity</CardTitle>
            <CardDescription>
              View your recent API requests and responses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Today at 14:32</TableCell>
                  <TableCell>
                    <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">GET</Badge>
                  </TableCell>
                  <TableCell>/v1/bots</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">200</Badge>
                  </TableCell>
                  <TableCell>192.168.1.1</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Today at 14:30</TableCell>
                  <TableCell>
                    <Badge className="bg-green-50 text-green-700 hover:bg-green-50">POST</Badge>
                  </TableCell>
                  <TableCell>/v1/bots</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">201</Badge>
                  </TableCell>
                  <TableCell>192.168.1.1</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Today at 13:25</TableCell>
                  <TableCell>
                    <Badge className="bg-red-50 text-red-700 hover:bg-red-50">DELETE</Badge>
                  </TableCell>
                  <TableCell>/v1/bots/bot_123</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">204</Badge>
                  </TableCell>
                  <TableCell>192.168.1.1</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/logs">
              <Button variant="link" className="gap-1">
                View all activity logs
                <Key className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
        </div>
    </div>
  )
}

