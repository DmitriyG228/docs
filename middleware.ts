export { default } from "next-auth/middleware";

// This config specifies that the middleware applies
// to all routes starting with /dashboard
export const config = {
  matcher: [
    '/dashboard/:path*', 
  ],
};
