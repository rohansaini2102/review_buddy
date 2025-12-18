'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getSavedBusinesses, SavedBusiness } from '@/lib/firestore';
import { getAnalyticsSummary, AnalyticsSummary } from '@/lib/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Eye,
  MousePointer,
  Users,
  TrendingUp,
  Building2,
  ArrowLeft,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [businesses, setBusinesses] = useState<SavedBusiness[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<SavedBusiness | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(30);

  // Load businesses
  useEffect(() => {
    async function loadBusinesses() {
      if (!user) return;
      try {
        const savedBusinesses = await getSavedBusinesses(user.uid);
        setBusinesses(savedBusinesses);

        // Auto-select business from URL or first one
        const businessId = searchParams.get('business');
        const business = businessId
          ? savedBusinesses.find((b) => b.placeId === businessId)
          : savedBusinesses[0];

        if (business) {
          setSelectedBusiness(business);
        }
      } catch (error) {
        console.error('Error loading:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadBusinesses();
  }, [user, searchParams]);

  // Load analytics when business or time range changes
  useEffect(() => {
    async function loadAnalytics() {
      if (!selectedBusiness) return;

      try {
        const summary = await getAnalyticsSummary(selectedBusiness.placeId, timeRange);
        setAnalytics(summary);
      } catch (error) {
        console.error('Error loading analytics:', error);
        setAnalytics(null);
      }
    }
    loadAnalytics();
  }, [selectedBusiness, timeRange]);

  // Handle business change
  const handleBusinessChange = (placeId: string) => {
    const business = businesses.find((b) => b.placeId === placeId);
    if (business) {
      setSelectedBusiness(business);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Business Added</h2>
            <p className="text-muted-foreground mb-6">
              Add a business first to view analytics.
            </p>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Analytics
            </h1>
            <p className="text-muted-foreground text-sm">
              Track your review link performance.
            </p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          {[7, 14, 30].map((days) => (
            <Button
              key={days}
              variant={timeRange === days ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(days as 7 | 14 | 30)}
            >
              {days}d
            </Button>
          ))}
        </div>
      </div>

      {/* Business Selector */}
      {businesses.length > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium whitespace-nowrap">
                Select Business:
              </label>
              <select
                value={selectedBusiness?.placeId || ''}
                onChange={(e) => handleBusinessChange(e.target.value)}
                className="flex-1 h-10 px-3 rounded-md border bg-background text-sm"
              >
                {businesses.map((business) => (
                  <option key={business.placeId} value={business.placeId}>
                    {business.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Page Views"
          value={analytics?.totalPageViews || 0}
          icon={Eye}
          description={`Last ${timeRange} days`}
        />
        <StatCard
          title="Button Clicks"
          value={analytics?.totalButtonClicks || 0}
          icon={MousePointer}
          description="Review button clicks"
        />
        <StatCard
          title="Unique Visitors"
          value={analytics?.totalUniqueVisitors || 0}
          icon={Users}
          description={`Last ${timeRange} days`}
        />
        <StatCard
          title="Conversion Rate"
          value={`${(analytics?.conversionRate || 0).toFixed(1)}%`}
          icon={TrendingUp}
          description="Views → Clicks"
          isPercentage
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Daily Views
          </CardTitle>
          <CardDescription>
            Page views over the last {timeRange} days
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analytics && analytics.dailyData.length > 0 ? (
            <SimpleBarChart data={analytics.dailyData} />
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              No data available yet. Share your review link to start tracking.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Total page views (all time)</span>
              <span className="font-medium">{analytics?.totalPageViews || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Total button clicks (all time)</span>
              <span className="font-medium">{analytics?.totalButtonClicks || 0}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Avg. daily views ({timeRange}d)</span>
              <span className="font-medium">
                {analytics?.dailyData && analytics.dailyData.length > 0
                  ? (analytics.dailyData.reduce((sum, d) => sum + d.pageViews, 0) / analytics.dailyData.length).toFixed(1)
                  : 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Conversion rate</span>
              <span className={cn(
                "font-medium",
                (analytics?.conversionRate || 0) > 20 ? "text-green-600" : ""
              )}>
                {(analytics?.conversionRate || 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Simple stat card component
function StatCard({
  title,
  value,
  icon: Icon,
  description,
  isPercentage = false,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description: string;
  isPercentage?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Simple bar chart component (no external dependency)
function SimpleBarChart({ data }: { data: { date: string; pageViews: number }[] }) {
  const maxValue = Math.max(...data.map((d) => d.pageViews), 1);

  return (
    <div className="h-48">
      <div className="flex items-end justify-between h-full gap-1">
        {data.map((item, index) => {
          const height = (item.pageViews / maxValue) * 100;
          const date = new Date(item.date);
          const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });

          return (
            <div key={item.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground">{item.pageViews}</span>
              <div
                className="w-full bg-primary/80 rounded-t transition-all duration-300 hover:bg-primary"
                style={{ height: `${Math.max(height, 2)}%` }}
                title={`${item.date}: ${item.pageViews} views`}
              />
              <span className="text-[10px] text-muted-foreground">
                {data.length <= 14 ? dayLabel : (index % 7 === 0 ? dayLabel : '')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <AnalyticsContent />
    </Suspense>
  );
}
