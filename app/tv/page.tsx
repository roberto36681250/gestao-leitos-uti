'use client';

import { useState, useEffect } from 'react';
import { useBedsRealtime } from '@/hooks/useBedsRealtime';
import { TopMetrics } from '@/components/TopMetrics';
import { BoardGrid } from '@/components/BoardGrid';
import { BedCardSkeleton } from '@/components/BedCardSkeleton';
import { ConnectionStatus } from '@/components/ConnectionStatus';

export default function TVPage() {
  const { beds, loading, error, latency, lastEventTime, refetch } = useBedsRealtime();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualizar relógio a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Polling adicional a cada 15s
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 15000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <BedCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold text-red-600">Erro: {error}</div>
      </div>
    );
  }

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header com relógio e status */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestão de Leitos</h1>
            <p className="text-gray-600 text-lg">Sistema em tempo real</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-5xl font-mono font-bold text-gray-900">
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {currentTime.toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </div>
            </div>
            <ConnectionStatus latency={latency} lastEventTime={lastEventTime} />
          </div>
        </div>

        {/* Métricas grandes */}
        <div className="mb-8">
          <TopMetrics beds={beds} onStateClick={() => {}} />
        </div>

        {/* Grade de leitos ampliada */}
        <div className="pb-8">
          <BoardGrid beds={beds} onAction={() => {}} />
        </div>
      </div>
    </div>
  );
}

