"use client"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { useNavigation } from "@/lib/navigation"
import { cn } from "@/lib/utils"

interface BreadcrumbProps {
  className?: string
}

export function Breadcrumb({ className }: BreadcrumbProps) {
  const { currentPath, currentSection, currentItem } = useNavigation()

  // Generate breadcrumb items based on the current path
  const items = []

  if (currentSection) {
    items.push({
      label: currentSection.title,
      href: currentItem?.href.split("#")[0],
    })
  }

  if (currentItem) {
    items.push({
      label: currentItem.label,
      href: undefined,
    })
  }

  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}>
      <Link
        href="/docs"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
} 