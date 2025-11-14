'use client';

import { useState } from 'react';
import type { BedWithReservation } from '@/lib/types';
import { bedStateColors, bedStateBorderColors } from '@/lib/bedColors';
import { Button } from '@/components/ui/button';
import { DialogMotivo } from './DialogMotivo';
import { DialogReserva } from './DialogReserva';
import { DialogEditar } from './DialogEditar';
import { useActions } from '@/hooks/useActions';
import { cn } from '@/lib/utils';

interface CardLeitoProps {
  bed: BedWithReservation;
}

export function CardLeito({ bed }: CardLeitoProps) {
  const [showMotivoDialog, setShowMotivoDialog] = useState(false);
  const [showReservaDialog, setShowReservaDialog] = useState(false);
  const [showEditarDialog, setShowEditarDialog] = useState(false);
  const actions = useActions();

  const handleAltaSinalizada = () => {
    actions.altaSinalizada(bed.id);
  };

  const handleAltaEfetivada = () => {
    actions.altaEfetivada(bed.id);
  };

  const handleCancelarAlta = (motivo: string) => {
    actions.cancelarAlta(bed.id, motivo);
    setShowMotivoDialog(false);
  };

  const handleTransferencia = () => {
    actions.iniciarTransferencia(bed.id);
  };

  const handleIniciarHigienizacao = () => {
    actions.iniciarHigienizacao(bed.id);
  };

  const handleFinalizarHigienizacao = () => {
    actions.finalizarHigienizacao(bed.id);
  };

  const handleReservar = (data: {
    iniciais: string;
    sexo: 'M' | 'F' | null;
    matricula: string;
    origem: string;
  }) => {
    actions.criarReserva(bed.id, data);
    setShowReservaDialog(false);
  };

  const handleLiberar = () => {
    if (bed.reservation) {
      actions.liberarReserva(bed.reservation.id, bed.id);
    }
  };

  const handleEntradaConfirmada = () => {
    actions.entradaConfirmada(bed.id);
  };

  const handleInterditar = () => {
    actions.interditar(bed.id);
  };

  const handleEditar = (data: {
    sexo: 'M' | 'F' | null;
    plano: 'SUS' | 'Particular' | 'Convênio' | null;
    isolamento: string[];
    hd: boolean;
    observacao: string;
  }) => {
    actions.editarLeito(bed.id, data);
    setShowEditarDialog(false);
  };

  const colorClass = bedStateColors[bed.state];
  const borderClass = bedStateBorderColors[bed.state];

  return (
    <>
      <div
        className={cn(
          'rounded-lg border-2 p-4 shadow-md transition-all hover:shadow-lg',
          borderClass
        )}
      >
        <div className={cn('rounded-md px-3 py-2 mb-3 text-center font-bold', colorClass)}>
          Leito {bed.number} - {bed.state}
        </div>

        <div className="space-y-1 text-sm mb-3">
          {bed.sexo && <div>Sexo: {bed.sexo}</div>}
          {bed.plano && <div>Plano: {bed.plano}</div>}
          {bed.isolamento.length > 0 && (
            <div>Isolamento: {bed.isolamento.join(', ')}</div>
          )}
          {bed.hd && <div className="font-semibold text-red-600">HD</div>}
          {bed.observacao && (
            <div className="text-xs text-gray-600">Obs: {bed.observacao}</div>
          )}
          {bed.reservation && (
            <div className="bg-purple-100 p-2 rounded mt-2">
              <div className="font-semibold">Reserva: {bed.reservation.iniciais}</div>
              <div className="text-xs">Mat: {bed.reservation.matricula}</div>
              <div className="text-xs">Origem: {bed.reservation.origem}</div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {bed.state === 'Ocupado' && (
            <>
              <Button size="sm" variant="outline" onClick={handleAltaSinalizada}>
                Alta Sinalizada
              </Button>
              <Button size="sm" variant="outline" onClick={handleTransferencia}>
                Transferência
              </Button>
            </>
          )}

          {bed.state === 'Alta Sinalizada' && (
            <>
              <Button size="sm" variant="default" onClick={handleAltaEfetivada}>
                Alta Efetivada
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowMotivoDialog(true)}
              >
                Cancelar Alta
              </Button>
            </>
          )}

          {bed.state === 'Alta Efetivada' && (
            <Button size="sm" variant="outline" onClick={handleIniciarHigienizacao}>
              Iniciar Higienização
            </Button>
          )}

          {bed.state === 'Higienização' && (
            <Button size="sm" variant="default" onClick={handleFinalizarHigienizacao}>
              Finalizar Higienização
            </Button>
          )}

          {bed.state === 'Vago' && (
            <>
              <Button size="sm" variant="default" onClick={() => setShowReservaDialog(true)}>
                Reservar
              </Button>
              <Button size="sm" variant="outline" onClick={handleEntradaConfirmada}>
                Entrada Confirmada
              </Button>
              <Button size="sm" variant="destructive" onClick={handleInterditar}>
                Interditar
              </Button>
            </>
          )}

          {bed.state === 'Reservado' && (
            <>
              <Button size="sm" variant="outline" onClick={handleLiberar}>
                Liberar
              </Button>
              <Button size="sm" variant="default" onClick={handleEntradaConfirmada}>
                Entrada Confirmada
              </Button>
            </>
          )}

          {bed.state === 'Interdição' && (
            <Button size="sm" variant="outline" onClick={handleLiberar}>
              Liberar
            </Button>
          )}

          {bed.state === 'Transferência' && (
            <Button size="sm" variant="outline" onClick={handleIniciarHigienizacao}>
              Iniciar Higienização
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowEditarDialog(true)}
            className="ml-auto"
          >
            Editar
          </Button>
        </div>
      </div>

      <DialogMotivo
        open={showMotivoDialog}
        onOpenChange={setShowMotivoDialog}
        onConfirm={handleCancelarAlta}
      />

      <DialogReserva
        open={showReservaDialog}
        onOpenChange={setShowReservaDialog}
        onConfirm={handleReservar}
      />

      <DialogEditar
        open={showEditarDialog}
        onOpenChange={setShowEditarDialog}
        bed={bed}
        onConfirm={handleEditar}
      />
    </>
  );
}

