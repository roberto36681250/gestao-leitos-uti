'use client';

import { BedCard } from './BedCard';
import type { BedWithReservation } from '@/lib/types';

interface BoardGridProps {
  beds: BedWithReservation[];
  onAction?: (action: string, bedId: string, data?: any) => void;
  onFocus?: (bedId: string | null) => void;
  focusedBedId?: string | null;
}

export function BoardGrid({
  beds,
  onAction,
  onFocus,
  focusedBedId,
}: BoardGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 w-full max-w-full">
      {beds.map((bed) => (
        <div
          key={bed.id}
          className="relative overflow-visible"
          data-bed-id={bed.id}
          onFocus={() => onFocus?.(bed.id)}
          onBlur={() => onFocus?.(null)}
          tabIndex={0}
        >
              <BedCard
                bed={bed}
                onAction={onAction}
                focused={focusedBedId === bed.id}
              />
        </div>
      ))}
    </div>
  );
}
