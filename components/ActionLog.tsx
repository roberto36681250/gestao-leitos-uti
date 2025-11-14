'use client';

import { useActionLog } from '@/hooks/useActionLog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export function ActionLog() {
  const logs = useActionLog();

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  if (logs.length === 0) {
    return (
      <div className="p-4 text-xs text-gray-500 text-center">
        Nenhuma ação registrada
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="p-2 space-y-1">
        {logs.map((log, idx) => (
          <div
            key={idx}
            className="text-xs p-2 rounded border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900">
                  Leito {log.bedNumber} - {log.action}
                </div>
                {log.details && (
                  <div className="text-gray-600 mt-0.5 truncate">
                    {log.details}
                  </div>
                )}
              </div>
              <div className="text-gray-500 font-mono text-[10px] whitespace-nowrap">
                {formatTimestamp(log.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

