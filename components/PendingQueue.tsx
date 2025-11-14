'use client';

import { usePendingQueue } from '@/hooks/usePendingQueue';
import { useBottlenecks } from '@/hooks/useBottlenecks';
import { ActionLog } from '@/components/ActionLog';
import type { BedWithReservation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface PendingQueueProps {
  beds: BedWithReservation[];
  onBedClick?: (bedId: string) => void;
  className?: string;
}

export function PendingQueue({ beds, onBedClick, className }: PendingQueueProps) {
  const { pending, totalPending } = usePendingQueue(beds);
  const bottlenecks = useBottlenecks(beds);

  const handleBedClick = (bedId: string) => {
    if (onBedClick) {
      onBedClick(bedId);
      // Scroll até o card
      const element = document.querySelector(`[data-bed-id="${bedId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Focar o card
        (element as HTMLElement).focus();
      }
    }
  };

  if (totalPending === 0) {
    return (
      <div className={cn('p-4 text-sm text-gray-500', className)}>
        Nenhuma pendência
      </div>
    );
  }

  return (
    <ScrollArea className={cn('h-full', className)}>
      <div className="p-4 space-y-4">
        {Object.entries(pending).map(([action, items]) => {
          if (items.length === 0) return null;

          return (
            <div key={action} className="space-y-2">
              <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                {action} ({items.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <Button
                    key={item.bed.id}
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => handleBedClick(item.bed.id)}
                    data-bed-id={item.bed.id}
                  >
                    {item.bed.number}
                    {item.waitTime > 0 && (
                      <span className="ml-1 text-[10px] text-gray-500">
                        ({item.waitTime}m)
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bloco Gargalos */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          Gargalos
        </div>
        
        <div className="space-y-2 text-xs">
          <div>
            <div className="font-medium text-gray-900 mb-1">Alta Sinalizada</div>
            <div className="text-gray-600">
              Mediana: {bottlenecks.altaSinalizada.median}m, P95: {bottlenecks.altaSinalizada.p95}m
            </div>
          </div>
          
          <div>
            <div className="font-medium text-gray-900 mb-1">Higienização</div>
            <div className="text-gray-600">
              Mediana: {bottlenecks.higienizacao.median}m, P95: {bottlenecks.higienizacao.p95}m
            </div>
          </div>
        </div>
      </div>

      {/* Ata de Ações */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">
          Ata de Ações
        </div>
        <ActionLog />
      </div>
    </ScrollArea>
  );
}

