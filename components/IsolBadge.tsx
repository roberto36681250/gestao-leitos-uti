'use client';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Isolamento } from '@/lib/types';

interface IsolBadgeProps {
  isolamentos: Isolamento[];
}

const isolamentoAbbr: Record<string, string> = {
  Vigilância: 'VIG',
  Contato: 'CONT',
  Respiratório: 'RESP',
  Gotículas: 'GOT',
};

export function IsolBadge({ isolamentos }: IsolBadgeProps) {
  const abbrs = isolamentos.map((iso) => isolamentoAbbr[iso] || iso);
  
  // Formatar abreviação para o badge
  const formatAbbr = () => {
    if (abbrs.length === 0) return '';
    if (abbrs.length === 1) return abbrs[0];
    if (abbrs.length === 2) return `${abbrs[0]}+${abbrs[1]}`;
    return `${abbrs[0]}+${abbrs[1]}+`;
  };

  const badgeText = formatAbbr();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="absolute top-0 right-0 bg-yellow-400 text-zinc-900 ring-1 ring-zinc-800 text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg shadow-sm z-10 flex items-center gap-0.5 cursor-pointer hover:bg-yellow-500 transition-colors">
          <span>🛡️</span>
          <span>ISOL</span>
          {badgeText && <span className="ml-0.5">{badgeText}</span>}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="end">
        <div className="flex flex-wrap gap-1.5">
          {abbrs.map((abbr, idx) => (
            <span
              key={idx}
              className="px-2 py-1 text-xs font-semibold bg-zinc-100 text-zinc-900 rounded border border-zinc-300"
            >
              [{abbr}]
            </span>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

