'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CancelFormProps {
  bedNumber: number;
  onConfirm: (motivo: string) => void;
  onCancel: () => void;
}

const motivoSuggestions = ['Hipotensão', 'Febre', 'Novo suporte', 'Complicação clínica'];

export function CancelForm({ bedNumber, onConfirm, onCancel }: CancelFormProps) {
  const [motivo, setMotivo] = useState('');

  const handleConfirm = () => {
    if (motivo.trim()) {
      onConfirm(motivo.trim());
      setMotivo('');
    }
  };

  return (
    <div
      data-action-form
      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white rounded-lg shadow-xl border-2 border-gray-300 p-4 z-50 min-w-[280px] max-w-[320px]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Cancelar Alta - Leito {bedNumber}</h3>
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-6 w-6 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-3">
        <div>
          <Input
            placeholder="Motivo (máx. 60 caracteres)"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value.slice(0, 60))}
            maxLength={60}
            className="text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && motivo.trim()) {
                handleConfirm();
              } else if (e.key === 'Escape') {
                onCancel();
              }
            }}
          />
          <div className="text-xs text-gray-500 mt-1">{motivo.length}/60</div>
        </div>
        
        <div>
          <div className="text-xs text-gray-600 mb-1.5">Sugestões:</div>
          <div className="flex flex-wrap gap-1.5">
            {motivoSuggestions.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => setMotivo(sug)}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onCancel} className="flex-1 text-xs h-9">
            Cancelar
          </Button>
          <Button size="sm" onClick={handleConfirm} disabled={!motivo.trim()} className="flex-1 text-xs h-9">
            Confirmar
          </Button>
        </div>
      </div>
      
      {/* Seta apontando para o card */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-300"></div>
      </div>
    </div>
  );
}

