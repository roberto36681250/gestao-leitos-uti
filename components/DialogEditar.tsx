'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import type { BedWithReservation, Isolamento } from '@/lib/types';

interface DialogEditarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bed: BedWithReservation;
  onConfirm: (data: {
    sexo: 'M' | 'F' | null;
    plano: 'SUS' | 'Particular' | 'Convênio' | null;
    isolamento: string[];
    hd: boolean;
    observacao: string;
  }) => void;
}

const isolamentoOptions: Isolamento[] = [
  'Texto',
  'Vigilância',
  'Contato',
  'Respiratório',
  'Gotículas',
];

export function DialogEditar({
  open,
  onOpenChange,
  bed,
  onConfirm,
}: DialogEditarProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Leito {bed.number}</DialogTitle>
          <DialogDescription>Atualize os dados do leito.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="grid gap-2">
            <Label htmlFor="sexo">Sexo</Label>
            <Select
              value={sexo || ''}
              onValueChange={(v) => setSexo(v as 'M' | 'F' | null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="plano">Plano</Label>
            <Select
              value={plano || ''}
              onValueChange={(v) => setPlano(v as 'SUS' | 'Particular' | 'Convênio' | null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                <SelectItem value="SUS">SUS</SelectItem>
                <SelectItem value="Particular">Particular</SelectItem>
                <SelectItem value="Convênio">Convênio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Isolamento (múltiplo)</Label>
            <div className="space-y-2">
              {isolamentoOptions.map((iso) => (
                <div key={iso} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`iso-${iso}`}
                    checked={isolamento.includes(iso)}
                    onChange={() => toggleIsolamento(iso)}
                    className="h-4 w-4"
                  />
                  <label htmlFor={`iso-${iso}`} className="text-sm">
                    {iso}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hd"
              checked={hd}
              onChange={(e) => setHd(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="hd">HD (Hemodiálise)</Label>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="observacao">Observação</Label>
            <Input
              id="observacao"
              placeholder="Observações adicionais"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              maxLength={200}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

