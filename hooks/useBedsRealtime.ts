'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { BedWithReservation } from '@/lib/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useBedsRealtime() {
  const [beds, setBeds] = useState<BedWithReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | undefined>(undefined);
  const [lastEventTime, setLastEventTime] = useState<number | undefined>(undefined);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const fetchBeds = useCallback(async () => {
    if (!supabase) {
      setError('Supabase client não inicializado');
      setLoading(false);
      setLastEventTime(Date.now()); // Atualizar mesmo sem Supabase
      return;
    }

    try {
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
        const bedWithReservation = {
          ...bed,
          reservation: reservation || undefined,
        };
        
        // Logs de debug removidos - sistema funcionando corretamente
        
        return bedWithReservation;
      });

      setBeds(bedsWithReservations);
      // Atualizar lastEventTime após busca bem-sucedida (indicando conexão ativa)
      setLastEventTime(Date.now());
    } catch (err) {
      // Tratamento mais robusto de erros
      let errorMessage = 'Erro desconhecido';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object') {
        // Tentar extrair mensagem de erro do Supabase
        const supabaseError = err as any;
        errorMessage = supabaseError?.message || 
                      supabaseError?.error?.message || 
                      supabaseError?.details || 
                      JSON.stringify(err);
      }
      
      console.error('Erro ao buscar leitos:', {
        error: err,
        message: errorMessage,
        type: typeof err,
      });
      
      setError(errorMessage);
      // Mesmo em erro, atualizar lastEventTime para indicar que tentou se conectar
      setLastEventTime(Date.now());
    } finally {
      setLoading(false);
    }
  }, []);

  // Função com debounce para atualizar leitos
  const debouncedFetch = useCallback(() => {
    const eventTime = Date.now();
    setLastEventTime(eventTime);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(async () => {
      const startTime = Date.now();
      await fetchBeds();
      const endTime = Date.now();
      const calculatedLatency = endTime - startTime;
      setLatency(calculatedLatency);
    }, 500); // Debounce de 500ms (aumentado de 200ms para reduzir conflitos)
  }, [fetchBeds]);

  useEffect(() => {
    if (!supabase) {
      setError('Supabase client não inicializado');
      setLoading(false);
      return;
    }

    // Buscar inicial e definir lastEventTime
    setLastEventTime(Date.now());
    fetchBeds().finally(() => {
      // Após buscar inicialmente (sucesso ou erro), atualizar lastEventTime
      setLastEventTime(Date.now());
    });

    // Configurar Realtime com debounce
    try {
      const channel = supabase
        .channel('beds-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'beds',
          },
          () => {
            debouncedFetch();
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
            debouncedFetch();
          }
        )
        .subscribe();

      channelRef.current = channel;
    } catch (err) {
      console.error('Erro ao configurar Realtime:', err);
    }

    // Polling de backup a cada 30s (aumentado de 15s para reduzir conflitos)
    // Também atualiza lastEventTime para indicar que a conexão está ativa
    const pollingInterval = setInterval(() => {
      setLastEventTime(Date.now()); // Atualizar lastEventTime mesmo sem eventos
      fetchBeds();
    }, 30000);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      clearInterval(pollingInterval);
    };
  }, [fetchBeds, debouncedFetch]);

  return { 
    beds, 
    loading, 
    error, 
    refetch: fetchBeds,
    latency,
    lastEventTime,
  };
}
