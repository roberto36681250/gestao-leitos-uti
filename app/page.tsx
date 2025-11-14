'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useBedsRealtime } from '@/hooks/useBedsRealtime';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { TopMetrics } from '@/components/TopMetrics';
import { FilterPills } from '@/components/FilterPills';
import { BoardGrid } from '@/components/BoardGrid';
import { BoletimButton } from '@/components/BoletimButton';
import { SoundToggle } from '@/components/SoundToggle';
import { LegendPopover } from '@/components/LegendPopover';
import { PendingQueue } from '@/components/PendingQueue';
import { PendingQueueDrawer } from '@/components/PendingQueueDrawer';
import { ShareButton } from '@/components/ShareButton';
import { CSVExport } from '@/components/CSVExport';
import { useUndoStack } from '@/hooks/useUndoStack';
import { AccessibilityControls } from '@/components/AccessibilityControls';
import { OfflineQueueBadge } from '@/components/OfflineQueueBadge';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { SearchInput } from '@/components/SearchInput';
import { FooterMetrics } from '@/components/FooterMetrics';
import { BedCardSkeleton } from '@/components/BedCardSkeleton';
import { CancelDialog } from '@/components/CancelDialog';
import { ReserveDialog } from '@/components/ReserveDialog';
import { EditSheet } from '@/components/EditSheet';
import { Toaster } from '@/components/ui/toaster';
import type { FiltrosState, BedWithReservation, BedState } from '@/lib/types';
import { useActions } from '@/hooks/useActions';
import { useHotkeys } from '@/hooks/useHotkeys';
import { toast } from '@/components/ui/use-toast';
import { buildBoletimText } from '@/lib/buildBoletimText';
import { getDefaultActionByState } from '@/lib/state';
import { cn } from '@/lib/utils';

