'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  latency?: number;
  lastEventTime?: number;
  onStatusChange?: (status: 'online' | 'reconnecting' | 'offline') => void;
}

type Status = 'online' | 'reconnecting' | 'offline';

export function ConnectionStatus({ latency, lastEventTime, onStatusChange }: ConnectionStatusProps) {
  const [status, setStatus] = useState<Status>('online');
  const [displayLatency, setDisplayLatency] = useState<number | null>(null);

  useEffect(() => {
    if (latency !== undefined) {
      setDisplayLatency(latency);
      setStatus('online');
    }
  }, [latency]);

  useEffect(() => {
    if (lastEventTime === undefined) return;

    const checkConnection = () => {
      const now = Date.now();
      const timeSinceLastEvent = now - lastEventTime;

      let newStatus: Status = 'online';
      // Aumentar tolerância para evitar falsos positivos
      // Considerando que polling é a cada 30s, precisamos tolerar até 45-60s
      if (timeSinceLastEvent > 60000) {
        // 60 segundos sem atividade = offline (polling é 30s, então 2x polling = offline)
        newStatus = 'offline';
      } else if (timeSinceLastEvent > 45000) {
        // 45 segundos sem atividade = reconectando (1.5x polling)
        newStatus = 'reconnecting';
      }

      if (newStatus !== status) {
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      }
    };

    const interval = setInterval(checkConnection, 1000);
    checkConnection(); // Verifica imediatamente

    return () => clearInterval(interval);
  }, [lastEventTime, status, onStatusChange]);

  const statusConfig = {
    online: {
      dot: 'bg-green-500',
      text: 'Online',
      textColor: 'text-green-700',
    },
    reconnecting: {
      dot: 'bg-yellow-500',
      text: 'Reconectando',
      textColor: 'text-yellow-700',
    },
    offline: {
      dot: 'bg-red-500',
      text: 'Offline',
      textColor: 'text-red-700',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={cn('w-2 h-2 rounded-full', config.dot)} />
      <span className={cn('font-medium', config.textColor)}>{config.text}</span>
      {status === 'online' && displayLatency !== null && (
        <span className="text-gray-600 text-xs">latência {displayLatency} ms</span>
      )}
    </div>
  );
}

