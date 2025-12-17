'use client';

import { useState, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

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
      <div className="space-y-2">
        <Label htmlFor="review-url">Enter your Google Review Link</Label>
        <Input
          id="review-url"
          placeholder="https://g.page/r/xxxxx/review or Place ID"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          className={error ? 'border-destructive' : ''}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!url.trim() || isLoading}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Generate Preview
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Paste your Google Business review link or Place ID
      </p>
    </form>
  );
}
