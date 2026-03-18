'use client'

import { motion } from 'framer-motion'
import { useStats } from '@/hooks/usePlanets'

const PHASES = [
  {
    num    : '01',
    title  : 'Data Pipeline',
    sub    : 'NASA Kepler light curve processing',
    color  : '#1D9E75',
    items  : [
      '15 Kepler target stars downloaded from NASA MAST via lightkurve',
      '7-step preprocessing: stitch → sigma-clip → normalize → detrend (Wotan biweight) → NaN removal → validate',
      '11 CONFIRMED planet hosts + 4 FALSE_POSITIVE = 15 stars total',
      'NPZ format: ~65,000 cadences per star, 4 years of observations',
    ],
    metrics: ['15 stars', '65k cadences/star', 'Wotan biweight', '4 year baseline'],
  },
  {
    num    : '02',
    title  : 'Transit Signal Detection',
    sub    : 'BLS period search + phase folding',
    color  : '#378ADD',
    items  : [
      'Box Least Squares (BLS) period search on all 15 stars',
      'Phase-folded light curves using known NASA periods for confirmed planets',
      '7 TCEs (Threshold Crossing Events) flagged at SDE ≥ 5.0',
      'Kepler-22b strongest detection: SDE = 29.3, period = 289.86 days',
    ],
    metrics: ['7 TCEs detected', 'SDE threshold 5.0', 'Kepler-22b SDE=29.3', 'Phase-folded curves'],
  },
  {
    num    : '03',
    title  : 'AstroNet CNN Classifier',
    sub    : 'Deep learning planet detection (Shallue & Vanderburg 2018)',
    color  : '#EF9F27',
    items  : [
      'Dual-input 1D CNN: global view (2001 pts) + local view (201 pts)',
      'Trained on 5,087 Kaggle Kepler labelled stars with 137:1 class imbalance',
      'WeightedRandomSampler + BCEWithLogitsLoss pos_weight for imbalance handling',
      'Temperature scaling T=10.0 applied for probability calibration',
      'Optimal threshold 0.70 via Youden\'s J statistic',
    ],
    metrics: ['AUC = 0.979', '5/5 planet recall', '5,087 training stars', 'T=10.0 calibrated'],
  },
  {
    num    : '04',
    title  : 'Habitability Intelligence Engine',
    sub    : '14-factor research-grade astrophysical model',
    color  : '#97C459',
    items  : [
      'ESI (Schulze-Makuch 2011) with stellar activity penalty by spectral type',
      'Habitable zone boundaries (Kopparapu 2013) with continuous HZ score',
      'Monte Carlo uncertainty propagation: 500 simulations per planet',
      'Climate stability: stellar variability + eccentricity + tidal locking',
      'Water retention: escape velocity + UV flux + surface temperature',
      'Stellar luminosity evolution: age-adjusted habitable zone boundaries',
    ],
    metrics: ['6 EARTH-LIKE found', 'ESI ± MC uncertainty', 'Kopparapu 2013 HZ', '14 factors'],
  },
]

export default function PipelinePage() {
  const { data: stats } = useStats()

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-2xl font-bold mb-1">TRINETRA Pipeline</h1>
        <p className="text-sm text-white/40 font-mono">
          End-to-end AI system for exoplanet discovery · Phases 1 through 4
        </p>
      </motion.div>

      {/* Live stats bar */}
      {stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 mb-8 grid grid-cols-4 divide-x divide-white/5"
        >
          {[
            { v: stats.total_stars_processed,           l: 'Stars'       },
            { v: stats.total_tce_detected,              l: 'TCEs'        },
            { v: stats.model_auc.toFixed(3),            l: 'AUC'         },
            { v: stats.habitability_tiers['EARTH-LIKE'],l: 'Earth-like'  },
          ].map(({ v, l }) => (
            <div key={l} className="text-center px-4 first:pl-0 last:pr-0">
              <p className="text-xl font-bold font-mono text-white">{v}</p>
              <p className="text-[10px] font-mono text-white/30 mt-0.5">{l}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Phase cards */}
      <div className="space-y-4">
        {PHASES.map(({ num, title, sub, color, items, metrics }, i) => (
          <motion.div
            key={num}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i + 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-start gap-4 mb-4">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold font-mono flex-shrink-0"
                style={{ background: `${color}22`, border: `1px solid ${color}44`, color }}
              >
                {num}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-xs text-white/40 font-mono">{sub}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-end">
                {metrics.map(m => (
                  <span key={m} className="text-[10px] font-mono bg-space-800/60 text-white/40 px-2 py-0.5 rounded border border-white/5">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <ul className="space-y-1.5 pl-13">
              {items.map((item, j) => (
                <li key={j} className="text-xs text-white/50 flex items-start gap-2">
                  <span style={{ color }} className="mt-0.5 flex-shrink-0">›</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Scientific references */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 glass-card p-5"
      >
        <h3 className="text-xs font-mono text-white/40 uppercase tracking-wider mb-3">
          Scientific references
        </h3>
        <div className="space-y-1.5">
          {[
            'Shallue & Vanderburg 2018 — AstroNet CNN architecture (arXiv:1712.05044)',
            'Kopparapu et al. 2013 — Habitable zone boundaries',
            'Schulze-Makuch et al. 2011 — Earth Similarity Index',
            'France et al. 2016 — M-dwarf UV flux and flare rates',
            'Barnes et al. 2009 — Tidal locking and habitability',
          ].map(ref => (
            <p key={ref} className="text-xs font-mono text-white/30">› {ref}</p>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
