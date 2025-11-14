'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Bed } from '@/types/bed'
import Boletim from '@/components/Boletim'

export default function BoletimPage() {
  const [beds, setBeds] = useState<Bed[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBeds()
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-xl text-cyan-400">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <Boletim beds={beds} />
      
      {/* Botão Imprimir */}
      <div className="text-center mt-8">
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg transition-colors"
        >
          Imprimir Boletim
        </button>
      </div>
    </div>
  )
}
