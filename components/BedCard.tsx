'use client';

import { useState, useEffect, useRef } from 'react';
import type { BedWithReservation } from '@/lib/types';
import { mapStateToColor, getStateShortName, mapStateToBadge } from '@/lib/state';
import { BedCardModalEdit } from './BedCard.ModalEdit';
import { IsolBadge } from './IsolBadge';
import { AgingBadge } from './AgingBadge';
import { cn } from '@/lib/utils';
import { CRITICAL_STATES } from '@/lib/constants';

interface BedCardProps {
  bed: BedWithReservation;
  onAction?: (action: string, bedId: string, data?: any) => void;
  selected?: boolean;
  onSelect?: (bedId: string) => void;
  focused?: boolean;
}

// Abreviações de isolamento
const isolamentoAbbr: Record<string, string> = {
  Vigilância: 'VIG',
  Contato: 'CONT',
  Respiratório: 'RESP',
  Gotículas: 'GOT',
};

// Mapeamento plano -> APT/ENF
const planoToAptEnf = (plano: string | null): string | null => {
  if (!plano) return null;
  if (plano === 'Apartamento') return 'APT';
  if (plano === 'Enfermaria') return 'ENF';
  return null;
};

export function BedCard({
  bed,
  onAction,
  selected = false,
  onSelect,
  focused = false,
}: BedCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [showInitials, setShowInitials] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const prevUpdatedAtRef = useRef<string>(bed.updated_at);
  const colors = mapStateToColor(bed.state);
  // Não mostrar isolamento, plano, sexo, HD se o leito está vago, higienização ou bloqueado (sem paciente)
  const isVacantState = bed.state === 'Vago' || bed.state === 'Higienização' || bed.state === 'Bloqueado';
  const hasIsolamento = !isVacantState && bed.isolamento.length > 0;
  const planoAptEnf = !isVacantState ? planoToAptEnf(bed.plano) : null;

  const handleClick = (e: React.MouseEvent) => {
    // Abrir modal ao clicar no card
    setShowModal(true);
  };


  // Animar quando recebe atualização realtime
  useEffect(() => {
    if (bed.updated_at !== prevUpdatedAtRef.current) {
      setIsRefreshing(true);
      prevUpdatedAtRef.current = bed.updated_at;
      
      const timer = setTimeout(() => {
        setIsRefreshing(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [bed.updated_at]);

  // Calcula frescor e cor do dot
  const getFreshnessDot = (timestamp: string) => {
    const now = Date.now();
    const updated = new Date(timestamp).getTime();
    const diffMinutes = Math.floor((now - updated) / 60000);
    
    let color: string;
    let ariaLabel: string;
    
    if (diffMinutes <= 2) {
      color = 'bg-emerald-500';
      ariaLabel = `atualizado há ${diffMinutes} min`;
    } else if (diffMinutes <= 10) {
      color = 'bg-amber-500';
      ariaLabel = `atualizado há ${diffMinutes} min`;
    } else {
      color = 'bg-rose-600';
      ariaLabel = `atualizado há ${diffMinutes} min`;
    }
    
    // Formata timestamp para tooltip
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const tooltipText = `Última atualização: ${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    
    return { color, ariaLabel, tooltipText };
  };

  const freshness = getFreshnessDot(bed.updated_at);
  
  // Matrícula: priorizar bed.matricula quando ocupado, senão usar reservation
  // Quando Ocupado, a matrícula deve vir do bed.matricula (paciente atual)
  // Quando Reservado, pode vir da reservation
  let matricula: string | null = null;
  if (bed.state === 'Ocupado' || bed.state === 'Alta Sinalizada' || bed.state === 'Transferência' || bed.state === 'Previsão de Alta em 24h') {
    // Para estados ocupados, usar sempre bed.matricula
    matricula = bed.matricula || null;
  } else if (bed.state === 'Reservado') {
    // Para reservado, pode usar reservation ou bed.matricula
    matricula = bed.matricula || bed.reservation?.matricula || null;
  } else {
    // Para outros estados, não mostrar matrícula
    matricula = null;
  }
  
  // Log de debug removido - matrícula funcionando corretamente

  return (
    <div
        ref={cardRef}
        className={cn(
          'relative rounded-lg border-2 bg-white transition-all duration-200',
          'hover:shadow-xl cursor-pointer overflow-visible',
          colors.border,
          'h-[130px] flex flex-col w-full',
          showModal && 'z-30',
          selected && 'ring-4 ring-blue-500 ring-offset-2',
          isRefreshing && 'animate-pulse'
        )}
        data-state={bed.state}
        onMouseEnter={() => setShowInitials(true)}
        onMouseLeave={() => setShowInitials(false)}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={`Leito ${bed.number}, estado ${bed.state}`}
      >
        {/* Barra superior colorida - 12px */}
        <div className={cn('h-2.5 w-full', colors.bg)} />
        
        {/* Indicador de atualização realtime */}
        {isRefreshing && (
          <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-ping z-30" />
        )}


        {/* Badge de estado (P, A, H, T, I, R) - canto superior esquerdo */}
        {mapStateToBadge(bed.state) && (
          <div className={cn(
            'absolute top-1.5 left-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white z-20',
            bed.state === 'Previsão de Alta em 24h' && 'bg-indigo-600',
            bed.state === 'Alta Sinalizada' && 'bg-blue-600',
            bed.state === 'Higienização' && 'bg-yellow-600',
            bed.state === 'Transferência' && 'bg-orange-600',
            bed.state === 'Bloqueado' && 'bg-zinc-600',
            bed.state === 'Reservado' && 'bg-purple-600'
          )}>
            {mapStateToBadge(bed.state)}
          </div>
        )}

        {/* Aging badge para estados críticos */}
        {CRITICAL_STATES.includes(bed.state as any) && <AgingBadge bed={bed} />}

        {/* Selo ISOL amarelo no canto superior direito */}
        {hasIsolamento && (
          <IsolBadge isolamentos={bed.isolamento} />
        )}

        {/* Conteúdo central */}
        <div className="flex-1 flex flex-col items-center justify-center p-1.5 bg-white overflow-hidden rounded-b-lg">
          {/* Número do leito - central, grande */}
          <div className="text-4xl font-black text-gray-900 mb-0.5 leading-none">{bed.number}</div>
          
          {/* Status do leito - texto delicado */}
          <div className="text-[10px] font-normal text-gray-400 mb-0.5">
            {getStateShortName(bed.state)}
          </div>
          
          {/* Matrícula no centro - se houver */}
          {matricula && (
            <div className="text-[10px] font-semibold text-gray-600 mb-0.5 px-1.5 py-0.5 bg-gray-100 rounded">
              Mat: {matricula}
            </div>
          )}
          
          {/* Iniciais no hover */}
          {showInitials && bed.last_initials && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white text-xs font-semibold px-2 py-1 rounded z-20">
              {bed.last_initials}
            </div>
          )}

          {/* Rodapé com símbolos - apenas se não estiver vago */}
          {!isVacantState && (
            <div className="flex items-center gap-1 mt-auto">
              {/* Sexo - símbolos discretos */}
              {bed.sexo && (
                <div className="text-sm" title={bed.sexo === 'M' ? 'Masculino' : 'Feminino'}>
                  {bed.sexo === 'M' ? '♂︎' : '♀︎'}
                </div>
              )}

              {/* Plano APT/ENF */}
              {planoAptEnf && (
                <div
                  className="px-1 py-0.5 text-[9px] font-semibold bg-zinc-200 text-zinc-700 rounded"
                  title={`Plano: ${bed.plano}`}
                >
                  {planoAptEnf}
                </div>
              )}

              {/* HD vermelho */}
              {bed.hd && (
                <div className="px-1 py-0.5 text-[9px] font-semibold border border-red-500 bg-red-50 text-red-700 rounded flex items-center gap-0.5" title="Hemodiálise">
                  <span>💧</span>
                  <span>HD</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dot de frescor no canto inferior direito */}
        <div
          className={cn('absolute bottom-1 right-1 w-2 h-2 rounded-full', freshness.color)}
          title={freshness.tooltipText}
          aria-label={freshness.ariaLabel}
        />

        {/* Modal de edição */}
        {showModal && (
          <BedCardModalEdit
            bed={bed}
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSave={(data) => {
              onAction?.('Editar Completo', bed.id, data);
              setShowModal(false);
            }}
            onAction={onAction}
          />
        )}
    </div>
  );
}
