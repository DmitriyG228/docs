// Main routing middleware for Cloudflare Pages
export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  
  // Route /app/* to the old app
  if (url.pathname.startsWith('/app/')) {
    return env.APP.fetch(request);
  }
  
  // Route /assistant/* to the old assistant
  if (url.pathname.startsWith('/assistant/')) {
    return env.ASSISTANT.fetch(request);
  }
  
  // Forward everything else to the static site
  return next();
} 