'use client';

import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { buildBoletimText } from '@/lib/buildBoletimText';
import type { BedWithReservation } from '@/lib/types';

interface ShareButtonProps {
  beds: BedWithReservation[];
}

export function ShareButton({ beds }: ShareButtonProps) {
  const handleShare = async () => {
    const boletim = buildBoletimText(beds);
    
    // Tentar usar Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Boletim UTI Cruz Azul',
          text: boletim,
        });
        return;
      } catch (err) {
        // Usuário cancelou ou erro, fazer fallback
        if ((err as Error).name !== 'AbortError') {
          console.error('Erro ao compartilhar:', err);
        }
      }
    }
    
    // Fallback: copiar para clipboard
    try {
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
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare} className="h-9 px-3">
      <Share2 className="h-4 w-4 mr-1.5" />
      Compartilhar
    </Button>
  );
}

