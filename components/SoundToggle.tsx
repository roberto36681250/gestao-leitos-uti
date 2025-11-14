'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

interface SoundToggleProps {
  onStateChange?: (enabled: boolean) => void;
}

export function SoundToggle({ onStateChange }: SoundToggleProps) {
  const [enabled, setEnabled] = useState(true);

  const playPing = () => {
    if (!enabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (err) {
      // Ignorar erros de áudio
    }
  };

  const toggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    onStateChange?.(newState);
  };

  // Expor função para uso externo
  useEffect(() => {
    (window as any).playPingSound = playPing;
    return () => {
      delete (window as any).playPingSound;
    };
  }, [enabled]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="h-9 px-3"
      aria-label={enabled ? 'Desativar som' : 'Ativar som'}
    >
      {enabled ? (
        <Volume2 className="h-4 w-4" />
      ) : (
        <VolumeX className="h-4 w-4" />
      )}
      <span className="ml-2 text-xs">Som</span>
    </Button>
  );
}

