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

interface DialogReservaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    iniciais: string;
    sexo: 'M' | 'F' | null;
    matricula: string;
    origem: string;
  }) => void;
}

export function DialogReserva({ open, onOpenChange, onConfirm }: DialogReservaProps) {
  const [iniciais, setIniciais] = useState('');
  const [sexo, setSexo] = useState<'M' | 'F' | null>(null);
  const [matricula, setMatricula] = useState('');
  const [origem, setOrigem] = useState('');

  const handleConfirm = () => {
    if (iniciais.trim() && matricula.trim() && origem.trim()) {
      onConfirm({ iniciais, sexo, matricula, origem });
      setIniciais('');
      setSexo(null);
      setMatricula('');
      setOrigem('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reservar Leito</DialogTitle>
          <DialogDescription>Preencha os dados da reserva.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="iniciais">Iniciais</Label>
            <Input
              id="iniciais"
              placeholder="Ex: J.S."
              value={iniciais}
              onChange={(e) => setIniciais(e.target.value)}
              maxLength={10}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sexo">Sexo</Label>
            <Select value={sexo || ''} onValueChange={(v) => setSexo(v as 'M' | 'F' | null)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="matricula">Matrícula</Label>
            <Input
              id="matricula"
              placeholder="Ex: 123456"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              maxLength={20}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="origem">Origem</Label>
            <Input
              id="origem"
              placeholder="Ex: Emergência"
              value={origem}
              onChange={(e) => setOrigem(e.target.value)}
              maxLength={50}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!iniciais.trim() || !matricula.trim() || !origem.trim()}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

