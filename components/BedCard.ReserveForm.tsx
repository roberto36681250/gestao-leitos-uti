'use client';

import { useState } from 'react';
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
import { X } from 'lucide-react';

interface ReserveFormProps {
  bedNumber: number;
  onConfirm: (data: {
    iniciais: string;
    sexo: 'M' | 'F' | null;
    matricula: string;
    origem: string;
  }) => void;
  onCancel: () => void;
}

export function ReserveForm({ bedNumber, onConfirm, onCancel }: ReserveFormProps) {
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
  };

  return (
    <div
      data-action-form
      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-lg shadow-xl border-2 border-purple-600 p-4 z-50 min-w-[300px] max-w-[340px]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Reservar Leito {bedNumber}</h3>
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-6 w-6 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        <div className="grid gap-2">
          <Label htmlFor="reserve-iniciais" className="text-xs">
            Iniciais
          </Label>
          <Input
            id="reserve-iniciais"
            placeholder="Ex: J.S."
            value={iniciais}
            onChange={(e) => setIniciais(e.target.value.slice(0, 10))}
            maxLength={10}
            className="text-sm h-9"
            autoFocus
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="reserve-sexo" className="text-xs">
            Sexo
          </Label>
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
          <Label htmlFor="reserve-matricula" className="text-xs">
            Matrícula
          </Label>
          <Input
            id="reserve-matricula"
            placeholder="Ex: 123456"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value.slice(0, 20))}
            maxLength={20}
            className="text-sm h-9"
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="reserve-origem" className="text-xs">
            Origem
          </Label>
          <Input
            id="reserve-origem"
            placeholder="Ex: Emergência"
            value={origem}
            onChange={(e) => setOrigem(e.target.value.slice(0, 50))}
            maxLength={50}
            className="text-sm h-9"
          />
        </div>
        
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="reserve-active"
            checked={isActive}
            onCheckedChange={(checked) => setIsActive(checked as boolean)}
          />
          <Label htmlFor="reserve-active" className="text-xs font-normal cursor-pointer">
            Ativar reserva
          </Label>
        </div>
      </div>
      
      <div className="flex gap-2 pt-3 mt-3 border-t border-gray-200">
        <Button variant="outline" size="sm" onClick={onCancel} className="flex-1 text-xs h-9">
          Cancelar
        </Button>
        <Button size="sm" onClick={handleConfirm} className="flex-1 text-xs h-9">
          Confirmar
        </Button>
      </div>
      
      {/* Seta apontando para o card */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-600"></div>
      </div>
    </div>
  );
}

