'use client';

import { useState } from 'react';
import type { BedWithReservation, BedState, Sexo, Plano, Isolamento, FiltrosState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronDown, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterPillsProps {
  beds: BedWithReservation[];
  filtros: FiltrosState;
  onFiltrosChange: (filtros: FiltrosState) => void;
}

const estados: BedState[] = [
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

const isolamentoOptions: Isolamento[] = ['Vigilância', 'Contato', 'Respiratório', 'Gotículas'];

export function FilterPills({ beds, filtros, onFiltrosChange }: FilterPillsProps) {
  const [openFilters, setOpenFilters] = useState<string[]>([]);

  const counts = {
    estado: filtros.estado !== 'Todos' ? beds.filter((b) => b.state === filtros.estado).length : 0,
    sexo: filtros.sexo !== 'Todos' ? beds.filter((b) => b.sexo === filtros.sexo).length : 0,
    plano: filtros.plano !== 'Todos' ? beds.filter((b) => b.plano === filtros.plano).length : 0,
    isolamento: filtros.isolamento !== 'Todos' ? beds.filter((b) => b.isolamento.includes(filtros.isolamento)).length : 0,
    hd: beds.filter((b) => b.hd).length,
  };

  const activeFilters = [
    filtros.estado !== 'Todos' && { type: 'estado', label: `Estado: ${filtros.estado}`, count: counts.estado },
    filtros.sexo !== 'Todos' && { type: 'sexo', label: `Sexo: ${filtros.sexo === 'M' ? 'Masculino' : 'Feminino'}`, count: counts.sexo },
    filtros.plano !== 'Todos' && { type: 'plano', label: `Plano: ${filtros.plano}`, count: counts.plano },
    filtros.isolamento !== 'Todos' && { type: 'isolamento', label: `Isolamento: ${filtros.isolamento}`, count: counts.isolamento },
  ].filter(Boolean) as Array<{ type: keyof FiltrosState; label: string; count: number }>;

  const toggleFilter = (filterName: string) => {
    setOpenFilters((prev) =>
      prev.includes(filterName) ? prev.filter((f) => f !== filterName) : [...prev, filterName]
    );
  };

  const clearFilter = (type: keyof FiltrosState) => {
    onFiltrosChange({ ...filtros, [type]: 'Todos' });
  };

  const clearAllFilters = () => {
    onFiltrosChange({
      estado: 'Todos',
      sexo: 'Todos',
      plano: 'Todos',
      isolamento: 'Todos',
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Filtros ativos visíveis */}
      {activeFilters.map((filter) => (
        <Button
          key={filter.type}
          variant="default"
          size="sm"
          className="h-9 px-3 text-xs"
          onClick={() => clearFilter(filter.type)}
          aria-label={`Remover filtro ${filter.label}`}
        >
          {filter.label} ({filter.count})
          <X className="ml-1.5 h-3 w-3" />
        </Button>
      ))}

      {/* HD se houver leitos com HD */}
      {counts.hd > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 text-xs"
          aria-label={`Filtrar por HD: ${counts.hd} leitos`}
        >
          HD ({counts.hd})
        </Button>
      )}

      {/* Botão "+ Filtros" para filtros não ativos */}
      <Popover open={openFilters.includes('more')} onOpenChange={() => toggleFilter('more')}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 px-3 text-xs min-w-[44px]">
            <Plus className="mr-1.5 h-3 w-3" />
            Filtros
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar filtro..." />
            <CommandList>
              <CommandEmpty>Nenhum filtro encontrado.</CommandEmpty>

              {/* Estado */}
              <CommandGroup heading="Estado">
                <CommandItem
                  onSelect={() => {
                    onFiltrosChange({ ...filtros, estado: 'Todos' });
                    toggleFilter('more');
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', filtros.estado === 'Todos' ? 'opacity-100' : 'opacity-0')} />
                  Todos
                </CommandItem>
                {estados.map((estado) => (
                  <CommandItem
                    key={estado}
                    onSelect={() => {
                      onFiltrosChange({ ...filtros, estado });
                      toggleFilter('more');
                    }}
                  >
                    <Check className={cn('mr-2 h-4 w-4', filtros.estado === estado ? 'opacity-100' : 'opacity-0')} />
                    {estado}
                  </CommandItem>
                ))}
              </CommandGroup>

              {/* Sexo */}
              <CommandGroup heading="Sexo">
                <CommandItem
                  onSelect={() => {
                    onFiltrosChange({ ...filtros, sexo: 'Todos' });
                    toggleFilter('more');
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', filtros.sexo === 'Todos' ? 'opacity-100' : 'opacity-0')} />
                  Todos
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    onFiltrosChange({ ...filtros, sexo: 'M' });
                    toggleFilter('more');
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', filtros.sexo === 'M' ? 'opacity-100' : 'opacity-0')} />
                  Masculino
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    onFiltrosChange({ ...filtros, sexo: 'F' });
                    toggleFilter('more');
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', filtros.sexo === 'F' ? 'opacity-100' : 'opacity-0')} />
                  Feminino
                </CommandItem>
              </CommandGroup>

              {/* Plano */}
              <CommandGroup heading="Plano">
                <CommandItem
                  onSelect={() => {
                    onFiltrosChange({ ...filtros, plano: 'Todos' });
                    toggleFilter('more');
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', filtros.plano === 'Todos' ? 'opacity-100' : 'opacity-0')} />
                  Todos
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    onFiltrosChange({ ...filtros, plano: 'SUS' });
                    toggleFilter('more');
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', filtros.plano === 'SUS' ? 'opacity-100' : 'opacity-0')} />
                  SUS
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    onFiltrosChange({ ...filtros, plano: 'Particular' });
                    toggleFilter('more');
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', filtros.plano === 'Particular' ? 'opacity-100' : 'opacity-0')} />
                  Particular
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    onFiltrosChange({ ...filtros, plano: 'Convênio' });
                    toggleFilter('more');
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', filtros.plano === 'Convênio' ? 'opacity-100' : 'opacity-0')} />
                  Convênio
                </CommandItem>
              </CommandGroup>

              {/* Isolamento */}
              <CommandGroup heading="Isolamento">
                <CommandItem
                  onSelect={() => {
                    onFiltrosChange({ ...filtros, isolamento: 'Todos' });
                    toggleFilter('more');
                  }}
                >
                  <Check className={cn('mr-2 h-4 w-4', filtros.isolamento === 'Todos' ? 'opacity-100' : 'opacity-0')} />
                  Todos
                </CommandItem>
                {isolamentoOptions.map((iso) => (
                  <CommandItem
                    key={iso}
                    onSelect={() => {
                      onFiltrosChange({ ...filtros, isolamento: iso });
                      toggleFilter('more');
                    }}
                  >
                    <Check className={cn('mr-2 h-4 w-4', filtros.isolamento === iso ? 'opacity-100' : 'opacity-0')} />
                    {iso}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Limpar todos os filtros */}
      {activeFilters.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-3 text-xs min-w-[44px]"
          onClick={clearAllFilters}
          aria-label="Limpar todos os filtros"
        >
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      )}
    </div>
  );
}
