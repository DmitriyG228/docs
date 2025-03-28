"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)

  useEffect(() => {
    // Check if user has already accepted cookies
    const consent = localStorage.getItem("cookie-consent")
    if (!consent) {
      setShowConsent(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted")
    setShowConsent(false)
  }

  if (!showConsent) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-4 py-4 md:flex-row">
        <p className="text-center text-sm text-muted-foreground md:text-left">
          We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
            Learn more
          </Link>
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={acceptCookies}>
            Accept All
          </Button>
          <Button variant="outline" size="sm" onClick={acceptCookies}>
            Reject All
          </Button>
        </div>
      </div>
    </div>
  )
} 