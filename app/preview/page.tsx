'use client';

import { BedCard } from '@/components/BedCard';
import type { BedWithReservation, BedState } from '@/lib/types';

const mockBeds: BedWithReservation[] = [
  {
    id: '1',
    number: 21,
    state: 'Vago',
    sexo: null,
    plano: null,
    isolamento: [],
    hd: false,
    observacao: null,
    alta_sinalizada_at: null,
    alta_efetivada_at: null,
    alta_cancelada_at: null,
    transfer_inicio_at: null,
    higienizacao_inicio_at: null,
    higienizacao_fim_at: new Date().toISOString(),
    vago_since: new Date().toISOString(),
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    number: 22,
    state: 'Higienização',
    sexo: null,
    plano: null,
    isolamento: [],
    hd: false,
    observacao: null,
    alta_sinalizada_at: null,
    alta_efetivada_at: null,
    alta_cancelada_at: null,
    transfer_inicio_at: null,
    higienizacao_inicio_at: new Date().toISOString(),
    higienizacao_fim_at: null,
    vago_since: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    number: 23,
    state: 'Ocupado',
    sexo: 'M',
    plano: 'SUS',
    isolamento: ['Contato', 'Respiratório'],
    hd: true,
    observacao: 'Paciente com febre',
    alta_sinalizada_at: null,
    alta_efetivada_at: null,
    alta_cancelada_at: null,
    transfer_inicio_at: null,
    higienizacao_inicio_at: null,
    higienizacao_fim_at: null,
    vago_since: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    number: 24,
    state: 'Alta Sinalizada',
    sexo: 'F',
    plano: 'Particular',
    isolamento: [],
    hd: false,
    observacao: null,
    alta_sinalizada_at: new Date().toISOString(),
    alta_efetivada_at: null,
    alta_cancelada_at: null,
    transfer_inicio_at: null,
    higienizacao_inicio_at: null,
    higienizacao_fim_at: null,
    vago_since: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    number: 25,
    state: 'Reservado',
    sexo: 'M',
    plano: 'SUS',
    isolamento: [],
    hd: false,
    observacao: null,
    alta_sinalizada_at: null,
    alta_efetivada_at: null,
    alta_cancelada_at: null,
    transfer_inicio_at: null,
    higienizacao_inicio_at: null,
    higienizacao_fim_at: null,
    vago_since: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    reservation: {
      id: 'r1',
      bed_id: '5',
      iniciais: 'J.S.',
      sexo: 'M',
      matricula: '123456',
      origem: 'Emergência',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  },
  {
    id: '6',
    number: 26,
    state: 'Interdição',
    sexo: null,
    plano: null,
    isolamento: [],
    hd: false,
    observacao: 'Manutenção',
    alta_sinalizada_at: null,
    alta_efetivada_at: null,
    alta_cancelada_at: null,
    transfer_inicio_at: null,
    higienizacao_inicio_at: null,
    higienizacao_fim_at: null,
    vago_since: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    number: 27,
    state: 'Transferência',
    sexo: 'F',
    plano: 'Convênio',
    isolamento: ['Vigilância'],
    hd: false,
    observacao: null,
    alta_sinalizada_at: null,
    alta_efetivada_at: null,
    alta_cancelada_at: null,
    transfer_inicio_at: new Date().toISOString(),
    higienizacao_inicio_at: null,
    higienizacao_fim_at: null,
    vago_since: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '8',
    number: 28,
    state: 'Alta Efetivada',
    sexo: 'M',
    plano: 'SUS',
    isolamento: [],
    hd: false,
    observacao: null,
    alta_sinalizada_at: new Date(Date.now() - 3600000).toISOString(),
    alta_efetivada_at: new Date().toISOString(),
    alta_cancelada_at: null,
    transfer_inicio_at: null,
    higienizacao_inicio_at: null,
    higienizacao_fim_at: null,
    vago_since: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '9',
    number: 29,
    state: 'Alta Cancelada',
    sexo: 'F',
    plano: 'Particular',
    isolamento: ['Gotículas'],
    hd: true,
    observacao: 'Hipotensão',
    alta_sinalizada_at: new Date(Date.now() - 1800000).toISOString(),
    alta_efetivada_at: null,
    alta_cancelada_at: new Date().toISOString(),
    transfer_inicio_at: null,
    higienizacao_inicio_at: null,
    higienizacao_fim_at: null,
    vago_since: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Preview - Cards de Leitos</h1>
          <p className="text-gray-600">9 cards, um por estado</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {mockBeds.map((bed) => (
            <BedCard key={bed.id} bed={bed} />
          ))}
        </div>

        <div className="mt-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Legenda de Cores</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              <span>Vago</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-600 rounded"></div>
              <span>Higienização</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-zinc-600 rounded"></div>
              <span>Ocupado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span>Alta Sinalizada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-600 rounded"></div>
              <span>Reservado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span>Interdição</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-600 rounded"></div>
              <span>Transferência</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-700 rounded"></div>
              <span>Alta Efetivada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-rose-700 rounded"></div>
              <span>Alta Cancelada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
