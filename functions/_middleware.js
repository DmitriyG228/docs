// Main routing middleware for all requests
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // Routes for the old app - used by Chrome extension
  if (url.pathname.startsWith('/app/')) {
    console.log(`Routing ${url.pathname} to old app`);
    return await routeToOldSite(request, env);
  }
  
  // Routes for the old assistant
  if (url.pathname.startsWith('/assistant/')) {
    console.log(`Routing ${url.pathname} to old assistant`);
    return await routeToOldSite(request, env);
  }
  
  // For all other routes, pass through to the new portal site
  return context.next();
}

async function routeToOldSite(request, env) {
  const OLD_SITE_URL = env.OLD_SITE_URL || 'https://old-vexa-site.com';
  const url = new URL(request.url);
  
  // Keep the original path when forwarding to old site
  const newUrl = new URL(url.pathname + url.search, OLD_SITE_URL);
  
  // Clone the request with the new URL
  const newRequest = new Request(newUrl.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'manual'
  });
  
  return fetch(newRequest);
} 