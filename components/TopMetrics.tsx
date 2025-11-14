'use client';

import type { BedWithReservation, BedState } from '@/lib/types';
import { mapStateToColor } from '@/lib/state';
import { cn } from '@/lib/utils';

interface TopMetricsProps {
  beds: BedWithReservation[];
  onStateClick?: (state: BedState) => void;
}

export function TopMetrics({ beds, onStateClick }: TopMetricsProps) {
  const metrics = {
    vago: beds.filter((b) => b.state === 'Vago').length,
    ocupado: beds.filter((b) => b.state === 'Ocupado').length,
    higienizacao: beds.filter((b) => b.state === 'Higienização').length,
    altaSinalizada: beds.filter((b) => b.state === 'Alta Sinalizada').length,
    reservado: beds.filter((b) => b.state === 'Reservado').length,
    previsaoAlta24h: beds.filter((b) => b.state === 'Previsão de Alta em 24h').length,
    bloqueado: beds.filter((b) => b.state === 'Bloqueado').length,
  };

  const handleClick = (state: BedState) => {
    onStateClick?.(state);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 w-full">
      {/* 1. Ocupados */}
      <div
        className={cn(
          'rounded-lg p-3 text-white shadow-lg cursor-pointer hover:opacity-90 hover:scale-[1.02] transition-all',
          'h-[80px] flex flex-col justify-center items-center',
          mapStateToColor('Ocupado').bg
        )}
        onClick={() => handleClick('Ocupado')}
        role="button"
        tabIndex={0}
        aria-label={`Filtrar por Ocupados: ${metrics.ocupado} leitos`}
      >
        <div className="text-4xl font-black mb-1 leading-none">{metrics.ocupado}</div>
        <div className="text-xs font-semibold opacity-90 text-center leading-tight">Ocupados</div>
      </div>

      {/* 2. Alta Sinalizada */}
      <div
        className={cn(
          'rounded-lg p-3 text-white shadow-lg cursor-pointer hover:opacity-90 hover:scale-[1.02] transition-all',
          'h-[80px] flex flex-col justify-center items-center',
          mapStateToColor('Alta Sinalizada').bg
        )}
        onClick={() => handleClick('Alta Sinalizada')}
        role="button"
        tabIndex={0}
        aria-label={`Filtrar por Alta Sinalizada: ${metrics.altaSinalizada} leitos`}
      >
        <div className="text-4xl font-black mb-1 leading-none">{metrics.altaSinalizada}</div>
        <div className="text-xs font-semibold opacity-90 text-center leading-tight">Alta Sinalizada</div>
      </div>

      {/* 3. Vagos */}
      <div
        className={cn(
          'rounded-lg p-3 text-white shadow-lg cursor-pointer hover:opacity-90 hover:scale-[1.02] transition-all',
          'h-[80px] flex flex-col justify-center items-center',
          mapStateToColor('Vago').bg
        )}
        onClick={() => handleClick('Vago')}
        role="button"
        tabIndex={0}
        aria-label={`Filtrar por Vagos: ${metrics.vago} leitos`}
      >
        <div className="text-4xl font-black mb-1 leading-none">{metrics.vago}</div>
        <div className="text-xs font-semibold opacity-90 text-center leading-tight">Vagos</div>
      </div>

      {/* 4. Reservados */}
      <div
        className={cn(
          'rounded-lg p-3 text-white shadow-lg cursor-pointer hover:opacity-90 hover:scale-[1.02] transition-all',
          'h-[80px] flex flex-col justify-center items-center',
          mapStateToColor('Reservado').bg
        )}
        onClick={() => handleClick('Reservado')}
        role="button"
        tabIndex={0}
        aria-label={`Filtrar por Reservados: ${metrics.reservado} leitos`}
      >
        <div className="text-4xl font-black mb-1 leading-none">{metrics.reservado}</div>
        <div className="text-xs font-semibold opacity-90 text-center leading-tight">Reservados</div>
      </div>

      {/* 5. Higienização */}
      <div
        className={cn(
          'rounded-lg p-3 text-white shadow-lg cursor-pointer hover:opacity-90 hover:scale-[1.02] transition-all',
          'h-[80px] flex flex-col justify-center items-center',
          mapStateToColor('Higienização').bg
        )}
        onClick={() => handleClick('Higienização')}
        role="button"
        tabIndex={0}
        aria-label={`Filtrar por Higienização: ${metrics.higienizacao} leitos`}
      >
        <div className="text-4xl font-black mb-1 leading-none">{metrics.higienizacao}</div>
        <div className="text-xs font-semibold opacity-90 text-center leading-tight">Higienização</div>
      </div>

      {/* 6. Previsão de Alta em 24h */}
      <div
        className={cn(
          'rounded-lg p-3 text-white shadow-lg cursor-pointer hover:opacity-90 hover:scale-[1.02] transition-all',
          'h-[80px] flex flex-col justify-center items-center',
          mapStateToColor('Previsão de Alta em 24h').bg
        )}
        onClick={() => handleClick('Previsão de Alta em 24h')}
        role="button"
        tabIndex={0}
        aria-label={`Filtrar por Previsão de Alta em 24h: ${metrics.previsaoAlta24h} leitos`}
      >
        <div className="text-4xl font-black mb-1 leading-none">{metrics.previsaoAlta24h}</div>
        <div className="text-xs font-semibold opacity-90 text-center leading-tight">Alta em 24h</div>
      </div>

      {/* 7. Bloqueados */}
      <div
        className={cn(
          'rounded-lg p-3 text-white shadow-lg cursor-pointer hover:opacity-90 hover:scale-[1.02] transition-all',
          'h-[80px] flex flex-col justify-center items-center',
          mapStateToColor('Bloqueado').bg
        )}
        onClick={() => handleClick('Bloqueado')}
        role="button"
        tabIndex={0}
        aria-label={`Filtrar por Bloqueados: ${metrics.bloqueado} leitos`}
      >
        <div className="text-4xl font-black mb-1 leading-none">{metrics.bloqueado}</div>
        <div className="text-xs font-semibold opacity-90 text-center leading-tight">Bloqueados</div>
      </div>
    </div>
  );
}

