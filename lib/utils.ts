import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString); // Parse the ISO string (like 'YYYY-MM-DD')
    return format(date, 'LLLL d, yyyy'); // Format as "Month day, year"
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return dateString; // Return original string as fallback
  }
}

// Function to generate absolute URLs
export const absoluteUrl = (path: string) => {
  // Ensure NEXT_PUBLIC_APP_URL is set in .env or environment variables
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
};
