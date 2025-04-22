import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "API Documentation | Vexa",
  description: "Comprehensive API documentation for the Vexa platform",
};

export default function DocumentationNewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 p-6 lg:p-10">
      <div className="mx-auto max-w-6xl">
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
          <a
            href="/documentation_new"
            className="flex items-center hover:text-foreground transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 mr-2"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            API Documentation
          </a>
        </nav>
        {children}
      </div>
    </div>
  );
} 