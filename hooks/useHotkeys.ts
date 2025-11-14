'use client';

import { useEffect } from 'react';

interface HotkeyConfig {
  key: string;
  action: () => void;
  description?: string;
}

export function useHotkeys(hotkeys: HotkeyConfig[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar se estiver digitando em input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // Verificar se é uma combinação de teclas (ex: Shift+R)
      const keyCombo = e.shiftKey ? `Shift+${e.key}` : e.key;
      const hotkey = hotkeys.find((h) => {
        if (h.key.includes('+')) {
          return h.key.toLowerCase() === keyCombo.toLowerCase();
        }
        return h.key.toLowerCase() === e.key.toLowerCase();
      });
      
      if (hotkey) {
        e.preventDefault();
        hotkey.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hotkeys, enabled]);
}

