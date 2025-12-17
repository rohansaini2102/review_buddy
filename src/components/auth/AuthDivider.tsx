'use client';

import { Separator } from '@/components/ui/separator';

interface AuthDividerProps {
  text?: string;
}

export default function AuthDivider({ text = 'or continue with email' }: AuthDividerProps) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <Separator className="w-full" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-card text-muted-foreground">{text}</span>
      </div>
    </div>
  );
}
