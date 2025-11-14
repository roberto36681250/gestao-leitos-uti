'use client';

import { useState, useEffect } from 'react';
import type { BedWithReservation, Isolamento } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

interface EditFormProps {
  bed: BedWithReservation;
  onConfirm: (data: {
    sexo: 'M' | 'F' | null;
    plano: 'SUS' | 'Particular' | 'Convênio' | null;
    isolamento: string[];
    hd: boolean;
    observacao: string;
  }) => void;
  onCancel: () => void;
}

const isolamentoOptions: Isolamento[] = ['Vigilância', 'Contato', 'Respiratório', 'Gotículas'];

export function EditForm({ bed, onConfirm, onCancel }: EditFormProps) {
  const [sexo, setSexo] = useState<'M' | 'F' | null>(bed.sexo);
  const [plano, setPlano] = useState<'SUS' | 'Particular' | 'Convênio' | null>(bed.plano);
  const [isolamento, setIsolamento] = useState<string[]>(bed.isolamento);
  const [hd, setHd] = useState(bed.hd);
  const [observacao, setObservacao] = useState(bed.observacao || '');

  useEffect(() => {
    setSexo(bed.sexo);
    setPlano(bed.plano);
    setIsolamento(bed.isolamento);
    setHd(bed.hd);
    setObservacao(bed.observacao || '');
  }, [bed]);

  const handleConfirm = () => {
    onConfirm({ sexo, plano, isolamento, hd, observacao });
  };

  const toggleIsolamento = (iso: string) => {
    setIsolamento((prev) =>
      prev.includes(iso) ? prev.filter((i) => i !== iso) : [...prev, iso]
    );
  };

  return (
    <div
      data-action-form
      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-lg shadow-xl border-2 border-gray-600 p-4 z-50 min-w-[320px] max-w-[360px]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Editar Leito {bed.number}</h3>
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-6 w-6 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-3 max-h-[450px] overflow-y-auto">
        <div className="grid gap-2">
          <Label htmlFor="edit-sexo" className="text-xs">Sexo</Label>
          <Select
            value={sexo || undefined}
            onValueChange={(v) => setSexo(v === 'none' ? null : (v as 'M' | 'F'))}
          >
            <SelectTrigger className="text-sm h-9">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              <SelectItem value="M">Masculino</SelectItem>
              <SelectItem value="F">Feminino</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="edit-plano" className="text-xs">Plano</Label>
          <Select
            value={plano || undefined}
            onValueChange={(v) => setPlano(v === 'none' ? null : (v as 'SUS' | 'Particular' | 'Convênio'))}
          >
            <SelectTrigger className="text-sm h-9">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              <SelectItem value="SUS">SUS</SelectItem>
              <SelectItem value="Particular">Particular</SelectItem>
              <SelectItem value="Convênio">Convênio</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label className="text-xs">Isolamento</Label>
          <div className="grid grid-cols-2 gap-2">
            {isolamentoOptions.map((iso) => (
              <div key={iso} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`edit-iso-${iso}`}
                  checked={isolamento.includes(iso)}
                  onChange={() => toggleIsolamento(iso)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor={`edit-iso-${iso}`} className="text-xs font-normal cursor-pointer">
                  {iso}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-1">
          <input
            type="checkbox"
            id="edit-hd"
            checked={hd}
            onChange={(e) => setHd(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="edit-hd" className="text-xs font-normal cursor-pointer">
            HD (Hemodiálise)
          </Label>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="edit-observacao" className="text-xs">Observação</Label>
          <Input
            id="edit-observacao"
            placeholder="Observações adicionais"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value.slice(0, 200))}
            maxLength={200}
            className="text-sm h-9"
          />
        </div>
      </div>
      
      <div className="flex gap-2 pt-3 mt-3 border-t border-gray-200">
        <Button variant="outline" size="sm" onClick={onCancel} className="flex-1 text-xs h-9">
          Cancelar
        </Button>
        <Button size="sm" onClick={handleConfirm} className="flex-1 text-xs h-9">
          Salvar
        </Button>
      </div>
      
      {/* Seta apontando para o card */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-600"></div>
      </div>
    </div>
  );
}

