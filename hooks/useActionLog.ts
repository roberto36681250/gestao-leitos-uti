'use client';

import { useState, useEffect } from 'react';

interface ActionLog {
  bedNumber: number;
  action: string;
  details?: string;
  timestamp: string;
}

const ATA_KEY = 'gestao-leitos-ata';

export function useActionLog() {
  const [logs, setLogs] = useState<ActionLog[]>([]);

  useEffect(() => {
    // Carregar logs do localStorage
    const saved = localStorage.getItem(ATA_KEY);
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (err) {
        console.error('Erro ao carregar ata:', err);
      }
    }

    // Listener para mudanças no localStorage de outras abas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ATA_KEY && e.newValue) {
        try {
          setLogs(JSON.parse(e.newValue));
        } catch (err) {
          console.error('Erro ao atualizar ata:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Polling para atualizar localmente (mesma aba)
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem(ATA_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setLogs((prev) => {
            // Só atualizar se mudou
            if (JSON.stringify(prev) !== JSON.stringify(parsed)) {
              return parsed;
            }
            return prev;
          });
        } catch (err) {
          // Ignorar erro
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return logs;
}

