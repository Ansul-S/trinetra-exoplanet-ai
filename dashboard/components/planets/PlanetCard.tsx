'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { TierBadge } from '@/components/ui/TierBadge'
import { PulsingDot } from '@/components/ui/PulsingDot'
import { SCORE_COLOR, DETECTION_CONFIG, CNN_TIER_CONFIG, isHabitabilityValid } from '@/lib/api'
import type { Planet } from '@/lib/types'

function MetaTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-mono bg-space-800/60 text-white/40
                     px-2 py-0.5 rounded border border-white/5">
      {children}
    </span>
  )
}

function DetectionBadge({ status }: { status: string }) {
  const cfg = DETECTION_CONFIG[status] ?? DETECTION_CONFIG['REJECTED']
  return (
    <span
      className="text-[9px] font-mono px-2 py-0.5 rounded-full tracking-wide"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      {cfg.label}
    </span>
  )
}

export function PlanetCard({ planet, index = 0 }: { planet: Planet; index?: number }) {
  const habValid   = isHabitabilityValid(planet)
  const score      = planet.planet_probability
  const scoreColor = SCORE_COLOR(score)
  const isFP       = planet.detection_status === 'FALSE_POSITIVE'
  const isValidated= planet.detection_status === 'CATALOG_VALIDATED'
  const cnnCfg     = CNN_TIER_CONFIG[planet.cnn_confidence_tier ?? 'REJECTED']

  return (
    <motion.div
      initial   ={{ opacity: 0, y: 20 }}
      animate   ={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.15 } }}
      className="group nebula-glow"
    >
      <Link href={`/planets/${encodeURIComponent(planet.planet_name ?? planet.star_id)}`}>
        <div
          className="glass-card p-5 cursor-pointer transition-all duration-200
                     group-hover:border-star-blue/40"
          style={isFP ? { opacity: 0.65 } : {}}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {isValidated && !isFP && <PulsingDot color="#97C459" />}
              {isFP && (
                <span className="text-red-400/60 text-xs">✕</span>
              )}
              <div>
                <p className="text-xs font-mono text-white/30 mb-0.5">{planet.kic_id ?? planet.star_id}</p>
                <h3 className="text-sm font-semibold text-white leading-none">
                  {planet.planet_name ?? planet.star_id}
                </h3>
              </div>
            </div>
            {habValid
              ? <TierBadge tier={planet.habitability_tier as any} />
              : <span className="text-[9px] font-mono text-white/20 border border-white/10
                                 px-2 py-0.5 rounded-full">
                  NOT EVALUATED
                </span>
            }
          </div>

          {/* Detection badge */}
          <div className="mb-3">
            <DetectionBadge status={planet.detection_status} />
          </div>

          {/* Scores — only if habitability valid */}
          {habValid && score ? (
            <div className="mb-3">
              <div className="flex items-baseline gap-1 mb-1.5">
                <span className="text-2xl font-bold font-mono" style={{ color: scoreColor }}>
                  {score.toFixed(4)}
                </span>
                <span className="text-xs text-white/30 font-mono">TRINETRA</span>
              </div>
              <div className="h-1 bg-space-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: scoreColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${score * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.05 + 0.2 }}
                />
              </div>
            </div>
          ) : (
            <div className="mb-3 py-2 text-center">
              <p className="text-[10px] font-mono text-white/20">
                {isFP
                  ? 'Transit signal classified as false positive'
                  : 'CNN signal below detection threshold'
                }
              </p>
            </div>
          )}

          {/* CNN confidence — always shown */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-white/30">CNN</span>
            <span className="text-[10px] font-mono" style={{ color: cnnCfg.color }}>
              {planet.cnn_probability?.toFixed(4)} [{cnnCfg.label}]
            </span>
          </div>

          {/* Meta tags */}
          <div className="flex flex-wrap gap-1.5">
            {habValid && planet.esi_score && (
              <MetaTag>ESI {planet.esi_score.toFixed(3)}</MetaTag>
            )}
            {habValid && planet.t_surface_k && (
              <MetaTag>{Math.round(planet.t_surface_k)}K</MetaTag>
            )}
            {planet.composition && habValid && (
              <MetaTag>{planet.composition}</MetaTag>
            )}
            {planet.in_early_hz && habValid && <MetaTag>in HZ</MetaTag>}
            {planet.tidally_locked && habValid && <MetaTag>TL</MetaTag>}
            <MetaTag>SNR {planet.tls_snr?.toFixed(1) ?? '—'}</MetaTag>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}