/**
 * Google Analytics utility functions with improved reliability
 */

/**
 * Track a custom event in Google Analytics
 * @param eventName The name of the event to track
 * @param eventParams Optional parameters for the event
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, string | number | boolean>
): void {
  try {
    // Check if gtag is available
    if (typeof window !== 'undefined') {
      // If gtag is directly available
      if (window.gtag) {
        console.log(`📊 Tracking event: ${eventName}`, eventParams);
        window.gtag('event', eventName, eventParams);
      } 
      // If dataLayer is available, use it (alternative approach)
      else if (window.dataLayer) {
        console.log(`📊 Tracking event via dataLayer: ${eventName}`, eventParams);
        window.dataLayer.push({
          event: eventName,
          ...eventParams
        });
      } 
      // No tracking available
      else {
        console.warn(`📊 GA not loaded. Would track: ${eventName}`, eventParams);
      }
    } else {
      console.log(`📊 Server-side - Would track: ${eventName}`, eventParams);
    }
  } catch (error) {
    console.error('Error tracking GA event:', error);
  }
}

/**
 * Track a page view in Google Analytics
 * @param path The path of the page
 * @param title The title of the page
 */
export function trackPageView(path: string, title?: string): void {
  try {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    
    if (!measurementId || measurementId === 'G-MEASUREMENT_ID') {
      console.warn('GA Measurement ID not set - skipping page view tracking');
      return;
    }
    
    if (typeof window !== 'undefined' && window.gtag) {
      console.log(`📊 Tracking page view: ${path}`);
      window.gtag('config', measurementId, {
        page_path: path,
        page_title: title
      });
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}

// Define global types for Google Analytics
declare global {
  interface Window {
    gtag: (
      command: 'event' | 'config' | 'set' | 'js',
      targetId: string | Date,
      params?: Record<string, any>
    ) => void;
    dataLayer: Array<Record<string, any>>;
  }
}

/**
 * Examples usage:
 * 
 * // Track a sign up event
 * trackEvent('sign_up', { method: 'email' });
 * 
 * // Track a button click
 * trackEvent('button_click', { button_id: 'submit_form' });
 */ 