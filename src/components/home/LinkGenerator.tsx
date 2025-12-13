'use client';

import { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface LinkGeneratorProps {
  onGenerate: (url: string) => Promise<void>;
  isLoading: boolean;
  error: string;
}

export function LinkGenerator({ onGenerate, isLoading, error }: LinkGeneratorProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      await onGenerate(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Enter your Google Review Link"
        placeholder="https://g.page/r/xxxxx/review or Place ID"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        error={error}
        disabled={isLoading}
      />
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        isLoading={isLoading}
        disabled={!url.trim()}
      >
        Generate Preview
      </Button>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
        Paste your Google Business review link or Place ID
      </p>
    </form>
  );
}
