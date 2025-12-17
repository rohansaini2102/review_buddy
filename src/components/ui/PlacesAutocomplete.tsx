'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2, MapPin, Search, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Prediction {
  placeId: string;
  name: string;
  address: string;
}

interface PlacesAutocompleteProps {
  onSelect: (placeId: string, name: string) => void;
  placeholder?: string;
  className?: string;
}

export function PlacesAutocomplete({
  onSelect,
  placeholder = 'Search for your business...',
  className,
}: PlacesAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (data.success && data.predictions) {
          setPredictions(data.predictions);
          setIsOpen(data.predictions.length > 0);
        }
      } catch (error) {
        console.error('Autocomplete error:', error);
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < predictions.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && predictions[selectedIndex]) {
            handleSelect(predictions[selectedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
      }
    },
    [isOpen, predictions, selectedIndex]
  );

  const handleSelect = (prediction: Prediction) => {
    setQuery(prediction.name);
    setIsOpen(false);
    setPredictions([]);
    onSelect(prediction.placeId, prediction.name);
  };

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => predictions.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg overflow-hidden">
          <ul className="max-h-60 overflow-y-auto">
            {predictions.map((prediction, index) => (
              <li
                key={prediction.placeId}
                className={cn(
                  'px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0',
                  index === selectedIndex
                    ? 'bg-primary/10'
                    : 'hover:bg-muted/50'
                )}
                onClick={() => handleSelect(prediction)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">
                      {prediction.name}
                    </p>
                    {prediction.address && (
                      <p className="text-sm text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        {prediction.address}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
