'use client';

import { useMemo } from 'react';
import type { BedWithReservation } from '@/lib/types';
import { META_ALTA_MIN, META_HIGIENE_MIN } from '@/lib/constants';

interface BottleneckStats {
  altaSinalizada: {
    median: number;
    p95: number;
    exceeds: boolean;
  };
  higienizacao: {
    median: number;
    p95: number;
    exceeds: boolean;
  };
}

export function useBottlenecks(beds: BedWithReservation[]) {
  const stats = useMemo(() => {
    const now = Date.now();

    // Alta Sinalizada
    const altasSinalizadas = beds
      .filter((b) => b.state === 'Alta Sinalizada' && b.alta_sinalizada_at)
      .map((b) => {
        const start = new Date(b.alta_sinalizada_at!).getTime();
        return Math.floor((now - start) / 60000);
      })
      .sort((a, b) => a - b);

    const altaMedian = altasSinalizadas.length > 0
      ? altasSinalizadas[Math.floor(altasSinalizadas.length / 2)]
      : 0;
    const altaP95 = altasSinalizadas.length > 0
      ? altasSinalizadas[Math.floor(altasSinalizadas.length * 0.95)]
      : 0;

    // Higienização
    const higienizacoes = beds
      .filter((b) => b.state === 'Higienização' && b.higienizacao_inicio_at)
      .map((b) => {
        const start = new Date(b.higienizacao_inicio_at!).getTime();
        return Math.floor((now - start) / 60000);
      })
      .sort((a, b) => a - b);

    const higMedian = higienizacoes.length > 0
      ? higienizacoes[Math.floor(higienizacoes.length / 2)]
      : 0;
    const higP95 = higienizacoes.length > 0
      ? higienizacoes[Math.floor(higienizacoes.length * 0.95)]
      : 0;

    return {
      altaSinalizada: {
        median: altaMedian,
        p95: altaP95,
        exceeds: altaMedian > META_ALTA_MIN,
      },
      higienizacao: {
        median: higMedian,
        p95: higP95,
        exceeds: higMedian > META_HIGIENE_MIN,
      },
    };
  }, [beds]);

  return stats;
}

