'use client';

import { useState, useCallback } from 'react';
import { Button } from './button';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  className?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'primary';
  size?: 'sm' | 'default' | 'lg';
  onCopy?: () => void;
}

export function CopyButton({ text, className = '', variant = 'secondary', size = 'sm', onCopy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  // Map old variant names to shadcn variant names
  const mappedVariant = variant === 'primary' ? 'default' : variant;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text, onCopy]);

  return (
    <Button
      variant={copied ? 'default' : mappedVariant}
      size={size}
      onClick={handleCopy}
      className={`min-w-[80px] ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-1" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-1" />
          Copy
        </>
      )}
    </Button>
  );
}
