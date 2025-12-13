'use client';

import { useState } from 'react';
import { ReviewTemplate } from '@/types';
import { CopyButton } from '@/components/ui/CopyButton';

interface ReviewTemplateCardProps {
  template: ReviewTemplate;
}

export function ReviewTemplateCard({ template }: ReviewTemplateCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = template.text.length > 150;

  return (
    <div className="p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 mb-2">
            {template.title}
          </span>
          <p className={`text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed ${!expanded && isLong ? 'line-clamp-3' : ''}`}>
            {template.text}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-600 dark:text-blue-400 text-xs mt-1 hover:underline"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <CopyButton text={template.text} variant="primary" size="md" />
      </div>
    </div>
  );
}
