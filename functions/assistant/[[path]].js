// Handler for /assistant/* routes - forwards to old assistant
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const OLD_SITE_URL = env.OLD_SITE_URL || 'https://old-vexa-site.com';
  
  // Forward to old site with original path including /assistant
  const newUrl = new URL(url.pathname + url.search, OLD_SITE_URL);
  
  const newRequest = new Request(newUrl.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'manual'
  });
  
  return fetch(newRequest);
} 