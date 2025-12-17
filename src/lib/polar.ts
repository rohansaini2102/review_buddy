// Polar Payment Configuration

export const POLAR_CONFIG = {
  organizationSlug: 'nexora-ventures',
  products: {
    pro: {
      id: process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID || '69b7aa96-8eea-4f17-95b0-e319594399cf',
      name: 'Pro',
      price: 10,
      businessLimit: 1,
      trialDays: 14,
      features: [
        '1 business profile',
        'Unlimited review links',
        'QR code generator',
        'Custom review page',
        'Email support',
      ],
    },
    business: {
      id: process.env.NEXT_PUBLIC_POLAR_BUSINESS_PRODUCT_ID || 'cb084e0e-df35-4c86-8a9b-195017748c34',
      name: 'Business',
      price: 20,
      businessLimit: 5,
      trialDays: 0,
      features: [
        'Up to 5 business profiles',
        'Everything in Pro',
        'Priority support',
        'Analytics dashboard (coming soon)',
        'Team collaboration (coming soon)',
      ],
    },
  },
} as const;

export type PlanType = 'pro' | 'business';

/**
 * Generate a Polar checkout URL for a specific product
 */
export function getCheckoutUrl(plan: PlanType, userEmail?: string): string {
  const product = POLAR_CONFIG.products[plan];
  const baseUrl = `https://polar.sh/checkout/${POLAR_CONFIG.organizationSlug}/${product.id}`;

  if (userEmail) {
    const params = new URLSearchParams({ email: userEmail });
    return `${baseUrl}?${params.toString()}`;
  }

  return baseUrl;
}

/**
 * Generate a Polar customer portal URL
 */
export function getCustomerPortalUrl(): string {
  return `https://polar.sh/${POLAR_CONFIG.organizationSlug}/portal`;
}

/**
 * Subscription status type
 */
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'free';

/**
 * User subscription data stored in Firebase
 */
export interface UserSubscription {
  status: SubscriptionStatus;
  plan: PlanType | null;
  polarCustomerId: string | null;
  polarSubscriptionId: string | null;
  currentPeriodEnd: Date | null;
  businessLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Default subscription for free users
 */
export const DEFAULT_SUBSCRIPTION: UserSubscription = {
  status: 'free',
  plan: null,
  polarCustomerId: null,
  polarSubscriptionId: null,
  currentPeriodEnd: null,
  businessLimit: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Check if user has an active subscription
 */
export function hasActiveSubscription(subscription: UserSubscription | null): boolean {
  if (!subscription) return false;
  return subscription.status === 'active' || subscription.status === 'trialing';
}

/**
 * Get business limit for a subscription
 */
export function getBusinessLimit(subscription: UserSubscription | null): number {
  if (!subscription || !hasActiveSubscription(subscription)) return 0;
  return subscription.businessLimit;
}
