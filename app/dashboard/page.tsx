'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Bed } from '@/types/bed'
import BoardGridCompact from '@/components/BoardGridCompact'
import DashboardHeader from '@/components/DashboardHeader'

export default function DashboardPage() {
  const [beds, setBeds] = useState<Bed[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBeds()
    
    const channel = supabase
      .channel('beds-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'beds' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setBeds((current) =>
              current.map((bed) =>
                bed.id === payload.new.id ? (payload.new as Bed) : bed
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchBeds() {
    const { data, error } = await supabase
      .from('beds')
      .select('*')
      .order('bed_number')

    if (error) {
      console.error('Error fetching beds:', error)
    } else {
      setBeds(data || [])
    }
    setLoading(false)
  }

  async function updateBedState(bedId: string, newState: string) {
    const { error } = await supabase
      .from('beds')
      .update({ 
        state: newState,
        updated_at: new Date().toISOString()
      })
      .eq('id', bedId)

    if (error) {
      console.error('Error updating bed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-xl text-cyan-400">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <DashboardHeader beds={beds} />
      <BoardGridCompact beds={beds} onUpdateState={updateBedState} />
    </div>
  )
}
