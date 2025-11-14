'use client';

export function BedCardSkeleton() {
  return (
    <div className="relative rounded-lg border-2 border-gray-200 bg-gray-100 min-h-[140px] flex flex-col animate-pulse">
      <div className="h-3 w-full bg-gray-300" />
      <div className="flex-1 flex flex-col items-center justify-center p-3 bg-white">
        <div className="h-16 w-16 bg-gray-300 rounded mb-2" />
        <div className="flex items-center gap-2 mt-auto">
          <div className="h-6 w-6 bg-gray-300 rounded-full" />
          <div className="h-5 w-12 bg-gray-300 rounded" />
          <div className="h-6 w-6 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}

