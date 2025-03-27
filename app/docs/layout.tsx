"use client"

import { NavigationProvider } from "@/lib/navigation"
import { Breadcrumb } from "@/components/breadcrumb"

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NavigationProvider>
      <div className="flex-1 p-6 lg:p-10">
        <div className="mx-auto max-w-5xl">
          <Breadcrumb className="mb-6" />
          {children}
        </div>
      </div>
    </NavigationProvider>
  )
} 