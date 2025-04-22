import React from 'react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  language: string;
  value: string;
  className?: string;
}

export function CodeBlock({ language, value, className }: CodeBlockProps) {
  return (
    <div className={cn('relative rounded-md', className)}>
      <pre className="max-h-[650px] overflow-x-auto rounded-lg border bg-zinc-950 p-4 text-sm text-zinc-50 dark:bg-zinc-900">
        <code className={`language-${language}`}>{value}</code>
      </pre>
    </div>
  );
} 