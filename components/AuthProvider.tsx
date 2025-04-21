"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  // The SessionProvider component needs to be rendered on the client side.
  // We mark this component with "use client" to ensure that.
  return <SessionProvider>{children}</SessionProvider>;
} 