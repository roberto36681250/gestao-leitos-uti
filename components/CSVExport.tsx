'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { BedWithReservation } from '@/lib/types';

interface CSVExportProps {
  beds: BedWithReservation[];
}

export function CSVExport({ beds }: CSVExportProps) {
  const handleExport = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filtrar leitos com movimentos hoje
    const movements = beds
      .filter((bed) => {
        const updated = new Date(bed.updated_at);
        return updated >= today;
      })
      .map((bed) => {
        return {
          leito: bed.number,
          estado: bed.state,
          alta_sinalizada_at: bed.alta_sinalizada_at || '',
          alta_efetivada_at: bed.alta_efetivada_at || '',
          transfer_inicio_at: bed.transfer_inicio_at || '',
          higienizacao_inicio_at: bed.higienizacao_inicio_at || '',
          higienizacao_fim_at: bed.higienizacao_fim_at || '',
          updated_at: bed.updated_at,
        };
      });

    // Criar CSV
    const headers = [
      'Leito',
      'Estado',
      'Alta Sinalizada',
      'Alta Efetivada',
      'Transferência Início',
      'Higienização Início',
      'Higienização Fim',
      'Atualizado em',
    ];

    const rows = movements.map((m) => [
      m.leito,
      m.estado,
      m.alta_sinalizada_at,
      m.alta_efetivada_at,
      m.transfer_inicio_at,
      m.higienizacao_inicio_at,
      m.higienizacao_fim_at,
      m.updated_at,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `movimentos_${today.toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="h-9 px-3">
      <Download className="h-4 w-4 mr-1.5" />
      CSV do dia
    </Button>
  );
}

