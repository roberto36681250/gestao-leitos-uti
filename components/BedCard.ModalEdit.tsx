'use client';

import { useState, useEffect } from 'react';
import type { BedWithReservation, BedState, Isolamento } from '@/lib/types';
import { getNextActionsByState } from '@/lib/state';
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
import { cn } from '@/lib/utils';
import { getActionForTransition, canTransitionTo } from '@/lib/stateRules';

interface BedCardModalEditProps {
  bed: BedWithReservation;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    state?: BedState;
    sexo: 'M' | 'F' | null;
    plano: 'Apartamento' | 'Enfermaria' | null;
    isolamento: string[];
    hd: boolean;
    observacao: string;
    iniciais?: string;
    matricula?: string;
    origem?: string;
    motivo?: string;
  }) => void;
  onAction?: (action: string, bedId: string, data?: any) => void;
}

const isolamentoOptions: Isolamento[] = ['Vigilância', 'Contato', 'Respiratório', 'Gotículas'];
const bedStates: BedState[] = [
  'Ocupado',
  'Alta Sinalizada',
  'Previsão de Alta em 24h',
  'Vago',
  'Reservado',
  'Higienização',
  'Transferência',
  'Bloqueado',
  'Alta Efetivada',
  'Alta Cancelada',
];

export function BedCardModalEdit({ bed, isOpen, onClose, onSave, onAction }: BedCardModalEditProps) {
  const [state, setState] = useState<BedState>(bed.state);
  const [sexo, setSexo] = useState<'M' | 'F' | null>(bed.sexo);
  const [plano, setPlano] = useState<'Apartamento' | 'Enfermaria' | null>(bed.plano);
  const [isolamento, setIsolamento] = useState<string[]>(bed.isolamento);
  const [hd, setHd] = useState(bed.hd);
  const [observacao, setObservacao] = useState(bed.observacao || '');
  const [matricula, setMatricula] = useState('');
  const [iniciais, setIniciais] = useState('');
  const [origem, setOrigem] = useState('');
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    if (isOpen) {
      setState(bed.state);
      setSexo(bed.sexo);
      
      // Se o leito está Vago, Higienização ou Bloqueado (sem paciente), não preencher valores padrão
      const isVacantState = bed.state === 'Vago' || bed.state === 'Higienização' || bed.state === 'Bloqueado';
      
      if (isVacantState) {
        // Para leitos vagos, usar valores do banco (que devem estar null/vazios após reset)
        setPlano(bed.plano || null);
        setIsolamento(bed.isolamento || []);
        setMatricula(bed.matricula || '');
      } else {
        // Para leitos ocupados/reservados, usar valores do banco ou padrões se não houver valor
        setPlano(bed.plano || 'Enfermaria');
        setIsolamento(bed.isolamento.length > 0 ? bed.isolamento : ['Vigilância']);
        setMatricula(bed.matricula || bed.reservation?.matricula || '');
      }
      
      setHd(bed.hd);
      setObservacao(bed.observacao || '');
      setIniciais(bed.reservation?.iniciais || '');
      setOrigem(bed.reservation?.origem || '');
      setMotivo('');
    }
  }, [isOpen, bed]);

  const handleSave = () => {
    // Se mudando para Bloqueado, validar que tem observação (motivo)
    if (state === 'Bloqueado' && state !== bed.state && !observacao.trim()) {
      alert('Por favor, descreva o motivo do bloqueio no campo Observação');
      return;
    }
    
    // Se o estado final é Vago, Higienização ou Bloqueado (sem paciente), limpar dados de paciente
    const isVacantState = state === 'Vago' || state === 'Higienização' || state === 'Bloqueado';
    
    onSave({
      state: state !== bed.state ? state : undefined,
      // Limpar dados de paciente se estiver vago
      sexo: isVacantState ? null : sexo,
      plano: isVacantState ? null : plano,
      isolamento: isVacantState ? [] : isolamento,
      hd: isVacantState ? false : hd,
      // Observação pode ser mantida (pode ser nota geral do leito ou motivo de bloqueio)
      observacao: state === 'Bloqueado' ? observacao : (isVacantState ? null : observacao),
      // Matrícula deve ser limpa se estiver vago
      matricula: isVacantState ? null : (matricula.trim() || null),
      iniciais: iniciais.trim() || undefined,
      origem: origem.trim() || undefined,
      motivo: motivo.trim() || undefined,
    });
  };

  const availableActions = getNextActionsByState(bed.state);
  const needsReserva = state === 'Reservado' || (state === 'Vago' && availableActions.includes('Reservar'));
  const needsCancelamento = state === 'Alta Cancelada' || (bed.state === 'Alta Sinalizada' && state !== 'Alta Sinalizada');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl border border-gray-200 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Leito {bed.number}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Status/Estado - Mostrar apenas estados válidos */}
          <div className="grid gap-2">
            <Label htmlFor="state" className="text-sm font-semibold">
              Status
            </Label>
            <Select
              value={state}
              onValueChange={(v) => setState(v as BedState)}
            >
              <SelectTrigger id="state" className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bedStates.map((s) => {
                  const isValidTransition = s === bed.state || canTransitionTo(bed.state, s);
                  const action = s !== bed.state ? getActionForTransition(bed.state, s) : null;
                  
                  return (
                    <SelectItem 
                      key={s} 
                      value={s}
                      disabled={!isValidTransition}
                      className={!isValidTransition ? 'opacity-50' : ''}
                    >
                      {s} 
                      {s === bed.state && ' (atual)'}
                      {action && ` → ${action}`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {state !== bed.state && (
              <p className="text-xs mt-1">
                {(() => {
                  const action = getActionForTransition(bed.state, state);
                  if (action) {
                    return (
                      <span className="text-blue-600">
                        ✓ Ação: {action}
                      </span>
                    );
                  }
                  return (
                    <span className="text-red-600 font-semibold">
                      ⚠️ Transição inválida - Use as ações do card
                    </span>
                  );
                })()}
              </p>
            )}
          </div>

          {/* Informações básicas */}
          <div className="grid gap-2">
            <Label htmlFor="sexo" className="text-sm font-semibold">
              Sexo
            </Label>
            <Select
              value={sexo || undefined}
              onValueChange={(v) => setSexo(v === 'none' ? null : (v as 'M' | 'F'))}
            >
              <SelectTrigger id="sexo" className="text-sm">
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
            <Label htmlFor="plano" className="text-sm font-semibold">
              Plano
            </Label>
            <Select
              value={plano || undefined}
              onValueChange={(v) => setPlano(v === 'none' ? null : (v as 'Apartamento' | 'Enfermaria'))}
            >
              <SelectTrigger id="plano" className="text-sm">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                <SelectItem value="Apartamento">Apartamento</SelectItem>
                <SelectItem value="Enfermaria">Enfermaria</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Isolamento */}
          <div className="grid gap-2">
            <Label className="text-sm font-semibold">Isolamento</Label>
            <div className="space-y-2">
              {/* Opção "Sem isolamento" */}
              <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                <input
                  type="checkbox"
                  id="iso-sem-isolamento"
                  checked={isolamento.length === 0}
                  onChange={() => {
                    if (isolamento.length > 0) {
                      // Se tem isolamentos, remover todos
                      setIsolamento([]);
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="iso-sem-isolamento" className="text-sm font-normal cursor-pointer text-gray-600">
                  Sem isolamento
                </Label>
              </div>
              {/* Opções de isolamento */}
              {isolamentoOptions.map((iso) => (
                <div key={iso} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`iso-${iso}`}
                    checked={isolamento.includes(iso)}
                    onChange={() => {
                      setIsolamento((prev) => {
                        if (prev.includes(iso)) {
                          // Remover isolamento
                          return prev.filter((i) => i !== iso);
                        } else {
                          // Adicionar isolamento (remover "Sem isolamento" automaticamente)
                          return [...prev, iso];
                        }
                      });
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor={`iso-${iso}`} className="text-sm font-normal cursor-pointer">
                    {iso}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* HD */}
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

          {/* Observação */}
          <div className="grid gap-2">
            <Label htmlFor="observacao" className="text-sm font-semibold">
              Observação {state === 'Bloqueado' && '(motivo do bloqueio)' || ''}
            </Label>
            <Input
              id="observacao"
              placeholder={state === 'Bloqueado' ? "Descreva o motivo do bloqueio" : "Observações adicionais"}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value.slice(0, 200))}
              maxLength={200}
              className="text-sm"
            />
            {state === 'Bloqueado' && !observacao && (
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Motivo do bloqueio é obrigatório
              </p>
            )}
          </div>

          {/* Matrícula - sempre visível */}
          <div className="grid gap-2">
            <Label htmlFor="matricula" className="text-sm font-semibold">
              Matrícula {((state === 'Ocupado' || state === 'Reservado') && '(obrigatória)' || '')}
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

          {/* Campos condicionais para Reserva */}
          {needsReserva && (
            <>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-semibold mb-3">Dados da Reserva</h3>
                <div className="space-y-3">
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
                </div>
              </div>
            </>
          )}

          {/* Motivo para cancelamento */}
          {needsCancelamento && (
            <div className="grid gap-2">
              <Label htmlFor="motivo" className="text-sm font-semibold">
                Motivo do Cancelamento
              </Label>
              <Input
                id="motivo"
                placeholder="Ex: hipotensão, febre, novo suporte"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value.slice(0, 60))}
                maxLength={60}
                className="text-sm"
              />
            </div>
          )}

          {/* Botões de ação para leito reservado */}
          {bed.state === 'Reservado' && onAction && (
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
              <Button 
                onClick={() => {
                  // Entrada Confirmada - tornar ocupado
                  onAction('Entrada Confirmada', bed.id, {
                    matricula: matricula.trim() || null,
                    sexo,
                    plano,
                    isolamento,
                    hd,
                    observacao: observacao.trim() || null,
                    iniciais: iniciais.trim() || undefined,
                  });
                  onClose();
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Ocupar / Admissão
              </Button>
              <Button 
                onClick={() => {
                  // Liberar reserva
                  onAction('Liberar', bed.id);
                  onClose();
                }}
                variant="outline"
                className="w-full border-red-500 text-red-600 hover:bg-red-50"
              >
                Cancelar Reserva
              </Button>
            </div>
          )}

          {/* Botões de ação para leito bloqueado */}
          {bed.state === 'Bloqueado' && onAction && (
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
              <Button 
                onClick={() => {
                  // Liberar bloqueio - tornar vago
                  onAction('Liberar', bed.id);
                  onClose();
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Liberar / Leito Vago
              </Button>
            </div>
          )}

          {/* Botões padrão (Salvar/Cancelar) - não mostrar para reservado/bloqueado se temos onAction */}
          {!(bed.state === 'Reservado' && onAction) && !(bed.state === 'Bloqueado' && onAction) && (
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="flex-1">
                Salvar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

