'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckSquare, Square, CheckCircle2, Droplets, Bookmark, BedSingle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import type { BedWithReservation } from '@/lib/types';

interface BatchModeProps {
  beds: BedWithReservation[];
  selectedBeds: Set<string>;
  onSelectionChange: (beds: Set<string>) => void;
  onBatchAction: (action: string, bedIds: string[]) => Promise<void>;
}

export function BatchMode({ beds, selectedBeds, onSelectionChange, onBatchAction }: BatchModeProps) {
  const [isActive, setIsActive] = useState(false);

  const toggleMode = () => {
    setIsActive(!isActive);
    if (isActive) {
      onSelectionChange(new Set());
    }
  };

  const toggleBed = (bedId: string) => {
    const newSelection = new Set(selectedBeds);
    if (newSelection.has(bedId)) {
      newSelection.delete(bedId);
    } else {
      newSelection.add(bedId);
    }
    onSelectionChange(newSelection);
  };

  const handleBatchAction = async (action: string) => {
    const bedIds = Array.from(selectedBeds);
    if (bedIds.length === 0) {
      toast({ title: 'Selecione pelo menos um leito', variant: 'destructive' });
      return;
    }

    const actionMap: Record<string, string> = {
      'Iniciar Higienização': 'Iniciar Higienização',
      'Finalizar Higienização': 'Finalizar Higienização',
      'Reservar': 'Reservar',
      'Entrada Confirmada': 'Entrada Confirmada',
    };

    const actualAction = actionMap[action];
    if (!actualAction) return;

    await onBatchAction(actualAction, bedIds);
    onSelectionChange(new Set());
  };

  if (!isActive && selectedBeds.size === 0) {
    return (
      <Button variant="outline" size="sm" onClick={toggleMode} className="h-9 px-3">
        <CheckSquare className="h-4 w-4 mr-1.5" />
        Selecionar
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
      <Button variant="ghost" size="sm" onClick={toggleMode} className="h-8 px-2">
        <Square className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium text-blue-900">
        {selectedBeds.size} selecionado{selectedBeds.size !== 1 ? 's' : ''}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBatchAction('Iniciar Higienização')}
          className="h-8 px-2 text-xs"
        >
          <Droplets className="h-3 w-3 mr-1" />
          Higienizar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBatchAction('Finalizar Higienização')}
          className="h-8 px-2 text-xs"
        >
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Finalizar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBatchAction('Reservar')}
          className="h-8 px-2 text-xs"
        >
          <Bookmark className="h-3 w-3 mr-1" />
          Reservar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBatchAction('Entrada Confirmada')}
          className="h-8 px-2 text-xs"
        >
          <BedSingle className="h-3 w-3 mr-1" />
          Entrada
        </Button>
      </div>
    </div>
  );
}

