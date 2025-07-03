import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCompletionDocuments, type CompletionDocument } from '@/hooks/useCompletionDocuments';

interface EditDocumentModalProps {
  document: CompletionDocument;
  onClose: () => void;
  onDocumentUpdated?: () => void;
}

const categories = [
  { value: 'building-control', label: 'Building Control' },
  { value: 'certificates', label: 'Certificates' },
  { value: 'warranties', label: 'Warranties' },
  { value: 'approved-documents', label: 'Approved Documents' },
  { value: 'other', label: 'Other' },
];

export const EditDocumentModal = ({ document, onClose, onDocumentUpdated }: EditDocumentModalProps) => {
  const [displayName, setDisplayName] = useState(document.display_name || document.file_name);
  const [category, setCategory] = useState(document.category);
  const [description, setDescription] = useState(document.description || '');
  const [updating, setUpdating] = useState(false);

  const { updateDocument } = useCompletionDocuments(document.project_id);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await updateDocument(document.id, {
        display_name: displayName.trim(),
        category,
        description: description.trim() || null,
      });
      onDocumentUpdated?.();
      onClose();
    } catch (error) {
      console.error('Failed to update document:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display-name">Display Name *</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter document name..."
              disabled={updating}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} disabled={updating}>
              <SelectTrigger>
                <SelectValue placeholder="Select document category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              disabled={updating}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={updating}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!displayName.trim() || !category || updating}
            >
              {updating ? 'Updating...' : 'Update Document'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};