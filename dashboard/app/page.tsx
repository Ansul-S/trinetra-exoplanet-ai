'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useStats, usePlanets } from '@/hooks/usePlanets'
import { PlanetCard } from '@/components/planets/PlanetCard'
import { StatSkeleton, CardSkeleton } from '@/components/ui/LoadingSkeleton'

function StatCard({ value, label, delay = 0 }: { value: string | number; label: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card p-5 text-center"
    >
      <p className="text-3xl font-bold font-mono text-white">{value}</p>
      <p className="text-xs text-white/40 font-mono mt-1">{label}</p>
    </motion.div>
  )
}

export default function HomePage() {
  const { data: stats, isLoading: statsLoading } = useStats()
  const { data: planets, isLoading: planetsLoading } = usePlanets()

  const top3 = planets?.slice(0, 3) ?? []

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 bg-grid">
      {/* Hero */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Live API badge */}
        <motion.div
          className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full text-xs font-mono text-white/60 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-star-green animate-pulse" />
          API live · ansul-s-trinetra-api.hf.space
        </motion.div>

        <h1 className="text-5xl font-bold tracking-tight mb-3 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
          AI-Powered<br />Exoplanet Discovery
        </h1>
        <p className="text-lg text-white/40 font-light max-w-xl mx-auto mb-8">
          {statsLoading
            ? 'Loading pipeline results...'
            : `${stats?.habitability_tiers?.['EARTH-LIKE'] ?? 6} Earth-Like Planets Found in NASA Kepler Data`
          }
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/planets">
            <motion.button
              className="px-6 py-2.5 rounded-lg bg-star-blue/20 border border-star-blue/40 text-sm font-mono text-white hover:bg-star-blue/30 transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Explore candidates →
            </motion.button>
          </Link>
          <Link href="/map">
            <motion.button
              className="px-6 py-2.5 rounded-lg border border-white/10 text-sm font-mono text-white/60 hover:border-white/20 hover:text-white/80 transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              HZ orbit map
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard value={stats?.total_stars_processed ?? 15} label="Stars processed" delay={0.1} />
            <StatCard value={stats?.habitability_tiers?.['EARTH-LIKE'] ?? 6} label="Earth-like planets" delay={0.15} />
            <StatCard value={stats?.model_auc?.toFixed(3) ?? '0.979'} label="CNN AUC score" delay={0.2} />
            <StatCard value={(stats?.training_stars ?? 5087).toLocaleString()} label="Training stars" delay={0.25} />
          </>
        )}
      </div>

      {/* Top 3 candidates */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-mono text-white/50 uppercase tracking-widest">Top candidates</h2>
          <Link href="/planets" className="text-xs font-mono text-star-blue/60 hover:text-star-blue">
            view all →
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {planetsLoading
            ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            : top3.map((p, i) => <PlanetCard key={p.star_id} planet={p} index={i} />)
          }
        </div>
      </div>

      {/* Pipeline summary strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="glass-card p-4 mt-8"
      >
        <div className="grid grid-cols-4 divide-x divide-white/5">
          {[
            { num: '01', label: 'Data Pipeline',  sub: '15 stars · 65k cadences' },
            { num: '02', label: 'BLS Detection',  sub: '7 TCEs · SDE ≥ 5.0'     },
            { num: '03', label: 'AstroNet CNN',   sub: 'AUC 0.979 · 5/5 recall'  },
            { num: '04', label: 'Habitability',   sub: '14-factor ESI model'     },
          ].map(({ num, label, sub }) => (
            <div key={num} className="px-4 first:pl-0 last:pr-0 text-center">
              <p className="text-xs font-mono text-white/20 mb-0.5">{num}</p>
              <p className="text-xs font-medium text-white/70">{label}</p>
              <p className="text-[10px] font-mono text-white/30 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
