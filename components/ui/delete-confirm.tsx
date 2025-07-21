'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  requireConfirmation?: boolean;
  confirmationText?: string;
  isLoading?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Item',
  description = 'This action cannot be undone. This will permanently delete the api key.',
  itemName,
  requireConfirmation = false,
  confirmationText = 'DELETE',
  isLoading = false,
}: DeleteConfirmationModalProps) {
  const [confirmationInput, setConfirmationInput] = useState('');

  const handleConfirm = () => {
    if (requireConfirmation && confirmationInput !== confirmationText) {
      return;
    }
    onConfirm();
  };

  const handleClose = () => {
    setConfirmationInput('');
    onClose();
  };

  const isConfirmDisabled = requireConfirmation
    ? confirmationInput !== confirmationText || isLoading
    : isLoading;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-white">{title}</DialogTitle>
              {itemName && (
                <p className="text-sm text-gray-500 mt-1">
                  Item: <span className="font-medium">{itemName}</span>
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <DialogDescription className="text-sm text-gray-600 leading-relaxed">
          {description}
        </DialogDescription>

        {requireConfirmation && (
          <div className="space-y-2">
            <Label htmlFor="confirmation" className="text-sm font-medium text-gray-700">
              Type <span className="font-mono font-bold text-red-600">{confirmationText}</span> to
              confirm:
            </Label>
            <Input
              id="confirmation"
              value={confirmationInput}
              onChange={e => setConfirmationInput(e.target.value)}
              placeholder={confirmationText}
              className="font-mono"
              autoComplete="off"
            />
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="w-full sm:w-auto bg-transparent"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Deleting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
