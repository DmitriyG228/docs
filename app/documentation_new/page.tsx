"use client";

import { useEffect } from "react";

export default function DocumentationRedirect() {
  useEffect(() => {
    window.location.href = "https://github.com/Vexa-ai/vexa/blob/main/docs/user_api_guide.md";
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p>Redirecting to API documentation...</p>
    </div>
  );
} 