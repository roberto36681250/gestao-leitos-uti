'use client';

import { useState } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';

interface ReserveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    iniciais: string;
    sexo: 'M' | 'F' | null;
    matricula: string;
    origem: string;
  }) => void;
}

export function ReserveDialog({ open, onOpenChange, onConfirm }: ReserveDialogProps) {
  const [iniciais, setIniciais] = useState('');
  const [sexo, setSexo] = useState<'M' | 'F' | null>(null);
  const [matricula, setMatricula] = useState('');
  const [origem, setOrigem] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleConfirm = () => {
    onConfirm({ iniciais, sexo, matricula, origem });
    setIniciais('');
    setSexo(null);
    setMatricula('');
    setOrigem('');
    setIsActive(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reservar Leito</DialogTitle>
          <DialogDescription>Campos sugeridos (não obrigatórios)</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="iniciais" className="text-sm">
              Iniciais
            </Label>
            <Input
              id="iniciais"
              placeholder="Ex: J.S."
              value={iniciais}
              onChange={(e) => setIniciais(e.target.value.slice(0, 10))}
              maxLength={10}
              className="text-sm"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sexo" className="text-sm">
              Sexo
            </Label>
            <Select
              value={sexo || undefined}
              onValueChange={(v) => setSexo(v === 'none' ? null : (v as 'M' | 'F'))}
            >
              <SelectTrigger className="text-sm">
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
            <Label htmlFor="matricula" className="text-sm">
              Matrícula
            </Label>
            <Input
              id="matricula"
              placeholder="Ex: 123456"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value.slice(0, 20))}
              maxLength={20}
              className="text-sm"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="origem" className="text-sm">
              Origem
            </Label>
            <Input
              id="origem"
              placeholder="Ex: Emergência"
              value={origem}
              onChange={(e) => setOrigem(e.target.value.slice(0, 50))}
              maxLength={50}
              className="text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(checked as boolean)}
            />
            <Label htmlFor="isActive" className="text-sm font-normal cursor-pointer">
              Ativar reserva
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

