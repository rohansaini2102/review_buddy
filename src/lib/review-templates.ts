import { ReviewTemplate } from '@/types';

export const reviewTemplates: ReviewTemplate[] = [
  {
    id: 'quick-5star',
    title: 'Quick 5-Star',
    category: 'positive',
    text: 'Excellent service! Highly recommend to everyone. Professional, friendly, and efficient. Will definitely return!'
  },
  {
    id: 'detailed-experience',
    title: 'Detailed Experience',
    category: 'detailed',
    text: 'I had a wonderful experience from start to finish. The staff was incredibly welcoming and took the time to understand exactly what I needed. The quality of service exceeded my expectations in every way. I appreciated the attention to detail and the genuine care shown throughout my visit. This business truly stands out and I will be recommending them to all my friends and family.'
  },
  {
    id: 'professional-review',
    title: 'Professional',
    category: 'professional',
    text: 'Impressed by the level of professionalism displayed by this business. Communication was clear, service was prompt, and the results were exactly as promised. A reliable choice that I would confidently recommend.'
  },
  {
    id: 'value-appreciation',
    title: 'Great Value',
    category: 'positive',
    text: 'Outstanding value! The quality far exceeded what I expected at this price point. The team went above and beyond to ensure complete satisfaction. This has become my go-to spot!'
  },
  {
    id: 'first-visit',
    title: 'First Time Visitor',
    category: 'detailed',
    text: 'This was my first visit and I was thoroughly impressed! The atmosphere was welcoming, the service was top-notch, and everything was handled with care. I can see why this place has such great reviews. Looking forward to my next visit!'
  }
];

export function getTemplatesByCategory(category: ReviewTemplate['category']) {
  return reviewTemplates.filter(t => t.category === category);
}
