'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { PendingQueue } from './PendingQueue';
import { Bell } from 'lucide-react';
import type { BedWithReservation } from '@/lib/types';
import { usePendingQueue } from '@/hooks/usePendingQueue';

interface PendingQueueDrawerProps {
  beds: BedWithReservation[];
  onBedClick?: (bedId: string) => void;
}

export function PendingQueueDrawer({ beds, onBedClick }: PendingQueueDrawerProps) {
  const { totalPending } = usePendingQueue(beds);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 px-3 relative">
          <Bell className="h-4 w-4" />
          {totalPending > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalPending}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Pendências</SheetTitle>
        </SheetHeader>
        <PendingQueue beds={beds} onBedClick={onBedClick} className="h-[calc(100vh-80px)]" />
      </SheetContent>
    </Sheet>
  );
}

