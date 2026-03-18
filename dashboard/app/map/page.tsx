'use client'

import { motion } from 'framer-motion'
import { usePlanets } from '@/hooks/usePlanets'
import { OrbitMap } from '@/components/hz-map/OrbitMap'

// HZ boundaries per star (from Phase 4 data)
const HZ_DATA: Record<string, { hz_inner_au: number; hz_outer_au: number; a_au: number }> = {
  'Kepler-22'  : { hz_inner_au: 0.750, hz_outer_au: 1.766, a_au: 0.849 },
  'Kepler-442' : { hz_inner_au: 0.307, hz_outer_au: 0.723, a_au: 0.409 },
  'Kepler-452' : { hz_inner_au: 0.799, hz_outer_au: 1.881, a_au: 1.046 },
  'Kepler-62'  : { hz_inner_au: 0.410, hz_outer_au: 0.966, a_au: 0.718 },
  'Kepler-186' : { hz_inner_au: 0.237, hz_outer_au: 0.558, a_au: 0.356 },
  'Kepler-90'  : { hz_inner_au: 0.873, hz_outer_au: 2.057, a_au: 0.120 },
  'Kepler-69'  : { hz_inner_au: 0.548, hz_outer_au: 1.292, a_au: 0.640 },
  'Kepler-438' : { hz_inner_au: 0.224, hz_outer_au: 0.527, a_au: 0.166 },
  'Kepler-296' : { hz_inner_au: 0.200, hz_outer_au: 0.471, a_au: 0.179 },
  'Kepler-1229': { hz_inner_au: 0.242, hz_outer_au: 0.569, a_au: 0.286 },
  'KIC 9388479': { hz_inner_au: 0.369, hz_outer_au: 0.870, a_au: 0.244 },
  'KIC 3544595': { hz_inner_au: 0.710, hz_outer_au: 1.673, a_au: 0.118 },
  'KIC 4277632': { hz_inner_au: 0.786, hz_outer_au: 1.851, a_au: 0.031 },
  'KIC 5446285': { hz_inner_au: 0.621, hz_outer_au: 1.462, a_au: 0.480 },
  'KIC 6521045': { hz_inner_au: 0.750, hz_outer_au: 1.766, a_au: 0.108 },
}

export default function MapPage() {
  const { data: planets, isLoading } = usePlanets()

  const enriched = (planets ?? []).map(p => ({
    ...p,
    ...HZ_DATA[p.star_id],
  }))

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold mb-1">Habitable Zone Orbit Map</h1>
        <p className="text-sm text-white/40 font-mono">
          Planets orbit at speed proportional to actual period · hover for stats
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        {isLoading ? (
          <div className="h-[520px] flex items-center justify-center">
            <div className="text-white/30 font-mono text-sm animate-pulse">
              Loading orbital data...
            </div>
          </div>
        ) : (
          <OrbitMap planets={enriched} />
        )}
      </motion.div>

      {/* Note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xs font-mono text-white/20 text-center mt-4"
      >
        Green band = habitable zone (Kopparapu 2013) · dot size ∝ ESI · orbit speed ∝ actual period
      </motion.p>
    </div>
  )
}
