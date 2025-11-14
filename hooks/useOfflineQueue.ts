'use client';

import { useState, useEffect, useCallback } from 'react';

const OFFLINE_QUEUE_KEY = 'gestao-leitos-offline-queue';

interface QueuedAction {
  id: string;
  bedId: string;
  action: string;
  data: any;
  timestamp: number;
}

export function useOfflineQueue(isOnline: boolean) {
  const [queue, setQueue] = useState<QueuedAction[]>([]);

  useEffect(() => {
    // Carregar fila do localStorage
    const saved = localStorage.getItem(OFFLINE_QUEUE_KEY);
    if (saved) {
      try {
        setQueue(JSON.parse(saved));
      } catch (err) {
        console.error('Erro ao carregar fila offline:', err);
      }
    }
  }, []);

  useEffect(() => {
    // Salvar fila no localStorage
    if (queue.length > 0) {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } else {
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
    }
  }, [queue]);

  const addToQueue = useCallback((bedId: string, action: string, data: any) => {
    const newAction: QueuedAction = {
      id: `${Date.now()}-${Math.random()}`,
      bedId,
      action,
      data,
      timestamp: Date.now(),
    };
    setQueue((prev) => [...prev, newAction]);
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue((prev) => prev.filter((action) => action.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  }, []);

  const processQueue = useCallback(async (processAction: (action: QueuedAction) => Promise<void>) => {
    if (!isOnline || queue.length === 0) {
      return Promise.resolve();
    }

    // Processar todas as ações da fila
    const actionsToProcess = [...queue];
    clearQueue();

    const results = [];
    for (const action of actionsToProcess) {
      try {
        await processAction(action);
        results.push({ success: true, action });
      } catch (err) {
        console.error('Erro ao processar ação offline:', err);
        // Re-adicionar à fila se falhar
        setQueue((prev) => [...prev, action]);
        results.push({ success: false, action, error: err });
      }
    }
    
    return Promise.resolve(results);
  }, [isOnline, queue, clearQueue]);

  return {
    queue,
    queueLength: queue.length,
    addToQueue,
    removeFromQueue,
    clearQueue,
    processQueue,
  };
}

