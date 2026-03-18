'use client'

import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePlanet } from '@/hooks/usePlanets'
import { TierBadge } from '@/components/ui/TierBadge'
import { ScoreBar } from '@/components/charts/ScoreBar'
import { MonteCarloHistogram } from '@/components/charts/MonteCarloHistogram'
import { DetailSkeleton } from '@/components/ui/LoadingSkeleton'
import { SCORE_COLOR } from '@/lib/api'

function InfoBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="glass-card p-4">
      <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-base font-bold text-white">{value}</p>
      {sub && <p className="text-[10px] font-mono text-white/30 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function PlanetDetailPage() {
  const params  = useParams()
  const starId  = decodeURIComponent(params.star_id as string)
  const { data: planet, isLoading, error } = usePlanet(starId)

  if (isLoading) return (
    <div className="max-w-4xl mx-auto px-6 py-10"><DetailSkeleton /></div>
  )

  if (error || !planet) return (
    <div className="max-w-4xl mx-auto px-6 py-10 text-center">
      <p className="font-mono text-white/40">Planet not found: {starId}</p>
      <Link href="/planets" className="text-star-blue/60 text-sm mt-2 block">← back to planets</Link>
    </div>
  )

  const score      = planet.planet_probability
  const scoreColor = SCORE_COLOR(score)
  const isEarth    = planet.habitability_tier === 'EARTH-LIKE'

  const scoreComponents = [
    { label: 'ESI (adjusted)',   value: planet.esi_score,        color: '#97C459' },
    { label: 'CNN probability',  value: planet.cnn_probability ?? 0, color: '#378ADD' },
    { label: 'SNR normalized',   value: planet.snr_normalized ?? 0,  color: '#378ADD' },
    { label: 'Atm. retention',   value: planet.atm_retention,    color: '#1D9E75' },
    { label: 'Temp. score',      value: planet.temperature_score,color: '#EF9F27' },
    { label: 'HZ score',         value: planet.hz_score,         color: '#85B7EB' },
    { label: 'Water retention',  value: planet.water_retention,  color: '#5DCAA5' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Back */}
      <Link href="/planets" className="text-xs font-mono text-white/30 hover:text-white/60 mb-6 block">
        ← all candidates
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs font-mono text-white/30 mb-1">{starId}</p>
            <h1 className="text-3xl font-bold mb-2">
              {isEarth && <span className="text-star-green mr-2">●</span>}
              {starId}
            </h1>
            <div className="flex items-center gap-3">
              <TierBadge tier={planet.habitability_tier} size="md" />
              <span className="text-xs font-mono text-white/30">{planet.composition}</span>
              {planet.tidally_locked && (
                <span className="text-xs font-mono text-amber-400/60">tidally locked</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-white/30 mb-1">TRINETRA score</p>
            <p className="text-5xl font-bold font-mono" style={{ color: scoreColor }}>
              {score.toFixed(4)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Key metrics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6"
      >
        <InfoBox label="ESI (MC)" value={`${planet.esi_mean?.toFixed(4) ?? planet.esi_score.toFixed(4)}`} sub={`±${planet.esi_std?.toFixed(4) ?? '—'} (1σ)`} />
        <InfoBox label="Surface temperature" value={`${Math.round(planet.t_surface_k)} K`} sub={`T_eq ~ ${Math.round(planet.t_surface_k - 33)} K`} />
        <InfoBox label="Hab. probability" value={planet.habitability_prob?.toFixed(4) ?? '—'} sub={`±${planet.hab_prob_std?.toFixed(4) ?? '—'}`} />
        <InfoBox label="Water retention" value={planet.water_retention?.toFixed(4) ?? '—'} sub="escape vel + UV + temp" />
        <InfoBox label="Climate stability" value={planet.climate_stability?.toFixed(4) ?? '—'} sub={`e=${planet.eccentricity ?? '?'}, TL=${planet.tidally_locked ? 'yes' : 'no'}`} />
        <InfoBox label="Orbital period" value={`${planet.orbital_period_days?.toFixed(1)} days`} sub={`a = ${(planet.hz_score ?? 0).toFixed(3)} AU HZ score`} />
        <InfoBox label="Radius (transit)" value={`${planet.r_p_from_transit?.toFixed(3) ?? '—'} R⊕`} sub={`${planet.radius_agreement_pct?.toFixed(1) ?? '—'}% vs catalog`} />
        <InfoBox label="In early HZ" value={planet.in_early_hz ? 'YES (1 Gyr ago)' : 'No'} sub={`HZ frac: ${planet.hz_frac_lifetime?.toFixed(2) ?? '—'}`} />
        <InfoBox label="Stellar age" value={`${planet.stellar_age_gyr ?? '—'} Gyr`} sub={`stability ${planet.stellar_stability?.toFixed(2) ?? '—'}`} />
      </motion.div>

      {/* Score components */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6 mb-6"
      >
        <h2 className="text-xs font-mono text-white/40 uppercase tracking-wider mb-5">
          Score components — TRINETRA V4
        </h2>
        <div className="space-y-3">
          {scoreComponents.map(({ label, value, color }, i) => (
            <ScoreBar key={label} label={label} value={value ?? 0} color={color} delay={i * 0.08} />
          ))}
        </div>
      </motion.div>

      {/* Monte Carlo histogram */}
      {planet.esi_mean && planet.esi_std && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h2 className="text-xs font-mono text-white/40 uppercase tracking-wider mb-4">
            ESI Uncertainty — Monte Carlo (N=500)
          </h2>
          <MonteCarloHistogram esiMean={planet.esi_mean} esiStd={planet.esi_std} />
        </motion.div>
      )}
    </div>
  )
}
