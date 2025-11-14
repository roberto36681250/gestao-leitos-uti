'use client'

import { Bed } from '@/lib/types'
import { STATE_COLORS } from '@/lib/constants'
import { useState } from 'react'

interface BedCardCompactProps {
  bed: Bed
  onUpdateState: (bedId: string, newState: string) => Promise<void>
}

export default function BedCardCompact({ bed, onUpdateState }: BedCardCompactProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const color = STATE_COLORS[bed.state as keyof typeof STATE_COLORS] || '#666'

  const handleClick = async () => {
    if (isUpdating) return

    const states = [
      'Disponível',
      'Reservado',
      'Ocupado',
      'Higiene',
      'Manutenção',
      'Bloqueado',
      'Previsão de Alta',
      'Alta Dada'
    ]

    const currentIndex = states.indexOf(bed.state)
    const nextState = states[(currentIndex + 1) % states.length]

    setIsUpdating(true)
    try {
      await onUpdateState(bed.id, nextState)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isUpdating}
      className="relative w-full h-24 rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50"
      style={{
        backgroundColor: '#000',
        border: `3px solid ${color}`,
        boxShadow: `0 0 20px ${color}80, inset 0 0 20px ${color}20`
      }}
    >
      {/* Número do Leito */}
      <div className="absolute top-2 left-3 text-2xl font-bold" style={{ color }}>
        {bed.bed_number}
      </div>

      {/* Estado */}
      <div className="absolute bottom-2 left-3 right-3 text-xs font-semibold text-white/90">
        {bed.state}
      </div>

      {/* Efeito de brilho */}
      <div
        className="absolute inset-0 rounded-2xl opacity-30"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}40, transparent 70%)`
        }}
      />
    </button>
  )
}
