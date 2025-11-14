'use client';

import { Button } from '@/components/ui/button';
import { FileText, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { buildBoletimText } from '@/lib/buildBoletimText';
import type { BedWithReservation } from '@/lib/types';

interface BoletimButtonProps {
  beds: BedWithReservation[];
}

export function BoletimButton({ beds }: BoletimButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleGerarBoletim = async () => {
    try {
      const boletim = buildBoletimText(beds);
      await navigator.clipboard.writeText(boletim);
      setCopied(true);
      toast({
        title: 'Boletim copiado!',
        description: 'Texto copiado para a área de transferência.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'Erro ao copiar',
        description: 'Não foi possível copiar o boletim.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      onClick={handleGerarBoletim}
      className="h-10 px-4"
      variant="default"
      aria-label="Gerar boletim informativo"
    >
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Copiado!
        </>
      ) : (
        <>
          <FileText className="mr-2 h-4 w-4" />
          Boletim
        </>
      )}
    </Button>
  );
}

