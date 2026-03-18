'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { usePlanets } from '@/hooks/usePlanets'
import { PlanetCard } from '@/components/planets/PlanetCard'
import { FilterBar } from '@/components/planets/FilterBar'
import { CardSkeleton } from '@/components/ui/LoadingSkeleton'
import type { PlanetFilters } from '@/lib/types'

const DEFAULT_FILTERS: PlanetFilters = {
  tier          : 'ALL',
  composition   : 'ALL',
  inHzOnly      : false,
  earthLikeOnly : false,
  search        : '',
}

export default function PlanetsPage() {
  const { data: planets, isLoading, error } = usePlanets()
  const [filters, setFilters] = useState<PlanetFilters>(DEFAULT_FILTERS)

  const filtered = useMemo(() => {
    if (!planets) return []
    return planets.filter(p => {
      if (filters.earthLikeOnly && p.habitability_tier !== 'EARTH-LIKE') return false
      if (filters.tier !== 'ALL' && p.habitability_tier !== filters.tier) return false
      if (filters.composition !== 'ALL' && p.composition !== filters.composition) return false
      if (filters.inHzOnly && !p.in_early_hz) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!p.star_id.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [planets, filters])

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold mb-1">Planet Candidates</h1>
        <p className="text-sm text-white/40 font-mono">
          Ranked by TRINETRA composite score · NASA Kepler data
        </p>
      </motion.div>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        total={planets?.length ?? 0}
        filtered={filtered.length}
      />

      {error && (
        <div className="glass-card p-6 text-center text-red-400/70 font-mono text-sm">
          Failed to load planet data. API may be waking up — please try again in 30 seconds.
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 9 }).map((_, i) => <CardSkeleton key={i} />)
          : filtered.map((p, i) => <PlanetCard key={p.star_id} planet={p} index={i} />)
        }
      </div>

      {!isLoading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 text-white/30 font-mono"
        >
          <p className="text-3xl mb-3">∅</p>
          <p>No candidates match these filters</p>
        </motion.div>
      )}
    </div>
  )
}
