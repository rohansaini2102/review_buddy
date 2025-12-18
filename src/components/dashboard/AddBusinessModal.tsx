'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Link2,
  Loader2,
  Building2,
  Star,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import debounce from 'lodash/debounce';

interface PlaceResult {
  placeId: string;
  name: string;
  address?: string;
  photoUrl?: string;
  rating?: number;
  reviewCount?: number;
}

interface AddBusinessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBusiness: (business: PlaceResult) => Promise<void>;
  currentCount: number;
  limit: number;
}

export function AddBusinessModal({
  open,
  onOpenChange,
  onAddBusiness,
  currentCount,
  limit,
}: AddBusinessModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<PlaceResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('search');

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.error) {
          setError(data.error);
          setSearchResults([]);
        } else {
          setSearchResults(data.predictions || []);
        }
      } catch {
        setError('Failed to search. Please try again.');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSelectedBusiness(null);
    debouncedSearch(value);
  };

  const handleSelectFromSearch = async (prediction: { placeId: string; name: string; address?: string }) => {
    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`/api/places/${prediction.placeId}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSelectedBusiness({
          placeId: data.placeId,
          name: data.name,
          address: data.address,
          photoUrl: data.photoUrl,
          rating: data.rating,
          reviewCount: data.reviewCount,
        });
      }
    } catch {
      setError('Failed to get business details.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      setError('Please enter a Google URL');
      return;
    }

    setIsLoadingUrl(true);
    setError(null);
    setSelectedBusiness(null);

    try {
      // First parse the URL
      const parseResponse = await fetch('/api/places/parse-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      const parseData = await parseResponse.json();

      if (parseData.error) {
        setError(parseData.error);
        return;
      }

      // Then get the place details
      const detailsResponse = await fetch(`/api/places/${parseData.placeId}?originalUrl=${encodeURIComponent(urlInput.trim())}`);
      const detailsData = await detailsResponse.json();

      if (detailsData.error) {
        setError(detailsData.error);
      } else {
        setSelectedBusiness({
          placeId: detailsData.placeId,
          name: detailsData.name,
          address: detailsData.address,
          photoUrl: detailsData.photoUrl,
          rating: detailsData.rating,
          reviewCount: detailsData.reviewCount,
        });
      }
    } catch {
      setError('Failed to parse URL. Please try a different link.');
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const handleAddBusiness = async () => {
    if (!selectedBusiness) return;

    setIsAdding(true);
    setError(null);

    try {
      await onAddBusiness(selectedBusiness);
      // Reset state and close
      setSearchQuery('');
      setUrlInput('');
      setSearchResults([]);
      setSelectedBusiness(null);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add business');
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setUrlInput('');
    setSearchResults([]);
    setSelectedBusiness(null);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Business</DialogTitle>
          <DialogDescription>
            Search for your business or paste a Google Maps link.
            <span className="block mt-1 text-xs">
              Using {currentCount} of {limit} business profile{limit !== 1 ? 's' : ''}.
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">
              <Search className="w-4 h-4 mr-2" />
              Search
            </TabsTrigger>
            <TabsTrigger value="url">
              <Link2 className="w-4 h-4 mr-2" />
              Paste URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="search">Business Name</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search for your business..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Search Results */}
            {searchQuery && !selectedBusiness && (
              <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                {isSearching ? (
                  <div className="p-4 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result: { placeId: string; name: string; address?: string }) => (
                    <button
                      key={result.placeId}
                      onClick={() => handleSelectFromSearch(result)}
                      className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
                    >
                      <p className="font-medium text-sm">{result.name}</p>
                      {result.address && (
                        <p className="text-xs text-muted-foreground mt-0.5">{result.address}</p>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No businesses found
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="url" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="url">Google Maps URL</Label>
              <Input
                id="url"
                placeholder="https://g.page/... or https://maps.google.com/..."
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setSelectedBusiness(null);
                  setError(null);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Supports g.page links, Google Maps URLs, and Place IDs
              </p>
            </div>
            <Button
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim() || isLoadingUrl}
              className="w-full"
              variant="outline"
            >
              {isLoadingUrl ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Find Business
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Selected Business Preview */}
        {selectedBusiness && (
          <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              Business Found
            </div>
            <div className="flex gap-3">
              {selectedBusiness.photoUrl ? (
                <Image
                  src={selectedBusiness.photoUrl}
                  alt={selectedBusiness.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground">{selectedBusiness.name}</h4>
                {selectedBusiness.address && (
                  <p className="text-sm text-muted-foreground flex items-start gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{selectedBusiness.address}</span>
                  </p>
                )}
                {selectedBusiness.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm">{selectedBusiness.rating.toFixed(1)}</span>
                    {selectedBusiness.reviewCount && (
                      <span className="text-xs text-muted-foreground">
                        ({selectedBusiness.reviewCount} reviews)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleAddBusiness}
              disabled={isAdding}
              className="w-full"
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Add This Business
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
