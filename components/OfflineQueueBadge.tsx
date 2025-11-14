'use client';

import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfflineQueueBadgeProps {
  queueLength: number;
  onProcess: () => void;
  isProcessing?: boolean;
}

export function OfflineQueueBadge({ queueLength, onProcess, isProcessing }: OfflineQueueBadgeProps) {
  if (queueLength === 0) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onProcess}
      className={cn(
        'h-9 px-3 relative',
        isProcessing && 'opacity-50 cursor-not-allowed'
      )}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <CheckCircle2 className="h-4 w-4 mr-1.5" />
      ) : (
        <Clock className="h-4 w-4 mr-1.5" />
      )}
      <span className="text-xs">Fila</span>
      {queueLength > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {queueLength}
        </span>
      )}
    </Button>
  );
}

