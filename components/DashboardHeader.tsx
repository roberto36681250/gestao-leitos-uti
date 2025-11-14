'use client'

import { Bed } from '@/types/bed'
import { STATE_COLORS } from '@/lib/constants'

interface DashboardHeaderProps {
  beds: Bed[]
}

export default function DashboardHeader({ beds }: DashboardHeaderProps) {
  const stats = beds.reduce((acc, bed) => {
    acc[bed.state] = (acc[bed.state] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const statItems = [
    { label: 'Disponível', count: stats['Disponível'] || 0, color: STATE_COLORS['Disponível'] },
    { label: 'Reservado', count: stats['Reservado'] || 0, color: STATE_COLORS['Reservado'] },
    { label: 'Ocupado', count: stats['Ocupado'] || 0, color: STATE_COLORS['Ocupado'] },
    { label: 'Higiene', count: stats['Higiene'] || 0, color: STATE_COLORS['Higiene'] },
    { label: 'Manutenção', count: stats['Manutenção'] || 0, color: STATE_COLORS['Manutenção'] },
    { label: 'Bloqueado', count: stats['Bloqueado'] || 0, color: STATE_COLORS['Bloqueado'] },
    { label: 'Previsão de Alta', count: stats['Previsão de Alta'] || 0, color: STATE_COLORS['Previsão de Alta'] },
    { label: 'Alta Dada', count: stats['Alta Dada'] || 0, color: STATE_COLORS['Alta Dada'] }
  ]

  return (
    <div className="bg-black border-b border-white/10 p-6">
      {/* Título */}
      <h1 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
        UTI CRUZ AZUL
      </h1>

      {/* Estatísticas */}
      <div className="grid grid-cols-8 gap-4">
        {statItems.map((item) => (
          <div
            key={item.label}
            className="rounded-xl p-3 text-center transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: '#000',
              border: `2px solid ${item.color}`,
              boxShadow: `0 0 15px ${item.color}60`
            }}
          >
            <div className="text-2xl font-bold" style={{ color: item.color }}>
              {item.count}
            </div>
            <div className="text-xs text-white/80 mt-1">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
