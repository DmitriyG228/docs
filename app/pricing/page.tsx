import { Metadata } from 'next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Cloud, Server, Shield, Users, Zap, Globe } from 'lucide-react'
import Link from 'next/link'
import { DynamicPricingCard } from './components/DynamicPricingCard'
import { GetStartedButton } from './components/GetStartedButton'

export const metadata: Metadata = {
  title: 'Pricing | Vexa',
  description: 'Vexa pricing for managed cloud and self-hosting options. Transcribe live conversations from a single call to hundreds of concurrent streams.',
}

interface PricingCardProps {
  name: string
  description: string
  price: string
  period: string
  extraBot?: string
  features: string[]
  icon: React.ReactNode
  badge?: string
  isPopular?: boolean
  buttonText?: string
  buttonVariant?: 'default' | 'outline'
  valueProposition?: string
  idealFor?: string
  isEnterprise?: boolean
  planType?: 'mvp' | 'dynamic' | 'enterprise' | 'local' | 'community' | 'nomad' | 'dedicated'
}

function PricingCard({
  name,
  description,
  price,
  period,
  extraBot,
  features,
  icon,
  badge,
  isPopular = false,
  buttonText = 'Get Started',
  buttonVariant = 'default',
  valueProposition,
  idealFor,
  isEnterprise = false,
  planType = 'dynamic',
}: PricingCardProps) {
  const cardClassName = isEnterprise 
    ? 'relative rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg flex flex-col'
    : `relative rounded-xl border ${isPopular ? 'border-2 border-primary bg-card shadow-lg' : 'bg-card shadow-sm transition-all hover:shadow-md'} flex flex-col`;
  
  return (
    <Card className={cardClassName}>
      {badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1">
            {badge}
          </Badge>
        </div>
      )}
      <CardHeader className={`flex-shrink-0 ${isPopular ? 'text-center' : ''}`}>
        <CardTitle className={`flex items-center gap-2 ${isPopular ? 'justify-center text-xl' : ''}`}>
          {icon}
          {name}
        </CardTitle>
        <CardDescription className={`min-h-[2.5rem] flex items-center ${isPopular ? 'justify-center' : ''}`}>
          {description}
        </CardDescription>
        <div className={`${isPopular ? 'text-4xl' : 'text-3xl'} font-bold ${isEnterprise ? 'text-primary' : ''}`}>
          {price}
          <span className={`${isPopular ? 'text-lg' : 'text-base'} font-normal text-muted-foreground`}>
            {period}
          </span>
          {extraBot && (
            <span className="text-sm font-normal text-muted-foreground"> • Extra bot: {extraBot}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
        <div className={`mt-auto pt-4 ${isPopular ? 'text-center' : ''}`}>
          {valueProposition && (
            <p className="text-xs text-muted-foreground mb-2">
              {valueProposition}
            </p>
          )}
          {idealFor && (
            <p className="text-xs text-muted-foreground font-medium mb-4">
              {idealFor}
            </p>
          )}
          {buttonText && (
            <GetStartedButton
              buttonText={buttonText}
              buttonVariant={buttonVariant}
              isPopular={isPopular}
              isEnterprise={isEnterprise}
              planType={planType}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      {/* Header Section */}
      <section className="py-10">
        <div className="mx-auto max-w-5xl text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Vexa <span className="text-primary">Pricing & Deployment</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            Transcribe live conversations —from a single Zoom call on your laptop to hundreds of concurrent streams in a regulated enterprise—without ever locking up your data.
          </p>
          <p className="text-lg text-muted-foreground">
            Everything is <span className="text-primary font-medium">open-source (Apache-2)</span>, fully peer-reviewed, and self-hostable at any time.
          </p>
        </div>
      </section>

      {/* Main Tabs */}
      <section className="py-10">
        <Tabs defaultValue="cloud" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="cloud" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Cloud Hosting
            </TabsTrigger>
            <TabsTrigger value="self-hosting" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Self-Hosting
            </TabsTrigger>
          </TabsList>
        
        <TabsContent value="cloud" className="space-y-10">
          <div className="mx-auto max-w-5xl text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Cloud className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Managed Cloud</h2>
            </div>
            <p className="text-lg text-muted-foreground">
              Concurrency-based pricing. <span className="text-primary font-medium">*Pay yearly and get two months free.</span>
            </p>
          </div>
          
          {/* Main Pricing Plans */}
          <div className="mx-auto max-w-5xl space-y-8">
            
            {/* MVP + Dynamic Business Plan Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* MVP Plan */}
              <PricingCard
                name="MVP"
                description="Start with 7-day free trial, no credit card required"
                price="$12"
                period="/mo"
                features={[
                  "7-day free trial • No credit card required",
                  "1 concurrent meeting", 
                  "Unlimited transcription volume", 
                  "Community Slack support"
                ]}
                icon={<Users className="h-5 w-5 text-primary" />}
                badge="No Credit Card Required"
                isPopular={true}
                idealFor="Ideal for: Freelancers, students, MVP builders"
                planType="mvp"
              />

              {/* Dynamic Business Plan */}
              <DynamicPricingCard />
            </div>

            {/* Enterprise Plan - Separate Section */}
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                <PricingCard
                  name="Enterprise"
                  description="Dedicated Cloud • Isolated VPC"
                  price="Contact sales"
                  period=""
                  features={["≥500-bot fleets", "Regulated workloads", "24 × 7, contractual SLA, DPA"]}
                  icon={<Shield className="h-5 w-5 text-primary" />}
                  isPopular={true}
                  isEnterprise={true}
                  buttonText="Contact Sales"
                  buttonVariant="outline"
                  planType="enterprise"
                />
              </div>
            </div>
          </div>

          {/* Always Included Section */}
          <div className="mx-auto max-w-5xl space-y-6">
            <h3 className="text-2xl font-bold tracking-tight text-center">Always included</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-xl border bg-card shadow-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Unlimited languages (translation = target_lang parameter)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Unlimited integrations & webhooks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">7-day rolling storage • extra retention $0.05 / record-hr / 30 d</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">EU, US & APAC regions</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border bg-card shadow-sm">
                <CardHeader>
                  <CardTitle>Add-ons</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Extra concurrency (Solo/Startup)</span>
                    <Badge variant="secondary" className="text-xs">$20 / bot / mo</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Extra concurrency (Growth+)</span>
                    <Badge variant="secondary" className="text-xs">$15 → $10 / bot / mo</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Long-term storage</span>
                    <Badge variant="secondary" className="text-xs">$0.05 / record-hr / 30 d</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Dedicated GPU region</span>
                    <Badge variant="secondary" className="text-xs">+15% to plan</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Premium 4 h SLA (Startup/Growth)</span>
                    <Badge variant="secondary" className="text-xs">+20%</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="self-hosting" className="space-y-10">
          <div className="mx-auto max-w-5xl text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Server className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Self-hosting options</h2>
            </div>
            <p className="text-lg text-muted-foreground">
              <span className="text-primary font-medium">† Effort scale</span> — ● high, ◐ medium, ○ low.
            </p>
          </div>
          
          {/* Self-hosting Options Table */}
          <div className="mx-auto max-w-5xl space-y-4">
            {/* Option A - Local CPU */}
            <PricingCard
              name="A. Local CPU"
              description="Docker-Compose, Whisper-tiny CPU, 0-1 bots"
              price="$0"
              period="runs on your laptop"
              features={["Ops effort†: ●●●◐◐", "Latency / quality: ~1 s lag, medium accuracy (EN)"]}
              icon={<Users className="h-5 w-5 text-primary" />}
              isPopular={true}
              idealFor="Demos, coursework, hack-days"
              planType="local"
            />

            {/* Option B - Community GPU */}
            <PricingCard
              name="B. Community GPU"
              description="1 × T4 VM, Whisper-base, 2 bots"
              price="$0.52 / hr → $375 / mo"
              period="≈"
              features={["Ops effort†: ●●●◐◐", "Latency / quality: &lt;300 ms lag, good accuracy"]}
              icon={<Zap className="h-5 w-5 text-primary" />}
              idealFor="Solo founders needing a public API"
              planType="community"
            />

            {/* Option C - Nomad Starter */}
            <PricingCard
              name="C. Nomad Starter"
              description="3-node Nomad (3 × T4) · 5–8 bots"
              price="$1 050 / mo cloud + $500 support"
              period="≈"
              features={["Ops effort†: ●●◐◐◐", "Latency / quality: &lt;250 ms lag"]}
              icon={<Globe className="h-5 w-5 text-primary" />}
              idealFor="Seed-stage SaaS, privacy-critical"
              planType="nomad"
            />

            {/* Option D - Nomad Growth / Enterprise */}
            <PricingCard
              name="D. Nomad Growth / Ent."
              description="Autoscaled Nomad cluster · 30–200 bots"
              price="$4 500–$8 000 / mo cloud + $1 500–$4 000 support"
              period="$"
              features={["Ops effort†: ●◐◐◐◐", "Latency / quality: 200 ms lag, 99.9% SLA"]}
              icon={<Server className="h-5 w-5 text-primary" />}
              idealFor="Contact-centre tech, regulated"
              planType="nomad"
            />

            {/* Option E - Dedicated Cloud */}
            <PricingCard
              name="E. Dedicated Cloud"
              description="Single-tenant cluster managed by Vexa"
              price="Contact sales"
              period=""
              features={["Ops effort†: Vexa fully manages", "Latency / quality: Same as D"]}
              icon={<Shield className="h-5 w-5 text-primary" />}
              isPopular={true}
              buttonText="Contact Sales"
              buttonVariant="outline"
              idealFor="Isolation with zero infra work"
              planType="dedicated"
            />
            </div>

                        {/* Quick Decision Table */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold tracking-tight text-center">Quick decision table</h3>
              <Card className="rounded-xl border bg-card shadow-sm">
                <CardHeader className="bg-muted">
                  <CardTitle>You...</CardTitle>
                  <CardDescription>Choose the best option based on your needs</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 border-b border-border/50">
                      <span className="text-sm font-medium">Just experimenting, no server budget</span>
                      <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 w-fit">
                        Local CPU
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 border-b border-border/50">
                      <span className="text-sm font-medium">Need public endpoint, ≤2 streams</span>
                      <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 w-fit">
                        Community GPU
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 border-b border-border/50">
                      <span className="text-sm font-medium">Need privacy + ≤10 bots, have 1 DevOps FTE</span>
                      <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 w-fit">
                        Nomad Starter
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 border-b border-border/50">
                      <span className="text-sm font-medium">Promise 99.9% uptime or &gt;30 bots</span>
                      <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 w-fit">
                        Nomad Growth / Ent.
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3">
                      <span className="text-sm font-medium">Want isolation but no on-call</span>
                      <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 w-fit">
                        Dedicated Cloud
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
        </TabsContent>
      </Tabs>
      </section>

      {/* Privacy & Data-Stewardship Pledge */}
      <section className="py-10">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Privacy & Data-Stewardship Pledge</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-xl border bg-card shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Your transcripts are your property.</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  They remain on our servers only until you call DELETE. We encourage routine purging and external archival.
                </p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">We never train models on customer data.</span>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-xl border bg-card shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">End-to-end encryption in transit and at rest.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Open source, always.</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  Fork, self-host, or return to Cloud—no vendor lock-in by design.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Professional Services */}
      <section className="py-10">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Professional services (optional)</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Integration sprint
                </CardTitle>
                <CardDescription>Notion, HubSpot, n8n...</CardDescription>
                <div className="text-2xl font-bold">$3,000<span className="text-base font-normal text-muted-foreground"> / 2 weeks</span></div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">PoC code, CI tests, docs</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Ad-hoc engineering help
                </CardTitle>
                <div className="text-2xl font-bold">$200<span className="text-base font-normal text-muted-foreground"> / hour</span></div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Pair-programming, scaling advice</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl border bg-card shadow-sm transition-all hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" />
                  Turn-key deployment
                </CardTitle>
                <div className="text-2xl font-bold">$8,000<span className="text-base font-normal text-muted-foreground"> one-off</span></div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">White-glove install, IaC hand-off</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Ready to start */}
      <section className="py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border shadow-lg overflow-hidden">
            <div className="bg-primary p-6 md:p-8 text-primary-foreground">
              <div className="text-center space-y-6">
                <h2 className="text-2xl font-bold">Ready to start?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 mx-auto">
                      <Server className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold">Hack locally</h3>
                    <p className="text-sm text-primary-foreground/80">
                      git clone https://github.com/Vexa-ai/vexa && docker-compose up
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 mx-auto">
                      <Cloud className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold">Spin a bot in the cloud</h3>
                    <p className="text-sm text-primary-foreground/80">
                      Create a Solo account → grab your API key → call /v1/streams
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20 mx-auto">
                      <Shield className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold">Need isolation?</h3>
                    <p className="text-sm text-primary-foreground/80">
                      Book a 20-minute architecture chat and we'll scope Dedicated Cloud or Nomad
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/api/auth/signin">
                    <Button size="lg" variant="secondary" className="gap-2">
                      <Cloud className="h-4 w-4" />
                      Get Started
                    </Button>
                  </Link>
                  <Link href="https://github.com/Vexa-ai/vexa" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="border-primary-foreground/20 bg-primary-foreground/10 hover:bg-primary-foreground/20 gap-2">
                      <Server className="h-4 w-4" />
                      Try Self-Hosted
                    </Button>
                  </Link>
                </div>
                <p className="text-lg font-medium text-primary-foreground/90">
                  Build where you like, migrate when you need—Vexa makes transcription transparent, private, and yours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 