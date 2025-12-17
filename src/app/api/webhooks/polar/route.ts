import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { getAdminDb } from '@/lib/firebase-admin';
import { POLAR_CONFIG, PlanType, UserSubscription } from '@/lib/polar';

const WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET;

// Verify webhook signature from Polar
function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) {
    console.error('POLAR_WEBHOOK_SECRET not configured');
    return false;
  }

  const expectedSignature = createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature || signature === `sha256=${expectedSignature}`;
}

// Get plan type from product ID
function getPlanFromProductId(productId: string): PlanType | null {
  if (productId === POLAR_CONFIG.products.pro.id) return 'pro';
  if (productId === POLAR_CONFIG.products.business.id) return 'business';
  return null;
}

// Get business limit from plan
function getBusinessLimitFromPlan(plan: PlanType | null): number {
  if (!plan) return 0;
  return POLAR_CONFIG.products[plan].businessLimit;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('x-polar-signature') ||
                      request.headers.get('polar-signature') || '';

    // Verify signature (skip in development if needed)
    if (process.env.NODE_ENV === 'production') {
      if (!verifyWebhookSignature(payload, signature)) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(payload);
    console.log('Polar webhook event:', event.type);

    const db = getAdminDb();

    switch (event.type) {
      case 'subscription.created':
      case 'subscription.updated': {
        const subscription = event.data;
        const customerEmail = subscription.customer?.email;
        const productId = subscription.product?.id || subscription.product_id;
        const plan = getPlanFromProductId(productId);

        if (!customerEmail) {
          console.error('No customer email in subscription event');
          return NextResponse.json({ error: 'No customer email' }, { status: 400 });
        }

        // Find user by email
        const usersRef = db.collection('users');
        const userQuery = await usersRef.where('email', '==', customerEmail).limit(1).get();

        if (userQuery.empty) {
          console.log(`User not found for email: ${customerEmail}`);
          // Create a pending subscription record that can be matched later
          await db.collection('pending_subscriptions').doc(customerEmail).set({
            email: customerEmail,
            polarCustomerId: subscription.customer?.id,
            polarSubscriptionId: subscription.id,
            productId: productId,
            plan: plan,
            status: subscription.status,
            currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end) : null,
            createdAt: new Date(),
          });
          return NextResponse.json({ received: true, note: 'User not found, saved as pending' });
        }

        const userDoc = userQuery.docs[0];
        const subscriptionData: Partial<UserSubscription> = {
          status: subscription.status === 'active' ? 'active' :
                  subscription.status === 'trialing' ? 'trialing' :
                  subscription.status === 'past_due' ? 'past_due' :
                  subscription.status === 'canceled' ? 'canceled' : 'incomplete',
          plan: plan,
          polarCustomerId: subscription.customer?.id || null,
          polarSubscriptionId: subscription.id,
          currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end) : null,
          businessLimit: getBusinessLimitFromPlan(plan),
          updatedAt: new Date(),
        };

        await userDoc.ref.update({
          subscription: subscriptionData,
        });

        console.log(`Updated subscription for user: ${customerEmail}`);
        break;
      }

      case 'subscription.canceled':
      case 'subscription.revoked': {
        const subscription = event.data;
        const customerEmail = subscription.customer?.email;

        if (!customerEmail) {
          return NextResponse.json({ error: 'No customer email' }, { status: 400 });
        }

        const usersRef = db.collection('users');
        const userQuery = await usersRef.where('email', '==', customerEmail).limit(1).get();

        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0];
          await userDoc.ref.update({
            'subscription.status': 'canceled',
            'subscription.updatedAt': new Date(),
          });
          console.log(`Canceled subscription for user: ${customerEmail}`);
        }
        break;
      }

      case 'checkout.created': {
        // User started checkout - can be used for analytics
        console.log('Checkout created:', event.data);
        break;
      }

      case 'checkout.updated': {
        // Checkout was updated (e.g., completed)
        const checkout = event.data;
        if (checkout.status === 'succeeded') {
          console.log('Checkout succeeded:', checkout.customer?.email);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Polar may send GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ status: 'Polar webhook endpoint active' });
}
