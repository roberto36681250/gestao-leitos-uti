'use client';

import { useState } from 'react';
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

interface CancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (motivo: string) => void;
}

export function CancelDialog({ open, onOpenChange, onConfirm }: CancelDialogProps) {
  const [motivo, setMotivo] = useState('');

  const handleConfirm = () => {
    if (motivo.trim()) {
      onConfirm(motivo.trim());
      setMotivo('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancelar Alta</DialogTitle>
          <DialogDescription>Motivo do cancelamento (máx. 60 caracteres)</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="motivo" className="sr-only">
            Motivo
          </Label>
          <Input
            id="motivo"
            placeholder="Ex: hipotensão, febre, novo suporte"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value.slice(0, 60))}
            maxLength={60}
            className="text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && motivo.trim()) {
                handleConfirm();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!motivo.trim()}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

