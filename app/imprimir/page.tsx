'use client';

import { useBedsRealtime } from '@/hooks/useBedsRealtime';
import { buildBoletimText } from '@/lib/buildBoletimText';
import { useEffect, useState } from 'react';

export default function ImprimirPage() {
  const { beds, loading } = useBedsRealtime();
  const [boletim, setBoletim] = useState('');

  useEffect(() => {
    if (!loading && beds.length > 0) {
      setBoletim(buildBoletimText(beds));
    }
  }, [beds, loading]);

  // Copiar para clipboard ao carregar
  useEffect(() => {
    if (boletim) {
      navigator.clipboard.writeText(boletim).catch(() => {
        // Ignorar erro de clipboard
      });
    }
  }, [boletim]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg text-gray-600">Carregando boletim...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8 print:p-4">
      <div className="max-w-2xl mx-auto">
        <pre className="whitespace-pre-wrap font-mono text-base leading-relaxed text-gray-900">
          {boletim}
        </pre>
        <div className="mt-4 text-xs text-gray-500 text-center">
          Boletim copiado para a área de transferência
        </div>
      </div>
    </div>
  );
}

