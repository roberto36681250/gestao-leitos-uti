'use client';

import type { BedWithReservation } from '@/lib/types';
import { useMemo } from 'react';

interface FooterMetricsProps {
  beds: BedWithReservation[];
}

export function FooterMetrics({ beds }: FooterMetricsProps) {
  const metrics = useMemo(() => {
    // Tempo médio alta até saída (Alta Sinalizada → Alta Efetivada)
    const altasCompletas = beds.filter(
      (b) => b.alta_sinalizada_at && b.alta_efetivada_at
    );
    let tempoMedioAlta = 0;
    if (altasCompletas.length > 0) {
      const tempos = altasCompletas.map((bed) => {
        const inicio = new Date(bed.alta_sinalizada_at!).getTime();
        const fim = new Date(bed.alta_efetivada_at!).getTime();
        return (fim - inicio) / (1000 * 60); // minutos
      });
      tempoMedioAlta = Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length);
    }

    // Tempo médio saída até liberação (Alta Efetivada → Vago)
    const liberacoes = beds.filter(
      (b) => b.alta_efetivada_at && b.higienizacao_fim_at
    );
    let tempoMedioLiberacao = 0;
    if (liberacoes.length > 0) {
      const tempos = liberacoes.map((bed) => {
        const inicio = new Date(bed.alta_efetivada_at!).getTime();
        const fim = new Date(bed.higienizacao_fim_at!).getTime();
        return (fim - inicio) / (1000 * 60); // minutos
      });
      tempoMedioLiberacao = Math.round(
        tempos.reduce((a, b) => a + b, 0) / tempos.length
      );
    }

    // Total de entradas do dia (leitos que ficaram Ocupados hoje)
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const entradasHoje = beds.filter((bed) => {
      if (!bed.updated_at) return false;
      const updated = new Date(bed.updated_at);
      return updated >= hoje && bed.state === 'Ocupado';
    }).length;

    return {
      tempoMedioAlta: tempoMedioAlta > 0 ? `${tempoMedioAlta} min` : 'N/A',
      tempoMedioLiberacao:
        tempoMedioLiberacao > 0 ? `${tempoMedioLiberacao} min` : 'N/A',
      entradasHoje,
    };
  }, [beds]);

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-500 mb-1">Tempo médio alta</div>
            <div className="text-lg font-bold text-gray-900">{metrics.tempoMedioAlta}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Tempo médio liberação</div>
            <div className="text-lg font-bold text-gray-900">{metrics.tempoMedioLiberacao}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Entradas hoje</div>
            <div className="text-lg font-bold text-gray-900">{metrics.entradasHoje}</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