export default function Home() {
  const { beds, loading, error, latency, lastEventTime, refetch } = useBedsRealtime();
  const actions = useActions();
  const [filtros, setFiltros] = useState<FiltrosState>({
    estado: 'Todos',
    sexo: 'Todos',
    plano: 'Todos',
    isolamento: 'Todos',
  });
  const [searchNumber, setSearchNumber] = useState('');

  // Handler para clicar em métrica
  const handleStateClick = (state: BedState) => {
    setFiltros((prev) => ({ ...prev, estado: state }));
  };

  const [focusedBedId, setFocusedBedId] = useState<string | null>(null);
  const [showPendingQueue, setShowPendingQueue] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedBed, setSelectedBed] = useState<BedWithReservation | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [reserveDialogOpen, setReserveDialogOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const { pushUndo, popUndo, hasUndo } = useUndoStack();
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'reconnecting' | 'offline'>('online');
  const { queue, queueLength, addToQueue, processQueue } = useOfflineQueue(connectionStatus === 'online');
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const prevConnectionStatusRef = useRef<'online' | 'reconnecting' | 'offline'>('online');

  // Ref para detectar mudanças de estado para tocar som (deve estar no topo com os outros hooks)
  const prevBedsRef = useRef<BedWithReservation[]>([]);
  
  // Processar fila automaticamente quando voltar online
  useEffect(() => {
    const wasOffline = prevConnectionStatusRef.current === 'offline' || prevConnectionStatusRef.current === 'reconnecting';
    const isNowOnline = connectionStatus === 'online';
    
    // Se estava offline e agora está online, processar fila automaticamente
    if (wasOffline && isNowOnline && queueLength > 0 && !isProcessingQueue) {
      const actionsCount = queueLength;
      setIsProcessingQueue(true);
      
      // Processar fila automaticamente
      processQueue(async (action) => {
        // Processar ação da fila diretamente (sem passar por handleAction para evitar loop)
        const bed = beds.find((b) => b.id === action.bedId);
        if (!bed) return;
        
        // Chamar handleAction com skipOfflineCheck=true para não adicionar à fila novamente
        await handleAction(action.action, action.bedId, action.data, false, true);
      }).then((results) => {
        setIsProcessingQueue(false);
        const successCount = results?.filter((r: any) => r.success).length || actionsCount;
        if (successCount > 0) {
          toast({
            title: 'Fila processada automaticamente',
            description: `${successCount} ação(ões) foram executadas`,
          });
        }
      }).catch((err) => {
        console.error('Erro ao processar fila:', err);
        setIsProcessingQueue(false);
        toast({
          title: 'Erro ao processar fila',
          description: 'Algumas ações podem não ter sido executadas. Tente novamente.',
          variant: 'destructive',
        });
      });
    }
    
    prevConnectionStatusRef.current = connectionStatus;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionStatus, queueLength, isProcessingQueue, processQueue, beds]);

  const bedsFiltrados = useMemo(() => {
    return beds
      .filter((bed) => {
        // Busca por número
        if (searchNumber && bed.number.toString() !== searchNumber) return false;
        
        if (filtros.estado !== 'Todos' && bed.state !== filtros.estado) return false;
        if (filtros.sexo !== 'Todos' && bed.sexo !== filtros.sexo) return false;
        if (filtros.plano !== 'Todos' && bed.plano !== filtros.plano) return false;
        if (
          filtros.isolamento !== 'Todos' &&
          !bed.isolamento.includes(filtros.isolamento)
        )
          return false;
        return true;
      })
      .sort((a, b) => a.number - b.number); // Ordenação fixa por número
  }, [beds, filtros, searchNumber]);

  // Detectar mudanças de estado para tocar som (deve estar no topo com os outros hooks)
  useEffect(() => {
    if (!soundEnabled) {
      prevBedsRef.current = beds;
      return;
    }
    
    beds.forEach((bed) => {
      const prevBed = prevBedsRef.current.find((b) => b.id === bed.id);
      if (prevBed && prevBed.state !== bed.state) {
        // Estado mudou
        if (bed.state === 'Vago' || bed.state === 'Alta Sinalizada') {
          // Tocar ping
          if ((window as any).playPingSound) {
            (window as any).playPingSound();
          }
        }
      }
    });
    
    prevBedsRef.current = beds;
  }, [beds, soundEnabled]);

  const handleBatchAction = async (action: string, bedIds: string[]) => {
    const bedsToUpdate = beds.filter((b) => bedIds.includes(b.id));
    const previousStates = bedsToUpdate.map((b) => ({
      bedId: b.id,
      state: b.state,
      version: b.version,
    }));

    // Executar ações
    for (const bedId of bedIds) {
      const bed = beds.find((b) => b.id === bedId);
      if (!bed) continue;

      switch (action) {
        case 'Iniciar Higienização': {
          const result = await actions.iniciarHigienizacao(bedId, bed.version);
          if (result?.needsRefetch) await refetch();
          break;
        }
        case 'Finalizar Higienização': {
          const result = await actions.finalizarHigienizacao(bedId, bed.version);
          if (result?.needsRefetch) await refetch();
          break;
        }
        case 'Reservar': {
          // Para reservar em lote, precisa de dados - pular por enquanto
          break;
        }
        case 'Entrada Confirmada': {
          const result = await actions.entradaConfirmada(bedId, bed.version);
          if (result?.needsRefetch) await refetch();
          break;
        }
      }
    }

    // Adicionar ao stack de undo
    pushUndo({
      bedIds,
      action,
      previousStates,
      timestamp: Date.now(),
    });

    // Toast com botão desfazer (simplificado)
    toast({
      title: `${bedIds.length} leito(s) atualizado(s)`,
      description: 'Ação realizada com sucesso',
    });
  };

  const handleAction = async (action: string, bedId: string, data?: any, skipDataUpdate = false, skipOfflineCheck = false): Promise<{ needsRefetch?: boolean } | void> => {
    // Se offline, adicionar à fila (a menos que estejamos processando a fila)
    if (!skipOfflineCheck && connectionStatus === 'offline') {
      addToQueue(bedId, action, data || {});
      toast({
        title: 'Modo offline',
        description: 'Ação será processada automaticamente quando a conexão for restabelecida',
      });
      return;
    }

    const bed = beds.find((b) => b.id === bedId);
    if (!bed) return;

    switch (action) {
      case 'Alta Sinalizada': {
        const result = await actions.altaSinalizada(bedId, bed.version);
        if (result?.needsRefetch) {
          await refetch();
          return { needsRefetch: true };
        } else {
          toast({ title: `${bed.number}, alta sinalizada` });
          logAction(bed.number, 'Alta Sinalizada');
          return { needsRefetch: false };
        }
      }
      case 'Alta Efetivada': {
        const result = await actions.altaEfetivada(bedId, bed.version);
        if (result?.needsRefetch) {
          await refetch();
          return { needsRefetch: true };
        } else {
          toast({ title: `${bed.number}, alta efetivada` });
          logAction(bed.number, 'Alta Efetivada');
          return { needsRefetch: false };
        }
      }
      case 'Cancelar Alta':
        setSelectedBed(bed);
        setCancelDialogOpen(true);
        break;
      case 'Previsão de Alta em 24h': {
        const result = await actions.previsaoAlta24h(bedId, bed.version);
        if (result?.needsRefetch) {
          await refetch();
        } else {
          toast({ title: `${bed.number}, previsão de alta em 24h` });
          logAction(bed.number, 'Previsão de Alta em 24h');
        }
        break;
      }
      case 'Cancelar Previsão': {
        const result = await actions.cancelarPrevisao(bedId, bed.version);
        if (result?.needsRefetch) {
          await refetch();
          return { needsRefetch: true };
        } else {
          toast({ title: `${bed.number}, previsão cancelada` });
          logAction(bed.number, 'Cancelar Previsão');
          return { needsRefetch: false };
        }
      }
      case 'Voltar para Ocupado': {
        const result = await actions.voltarParaOcupado(bedId, bed.version);
        if (result?.needsRefetch) {
          await refetch();
          return { needsRefetch: true };
        } else {
          toast({ title: `${bed.number}, voltou para ocupado` });
          logAction(bed.number, 'Voltar para Ocupado');
          return { needsRefetch: false };
        }
      }
      case 'Iniciar Higienização': {
        const result = await actions.iniciarHigienizacao(bedId, bed.version);
        if (result?.needsRefetch) {
          await refetch();
          return { needsRefetch: true };
        } else {
          toast({ title: `${bed.number}, limpeza iniciada` });
          logAction(bed.number, 'Iniciar Higienização');
          return { needsRefetch: false };
        }
      }
      case 'Finalizar Higienização': {
        const result = await actions.finalizarHigienizacao(bedId, bed.version);
        if (result?.needsRefetch) {
          await refetch();
          return { needsRefetch: true };
        } else {
          toast({ title: `${bed.number}, fim limpeza` });
          logAction(bed.number, 'Finalizar Higienização');
          return { needsRefetch: false };
        }
      }
      case 'Transferência': {
        const result = await actions.iniciarTransferencia(bedId, bed.version);
        if (result?.needsRefetch) {
          await refetch();
          return { needsRefetch: true };
        } else {
          toast({ title: `${bed.number}, transferência` });
          logAction(bed.number, 'Transferência');
          return { needsRefetch: false };
        }
      }
      case 'Reservar':
        setSelectedBed(bed);
        setReserveDialogOpen(true);
        break;
      case 'Liberar':
        // Se tem reserva, liberar reserva
        if (bed.reservation) {
          const result = await actions.liberarReserva(bed.reservation.id, bedId, bed.version);
          if (result?.needsRefetch) {
            await refetch();
            return { needsRefetch: true };
          } else {
            toast({ title: `${bed.number}, liberado` });
            logAction(bed.number, 'Liberar');
            return { needsRefetch: false };
          }
        }
        // Se está em Bloqueado, liberar bloqueio e tornar vago
        if (bed.state === 'Bloqueado') {
          const result = await actions.liberarBloqueio(bedId, bed.version);
          if (result?.needsRefetch) {
            await refetch();
            return { needsRefetch: true };
          } else {
            toast({ title: `${bed.number}, liberado e vago` });
            logAction(bed.number, 'Liberar Bloqueio');
            return { needsRefetch: false };
          }
        }
        return { needsRefetch: false };
      case 'Entrada Confirmada': {
        // Se tem dados do modal, passar junto
        const entradaData = data ? {
          matricula: data.matricula,
          sexo: data.sexo,
          plano: data.plano,
          isolamento: data.isolamento,
          hd: data.hd,
          observacao: data.observacao,
          iniciais: data.iniciais,
        } : undefined;
        
        const result = await actions.entradaConfirmada(bedId, entradaData, bed.version);
        if (result?.needsRefetch) {
          await refetch();
          return { needsRefetch: true };
        } else {
          toast({ title: `${bed.number}, entrada confirmada` });
          logAction(bed.number, 'Entrada Confirmada');
          return { needsRefetch: false };
        }
      }
      case 'Ocupado': {
        // Quando chamado de "Vago", usar "Entrada Confirmada"
        const entradaData = data ? {
          matricula: data.matricula,
          sexo: data.sexo,
          plano: data.plano,
          isolamento: data.isolamento,
          hd: data.hd,
          observacao: data.observacao,
          iniciais: data.iniciais,
        } : undefined;
        
        const result = await actions.entradaConfirmada(bedId, entradaData, bed.version);
        if (result?.needsRefetch) {
          await refetch();
          return { needsRefetch: true };
        } else {
          toast({ title: `${bed.number}, ocupado` });
          logAction(bed.number, 'Ocupado');
          return { needsRefetch: false };
        }
      }
      case 'Bloquear': {
        // O motivo deve vir nos dados do modal
        const motivo = data?.motivo || data?.observacao || '';
        const result = await actions.bloquear(bedId, motivo, bed.version);
        if (result?.needsRefetch) {
          await refetch();
          return { needsRefetch: true };
        } else {
          toast({ title: `${bed.number}, bloqueado` });
          logAction(bed.number, 'Bloquear', motivo);
          return { needsRefetch: false };
        }
      }
      case 'Editar':
        setSelectedBed(bed);
        setEditSheetOpen(true);
        break;
      case 'Editar Completo':
        // Atualizar com dados do modal
        if (data && bed) {
          // Log de debug removido
          
          let currentBed = bed; // Usar variável mutável
          
          // Se mudou o estado, aplicar ação correspondente respeitando regras de transição
          if (data.state && data.state !== currentBed.state) {
            // Usar getActionForTransition para obter a ação correta
            const { getActionForTransition } = await import('@/lib/stateRules');
            const targetAction = getActionForTransition(currentBed.state, data.state);
            
            if (targetAction) {
              // Se for Bloquear, passar a observação como motivo
              const actionData = targetAction === 'Bloquear' 
                ? { observacao: data.observacao || '' }
                : undefined;
              
              // Chamar a ação de transição
              const transitionResult = await handleAction(targetAction, bedId, actionData);
              
              // Se houve conflito de versão, fazer refetch e buscar versão atualizada
              if (transitionResult?.needsRefetch) {
                await refetch();
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Buscar o leito atualizado após refetch
                const updatedBed = beds.find((b) => b.id === bedId);
                if (updatedBed) {
                  currentBed = updatedBed;
                } else {
                  // Se não encontrou o leito após refetch, cancelar operação
                  toast({ 
                    title: 'Erro ao atualizar', 
                    description: 'Não foi possível encontrar o leito após atualização. Tente novamente.',
                    variant: 'destructive'
                  });
                  return;
                }
              } else {
                // Aguardar um pouco para a transição ser processada
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Refetch para garantir dados atualizados
                await refetch();
                await new Promise(resolve => setTimeout(resolve, 200));
                
                // Buscar o leito atualizado após refetch
                const updatedBed = beds.find((b) => b.id === bedId);
                if (updatedBed) {
                  currentBed = updatedBed;
                }
              }
            } else {
              console.warn('⚠️ Não há ação válida para transição de', currentBed.state, 'para', data.state);
              toast({ 
                title: 'Transição inválida', 
                description: `Não é possível mudar de ${currentBed.state} para ${data.state} diretamente. Use as ações do card (ex: "Alta Sinalizada" → "Alta Efetivada").`,
                variant: 'destructive'
              });
              return; // Não continuar se a transição não é válida
            }
          }
          
          // Sempre atualizar dados básicos (sexo, plano, isolamento, hd, observacao, matricula)
          // Aguardar um pouco para garantir que realtime atualizou
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Fazer refetch uma vez para garantir versão atualizada
          await refetch();
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const latestBed = beds.find((b) => b.id === bedId);
          if (!latestBed) {
            toast({ 
              title: 'Erro ao atualizar', 
              description: 'Não foi possível encontrar o leito. Tente novamente.',
              variant: 'destructive'
            });
            return;
          }
          
          const editData: any = {
            sexo: data.sexo,
            plano: data.plano,
            isolamento: data.isolamento,
            hd: data.hd,
            observacao: data.observacao,
          };
          
          // Incluir matrícula sempre (mesmo se null)
          if (data.matricula !== undefined) {
            editData.matricula = data.matricula || null;
          }
          
          // Tentar editar com a versão atual (updateWithVersion já busca versão mais recente)
          const result = await actions.editarLeito(
            bedId,
            editData,
            latestBed.version
          );
          
          if (result?.needsRefetch) {
            // Se houve conflito, fazer refetch e mostrar mensagem
            await refetch();
            toast({ 
              title: 'Atualização concorrente detectada', 
              description: 'Dados recarregados. Se necessário, tente novamente.',
              variant: 'default'
            });
          } else {
            // Sucesso!
            toast({ title: `${latestBed.number}, atualizado` });
            logAction(latestBed.number, 'Editar', 'Dados atualizados');
          }
          
          // Se tem dados de reserva e estado é Reservado
          if (data.state === 'Reservado' && (data.iniciais || data.origem)) {
            const reserveResult = await actions.criarReserva(
              bedId,
              {
                iniciais: data.iniciais || '',
                sexo: data.sexo,
                matricula: data.matricula || '',
                origem: data.origem || '',
              },
              bed.version
            );
            if (reserveResult?.needsRefetch) {
              await refetch();
            } else {
              toast({ title: `${bed.number}, reservado` });
              logAction(bed.number, 'Reservar', `${data.iniciais || 'N/A'} - ${data.origem || 'N/A'}`);
            }
          }
          
          // Se tem motivo e é cancelamento
          if (data.motivo && bed.state === 'Alta Sinalizada') {
            const cancelResult = await actions.cancelarAlta(bedId, data.motivo, bed.version);
            if (cancelResult?.needsRefetch) {
              await refetch();
            } else {
              toast({ title: `${bed.number}, alta cancelada` });
              logAction(bed.number, 'Cancelar Alta', data.motivo);
            }
          }
        }
        break;
    }
  };

  // Hotkeys quando um card está focado
  useHotkeys(
    [
      {
        key: 'h',
        action: () => {
          if (focusedBedId) {
            const bed = beds.find((b) => b.id === focusedBedId);
            if (bed && bed.state === 'Alta Efetivada') {
              handleAction('Iniciar Higienização', focusedBedId);
            }
          }
        },
      },
      {
        key: 'f',
        action: () => {
          if (focusedBedId) {
            const bed = beds.find((b) => b.id === focusedBedId);
            if (bed && bed.state === 'Higienização') {
              handleAction('Finalizar Higienização', focusedBedId);
            }
          }
        },
      },
      {
        key: 'a',
        action: () => {
          if (focusedBedId) {
            const bed = beds.find((b) => b.id === focusedBedId);
            if (bed && bed.state === 'Ocupado') {
              handleAction('Alta Sinalizada', focusedBedId);
            }
          }
        },
      },
      {
        key: 'e',
        action: () => {
          if (focusedBedId) {
            const bed = beds.find((b) => b.id === focusedBedId);
            if (bed && bed.state === 'Alta Sinalizada') {
              handleAction('Alta Efetivada', focusedBedId);
            }
          }
        },
      },
      {
        key: 'c',
        action: () => {
          if (focusedBedId) {
            const bed = beds.find((b) => b.id === focusedBedId);
            if (bed && bed.state === 'Alta Sinalizada') {
              handleAction('Cancelar Alta', focusedBedId);
            }
          }
        },
      },
      {
        key: 'r',
        action: () => {
          if (focusedBedId) {
            const bed = beds.find((b) => b.id === focusedBedId);
            if (bed && bed.state === 'Vago') {
              handleAction('Reservar', focusedBedId);
            }
          }
        },
      },
      {
        key: 'l',
        action: () => {
          if (focusedBedId) {
            const bed = beds.find((b) => b.id === focusedBedId);
            if (bed && (bed.state === 'Reservado' || bed.state === 'Bloqueado')) {
              handleAction('Liberar', focusedBedId);
            }
          }
        },
      },
      {
        key: 't',
        action: () => {
          if (focusedBedId) {
            const bed = beds.find((b) => b.id === focusedBedId);
            if (bed && bed.state === 'Ocupado') {
              handleAction('Transferência', focusedBedId);
            }
          }
        },
      },
      {
        key: 'i',
        action: () => {
          if (focusedBedId) {
            const bed = beds.find((b) => b.id === focusedBedId);
            if (bed && bed.state === 'Vago') {
              handleAction('Bloquear', focusedBedId, { observacao: 'Motivo do bloqueio' });
            }
          }
        },
      },
      {
        key: 'Enter',
        action: () => {
          if (focusedBedId) {
            const bed = beds.find((b) => b.id === focusedBedId);
            if (bed) {
              // Verificar se ActionBar está aberta (card clicado)
              const cardElement = document.querySelector(`[data-bed-id="${focusedBedId}"]`);
              const actionBar = cardElement?.querySelector('[data-action-bar]');
              
              if (actionBar) {
                // ActionBar está aberta, executar ação padrão
                const defaultAction = getDefaultActionByState(bed.state);
                if (defaultAction) {
                  handleAction(defaultAction, focusedBedId);
                }
              } else {
                // ActionBar não está aberta, abrir ela (simular clique)
                (cardElement as HTMLElement)?.click();
              }
            }
          }
        },
      },
      {
        key: 'Shift+R',
        action: async () => {
          if (focusedBedId) {
            // Recarregar somente o leito focado
            await refetch();
            toast({ title: 'Leito recarregado' });
          }
        },
      },
      {
        key: 'Escape',
        action: () => {
          // Fechar ActionBar ou limpar foco
          setFocusedBedId(null);
        },
      },
    ],
    focusedBedId !== null
  );

  // Hotkey global para boletim (B)
  useHotkeys(
    [
      {
        key: 'b',
        action: async () => {
          try {
            const boletim = buildBoletimText(beds);
            await navigator.clipboard.writeText(boletim);
            toast({
              title: 'Boletim copiado!',
              description: 'Texto copiado para a área de transferência.',
            });
          } catch (err) {
            toast({
              title: 'Erro ao copiar',
              description: 'Não foi possível copiar o boletim.',
              variant: 'destructive',
            });
          }
        },
      },
    ],
    true
  );

  const handleCancelAlta = async (motivo: string) => {
    if (!selectedBed) return;
    
    const result = await actions.cancelarAlta(selectedBed.id, motivo, selectedBed.version);
    if (result?.needsRefetch) {
      await refetch();
    } else {
      toast({ title: `${selectedBed.number}, alta cancelada` });
      logAction(selectedBed.number, 'Cancelar Alta', motivo);
    }
    setCancelDialogOpen(false);
    setSelectedBed(null);
  };

  const handleReserve = async (data: {
    iniciais: string;
    sexo: 'M' | 'F' | null;
    matricula: string;
    origem: string;
  }) => {
    if (!selectedBed) return;
    
    const result = await actions.criarReserva(selectedBed.id, data, selectedBed.version);
    if (result?.needsRefetch) {
      await refetch();
    } else {
      toast({ title: `${selectedBed.number}, reservado` });
      logAction(selectedBed.number, 'Reservar', `${data.iniciais || 'N/A'} - ${data.origem || 'N/A'}`);
    }
    setReserveDialogOpen(false);
    setSelectedBed(null);
  };

  const handleEdit = async (data: {
    sexo: 'M' | 'F' | null;
    plano: 'Apartamento' | 'Enfermaria' | null;
    isolamento: string[];
    hd: boolean;
    observacao: string;
    matricula?: string | null;
  }) => {
    if (!selectedBed) return;
    
    const result = await actions.editarLeito(selectedBed.id, data, selectedBed.version);
    if (result?.needsRefetch) {
      await refetch();
    } else {
      toast({ title: `${selectedBed.number}, atualizado` });
      logAction(selectedBed.number, 'Editar', 'Dados atualizados');
    }
    setEditSheetOpen(false);
    setSelectedBed(null);
  };

  // Função para registrar ações na ata
  const logAction = (bedNumber: number, action: string, details?: string) => {
    const log = {
      bedNumber,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    
    const logs = JSON.parse(localStorage.getItem('gestao-leitos-ata') || '[]');
    logs.unshift(log);
    // Manter apenas os últimos 100 registros
    if (logs.length > 100) {
      logs.splice(100);
    }
    localStorage.setItem('gestao-leitos-ata', JSON.stringify(logs));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <BedCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-semibold text-red-600">Erro: {error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
      <div className="max-w-7xl mx-auto relative flex-1 flex flex-col overflow-hidden p-3 md:p-4 pb-0 w-full">
        {/* Header com botão de boletim */}
        <div className="flex justify-between items-center mb-2 md:mb-3 flex-shrink-0">
          <header>
            <div className="flex items-center gap-2 md:gap-3">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-0.5">Gestão de Leitos</h1>
                <p className="text-xs md:text-sm text-gray-600">Sistema em tempo real</p>
              </div>
              <ConnectionStatus
                latency={latency}
                lastEventTime={lastEventTime}
                onStatusChange={setConnectionStatus}
              />
            </div>
          </header>
          <div className="flex items-center gap-2">
            <AccessibilityControls />
            <SoundToggle onStateChange={setSoundEnabled} />
            <LegendPopover />
            <OfflineQueueBadge
              queueLength={queueLength}
              onProcess={async () => {
                if (isProcessingQueue) return;
                setIsProcessingQueue(true);
                try {
                  await processQueue(async (action) => {
                    // Processar ação da fila
                    const bed = beds.find((b) => b.id === action.bedId);
                    if (bed) {
                      await handleAction(action.action, action.bedId, action.data);
                    }
                  });
                  toast({
                    title: 'Fila processada',
                    description: `${queueLength} ação(ões) executada(s)`,
                  });
                } catch (err) {
                  console.error('Erro ao processar fila manualmente:', err);
                  toast({
                    title: 'Erro ao processar fila',
                    description: 'Algumas ações podem não ter sido executadas',
                    variant: 'destructive',
                  });
                } finally {
                  setIsProcessingQueue(false);
                }
              }}
              isProcessing={isProcessingQueue}
            />
            <div className="lg:hidden">
              <PendingQueueDrawer beds={beds} onBedClick={(bedId) => {
                const bed = beds.find((b) => b.id === bedId);
                if (bed) {
                  const element = document.querySelector(`[data-bed-id="${bedId}"]`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    (element as HTMLElement).focus();
                  }
                }
              }} />
            </div>
            <ShareButton beds={beds} />
            <CSVExport beds={beds} />
            <BoletimButton beds={beds} />
          </div>
        </div>

        {/* Métricas no topo - clicáveis */}
        <div className="flex-shrink-0 mb-2">
          <TopMetrics beds={beds} onStateClick={handleStateClick} />
        </div>

        {/* Busca e Filtros */}
        <div className="flex flex-col md:flex-row gap-2 mb-2 flex-shrink-0">
          <div className="flex-1 max-w-xs">
            <SearchInput value={searchNumber} onChange={setSearchNumber} />
          </div>
          <FilterPills beds={beds} filtros={filtros} onFiltrosChange={setFiltros} />
        </div>

        {/* Contador */}
        <div className="text-xs text-gray-600 mb-2 flex-shrink-0">
          Exibindo {bedsFiltrados.length} de {beds.length} leitos
        </div>

        {/* Grade de leitos - com margem para sidebar */}
        <div className={cn('flex-1 overflow-y-auto overflow-x-hidden pb-14', 'lg:mr-72')}>
          <BoardGrid
            beds={bedsFiltrados}
            onAction={handleAction}
            onFocus={setFocusedBedId}
            focusedBedId={focusedBedId}
          />
        </div>

        {/* Mensagem vazia */}
        {bedsFiltrados.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhum leito encontrado com os filtros aplicados.
          </div>
        )}

        {/* Sidebar de Pendências - Desktop */}
        <div className="hidden lg:block fixed right-4 top-24 bottom-24 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-sm font-semibold">Pendências</h2>
          </div>
          <PendingQueue beds={beds} onBedClick={(bedId) => {
            const bed = beds.find((b) => b.id === bedId);
            if (bed) {
              const element = document.querySelector(`[data-bed-id="${bedId}"]`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                (element as HTMLElement).focus();
              }
            }
          }} className="flex-1 overflow-y-auto" />
        </div>
      </div>


      {/* Dialogs */}
      <CancelDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancelAlta}
      />

      <ReserveDialog
        open={reserveDialogOpen}
        onOpenChange={setReserveDialogOpen}
        onConfirm={handleReserve}
      />

      {selectedBed && (
        <EditSheet
          open={editSheetOpen}
          onOpenChange={setEditSheetOpen}
          bed={selectedBed}
          onConfirm={handleEdit}
        />
      )}

      {/* Rodapé fixo com métricas */}
      <FooterMetrics beds={beds} />

      <Toaster />
    </div>
  );
}
