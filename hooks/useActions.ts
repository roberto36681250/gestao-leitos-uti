'use client';

import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import type { BedWithReservation } from '@/lib/types';

// Helper para atualizar com controle de versão
// Nota: toast não está disponível aqui, então não podemos mostrar notificações
async function updateWithVersion(
  bedId: string,
  currentVersion: number,
  updates: Record<string, any>
): Promise<{ success: boolean; needsRefetch: boolean }> {
  try {
    // SEMPRE buscar versão mais recente antes de atualizar para evitar conflitos
    // Isso garante que estamos usando a versão mais atual do banco
    const { data: currentBed } = await supabase
      .from('beds')
      .select('version')
      .eq('id', bedId)
      .single();
    
    const version = currentBed?.version || currentVersion || 1;
    
    // Se a versão mudou significativamente, pode haver conflito (log silencioso)
    // if (currentVersion && Math.abs(version - currentVersion) > 1) {
    //   console.log('⚠️ Versão mudou significativamente', { esperada: currentVersion, atual: version });
    // }

    // Filtrar campos undefined/null que podem causar problemas
    const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      // Incluir null, mas não undefined
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);
    
    // Campos que podem não existir no banco (após migrações)
    // Se a migração não foi executada, remover esses campos do update
    const optionalColumns = ['previsao_alta_24h_at', 'last_initials'];
    
    // Tentar atualizar com verificação de versão
    let data: any = null;
    let error: any = null;
    let attempts = 0;
    const maxAttempts = 2;
    
    while (attempts < maxAttempts) {
      const { data: resultData, error: resultError } = await supabase
        .from('beds')
        .update(cleanUpdates)
        .eq('id', bedId)
        .eq('version', version) // Só atualiza se a versão for a mesma
        .select()
        .single();
      
      data = resultData;
      error = resultError;
      
      // Se não houve erro, sair do loop
      if (!error) {
        break;
      }
      
      // Extrair informações do erro para verificar se é coluna não encontrada
      let errorMessage = '';
      let errorCode = '';
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = (error as any).message || (error as any).error || String(error) || '';
        errorCode = (error as any).code || (error as any).statusCode || '';
      } else {
        errorMessage = String(error);
      }
      
      // Se erro é de coluna não encontrada e temos campos opcionais, tentar novamente sem eles
      const isColumnError = errorMessage.includes('column') || 
                           errorCode === '42703' || 
                           errorMessage.includes('does not exist') ||
                           errorMessage.includes('schema cache') ||
                           errorMessage.includes('Could not find');
      
      if (
        attempts === 0 && 
        isColumnError &&
        optionalColumns.some(col => cleanUpdates.hasOwnProperty(col))
      ) {
        // Identificar qual coluna está causando o erro
        // A mensagem de erro geralmente contém o nome da coluna entre aspas simples
        const problematicColumn = optionalColumns.find(col => {
          const colLower = col.toLowerCase();
          const errorLower = errorMessage.toLowerCase();
          // Procurar por padrões como 'previsao_alta_24h_at' ou "previsao_alta_24h_at"
          return errorLower.includes(`'${colLower}'`) || 
                 errorLower.includes(`"${colLower}"`) ||
                 errorLower.includes(colLower);
        });
        
        if (problematicColumn) {
          // Remover apenas a coluna problemática
          console.log(`⚠️ Coluna opcional não encontrada: ${problematicColumn}. Removendo do update.`);
          delete cleanUpdates[problematicColumn];
          attempts++;
          continue; // Tentar novamente sem a coluna problemática
        } else {
          // Se não identificou, remover todas as colunas opcionais que estão no update
          console.log(`⚠️ Erro de coluna detectado. Removendo todas as colunas opcionais: ${optionalColumns.join(', ')}`);
          optionalColumns.forEach(col => {
            if (cleanUpdates.hasOwnProperty(col)) {
              delete cleanUpdates[col];
            }
          });
          attempts++;
          continue; // Tentar novamente sem os campos opcionais
        }
      }
      
      // Se não é erro de coluna ou já tentamos, sair do loop
      break;
    }

    if (error) {
      // Extrair informações do erro de forma mais robusta
      let errorMessage = '';
      let errorCode = '';
      let errorDetails = '';
      
      // Tentar diferentes formas de acessar o erro
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        // Tentar acessar propriedades comuns do PostgrestError
        errorMessage = (error as any).message || (error as any).error || String(error) || '';
        errorCode = (error as any).code || (error as any).statusCode || '';
        errorDetails = (error as any).details || (error as any).hint || '';
      } else {
        errorMessage = String(error);
      }
      
      // Verificar PRIMEIRO se é conflito de versão (PGRST116 = nenhuma linha atualizada)
      // Isso deve ser tratado antes de qualquer outro erro
      if (errorCode === 'PGRST116' || 
          errorMessage.includes('0 rows') || 
          errorMessage.includes('No rows') ||
          errorDetails?.includes('0 rows')) {
        // Log silencioso - conflito de versão é esperado em sistemas concorrentes
        // console.log('⚠️ Conflito de versão detectado - nenhuma linha foi atualizada');
        return { success: false, needsRefetch: true };
      }
      
      // Log detalhado apenas para outros tipos de erro (que não foram tratados no loop)
      // Se chegou aqui, significa que já tentamos remover campos opcionais e ainda há erro
      console.error('🔴 updateWithVersion - Erro após remover campos opcionais:', {
        message: errorMessage,
        code: errorCode,
        details: errorDetails,
        type: typeof error,
        campos_tentados: Object.keys(cleanUpdates)
      });
      
      // Se erro de coluna não encontrada e já tentamos remover campos opcionais
      const isColumnError = errorMessage.includes('column') || 
                           errorCode === '42703' || 
                           errorMessage.includes('does not exist') ||
                           errorMessage.includes('schema cache');
      
      if (isColumnError) {
        // Se ainda é erro de coluna após tentar remover campos opcionais,
        // pode ser que a coluna realmente não exista e não seja opcional
        console.error('❌ Erro de coluna não encontrada. Verifique se a migração foi executada.');
        console.error(`   Coluna problemática mencionada no erro: ${errorMessage}`);
        // toast não está disponível aqui, será tratado na função chamadora
        throw new Error(`Campo não encontrado no banco de dados: ${errorMessage}`);
      }
      
      // Se erro de constraint ou validação
      if (errorMessage.includes('violates') || errorMessage.includes('constraint') || errorCode === '23505' || errorCode === '23514') {
        console.error('❌ Erro de constraint:', errorMessage);
        throw new Error(`Dados inválidos: ${errorMessage}`);
      }
      
      // Se erro de autenticação
      if (errorMessage.includes('JWT') || errorCode === 'PGRST301') {
        console.error('❌ Erro de autenticação');
        throw new Error('Erro de autenticação. Verifique sua conexão.');
      }
      
      throw error;
    }

    // Se não retornou dados, pode ser conflito de versão
    if (!data) {
      console.log('⚠️ Nenhum dado retornado - possível conflito');
      return { success: false, needsRefetch: true };
    }

    // Verificar se a versão foi incrementada corretamente
    if (data.version !== version + 1) {
      console.log('⚠️ Versão não incrementada corretamente', { esperado: version + 1, atual: data.version });
      return { success: true, needsRefetch: true };
    }
    return { success: true, needsRefetch: false };
  } catch (err) {
    throw err;
  }
}

