'use client';

import type { BedWithReservation } from '@/lib/types';

interface BarraMetricaProps {
  beds: BedWithReservation[];
}

export function BarraMetrica({ beds }: BarraMetricaProps) {
  const metricas = {
    vago: beds.filter((b) => b.state === 'Vago').length,
    ocupado: beds.filter((b) => b.state === 'Ocupado').length,
    higienizacao: beds.filter((b) => b.state === 'Higienização').length,
    altaSinalizada: beds.filter((b) => b.state === 'Alta Sinalizada').length,
    reservado: beds.filter((b) => b.state === 'Reservado').length,
    interdicao: beds.filter((b) => b.state === 'Interdição').length,
    transferencia: beds.filter((b) => b.state === 'Transferência').length,
    altaEfetivada: beds.filter((b) => b.state === 'Alta Efetivada').length,
    altaCancelada: beds.filter((b) => b.state === 'Alta Cancelada').length,
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-4">Métricas</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{metricas.vago}</div>
          <div className="text-sm text-gray-600">Vagos</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-600">{metricas.ocupado}</div>
          <div className="text-sm text-gray-600">Ocupados</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-600">{metricas.higienizacao}</div>
          <div className="text-sm text-gray-600">Higienização</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{metricas.altaSinalizada}</div>
          <div className="text-sm text-gray-600">Alta Sinalizada</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">{metricas.reservado}</div>
          <div className="text-sm text-gray-600">Reservados</div>
        </div>
      </div>
    </div>
  );
}

