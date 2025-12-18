import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  orderBy,
  limit,
  where,
  increment,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

// Event types
export type AnalyticsEventType = 'page_view' | 'button_click' | 'qr_scan';

// Analytics event
export interface AnalyticsEvent {
  type: AnalyticsEventType;
  placeId: string;
  timestamp: Timestamp;
  userAgent?: string;
  referrer?: string;
  sessionId?: string;
}

// Daily analytics aggregate
export interface DailyAnalytics {
  date: string; // YYYY-MM-DD
  pageViews: number;
  buttonClicks: number;
  uniqueVisitors: number;
}

// Overall analytics summary
export interface AnalyticsSummary {
  totalPageViews: number;
  totalButtonClicks: number;
  totalUniqueVisitors: number;
  conversionRate: number;
  dailyData: DailyAnalytics[];
}

// Generate session ID
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Get or create session ID
export function getSessionId(): string {
  if (typeof window === 'undefined') return generateSessionId();

  const stored = sessionStorage.getItem('rb_session_id');
  if (stored) return stored;

  const newId = generateSessionId();
  sessionStorage.setItem('rb_session_id', newId);
  return newId;
}

// Get today's date string
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// Track an analytics event
export async function trackEvent(
  placeId: string,
  type: AnalyticsEventType,
  options?: {
    userAgent?: string;
    referrer?: string;
  }
): Promise<void> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('Firestore not initialized, skipping analytics');
    return;
  }

  const sessionId = getSessionId();
  const today = getTodayDateString();

  try {
    // Record event
    const eventRef = doc(collection(db, 'analytics', placeId, 'events'));
    await setDoc(eventRef, {
      type,
      placeId,
      timestamp: serverTimestamp(),
      userAgent: options?.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : undefined),
      referrer: options?.referrer || (typeof document !== 'undefined' ? document.referrer : undefined),
      sessionId,
    });

    // Update daily aggregate
    const dailyRef = doc(db, 'analytics', placeId, 'daily', today);
    const dailySnap = await getDoc(dailyRef);

    if (dailySnap.exists()) {
      // Update existing
      const updates: Record<string, unknown> = {};

      if (type === 'page_view') {
        updates.pageViews = increment(1);
      } else if (type === 'button_click') {
        updates.buttonClicks = increment(1);
      }

      // Check if this is a unique visitor for today
      const existingData = dailySnap.data();
      const visitors = existingData.visitors || [];
      if (!visitors.includes(sessionId)) {
        updates.uniqueVisitors = increment(1);
        updates.visitors = [...visitors, sessionId];
      }

      await setDoc(dailyRef, updates, { merge: true });
    } else {
      // Create new daily record
      await setDoc(dailyRef, {
        date: today,
        pageViews: type === 'page_view' ? 1 : 0,
        buttonClicks: type === 'button_click' ? 1 : 0,
        uniqueVisitors: 1,
        visitors: [sessionId],
      });
    }

    // Update total counters
    const totalRef = doc(db, 'analytics', placeId);
    const totalSnap = await getDoc(totalRef);

    if (totalSnap.exists()) {
      const totalUpdates: Record<string, unknown> = {};

      if (type === 'page_view') {
        totalUpdates.totalPageViews = increment(1);
      } else if (type === 'button_click') {
        totalUpdates.totalButtonClicks = increment(1);
      }

      await setDoc(totalRef, totalUpdates, { merge: true });
    } else {
      await setDoc(totalRef, {
        placeId,
        totalPageViews: type === 'page_view' ? 1 : 0,
        totalButtonClicks: type === 'button_click' ? 1 : 0,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error tracking event:', error);
    // Don't throw - analytics shouldn't break the app
  }
}

// Get analytics summary for a business
export async function getAnalyticsSummary(placeId: string, days: number = 30): Promise<AnalyticsSummary> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore not initialized');

  // Get total counters
  const totalRef = doc(db, 'analytics', placeId);
  const totalSnap = await getDoc(totalRef);
  const totalData = totalSnap.exists() ? totalSnap.data() : null;

  // Get daily data
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateString = startDate.toISOString().split('T')[0];

  const dailyRef = collection(db, 'analytics', placeId, 'daily');
  const dailyQuery = query(
    dailyRef,
    where('date', '>=', startDateString),
    orderBy('date', 'desc'),
    limit(days)
  );

  const dailySnap = await getDocs(dailyQuery);
  const dailyData: DailyAnalytics[] = dailySnap.docs.map((doc) => {
    const data = doc.data();
    return {
      date: data.date,
      pageViews: data.pageViews || 0,
      buttonClicks: data.buttonClicks || 0,
      uniqueVisitors: data.uniqueVisitors || 0,
    };
  });

  // Sort by date ascending for charts
  dailyData.sort((a, b) => a.date.localeCompare(b.date));

  // Calculate totals
  const totalPageViews = totalData?.totalPageViews || 0;
  const totalButtonClicks = totalData?.totalButtonClicks || 0;
  const totalUniqueVisitors = dailyData.reduce((sum, d) => sum + d.uniqueVisitors, 0);
  const conversionRate = totalPageViews > 0 ? (totalButtonClicks / totalPageViews) * 100 : 0;

  return {
    totalPageViews,
    totalButtonClicks,
    totalUniqueVisitors,
    conversionRate,
    dailyData,
  };
}

// Get analytics for multiple businesses (for dashboard overview)
export async function getMultiBusinessAnalytics(
  placeIds: string[]
): Promise<Map<string, { pageViews: number; buttonClicks: number }>> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firestore not initialized');

  const results = new Map<string, { pageViews: number; buttonClicks: number }>();

  for (const placeId of placeIds) {
    try {
      const totalRef = doc(db, 'analytics', placeId);
      const totalSnap = await getDoc(totalRef);

      if (totalSnap.exists()) {
        const data = totalSnap.data();
        results.set(placeId, {
          pageViews: data.totalPageViews || 0,
          buttonClicks: data.totalButtonClicks || 0,
        });
      } else {
        results.set(placeId, { pageViews: 0, buttonClicks: 0 });
      }
    } catch (error) {
      console.error(`Error getting analytics for ${placeId}:`, error);
      results.set(placeId, { pageViews: 0, buttonClicks: 0 });
    }
  }

  return results;
}
