'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { BedWithReservation } from '@/lib/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useBeds() {
  const [beds, setBeds] = useState<BedWithReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setError('Supabase client não inicializado. Verifique as variáveis de ambiente.');
      setLoading(false);
      return;
    }

    fetchBeds();

    // Subscrição Realtime
    let channel: RealtimeChannel | null = null;
    
    try {
      channel = supabase
        .channel('beds-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'beds',
          },
          () => {
            fetchBeds();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'reservations',
          },
          () => {
            fetchBeds();
          }
        )
        .subscribe();
    } catch (err) {
      console.error('Erro ao configurar Realtime:', err);
    }

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const fetchBeds = async () => {
    if (!supabase) {
      setError('Supabase client não inicializado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar leitos
      const { data: bedsData, error: bedsError } = await supabase
        .from('beds')
        .select('*')
        .order('number', { ascending: true });

      if (bedsError) throw bedsError;

      // Buscar reservas ativas
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select('*')
        .eq('is_active', true);

      if (reservationsError) throw reservationsError;

      // Combinar leitos com reservas
      const bedsWithReservations: BedWithReservation[] = (bedsData || []).map((bed) => {
        const reservation = (reservationsData || []).find((r) => r.bed_id === bed.id);
        return {
          ...bed,
          reservation: reservation || undefined,
        };
      });

      setBeds(bedsWithReservations);
    } catch (err) {
      console.error('Erro ao buscar leitos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return { beds, loading, error, refetch: fetchBeds };
}

