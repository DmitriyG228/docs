"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet"; // Added SheetTitle
import { MenuIcon, XIcon } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/get-started", label: "Get Started" },
  { href: "https://github.com/Vexa-ai/vexa/blob/main/docs/user_api_guide.md", label: "API Docs", target: "_blank", rel: "noopener noreferrer" },
  { href: "/public-beta", label: "Public Beta" },
  { href: "/blog", label: "Blog" },
];

export function MobileNav() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; 
  }

  const links = [...navLinks];
  if (session) {
    links.push({ href: "/dashboard/api-keys", label: "API Keys" });
    links.push({ href: "/dashboard", label: "Dashboard" });
  }

  return (
    <div className="md:hidden"> {/* Only show on small screens */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full max-w-xs sm:max-w-sm p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-4 border-b">
              <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                {/* You might want to add your logo here if you have it as a component or SVG */}
                <span className="font-bold text-lg">Vexa</span>
              </Link>
              <SheetClose asChild>
                <Button variant="ghost" size="icon">
                  <XIcon className="h-6 w-6" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </SheetClose>
            </div>
            <nav className="flex-grow p-4 space-y-2">
              {links.map((link) => (
                <SheetClose asChild key={link.href}>
                  <Link
                    href={link.href}
                    target={link.target}
                    rel={link.rel}
                    className="block px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-secondary"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
} 