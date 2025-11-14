'use client';

import { useMemo } from 'react';
import type { BedWithReservation } from '@/lib/types';

interface PendingItem {
  bed: BedWithReservation;
  pendingAction: string;
  waitTime: number; // minutos desde que entrou nesse estado
}

export function usePendingQueue(beds: BedWithReservation[]) {
  const pending = useMemo(() => {
    const groups: Record<string, PendingItem[]> = {
      'Alta sinalizada': [],
      'Iniciar higienização': [],
      'Finalizar higienização': [],
      'Reservado sem entrada': [],
    };

    const now = Date.now();

    beds.forEach((bed) => {
      let pendingAction: string | null = null;
      let waitTime = 0;

      // Alta sinalizada
      if (bed.state === 'Alta Sinalizada' && bed.alta_sinalizada_at) {
        const signalTime = new Date(bed.alta_sinalizada_at).getTime();
        waitTime = Math.floor((now - signalTime) / 60000);
        pendingAction = 'Alta sinalizada';
      }
      // Alta efetivada -> precisa iniciar higienização
      else if (bed.state === 'Alta Efetivada' && bed.alta_efetivada_at) {
        const efetivadaTime = new Date(bed.alta_efetivada_at).getTime();
        waitTime = Math.floor((now - efetivadaTime) / 60000);
        pendingAction = 'Iniciar higienização';
      }
      // Transferência -> precisa iniciar higienização
      else if (bed.state === 'Transferência' && bed.transfer_inicio_at) {
        const transferTime = new Date(bed.transfer_inicio_at).getTime();
        waitTime = Math.floor((now - transferTime) / 60000);
        pendingAction = 'Iniciar higienização';
      }
      // Higienização -> precisa finalizar
      else if (bed.state === 'Higienização' && bed.higienizacao_inicio_at) {
        const higienizacaoTime = new Date(bed.higienizacao_inicio_at).getTime();
        waitTime = Math.floor((now - higienizacaoTime) / 60000);
        pendingAction = 'Finalizar higienização';
      }
      // Reservado sem entrada confirmada
      else if (bed.state === 'Reservado' && bed.reservation) {
        const reservaTime = new Date(bed.reservation.created_at).getTime();
        waitTime = Math.floor((now - reservaTime) / 60000);
        pendingAction = 'Reservado sem entrada';
      }

      if (pendingAction && groups[pendingAction]) {
        groups[pendingAction].push({ bed, pendingAction, waitTime });
      }
    });

    // Ordenar por tempo de espera (mais antigo primeiro)
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => b.waitTime - a.waitTime);
    });

    return groups;
  }, [beds]);

  const totalPending = useMemo(() => {
    return Object.values(pending).reduce((sum, items) => sum + items.length, 0);
  }, [pending]);

  return { pending, totalPending };
}

