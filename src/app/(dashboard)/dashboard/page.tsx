'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getSavedBusinesses,
  saveBusiness,
  deleteBusiness,
  createBusinessMapping,
  deleteBusinessMapping,
  canAddBusiness,
  SavedBusiness,
} from '@/lib/firestore';
import { BusinessCard, AddBusinessModal, UpgradeModal, QRCodeModal } from '@/components/dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Building2,
  Plus,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface PlaceResult {
  placeId: string;
  name: string;
  address?: string;
  photoUrl?: string;
  rating?: number;
  reviewCount?: number;
}

export default function DashboardPage() {
  const { user, userProfile, hasActiveSubscription } = useAuth();
  const [businesses, setBusinesses] = useState<SavedBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [businessLimit, setBusinessLimit] = useState({ allowed: false, current: 0, limit: 1 });

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQRBusiness, setSelectedQRBusiness] = useState<SavedBusiness | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; placeId: string | null }>({
    open: false,
    placeId: null,
  });

  // Load businesses and check limits
  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [savedBusinesses, limitInfo] = await Promise.all([
          getSavedBusinesses(user.uid),
          canAddBusiness(user.uid),
        ]);
        setBusinesses(savedBusinesses);
        setBusinessLimit(limitInfo);
      } catch (error) {
        console.error('Error loading businesses:', error);
        toast.error('Failed to load businesses');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Handle add business button
  const handleAddClick = () => {
    if (businessLimit.current >= businessLimit.limit) {
      setShowUpgradeModal(true);
    } else {
      setShowAddModal(true);
    }
  };

  // Handle add business
  const handleAddBusiness = async (business: PlaceResult) => {
    if (!user) throw new Error('Not authenticated');

    // Check if already added
    if (businesses.some((b) => b.placeId === business.placeId)) {
      throw new Error('This business is already added');
    }

    // Check limit again
    const limitInfo = await canAddBusiness(user.uid);
    if (!limitInfo.allowed) {
      setShowAddModal(false);
      setShowUpgradeModal(true);
      throw new Error('Business limit reached');
    }

    // Save to Firestore
    await saveBusiness(user.uid, {
      placeId: business.placeId,
      name: business.name,
      address: business.address,
      photoUrl: business.photoUrl,
      rating: business.rating,
      reviewCount: business.reviewCount,
    });

    // Create mapping for public access
    await createBusinessMapping(user.uid, business.placeId);

    // Update local state
    const newBusiness: SavedBusiness = {
      ...business,
      addedAt: { toDate: () => new Date() } as any,
    };
    setBusinesses((prev) => [newBusiness, ...prev]);
    setBusinessLimit((prev) => ({ ...prev, current: prev.current + 1, allowed: prev.current + 1 < prev.limit }));

    toast.success('Business added successfully!');
  };

  // Handle delete business
  const handleDeleteBusiness = async (placeId: string) => {
    if (!user) return;

    try {
      await deleteBusiness(user.uid, placeId);
      await deleteBusinessMapping(placeId);
      setBusinesses((prev) => prev.filter((b) => b.placeId !== placeId));
      setBusinessLimit((prev) => ({ ...prev, current: prev.current - 1, allowed: true }));
      toast.success('Business removed');
    } catch (error) {
      console.error('Error deleting business:', error);
      toast.error('Failed to remove business');
    }
  };

  // Handle copy link
  const handleCopyLink = async (placeId: string) => {
    const url = `${window.location.origin}/review/${placeId}`;
    await navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  // Handle show QR
  const handleShowQR = (business: SavedBusiness) => {
    setSelectedQRBusiness(business);
    setShowQRModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Your Businesses
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your business profiles and review links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Business Count Badge */}
          <Badge
            variant={businessLimit.current >= businessLimit.limit ? 'destructive' : 'secondary'}
            className="text-sm px-3 py-1"
          >
            {businessLimit.current}/{businessLimit.limit} Business{businessLimit.limit !== 1 ? 'es' : ''}
          </Badge>

          {/* Add Button */}
          <Button onClick={handleAddClick}>
            {businessLimit.current >= businessLimit.limit ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Upgrade to Add
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add Business
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Subscription Status Banner */}
      {!hasActiveSubscription && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">Your trial has ended</p>
                  <p className="text-sm text-muted-foreground">
                    Subscribe to continue generating review links.
                  </p>
                </div>
              </div>
              <Button onClick={() => window.location.href = '/pricing'}>
                View Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Grid */}
      {businesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.map((business) => (
            <BusinessCard
              key={business.placeId}
              business={business}
              onDelete={(placeId) => setDeleteConfirm({ open: true, placeId })}
              onCopyLink={handleCopyLink}
              onShowQR={handleShowQR}
            />
          ))}

          {/* Add Business Card (if can add more) */}
          {businessLimit.current < businessLimit.limit && (
            <Card
              className="overflow-hidden border-dashed hover:border-primary/50 cursor-pointer transition-colors"
              onClick={handleAddClick}
            >
              <CardContent className="h-full min-h-[200px] flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                <Plus className="w-12 h-12 mb-3" />
                <span className="font-medium">Add Another Business</span>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        /* Empty State */
        <Card className="text-center py-16">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Business Added Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add your first business to start generating review links and collecting more Google reviews.
            </p>
            <Button onClick={handleAddClick} size="lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Business
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <AddBusinessModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAddBusiness={handleAddBusiness}
        currentCount={businessLimit.current}
        limit={businessLimit.limit}
      />

      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        currentLimit={businessLimit.limit}
        currentCount={businessLimit.current}
      />

      {selectedQRBusiness && (
        <QRCodeModal
          open={showQRModal}
          onOpenChange={setShowQRModal}
          businessName={selectedQRBusiness.name}
          url={`${typeof window !== 'undefined' ? window.location.origin : ''}/review/${selectedQRBusiness.placeId}`}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, placeId: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Business?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the business from your account. Your review link will stop working. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm.placeId) {
                  handleDeleteBusiness(deleteConfirm.placeId);
                }
                setDeleteConfirm({ open: false, placeId: null });
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
