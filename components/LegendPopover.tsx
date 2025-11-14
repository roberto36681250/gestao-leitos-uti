'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { mapStateToColor } from '@/lib/state';
import type { BedState } from '@/lib/types';
import { cn } from '@/lib/utils';

const estados: BedState[] = [
  'Ocupado',
  'Vago',
  'Higienização',
  'Alta Sinalizada',
  'Reservado',
  'Interdição',
  'Transferência',
  'Alta Efetivada',
  'Alta Cancelada',
];

export function LegendPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-3" aria-label="Legenda">
          <HelpCircle className="h-4 w-4" />
          <span className="ml-2 text-xs">?</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-2">Estados</h3>
            <div className="space-y-1.5">
              {estados.map((state) => {
                const colors = mapStateToColor(state);
                return (
                  <div key={state} className="flex items-center gap-2 text-xs">
                    <div className={cn('w-3 h-3 rounded', colors.bg)} />
                    <span>{state}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Símbolos</h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span>🛡️ ISOL</span>
                <span className="text-gray-600">Isolamento</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💧 HD</span>
                <span className="text-gray-600">Hemodiálise</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-zinc-200 text-zinc-700 rounded text-[10px]">APT</span>
                <span className="text-gray-600">Plano</span>
              </div>
              <div className="flex items-center gap-2">
                <span>♂︎ / ♀︎</span>
                <span className="text-gray-600">Sexo</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Atalhos</h3>
            <div className="space-y-1 text-xs font-mono">
              <div>A - Alta sinalizada</div>
              <div>E - Alta efetivada</div>
              <div>C - Cancelar alta</div>
              <div>T - Transferência</div>
              <div>H - Iniciar higienização</div>
              <div>F - Finalizar higienização</div>
              <div>R - Reservar</div>
              <div>L - Liberar</div>
              <div>I - Interditar</div>
              <div>Enter - Ação padrão</div>
              <div>Shift+R - Recarregar leito</div>
              <div>B - Copiar boletim</div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

