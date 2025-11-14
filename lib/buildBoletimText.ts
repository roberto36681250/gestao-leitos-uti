import type { BedWithReservation } from './types';

// Abreviações de isolamento
const isolamentoAbbr: Record<string, string> = {
  Vigilância: 'VIG',
  Contato: 'CONT',
  Respiratório: 'RESP',
  Gotículas: 'GOT',
};

/**
 * Gera texto do boletim informativo para WhatsApp
 * @param beds Lista de leitos com reservas
 * @returns String formatada para WhatsApp
 */
export function buildBoletimText(beds: BedWithReservation[]): string {
  const now = new Date();
  const hour = now.getHours().toString().padStart(2, '0');
  const minute = now.getMinutes().toString().padStart(2, '0');
  
  let text = `Hospital Cruz Azul - Boletim das ${hour}:${minute}\n\n`;

  // Leitos Ocupados - apenas total
  const ocupados = beds
    .filter((b) => b.state === 'Ocupado')
    .sort((a, b) => a.number - b.number);

  const ocupadosCount = ocupados.length;
  text += `Leitos Ocupados: ${ocupadosCount.toString().padStart(2, '0')}\n\n`;

  // Altas Sinalizadas - com detalhes completos
  const altasSinalizadas = beds
    .filter((b) => b.state === 'Alta Sinalizada')
    .sort((a, b) => a.number - b.number);

  const altasCount = altasSinalizadas.length;
  text += `Altas Sinalizadas: ${altasCount.toString().padStart(2, '0')}\n`;
  
  if (altasCount > 0) {
    altasSinalizadas.forEach((bed) => {
      const parts: string[] = [`Leito ${bed.number}`];
      
      // Sexo
      if (bed.sexo) {
        parts.push(bed.sexo === 'M' ? 'masc' : 'fem');
      }
      
      // Plano
      if (bed.plano) {
        parts.push(bed.plano === 'Apartamento' ? 'Apt' : 'Enf');
      }
      
      // Matrícula
      if (bed.matricula) {
        parts.push(`Mat: ${bed.matricula}`);
      }
      
      // Isolamento
      if (bed.isolamento.length > 0) {
        const isolStr = bed.isolamento.map((iso) => isolamentoAbbr[iso] || iso).join('+');
        parts.push(`Isolamento: ${isolStr}`);
      }
      
      // HD
      if (bed.hd) {
        parts.push('HD');
      }
      
      text += `  . ${parts.join(', ')}\n`;
    });
  }
  text += '\n';

  // Previsão de Alta em 24h - com detalhes completos
  const previsaoAlta = beds
    .filter((b) => b.state === 'Previsão de Alta em 24h')
    .sort((a, b) => a.number - b.number);

  const previsaoCount = previsaoAlta.length;
  text += `Previsão de Alta em 24h: ${previsaoCount.toString().padStart(2, '0')}\n`;
  
  if (previsaoCount > 0) {
    previsaoAlta.forEach((bed) => {
      const parts: string[] = [`Leito ${bed.number}`];
      
      // Sexo
      if (bed.sexo) {
        parts.push(bed.sexo === 'M' ? 'masc' : 'fem');
      }
      
      // Plano
      if (bed.plano) {
        parts.push(bed.plano === 'Apartamento' ? 'Apt' : 'Enf');
      }
      
      // Matrícula
      if (bed.matricula) {
        parts.push(`Mat: ${bed.matricula}`);
      }
      
      // Isolamento
      if (bed.isolamento.length > 0) {
        const isolStr = bed.isolamento.map((iso) => isolamentoAbbr[iso] || iso).join('+');
        parts.push(`Isolamento: ${isolStr}`);
      }
      
      // HD
      if (bed.hd) {
        parts.push('HD');
      }
      
      text += `  . ${parts.join(', ')}\n`;
    });
  }
  text += '\n';

  // Leitos Vagos - lista simples
  const vagos = beds
    .filter((b) => b.state === 'Vago')
    .sort((a, b) => a.number - b.number)
    .map((b) => b.number);

  const vagosCount = vagos.length;
  text += `Leitos Vagos: ${vagosCount.toString().padStart(2, '0')}\n`;
  
  if (vagosCount > 0) {
    vagos.forEach((num) => {
      text += `  . Leito ${num}\n`;
    });
  }
  text += '\n';

  // Leitos Reservados - lista simples
  const reservados = beds
    .filter((b) => b.state === 'Reservado')
    .sort((a, b) => a.number - b.number)
    .map((b) => b.number);

  const reservadosCount = reservados.length;
  text += `Leitos Reservados: ${reservadosCount.toString().padStart(2, '0')}\n`;
  
  if (reservadosCount > 0) {
    reservados.forEach((num) => {
      text += `  . Leito ${num}\n`;
    });
  }
  text += '\n';

  // Leitos Bloqueados - com motivo
  const bloqueados = beds
    .filter((b) => b.state === 'Bloqueado')
    .sort((a, b) => a.number - b.number);

  const bloqueadosCount = bloqueados.length;
  text += `Leitos Bloqueados: ${bloqueadosCount.toString().padStart(2, '0')}\n`;
  
  if (bloqueadosCount > 0) {
    bloqueados.forEach((bed) => {
      const parts: string[] = [`Leito ${bed.number}`];
      
      // Motivo (observacao)
      if (bed.observacao) {
        parts.push(`(${bed.observacao})`);
      }
      
      text += `  . ${parts.join(' ')}\n`;
    });
  }

  return text.trim();
}

