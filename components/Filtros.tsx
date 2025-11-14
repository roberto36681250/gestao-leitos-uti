'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { FiltrosState, BedState, Sexo, Plano, Isolamento } from '@/lib/types';

interface FiltrosProps {
  filtros: FiltrosState;
  onFiltrosChange: (filtros: FiltrosState) => void;
}

const estados: (BedState | 'Todos')[] = [
  'Todos',
  'Vago',
  'Higienização',
  'Ocupado',
  'Alta Sinalizada',
  'Reservado',
  'Interdição',
  'Transferência',
  'Alta Efetivada',
  'Alta Cancelada',
];

export function Filtros({ filtros, onFiltrosChange }: FiltrosProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-4">Filtros</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="grid gap-2">
          <Label>Estado</Label>
          <Select
            value={filtros.estado}
            onValueChange={(v) =>
              onFiltrosChange({ ...filtros, estado: v as BedState | 'Todos' })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {estados.map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Sexo</Label>
          <Select
            value={filtros.sexo || 'Todos'}
            onValueChange={(v) => onFiltrosChange({ ...filtros, sexo: v as Sexo | 'Todos' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="M">Masculino</SelectItem>
              <SelectItem value="F">Feminino</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Plano</Label>
          <Select
            value={filtros.plano || 'Todos'}
            onValueChange={(v) =>
              onFiltrosChange({ ...filtros, plano: v as Plano | 'Todos' })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="SUS">SUS</SelectItem>
              <SelectItem value="Particular">Particular</SelectItem>
              <SelectItem value="Convênio">Convênio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Isolamento</Label>
          <Select
            value={filtros.isolamento || 'Todos'}
            onValueChange={(v) =>
              onFiltrosChange({ ...filtros, isolamento: v as Isolamento | 'Todos' })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Texto">Texto</SelectItem>
              <SelectItem value="Vigilância">Vigilância</SelectItem>
              <SelectItem value="Contato">Contato</SelectItem>
              <SelectItem value="Respiratório">Respiratório</SelectItem>
              <SelectItem value="Gotículas">Gotículas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

