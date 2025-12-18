'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SavedBusiness } from '@/lib/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Star,
  MapPin,
  ExternalLink,
  Edit3,
  BarChart3,
  MoreVertical,
  Trash2,
  Link2,
  QrCode,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BusinessCardProps {
  business: SavedBusiness;
  onDelete: (placeId: string) => void;
  onCopyLink: (placeId: string) => void;
  onShowQR: (business: SavedBusiness) => void;
}

export function BusinessCard({ business, onDelete, onCopyLink, onShowQR }: BusinessCardProps) {
  const reviewUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/review/${business.placeId}`;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        {/* Business Image */}
        <div className="relative h-32 bg-muted">
          {business.photoUrl ? (
            <Image
              src={business.photoUrl}
              alt={business.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <Star className="w-12 h-12 text-primary/30" />
            </div>
          )}
          {/* More Options */}
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onCopyLink(business.placeId)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShowQR(business)}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Show QR Code
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/review/${business.placeId}`} target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Preview Page
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(business.placeId)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Business
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Rating Badge */}
          {business.rating && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 shadow-sm">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-medium">{business.rating.toFixed(1)}</span>
              {business.reviewCount && (
                <span className="text-xs text-muted-foreground">
                  ({business.reviewCount})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Business Info */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-foreground line-clamp-1">{business.name}</h3>
            {business.address && (
              <p className="text-sm text-muted-foreground flex items-start gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{business.address}</span>
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button asChild variant="default" size="sm" className="flex-1">
              <Link href={`/dashboard/editor?business=${business.placeId}`}>
                <Edit3 className="w-4 h-4 mr-1.5" />
                Edit Page
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/dashboard/analytics?business=${business.placeId}`}>
                <BarChart3 className="w-4 h-4 mr-1.5" />
                Analytics
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
