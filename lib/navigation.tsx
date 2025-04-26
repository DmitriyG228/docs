"use client"

import { createContext, useContext, ReactNode } from "react"
import { usePathname } from "next/navigation"

interface NavigationSection {
  title: string
  items: {
    label: string
    href: string
    items?: {
      label: string
      href: string
    }[]
  }[]
}

export const navigationSections: NavigationSection[] = [
  {
    title: "Getting Started",
    items: [
      {
        label: "Introduction",
        href: "/docs/getting-started",
      },
      {
        label: "Installation",
        href: "/docs/getting-started/installation",
      },
      {
        label: "User Testing Guide",
        href: "/get-started",
      },
    ],
  },
  {
    title: "API Reference",
    items: [
      {
        label: "Overview",
        href: "/docs/api",
      },
      {
        label: "Authentication",
        href: "/docs/api/authentication",
        items: [
          { label: "API Key Authentication", href: "/docs/api/authentication#api-key" },
          { label: "Managing Keys", href: "/docs/api/authentication#managing-keys" },
          { label: "Token Types", href: "/docs/api/authentication#token-types" },
          { label: "Error Responses", href: "/docs/api/authentication#error-responses" },
        ],
      },
      {
        label: "Bots",
        href: "/docs/api/bots",
        items: [
          { label: "Send Bots", href: "/docs/api/bots#send" },
          { label: "Remove Bot", href: "/docs/api/bots#remove" },
          { label: "Web Module", href: "/docs/api/bots#web-module" },
        ],
      },
      {
        label: "Meeting Audio",
        href: "/docs/api/meeting-audio",
        items: [
          { label: "Download Audio", href: "/docs/api/meeting-audio#download" },
          { label: "Delete Audio", href: "/docs/api/meeting-audio#delete" },
          { label: "Recordings", href: "/docs/api/meeting-audio#recordings" },
          { label: "Transcription", href: "/docs/api/meeting-audio#transcription" },
        ],
      },
    ],
  },
]

interface NavigationContextType {
  currentPath: string
  currentSection?: NavigationSection
  currentItem?: {
    label: string
    href: string
    items?: {
      label: string
      href: string
    }[]
  }
}

const NavigationContext = createContext<NavigationContextType>({
  currentPath: "/docs",
})

export function useNavigation() {
  return useContext(NavigationContext)
}

interface NavigationProviderProps {
  children: ReactNode
  currentPath?: string
}

export function NavigationProvider({ children, currentPath }: NavigationProviderProps) {
  const pathname = usePathname()
  const path = currentPath || pathname || "/docs"

  // Find current section and item based on path
  let currentSection: NavigationSection | undefined
  let currentItem: NavigationSection["items"][0] | undefined

  for (const section of navigationSections) {
    const item = section.items.find((item) => 
      path.startsWith(item.href.split("#")[0])
    )
    if (item) {
      currentSection = section
      currentItem = item
      break
    }
  }

  return (
    <NavigationContext.Provider
      value={{
        currentPath: path,
        currentSection,
        currentItem,
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
} 