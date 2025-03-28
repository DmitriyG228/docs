"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  company: z.string().min(2, { message: "Company name must be at least 2 characters" }),
  companyBusiness: z.string().min(10, { message: "Please describe your business in at least 10 characters" }),
  companySize: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]),
  linkedIn: z.string().optional(),
  twitter: z.string().optional(),
  mainPlatform: z.enum(["google_meet", "zoom", "microsoft_teams", "other"]),
  otherPlatform: z.string().optional(),
  useCase: z.string().min(20, { message: "Please describe your use case in at least 20 characters" }),
})

// Simpler schema just for email correction
const emailCorrectionSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

export default function PricingPage() {
  const [submitted, setSubmitted] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [showEmailCorrection, setShowEmailCorrection] = useState(false)
  const [lastSubmittedData, setLastSubmittedData] = useState<z.infer<typeof formSchema> | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      company: "",
      companyBusiness: "",
      companySize: undefined,
      linkedIn: "",
      twitter: "",
      mainPlatform: undefined,
      otherPlatform: "",
      useCase: "",
    },
  })

  const emailCorrectionForm = useForm<z.infer<typeof emailCorrectionSchema>>({
    resolver: zodResolver(emailCorrectionSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setServerError(null)
    
    try {
      // Save the submitted data in case we need to resubmit with a corrected email
      setLastSubmittedData(data)
      
      const response = await fetch('/api/beta-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSuccess(true)
        form.reset()
      } else {
        setServerError(result.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setServerError('Failed to submit. Please try again later.')
      console.error('Form submission error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function onEmailCorrectionSubmit(data: z.infer<typeof emailCorrectionSchema>) {
    if (!lastSubmittedData) return
    
    setIsLoading(true)
    setServerError(null)
    
    try {
      // Resubmit the form with the corrected email
      const updatedData = {
        ...lastSubmittedData,
        email: data.email
      }
      
      const response = await fetch('/api/beta-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSuccess(true)
        setShowEmailCorrection(false)
        emailCorrectionForm.reset()
      } else {
        setServerError(result.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setServerError('Failed to submit. Please try again later.')
      console.error('Form submission error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-5xl py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Join Our Closed Beta</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Vexa is currently in private beta. Apply for early access to our real-time meeting transcription API.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 mb-10">
        <div>
          <h2 className="text-2xl font-bold mb-4">Early Access Benefits</h2>
          <ul className="space-y-4">
            <li className="flex gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <span className="font-medium">Priority Support</span>
                <p className="text-sm text-muted-foreground">Direct access to our engineering team</p>
              </div>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <span className="font-medium">Free Access</span>
                <p className="text-sm text-muted-foreground">Beta program is completely free of charge</p>
              </div>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <span className="font-medium">Feature Input</span>
                <p className="text-sm text-muted-foreground">Help shape the product roadmap</p>
              </div>
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <span className="font-medium">Early API Access</span>
                <p className="text-sm text-muted-foreground">Get ahead with our transcription technology</p>
              </div>
            </li>
          </ul>

          <Separator className="my-8" />

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Pricing Plans</h2>
            <p className="text-muted-foreground">
              The beta program is completely <span className="font-bold">free</span> for all participants. After the beta phase concludes, 
              we'll provide exclusive offers to our beta testers before launching our paid plans.
            </p>
          </div>
        </div>

        <div className="bg-muted p-6 rounded-lg">
          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold text-green-800 mb-3">Application Submitted</h3>
              <p className="text-green-700 mb-6">
                We've sent a verification email to your inbox. Please check your email and click the verification link to complete your application.
              </p>
              
              {showEmailCorrection ? (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <h4 className="text-lg font-medium mb-2">Update Email Address</h4>
                  <Form {...emailCorrectionForm}>
                    <form onSubmit={emailCorrectionForm.handleSubmit(onEmailCorrectionSubmit)} className="space-y-4">
                      <FormField
                        control={emailCorrectionForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Enter your correct email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {serverError && (
                        <div className="text-red-600 text-sm">{serverError}</div>
                      )}
                      <div className="flex gap-2">
                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={isLoading}
                        >
                          Update Email
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => setShowEmailCorrection(false)}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              ) : (
                <>
                  <div className="mt-4 flex flex-col items-center">
                    <p className="text-sm text-green-600 mb-3">
                      If you don't see the email within a few minutes, please check your spam folder.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowEmailCorrection(true)}
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      I made a mistake in my email address
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Apply for Vexa Beta Access</h2>
                <p className="text-muted-foreground mt-2">
                  The beta program is completely free of charge. Submit your application, and we'll review it.
                </p>
                <p className="mt-2 text-sm bg-amber-50 border border-amber-200 p-2 rounded-md inline-block">
                  You'll need to verify your email address to complete your application.
                </p>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address*</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Company Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companyBusiness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What does your company do?*</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Briefly describe your company's business..."
                            className="resize-none min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="companySize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of people in your company*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1-10">1-10 employees</SelectItem>
                            <SelectItem value="11-50">11-50 employees</SelectItem>
                            <SelectItem value="51-200">51-200 employees</SelectItem>
                            <SelectItem value="201-1000">201-1000 employees</SelectItem>
                            <SelectItem value="1000+">1000+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="linkedIn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn profile</FormLabel>
                          <FormControl>
                            <Input placeholder="linkedin.com/in/yourprofile" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>X (Twitter) profile</FormLabel>
                          <FormControl>
                            <Input placeholder="@yourhandle" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="mainPlatform"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>What meeting platform do you primarily use?*</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="google_meet" />
                              </FormControl>
                              <FormLabel className="font-normal">Google Meet</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="zoom" />
                              </FormControl>
                              <FormLabel className="font-normal">Zoom</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="microsoft_teams" />
                              </FormControl>
                              <FormLabel className="font-normal">Microsoft Teams</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="other" />
                              </FormControl>
                              <FormLabel className="font-normal">Other</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch("mainPlatform") === "other" && (
                    <FormField
                      control={form.control}
                      name="otherPlatform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Please specify your meeting platform</FormLabel>
                          <FormControl>
                            <Input placeholder="Meeting platform name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="useCase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>What do you plan to do with Vexa's API?*</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please describe your use case..."
                            className="resize-none min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Tell us about your intended integration and how you'll use the transcription data.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Alert className="bg-muted-foreground/10">
                    <AlertTitle>Privacy Note</AlertTitle>
                    <AlertDescription>
                      Your information will only be used to evaluate your application for the beta program and won't be shared with third parties.
                    </AlertDescription>
                  </Alert>
                  {serverError && (
                    <div className="text-red-600 text-sm font-medium">{serverError}</div>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Submitting..." : "Submit Application"}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 