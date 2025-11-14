'use client'

import { Bed } from '@/lib/types'
import { STATE_COLORS } from '@/lib/constants'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface BoletimProps {
  beds: Bed[]
}

export default function Boletim({ beds }: BoletimProps) {
  const now = new Date()
  const dateStr = format(now, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })

  const stats = beds.reduce((acc, bed) => {
    acc[bed.state] = (acc[bed.state] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalBeds = beds.length
  const ocupados = stats['Ocupado'] || 0
  const disponiveis = stats['Disponível'] || 0
  const reservados = stats['Reservado'] || 0
  const higiene = stats['Higiene'] || 0
  const manutencao = stats['Manutenção'] || 0
  const bloqueados = stats['Bloqueado'] || 0
  const previsaoAlta = stats['Previsão de Alta'] || 0
  const altaDada = stats['Alta Dada'] || 0

  const taxaOcupacao = totalBeds > 0 ? ((ocupados / totalBeds) * 100).toFixed(1) : '0.0'

  return (
    <div className="bg-black text-white p-8 rounded-xl border border-white/20 max-w-4xl mx-auto">
      {/* Cabeçalho */}
      <div className="text-center mb-6 border-b border-white/20 pb-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
          BOLETIM DE LEITOS - UTI CRUZ AZUL
        </h1>
        <p className="text-sm text-white/70">{dateStr}</p>
      </div>

      {/* Resumo Geral */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3 text-cyan-400">Resumo Geral</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="text-sm text-white/60 mb-1">Total de Leitos</div>
            <div className="text-3xl font-bold text-white">{totalBeds}</div>
          </div>
          <div className="bg-white/5 p-4 rounded-lg border border-white/10">
            <div className="text-sm text-white/60 mb-1">Taxa de Ocupação</div>
            <div className="text-3xl font-bold" style={{ color: STATE_COLORS['Ocupado'] }}>
              {taxaOcupacao}%
            </div>
          </div>
        </div>
      </div>

      {/* Detalhamento por Estado */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3 text-cyan-400">Detalhamento por Estado</h2>
        <div className="space-y-2">
          <StatusRow label="Disponível" count={disponiveis} total={totalBeds} color={STATE_COLORS['Disponível']} />
          <StatusRow label="Ocupado" count={ocupados} total={totalBeds} color={STATE_COLORS['Ocupado']} />
          <StatusRow label="Reservado" count={reservados} total={totalBeds} color={STATE_COLORS['Reservado']} />
          <StatusRow label="Higiene" count={higiene} total={totalBeds} color={STATE_COLORS['Higiene']} />
          <StatusRow label="Manutenção" count={manutencao} total={totalBeds} color={STATE_COLORS['Manutenção']} />
          <StatusRow label="Bloqueado" count={bloqueados} total={totalBeds} color={STATE_COLORS['Bloqueado']} />
          <StatusRow label="Previsão de Alta" count={previsaoAlta} total={totalBeds} color={STATE_COLORS['Previsão de Alta']} />
          <StatusRow label="Alta Dada" count={altaDada} total={totalBeds} color={STATE_COLORS['Alta Dada']} />
        </div>
      </div>

      {/* Lista de Leitos */}
      <div>
        <h2 className="text-xl font-semibold mb-3 text-cyan-400">Lista de Leitos</h2>
        <div className="grid grid-cols-5 gap-2">
          {beds.map((bed) => {
            const color = STATE_COLORS[bed.state as keyof typeof STATE_COLORS] || '#666'
            return (
              <div
                key={bed.id}
                className="p-2 rounded-lg text-center text-xs"
                style={{
                  backgroundColor: '#000',
                  border: `2px solid ${color}`,
                  boxShadow: `0 0 10px ${color}40`
                }}
              >
                <div className="font-bold" style={{ color }}>
                  {bed.bed_number}
                </div>
                <div className="text-white/60 mt-1 truncate">{bed.state}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatusRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0'
  
  return (
    <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div 
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}80` }}
        />
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-2xl font-bold" style={{ color }}>
          {count}
        </span>
        <span className="text-sm text-white/60 w-16 text-right">
          ({percentage}%)
        </span>
      </div>
    </div>
  )
}
