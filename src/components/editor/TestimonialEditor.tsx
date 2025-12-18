'use client';

import { useState } from 'react';
import { Testimonial } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Star, Plus, Pencil, Trash2, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestimonialEditorProps {
  testimonials: Testimonial[];
  onAdd: (testimonial: { text: string; author: string; rating: number }) => void;
  onUpdate: (id: string, updates: { text?: string; author?: string; rating?: number }) => void;
  onDelete: (id: string) => void;
  maxTestimonials?: number;
}

export function TestimonialEditor({
  testimonials,
  onAdd,
  onUpdate,
  onDelete,
  maxTestimonials = 10,
}: TestimonialEditorProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  // Form state
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);

  const resetForm = () => {
    setText('');
    setAuthor('');
    setRating(5);
  };

  const handleAdd = () => {
    if (!text.trim() || !author.trim()) return;
    onAdd({ text: text.trim(), author: author.trim(), rating });
    resetForm();
    setShowAddDialog(false);
  };

  const handleUpdate = () => {
    if (!editingTestimonial || !text.trim() || !author.trim()) return;
    onUpdate(editingTestimonial.id, { text: text.trim(), author: author.trim(), rating });
    resetForm();
    setEditingTestimonial(null);
  };

  const openEditDialog = (testimonial: Testimonial) => {
    setText(testimonial.text);
    setAuthor(testimonial.author);
    setRating(testimonial.rating);
    setEditingTestimonial(testimonial);
  };

  const canAdd = testimonials.length < maxTestimonials;

  return (
    <div className="space-y-4">
      {/* Testimonial List */}
      {testimonials.length > 0 ? (
        <div className="space-y-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="group relative p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
            >
              <div className="flex gap-3">
                <Quote className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground line-clamp-2">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      — {testimonial.author}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'w-3 h-3',
                              star <= testimonial.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-muted-foreground/30'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => openEditDialog(testimonial)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => onDelete(testimonial.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground text-sm">
          No testimonials yet. Add some to showcase on your review page.
        </div>
      )}

      {/* Add Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          resetForm();
          setShowAddDialog(true);
        }}
        disabled={!canAdd}
      >
        <Plus className="w-4 h-4 mr-2" />
        {canAdd ? 'Add Testimonial' : `Limit Reached (${maxTestimonials})`}
      </Button>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Testimonial</DialogTitle>
            <DialogDescription>
              Add a customer review to display on your review page.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text">Review Text</Label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the review text..."
                className="w-full min-h-[100px] px-3 py-2 rounded-md border bg-background text-sm resize-none"
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground text-right">
                {text.length}/300
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Customer Name</Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g., John D."
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={cn(
                        'w-6 h-6',
                        star <= rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-muted-foreground/30'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={!text.trim() || !author.trim()}>
              Add Testimonial
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingTestimonial}
        onOpenChange={(open) => !open && setEditingTestimonial(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Testimonial</DialogTitle>
            <DialogDescription>
              Update this customer review.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-text">Review Text</Label>
              <textarea
                id="edit-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the review text..."
                className="w-full min-h-[100px] px-3 py-2 rounded-md border bg-background text-sm resize-none"
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground text-right">
                {text.length}/300
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-author">Customer Name</Label>
              <Input
                id="edit-author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g., John D."
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={cn(
                        'w-6 h-6',
                        star <= rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-muted-foreground/30'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingTestimonial(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={!text.trim() || !author.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
