'use client';

import { getNextActionsByState, getActionShortcut } from '@/lib/state';
import { getActionTargetColor, getActionTargetTextColor } from '@/lib/actionColors';
import type { BedWithReservation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Flag,
  X,
  CheckCircle2,
  Droplets,
  Truck,
  Bookmark,
  ShieldAlert,
  BedSingle,
  ArrowRight,
  Pencil,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionBarProps {
  bed: BedWithReservation;
  onAction: (action: string) => void;
  onClose: () => void;
}

const actionIcons: Record<string, typeof Flag> = {
  'Alta Sinalizada': Flag,
  'Alta Efetivada': CheckCircle2,
  'Cancelar Alta': X,
  'Iniciar Higienização': Droplets,
  'Finalizar Higienização': CheckCircle2,
  Transferência: Truck,
  Reservar: Bookmark,
  Liberar: ArrowRight,
  'Entrada Confirmada': BedSingle,
  Interditar: ShieldAlert,
  Editar: Pencil,
};

const actionLabels: Record<string, string> = {
  'Alta Sinalizada': 'Alta',
  'Alta Efetivada': 'Efetivada',
  'Cancelar Alta': 'Cancelar',
  'Iniciar Higienização': 'Higienizar',
  'Finalizar Higienização': 'Finalizar',
  Transferência: 'Transferir',
  Reservar: 'Reservar',
  Liberar: 'Liberar',
  'Entrada Confirmada': 'Entrada',
  Interditar: 'Interditar',
  Editar: 'Editar',
};

export function ActionBar({ bed, onAction, onClose }: ActionBarProps) {
  const availableActions = getNextActionsByState(bed.state);
  
  // Limita a 4 botões, sempre inclui Editar
  const actionsToShow = availableActions.slice(0, 3);
  const actionsWithEdit = actionsToShow.includes('Editar')
    ? actionsToShow
    : [...actionsToShow, 'Editar'];

  return (
    <div
      data-action-bar
      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-wrap gap-1.5 justify-center max-w-[280px]">
        {actionsWithEdit.map((action) => {
          const Icon = actionIcons[action] || Flag;
          const label = actionLabels[action] || action;
          const shortcut = getActionShortcut(action);
          const targetColor = getActionTargetColor(action);
          const targetTextColor = getActionTargetTextColor(action);
          
          // Mapear cores para classes Tailwind
          const borderColorMap: Record<string, string> = {
            'bg-blue-600': 'border-blue-600',
            'bg-emerald-700': 'border-emerald-700',
            'bg-yellow-600': 'border-yellow-600',
            'bg-green-600': 'border-green-600',
            'bg-orange-600': 'border-orange-600',
            'bg-purple-600': 'border-purple-600',
            'bg-zinc-600': 'border-zinc-600',
            'bg-gray-600': 'border-gray-600',
          };

          const borderColor = borderColorMap[targetColor] || 'border-gray-600';
          
          return (
            <Button
              key={action}
              size="sm"
              variant="outline"
              className={cn(
                'h-11 px-3 text-xs min-w-[44px] flex items-center gap-1.5',
                'border-2 font-semibold',
                borderColor,
                targetTextColor
              )}
              onClick={(e) => {
                e.stopPropagation();
                onAction(action);
              }}
              aria-label={action}
            >
              {shortcut && (
                <span className={cn('text-[10px] font-black', targetTextColor)}>
                  {shortcut}
                </span>
              )}
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </Button>
          );
        })}
      </div>
      {/* Seta apontando para o card */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200"></div>
      </div>
    </div>
  );
}
