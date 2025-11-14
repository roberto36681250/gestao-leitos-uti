import { buildBoletimText } from '@/lib/buildBoletimText';
import type { BedWithReservation } from '@/lib/types';

describe('buildBoletimText', () => {
  const mockBeds: BedWithReservation[] = [
    {
      id: '1',
      number: 21,
      state: 'Vago',
      sexo: null,
      plano: null,
      isolamento: [],
      hd: false,
      observacao: null,
      matricula: null,
      alta_sinalizada_at: null,
      alta_efetivada_at: null,
      alta_cancelada_at: null,
      previsao_alta_24h_at: null,
      transfer_inicio_at: null,
      higienizacao_inicio_at: null,
      higienizacao_fim_at: new Date('2024-01-01T08:00:00Z').toISOString(),
      vago_since: new Date('2024-01-01T08:00:00Z').toISOString(),
      version: 1,
      last_initials: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      number: 22,
      state: 'Ocupado',
      sexo: 'M',
      plano: 'SUS',
      isolamento: [],
      hd: false,
      observacao: null,
      matricula: null,
      alta_sinalizada_at: null,
      alta_efetivada_at: null,
      alta_cancelada_at: null,
      previsao_alta_24h_at: null,
      transfer_inicio_at: null,
      higienizacao_inicio_at: null,
      higienizacao_fim_at: null,
      vago_since: null,
      version: 1,
      last_initials: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      number: 23,
      state: 'Reservado',
      sexo: null,
      plano: null,
      isolamento: [],
      hd: false,
      observacao: null,
      matricula: null,
      alta_sinalizada_at: null,
      alta_efetivada_at: null,
      alta_cancelada_at: null,
      previsao_alta_24h_at: null,
      transfer_inicio_at: null,
      higienizacao_inicio_at: null,
      higienizacao_fim_at: null,
      vago_since: null,
      version: 1,
      last_initials: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      reservation: {
        id: 'r1',
        bed_id: '3',
        iniciais: 'J.S.',
        sexo: 'M',
        matricula: '123456',
        origem: 'Emergência',
        is_active: true,
        created_at: new Date().toISOString(),
      },
    },
    {
      id: '4',
      number: 24,
      state: 'Alta Sinalizada',
      sexo: 'F',
      plano: 'Particular',
      isolamento: [],
      hd: false,
      observacao: null,
      matricula: null,
      alta_sinalizada_at: new Date().toISOString(),
      alta_efetivada_at: null,
      alta_cancelada_at: null,
      previsao_alta_24h_at: null,
      transfer_inicio_at: null,
      higienizacao_inicio_at: null,
      higienizacao_fim_at: null,
      vago_since: null,
      version: 1,
      last_initials: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '5',
      number: 25,
      state: 'Higienização',
      sexo: null,
      plano: null,
      isolamento: [],
      hd: false,
      observacao: null,
      matricula: null,
      alta_sinalizada_at: null,
      alta_efetivada_at: null,
      alta_cancelada_at: null,
      previsao_alta_24h_at: null,
      transfer_inicio_at: null,
      higienizacao_inicio_at: new Date().toISOString(),
      higienizacao_fim_at: null,
      vago_since: null,
      version: 1,
      last_initials: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '6',
      number: 26,
      state: 'Previsão de Alta em 24h',
      sexo: 'M',
      plano: 'Apartamento',
      isolamento: ['Vigilância'],
      hd: true,
      observacao: null,
      matricula: '789012',
      alta_sinalizada_at: null,
      alta_efetivada_at: null,
      alta_cancelada_at: null,
      previsao_alta_24h_at: new Date().toISOString(),
      transfer_inicio_at: null,
      higienizacao_inicio_at: null,
      higienizacao_fim_at: null,
      vago_since: null,
      version: 1,
      last_initials: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  it('deve gerar boletim com todas as seções', () => {
    const boletim = buildBoletimText(mockBeds);

    expect(boletim).toContain('BOLETIM DE LEITOS');
    expect(boletim).toContain('LEITOS VAGOS');
    expect(boletim).toContain('LEITOS RESERVADOS');
    expect(boletim).toContain('ALTAS SINALIZADAS');
    expect(boletim).toContain('EM HIGIENIZAÇÃO');
    expect(boletim).toContain('LEITOS OCUPADOS');
    expect(boletim).toContain('RESUMO GERAL');
  });

  it('deve listar leitos vagos corretamente', () => {
    const boletim = buildBoletimText(mockBeds);

    expect(boletim).toContain('Leito 21');
    expect(boletim).toContain('LEITOS VAGOS (1)');
  });

  it('deve listar leitos reservados com iniciais', () => {
    const boletim = buildBoletimText(mockBeds);

    expect(boletim).toContain('Leito 23');
    expect(boletim).toContain('J.S.');
    expect(boletim).toContain('Emergência');
    expect(boletim).toContain('LEITOS RESERVADOS (1)');
  });

  it('deve listar altas sinalizadas', () => {
    const boletim = buildBoletimText(mockBeds);

    expect(boletim).toContain('Leito 24');
    expect(boletim).toContain('ALTAS SINALIZADAS (1)');
  });

  it('deve contar leitos ocupados', () => {
    const boletim = buildBoletimText(mockBeds);

    expect(boletim).toContain('LEITOS OCUPADOS: 1');
  });

  it('deve gerar resumo geral correto', () => {
    const boletim = buildBoletimText(mockBeds);

    expect(boletim).toContain('Total de leitos: 5');
    expect(boletim).toContain('Vagos: 1');
    expect(boletim).toContain('Ocupados: 1');
    expect(boletim).toContain('Reservados: 1');
    expect(boletim).toContain('Em higienização: 1');
  });

  it('deve funcionar com lista vazia', () => {
    const boletim = buildBoletimText([]);

    expect(boletim).toContain('BOLETIM DE LEITOS');
    expect(boletim).toContain('Total de leitos: 0');
  });

  it('deve listar leitos com previsão de alta em 24h', () => {
    const boletim = buildBoletimText(mockBeds);

    expect(boletim).toContain('Previsão de Alta em 24h: 01');
    expect(boletim).toContain('Leito 26');
    expect(boletim).toContain('masc');
    expect(boletim).toContain('Apt');
    expect(boletim).toContain('Mat: 789012');
    expect(boletim).toContain('Isolamento: VIG');
    expect(boletim).toContain('HD');
  });
});

