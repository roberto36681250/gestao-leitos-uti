'use client';

import { useState, useMemo } from 'react';
import { useBedsRealtime } from '@/hooks/useBedsRealtime';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { BedCard } from '@/components/BedCard';
import { ViewToggle } from '@/components/ViewToggle';
import { HIGIENE_WIP } from '@/lib/constants';
import { canTransitionTo, getActionForTransition } from '@/lib/stateRules';
import { useActions } from '@/hooks/useActions';
import type { BedState, BedWithReservation } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

const STATES: BedState[] = [
  'Ocupado',
  'Alta Sinalizada',
  'Alta Efetivada',
  'Transferência',
  'Higienização',
  'Vago',
  'Reservado',
  'Interdição',
];

export default function LanesPage() {
  const { beds, loading, error, latency, lastEventTime, refetch } = useBedsRealtime();
  const actions = useActions();
  const [draggedBed, setDraggedBed] = useState<{ id: string; state: BedState } | null>(null);
  const [dragOverState, setDragOverState] = useState<BedState | null>(null);

  const bedsByState = useMemo(() => {
    const grouped: Record<BedState, BedWithReservation[]> = {
      'Ocupado': [],
      'Alta Sinalizada': [],
      'Alta Efetivada': [],
      'Transferência': [],
      'Higienização': [],
      'Vago': [],
      'Reservado': [],
      'Interdição': [],
      'Alta Cancelada': [],
    };

    beds.forEach((bed) => {
      if (grouped[bed.state]) {
        grouped[bed.state].push(bed);
      }
    });

    return grouped;
  }, [beds]);

  const handleDragStart = (bed: BedWithReservation) => {
    setDraggedBed({ id: bed.id, state: bed.state });
  };

  const handleDragEnd = () => {
    setDraggedBed(null);
    setDragOverState(null);
  };

  const handleDragOver = (state: BedState, e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedBed) return;

    const canDrop = canTransitionTo(draggedBed.state, state);
    if (canDrop) {
      e.dataTransfer.dropEffect = 'move';
      setDragOverState(state);
    } else {
      e.dataTransfer.dropEffect = 'none';
      setDragOverState(null);
    }
  };

  const handleDrop = async (targetState: BedState) => {
    if (!draggedBed) return;

    const canDrop = canTransitionTo(draggedBed.state, targetState);
    if (!canDrop) {
      toast({
        title: 'Transição inválida',
        description: `Não é possível mover de ${draggedBed.state} para ${targetState}`,
        variant: 'destructive',
      });
      setDraggedBed(null);
      setDragOverState(null);
      return;
    }

    const action = getActionForTransition(draggedBed.state, targetState);
    if (!action) {
      setDraggedBed(null);
      setDragOverState(null);
      return;
    }

    const bed = beds.find((b) => b.id === draggedBed.id);
    if (!bed) {
      setDraggedBed(null);
      setDragOverState(null);
      return;
    }

    // Executar ação
    try {
      let result;
      switch (action) {
        case 'Alta Sinalizada':
          result = await actions.altaSinalizada(bed.id, bed.version);
          break;
        case 'Alta Efetivada':
          result = await actions.altaEfetivada(bed.id, bed.version);
          break;
        case 'Iniciar Higienização':
          result = await actions.iniciarHigienizacao(bed.id, bed.version);
          break;
        case 'Finalizar Higienização':
          result = await actions.finalizarHigienizacao(bed.id, bed.version);
          break;
        case 'Transferência':
          result = await actions.iniciarTransferencia(bed.id, bed.version);
          break;
        case 'Entrada Confirmada':
          result = await actions.entradaConfirmada(bed.id, bed.version);
          break;
        case 'Liberar':
          result = await actions.liberarReserva(bed.reservation?.id || '', bed.id, bed.version);
          break;
        default:
          return;
      }

      if (result?.needsRefetch) {
        await refetch();
      } else {
        toast({ title: `Leito ${bed.number}, ${action.toLowerCase()}` });
      }
    } catch (err) {
      toast({
        title: 'Erro ao mover leito',
        description: 'Não foi possível realizar a transição',
        variant: 'destructive',
      });
    }

    setDraggedBed(null);
    setDragOverState(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">Carregando...</div>
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <header>
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Leitos - Lanes</h1>
                <p className="text-gray-600">Sistema em tempo real</p>
              </div>
              <ConnectionStatus latency={latency} lastEventTime={lastEventTime} />
            </div>
          </header>
          <ViewToggle />
        </div>

        {/* Lanes */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATES.map((state) => {
            const stateBeds = bedsByState[state] || [];
            const isHigienizacao = state === 'Higienização';
            const wipCount = stateBeds.length;
            const exceedsWip = isHigienizacao && wipCount > HIGIENE_WIP;

            return (
              <div
                key={state}
                className={cn(
                  'flex-shrink-0 w-80 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col transition-all',
                  exceedsWip && 'border-t-4 border-t-black',
                  dragOverState === state && canTransitionTo(draggedBed?.state || 'Ocupado', state) && 'ring-2 ring-blue-500 bg-blue-50'
                )}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(state);
                }}
                onDragOver={(e) => handleDragOver(state, e)}
                onDragLeave={() => setDragOverState(null)}
              >
                {/* Header da lane */}
                <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-gray-900">{state}</h3>
                    {isHigienizacao && (
                      <span className="text-xs text-gray-600">
                        {wipCount}/{HIGIENE_WIP}
                      </span>
                    )}
                  </div>
                  {exceedsWip && (
                    <div className="mt-1 text-xs text-red-600 font-medium">
                      Meta excedida
                    </div>
                  )}
                </div>

                {/* Cards */}
                <div className="flex-1 p-3 space-y-2 min-h-[400px] overflow-y-auto">
                  {stateBeds.map((bed) => (
                    <div
                      key={bed.id}
                      draggable
                      onDragStart={() => handleDragStart(bed)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        'cursor-move',
                        draggedBed?.id === bed.id && 'opacity-50'
                      )}
                    >
                      <BedCard bed={bed} onAction={() => {}} />
                    </div>
                  ))}
                  {stateBeds.length === 0 && (
                    <div className="text-center text-sm text-gray-400 py-8">
                      Nenhum leito
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

