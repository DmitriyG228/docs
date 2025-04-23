// Handle /app/* routes, proxying to OLD_SITE_URL
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const oldSiteUrl = env.OLD_SITE_URL || 'https://default-old-site-url.example.com';
  
  // Construct the URL to the old site, preserving the /app path
  const oldSiteUrlObj = new URL(oldSiteUrl);
  const newUrl = new URL(url.pathname + url.search, oldSiteUrlObj.origin);
  
  // Clone the request to forward
  const newRequest = new Request(newUrl, request);
  
  // Forward the request to the old site
  return fetch(newRequest);
} 