'use client'

import { Bed } from '@/lib/types'
import BedCardCompact from './BedCardCompact'

interface BoardGridCompactProps {
  beds: Bed[]
  onUpdateState: (bedId: string, newState: string) => Promise<void>
}

export default function BoardGridCompact({ beds, onUpdateState }: BoardGridCompactProps) {
  return (
    <div className="grid grid-cols-4 gap-4 p-6">
      {beds.map((bed) => (
        <BedCardCompact key={bed.id} bed={bed} onUpdateState={onUpdateState} />
      ))}
    </div>
  )
}