export function useActions() {
  const altaSinalizada = async (bedId: string, currentVersion?: number) => {
    try {
      const result = await updateWithVersion(
        bedId,
        currentVersion || 0,
        {
          state: 'Alta Sinalizada',
          alta_sinalizada_at: new Date().toISOString(),
        }
      );

      if (result.needsRefetch) {
        toast({ 
          title: 'Atualização concorrente detectada', 
          description: 'Dados recarregados',
          variant: 'destructive' 
        });
        return { needsRefetch: true };
      }

      if (result.success) {
        toast({ title: 'Alta sinalizada com sucesso' });
      }
    } catch (err: any) {
      console.error('Erro ao sinalizar alta:', err);
      toast({ 
        title: 'Erro ao sinalizar alta', 
        description: err?.message || 'Erro desconhecido',
        variant: 'destructive' 
      });
    }
    return { needsRefetch: false };
  };

  const altaEfetivada = async (bedId: string, currentVersion?: number) => {
    try {
      const result = await updateWithVersion(
        bedId,
        currentVersion || 0,
        {
          state: 'Alta Efetivada',
          alta_efetivada_at: new Date().toISOString(),
        }
      );

      if (result.needsRefetch) {
        toast({ 
          title: 'Atualização concorrente detectada', 
          description: 'Dados recarregados',
          variant: 'destructive' 
        });
        return { needsRefetch: true };
      }

      if (result.success) {
        toast({ title: 'Alta efetivada com sucesso' });
      }
    } catch (err: any) {
      console.error('Erro ao efetivar alta:', err);
      toast({ 
        title: 'Erro ao efetivar alta', 
        description: err?.message || 'Erro desconhecido',
        variant: 'destructive' 
      });
    }
    return { needsRefetch: false };
  };

  const cancelarAlta = async (bedId: string, motivo: string, currentVersion?: number) => {
    try {
      const result = await updateWithVersion(
        bedId,
        currentVersion || 0,
        {
          state: 'Alta Cancelada',
          alta_cancelada_at: new Date().toISOString(),
          observacao: `Alta cancelada: ${motivo}`,
        }
      );

      if (result.needsRefetch) {
        toast({ 
          title: 'Atualização concorrente detectada', 
          description: 'Dados recarregados',
          variant: 'destructive' 
        });
        return { needsRefetch: true };
      }

      if (result.success) {
        toast({ title: 'Alta cancelada', description: motivo });
      }
    } catch (err: any) {
      console.error('Erro ao cancelar alta:', err);
      toast({ 
        title: 'Erro ao cancelar alta', 
        description: err?.message || 'Erro desconhecido',
        variant: 'destructive' 
      });
    }
    return { needsRefetch: false };
  };

  const previsaoAlta24h = async (bedId: string, currentVersion?: number) => {
    try {
      const result = await updateWithVersion(
        bedId,
        currentVersion || 0,
        {
          state: 'Previsão de Alta em 24h',
          previsao_alta_24h_at: new Date().toISOString(),
        }
      );

      if (result.needsRefetch) {
        toast({ 
          title: 'Atualização concorrente detectada', 
          description: 'Dados recarregados',
          variant: 'destructive' 
        });
        return { needsRefetch: true };
      }

      if (result.success) {
        toast({ title: 'Previsão de alta em 24h registrada' });
      }
    } catch (err: any) {
      console.error('Erro ao registrar previsão de alta:', err);
      toast({ 
        title: 'Erro ao registrar previsão de alta', 
        description: err?.message || 'Erro desconhecido',
        variant: 'destructive' 
      });
    }
    return { needsRefetch: false };
  };

  const cancelarPrevisao = async (bedId: string, currentVersion?: number) => {
    try {
      const result = await updateWithVersion(
        bedId,
        currentVersion || 0,
        {
          state: 'Ocupado',
          previsao_alta_24h_at: null,
        }
      );

      if (result.needsRefetch) {
        toast({ 
          title: 'Atualização concorrente detectada', 
          description: 'Dados recarregados',
          variant: 'destructive' 
        });
        return { needsRefetch: true };
      }

      if (result.success) {
        toast({ title: 'Previsão de alta cancelada' });
      }
    } catch (err: any) {
      console.error('Erro ao cancelar previsão:', err);
      toast({ 
        title: 'Erro ao cancelar previsão', 
        description: err?.message || 'Erro desconhecido',
        variant: 'destructive' 
      });
    }
    return { needsRefetch: false };
  };

  const voltarParaOcupado = async (bedId: string, currentVersion?: number) => {
    try {
      const result = await updateWithVersion(
        bedId,
        currentVersion || 0,
        {
          state: 'Ocupado',
        }
      );

      if (result.needsRefetch) {
        toast({ 
          title: 'Atualização concorrente detectada', 
          description: 'Dados recarregados',
          variant: 'destructive' 
        });
        return { needsRefetch: true };
      }

      if (result.success) {
        toast({ title: 'Leito voltou para ocupado' });
      }
    } catch (err: any) {
      console.error('Erro ao voltar para ocupado:', err);
      toast({ 
        title: 'Erro ao atualizar leito', 
        description: err?.message || 'Erro desconhecido',
        variant: 'destructive' 
      });
    }
    return { needsRefetch: false };
  };

  const iniciarTransferencia = async (bedId: string, currentVersion?: number) => {
    try {
      const result = await updateWithVersion(
        bedId,
        currentVersion || 0,
        {
          state: 'Transferência',
          transfer_inicio_at: new Date().toISOString(),
        }
      );

      if (result.needsRefetch) {
        toast({ 
          title: 'Atualização concorrente detectada', 
          description: 'Dados recarregados',
          variant: 'destructive' 
        });
        return { needsRefetch: true };
      }

      if (result.success) {
        toast({ title: 'Transferência iniciada' });
      }
    } catch (err: any) {
      console.error('Erro ao iniciar transferência:', err);
      toast({ 
        title: 'Erro ao iniciar transferência', 
        description: err?.message || 'Erro desconhecido',
        variant: 'destructive' 
      });
    }
    return { needsRefetch: false };
  };

  const iniciarHigienizacao = async (bedId: string, currentVersion?: number) => {
    try {
      const result = await updateWithVersion(
        bedId,
        currentVersion || 0,
        {
          state: 'Higienização',
          higienizacao_inicio_at: new Date().toISOString(),
        }
      );

      if (result.needsRefetch) {
        toast({ 
          title: 'Atualização concorrente detectada', 
          description: 'Dados recarregados',
          variant: 'destructive' 
        });
        return { needsRefetch: true };
      }

      if (result.success) {
        toast({ title: 'Higienização iniciada' });
      }
    } catch (err: any) {
      console.error('Erro ao iniciar higienização:', err);
      toast({ 
        title: 'Erro ao iniciar higienização', 
        description: err?.message || 'Erro desconhecido',
        variant: 'destructive' 
      });
    }
    return { needsRefetch: false };
  };

  const finalizarHigienizacao = async (bedId: string, currentVersion?: number) => {
    try {
      // Resetar dados do leito quando fica vago
      const resetData: any = {
        state: 'Vago',
        higienizacao_fim_at: new Date().toISOString(),
        vago_since: new Date().toISOString(),
        // Resetar dados do paciente
        matricula: null,
        sexo: null,
        plano: null,
        isolamento: [],
        hd: false,
        observacao: null,
        last_initials: null,
        // Limpar timestamps de alta
        alta_sinalizada_at: null,
        alta_efetivada_at: null,
        alta_cancelada_at: null,
        previsao_alta_24h_at: null,
        transfer_inicio_at: null,
      };
      
      const result = await updateWithVersion(
        bedId,
        currentVersion || 0,
        resetData
      );

      if (result.needsRefetch) {
        toast({ 
          title: 'Atualização concorrente detectada', 
          description: 'Dados recarregados',
          variant: 'destructive' 
        });
        return { needsRefetch: true };
      }

      if (result.success) {
        toast({ title: 'Higienização finalizada - Leito vago e resetado' });
      }
    } catch (err: any) {
      console.error('Erro ao finalizar higienização:', err);
      toast({ 
        title: 'Erro ao finalizar higienização', 
        description: err?.message || 'Erro desconhecido',
        variant: 'destructive' 
      });
    }
    return { needsRefetch: false };
  };

  const criarReserva = async (
    bedId: string,
    data: {
      iniciais: string;
      sexo: 'M' | 'F' | null;
      matricula: string;
      origem: string;
    },
    currentVersion?: number
  ) => {
    try {
      // Criar reserva
      const { error: reservaError } = await supabase.from('reservations').insert({
        bed_id: bedId,
        iniciais: data.iniciais,
        sexo: data.sexo,
        matricula: data.matricula,
        origem: data.origem,
        is_active: true,
      });

      if (reservaError) throw reservaError;

      // Atualizar estado do leito com controle de versão
      const result = await updateWithVersion(
        bedId,
        currentVersion || 0,
        { state: 'Reservado' }
      );

      if (result.needsRefetch) {
        toast({ 
          title: 'Atualização concorrente detectada', 
          description: 'Dados recarregados',
          variant: 'destructive' 
        });
        return { needsRefetch: true };
      }

      if (result.success) {
        toast({ title: 'Leito reservado com sucesso' });
      }
    } catch (err: any) {
      console.error('Erro ao criar reserva:', err);
      toast({ 
        title: 'Erro ao criar reserva', 
        description: err?.message || 'Erro desconhecido',
        variant: 'destructive' 
      });
    }
    return { needsRefetch: false };
  };

  const liberarReserva = async (reservationId: string, bedId: string, currentVersion?: number) => {
    try {
      // Desativar reserva
      const { error: reservaError } = await supabase
        .from('reservations')
        .update({ is_active: false })
        .eq('id', reservationId);

      if (reservaError) throw reservaError;

      // Atualizar estado do leito para Vago e resetar dados
      const resetData: any = {
        state: 'Vago',
        vago_since: new Date().toISOString(),
        // Resetar dados do paciente
        matricula: null,
        sexo: null,
        plano: null,
        isolamento: [],
        hd: false,
        observacao: null,
        last_initials: null,
      };
      
      const result = await updateWithVersion(
        bedId,
        currentVersion || 0,
        resetData
      );

      if (result.needsRefetch) {
        toast({ 
          title: 'Atualização concorrente detectada', 
          description: 'Dados recarregados',
          variant: 'destructive' 
        });
        return { needsRefetch: true };
      }

      if (result.success) {
        toast({ title: 'Reserva liberada - Leito vago e resetado' });
      }
    } catch (err: any) {
      console.error('Erro ao liberar reserva:', err);
      toast({ 
        title: 'Erro ao liberar reserva', 
        description: err?.message || 'Erro desconhecido',
        variant: 'destructive' 
      });
    }
    return { needsRefetch: false };
  };

  const entradaConfirmada = async (
    bedId: string, 
    data?: {
      matricula?: string | null;
      sexo?: 'M' | 'F' | null;
      plano?: 'Apartamento' | 'Enfermaria' | null;
      isolamento?: string[];
      hd?: boolean;
      observacao?: string | null;
      iniciais?: string | null;
    },
    currentVersion?: number
  ) => {
    try {
      // Se tem dados adicionais, atualizar junto com o estado
      const updates: any = {
        state: 'Ocupado',
      };
      
      // Incluir dados se fornecidos
      if (data) {
        if (data.matricula !== undefined) updates.matricula = data.matricula || null;
        if (data.sexo !== undefined) updates.sexo = data.sexo;
        if (data.plano !== undefined) updates.plano = data.plano;
        if (data.isolamento !== undefined) updates.isolamento = data.isolamento || [];
        if (data.hd !== undefined) updates.hd = data.hd || false;
        if (data.observacao !== undefined) updates.observacao = data.observacao || null;
        // last_initials só será atualizado se a coluna existir no banco
        // Se a migração ainda não foi executada, este campo será ignorado
        if (data.iniciais !== undefined) {
          // Tentar incluir, mas não falhar se a coluna não existir
          updates.last_initials = data.iniciais || null;
        }
      }
      
      const result = await updateWithVersion(
        bedId,
        currentVersion || 0,
        updates
      );

      if (result.needsRefetch) {
        toast({ 
          title: 'Atualização concorrente detectada', 
          description: 'Dados recarregados',
          variant: 'destructive' 
        });
        return { needsRefetch: true };
      }

      if (result.success) {
        toast({ title: 'Entrada confirmada - Leito ocupado' });
      }
    } catch (err: any) {
      console.error('Erro ao confirmar entrada:', err);
      toast({ 
        title: 'Erro ao confirmar entrada', 
        description: err?.message || 'Erro desconhecido',
        variant: 'destructive' 
      });
    }
    return { needsRefetch: false };
  };

  const bloquear = async (bedId: string, motivo: string, currentVersion?: number) => {
    try {
      const result = await updateWithVersion(
        bedId,
        currentVersion || 0,
        { 
          state: 'Bloqueado',
          observacao: motivo || null
        }
      );

      if (result.needsRefetch) {
        toast({ 
          title: 'Atualização concorrente detectada', 
          description: 'Dados recarregados',
          variant: 'destructive' 
        });
        return { needsRefetch: true };
      }

      if (result.success) {
        toast({ title: 'Leito bloqueado' });
      }
    } catch (err: any) {
      console.error('Erro ao bloquear leito:', err);
      toast({ 
        title: 'Erro ao bloquear leito', 
        description: err?.message || 'Erro desconhecido',
        variant: 'destructive' 
      });
    }
    return { needsRefetch: false };
  };

  const editarLeito = async (
    bedId: string,
    data: {
      sexo: 'M' | 'F' | null;
      plano: 'Apartamento' | 'Enfermaria' | null;
      isolamento: string[];
      hd: boolean;
      observacao: string;
      matricula?: string | null;
    },
    currentVersion?: number
  ) => {
    try {
      const updates: any = {
        sexo: data.sexo,
        plano: data.plano,
        isolamento: data.isolamento,
        hd: data.hd,
        observacao: data.observacao,
      };
      
      // Sempre incluir matrícula (pode ser null)
      // Mas só se a coluna existir (verificar antes de incluir)
      if (data.matricula !== undefined) {
        updates.matricula = data.matricula || null;
      }
      
      const result = await updateWithVersion(
        bedId,
        currentVersion || 0,
        updates
      );

      if (result.needsRefetch) {
        toast({ 
          title: 'Atualização concorrente detectada', 
          description: 'Dados recarregados',
          variant: 'destructive' 
        });
        return { needsRefetch: true };
      }

      if (result.success) {
        console.log('✅ Leito atualizado com sucesso');
        toast({ title: 'Leito atualizado com sucesso' });
      }
      
      return { needsRefetch: false };
    } catch (err: any) {
      console.error('❌ Erro ao editar leito - Detalhes completos:', {
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        code: err?.code,
        error: err
      });
      
      // Se erro de coluna não encontrada, sugerir executar migração
      if (err?.message?.includes('column') || err?.code === '42703') {
        toast({ 
          title: 'Erro de banco de dados', 
          description: 'Campo não encontrado. Execute a migração de matrícula no Supabase.',
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'Erro ao editar leito', 
          description: err?.message || 'Erro desconhecido',
          variant: 'destructive' 
        });
      }
      
      return { needsRefetch: false };
    }
  };

  const liberarBloqueio = async (bedId: string, currentVersion?: number) => {
    try {
      // Atualizar estado do leito para Vago e resetar dados
      const resetData: any = {
        state: 'Vago',
        vago_since: new Date().toISOString(),
        // Resetar dados do paciente
        matricula: null,
        sexo: null,
        plano: null,
        isolamento: [],
        hd: false,
        observacao: null,
        last_initials: null,
      };
      
      const result = await updateWithVersion(
        bedId,
        currentVersion || 0,
        resetData
      );

      if (result.needsRefetch) {
        toast({ 
          title: 'Atualização concorrente detectada', 
          description: 'Dados recarregados',
          variant: 'destructive' 
        });
        return { needsRefetch: true };
      }

      if (result.success) {
        toast({ title: 'Bloqueio liberado - Leito vago e resetado' });
      }
    } catch (err: any) {
      console.error('Erro ao liberar bloqueio:', err);
      toast({ 
        title: 'Erro ao liberar bloqueio', 
        description: err?.message || 'Erro desconhecido',
        variant: 'destructive' 
      });
    }
    return { needsRefetch: false };
  };

  return {
    altaSinalizada,
    altaEfetivada,
    cancelarAlta,
    previsaoAlta24h,
    cancelarPrevisao,
    voltarParaOcupado,
    iniciarTransferencia,
    iniciarHigienizacao,
    finalizarHigienizacao,
    criarReserva,
    liberarReserva,
    entradaConfirmada,
    bloquear,
    liberarBloqueio,
    editarLeito,
  };
}

