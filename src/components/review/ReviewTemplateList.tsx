'use client';

import { ReviewTemplate } from '@/types';
import { ReviewTemplateCard } from './ReviewTemplateCard';

interface ReviewTemplateListProps {
  templates: ReviewTemplate[];
}

export function ReviewTemplateList({ templates }: ReviewTemplateListProps) {
  return (
    <div className="space-y-3">
      {templates.map((template) => (
        <ReviewTemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
}
