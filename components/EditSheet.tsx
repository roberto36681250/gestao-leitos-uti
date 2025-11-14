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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface EditSheetProps {
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

const isolamentoOptions: Isolamento[] = ['Vigilância', 'Contato', 'Respiratório', 'Gotículas'];

export function EditSheet({ open, onOpenChange, bed, onConfirm }: EditSheetProps) {
  const [sexo, setSexo] = useState<'M' | 'F' | null>(bed.sexo);
  const [plano, setPlano] = useState<'SUS' | 'Particular' | 'Convênio' | null>(bed.plano);
  const [isolamento, setIsolamento] = useState<string[]>(bed.isolamento);
  const [hd, setHd] = useState(bed.hd);
  const [observacao, setObservacao] = useState(bed.observacao || '');

  useEffect(() => {
    if (open) {
      setSexo(bed.sexo);
      setPlano(bed.plano);
      setIsolamento(bed.isolamento);
      setHd(bed.hd);
      setObservacao(bed.observacao || '');
    }
  }, [open, bed]);

  const handleConfirm = () => {
    onConfirm({ sexo, plano, isolamento, hd, observacao });
    onOpenChange(false);
  };

  const toggleIsolamento = (iso: string) => {
    setIsolamento((prev) =>
      prev.includes(iso) ? prev.filter((i) => i !== iso) : [...prev, iso]
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Editar Leito {bed.number}</SheetTitle>
          <SheetDescription>Atualize os dados do leito</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="sexo">Sexo</Label>
            <Select
              value={sexo || undefined}
              onValueChange={(v) => setSexo(v === 'none' ? null : (v as 'M' | 'F'))}
            >
              <SelectTrigger>
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
            <Label htmlFor="plano">Plano</Label>
            <Select
              value={plano || undefined}
              onValueChange={(v) => setPlano(v === 'none' ? null : (v as 'SUS' | 'Particular' | 'Convênio'))}
            >
              <SelectTrigger>
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
            <Label>Isolamento</Label>
            <div className="space-y-2">
              {isolamentoOptions.map((iso) => (
                <div key={iso} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`iso-${iso}`}
                    checked={isolamento.includes(iso)}
                    onChange={() => toggleIsolamento(iso)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor={`iso-${iso}`} className="text-sm font-normal cursor-pointer">
                    {iso}
                  </Label>
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
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="hd" className="text-sm font-normal cursor-pointer">
              HD (Hemodiálise)
            </Label>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="observacao">Observação</Label>
            <Input
              id="observacao"
              placeholder="Observações adicionais"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value.slice(0, 200))}
              maxLength={200}
              className="text-sm"
            />
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Salvar</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

