'use client';

import { cn } from '@/lib/utils';
import { META_ALTA_MIN, META_HIGIENE_MIN } from '@/lib/constants';
import type { BedWithReservation } from '@/lib/types';

interface AgingBadgeProps {
  bed: BedWithReservation;
}

export function AgingBadge({ bed }: AgingBadgeProps) {
  const getAgingTime = () => {
    if (bed.state === 'Alta Sinalizada' && bed.alta_sinalizada_at) {
      const start = new Date(bed.alta_sinalizada_at).getTime();
      const now = Date.now();
      const diffMs = now - start;
      const diffMin = Math.floor(diffMs / 60000);
      const diffSec = Math.floor((diffMs % 60000) / 1000);
      return { minutes: diffMin, seconds: diffSec, meta: META_ALTA_MIN };
    }
    
    if (bed.state === 'Higienização' && bed.higienizacao_inicio_at) {
      const start = new Date(bed.higienizacao_inicio_at).getTime();
      const now = Date.now();
      const diffMs = now - start;
      const diffMin = Math.floor(diffMs / 60000);
      const diffSec = Math.floor((diffMs % 60000) / 1000);
      return { minutes: diffMin, seconds: diffSec, meta: META_HIGIENE_MIN };
    }
    
    return null;
  };

  const aging = getAgingTime();
  if (!aging) return null;

  const minutes = aging.minutes;
  const seconds = aging.seconds;
  const meta = aging.meta;

  let colorClass = 'bg-blue-100 text-blue-700';
  if (minutes > meta * 2) {
    colorClass = 'bg-red-100 text-red-700';
  } else if (minutes > meta) {
    colorClass = 'bg-amber-100 text-amber-700';
  }

  return (
    <div
      className={cn(
        'absolute top-8 left-0 text-[10px] font-mono font-bold px-1 py-0.5 rounded-br-lg',
        colorClass
      )}
    >
      {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </div>
  );
}

