// Google Analytics
interface Window {
  gtag: (
    command: 'config' | 'event',
    targetId: string,
    params?: {
      [key: string]: string | number | boolean | null | undefined;
    }
  ) => void;
}

// Additional type declarations can be added here 