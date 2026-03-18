'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScore } from '@/hooks/usePlanets'
import { TierBadge } from '@/components/ui/TierBadge'
import { ScoreBar } from '@/components/charts/ScoreBar'
import { SCORE_COLOR } from '@/lib/api'
import type { ScoreRequest } from '@/lib/types'

const DEFAULTS: ScoreRequest = {
  star_id        : 'KIC-9999999',
  T_eff          : 5500,
  L_star         : 0.85,
  spectral_type  : 'G5V',
  period_days    : 180,
  a_AU           : 0.72,
  R_planet_earth : 1.4,
  M_planet_earth : 2.5,
  cnn_probability: 0.78,
  snr            : 8.5,
  eccentricity   : 0.04,
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[10px] font-mono text-white/40 uppercase tracking-wider mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputClass = "w-full bg-space-800/60 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-star-blue/50 transition-colors"

export default function ScorePage() {
  const [form, setForm] = useState<ScoreRequest>(DEFAULTS)
  const { mutate, data: result, isPending, error, reset } = useScore()

  const set = (k: keyof ScoreRequest, v: string | number) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    reset()
    mutate(form)
  }

  const scoreColor = result ? SCORE_COLOR(result.trinetra_score) : '#378ADD'

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold mb-1">Score a New Planet</h1>
        <p className="text-sm text-white/40 font-mono">
          Enter stellar and planetary parameters to run the TRINETRA habitability engine
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-6"
      >
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Field label="Star ID" id="star_id">
            <input id="star_id" className={inputClass} value={form.star_id}
              onChange={e => set('star_id', e.target.value)} />
          </Field>
          <Field label="Spectral type" id="spectral_type">
            <select id="spectral_type" className={inputClass} value={form.spectral_type}
              onChange={e => set('spectral_type', e.target.value)}>
              {['F5V','F8V','G2V','G5V','G8V','K2V','K5V','M0V','M1V','M2V'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="T_eff (K)" id="T_eff">
            <input id="T_eff" type="number" className={inputClass} value={form.T_eff}
              onChange={e => set('T_eff', +e.target.value)} />
          </Field>
          <Field label="L_star (L☉)" id="L_star">
            <input id="L_star" type="number" step="0.01" className={inputClass} value={form.L_star}
              onChange={e => set('L_star', +e.target.value)} />
          </Field>
          <Field label="Period (days)" id="period_days">
            <input id="period_days" type="number" className={inputClass} value={form.period_days}
              onChange={e => set('period_days', +e.target.value)} />
          </Field>
          <Field label="a_AU" id="a_AU">
            <input id="a_AU" type="number" step="0.01" className={inputClass} value={form.a_AU}
              onChange={e => set('a_AU', +e.target.value)} />
          </Field>
          <Field label="R_planet (R⊕)" id="R_planet_earth">
            <input id="R_planet_earth" type="number" step="0.1" className={inputClass} value={form.R_planet_earth}
              onChange={e => set('R_planet_earth', +e.target.value)} />
          </Field>
          <Field label="M_planet (M⊕)" id="M_planet_earth">
            <input id="M_planet_earth" type="number" step="0.1" className={inputClass} value={form.M_planet_earth}
              onChange={e => set('M_planet_earth', +e.target.value)} />
          </Field>
          <Field label="CNN probability" id="cnn_probability">
            <input id="cnn_probability" type="number" step="0.01" min="0" max="1" className={inputClass} value={form.cnn_probability}
              onChange={e => set('cnn_probability', +e.target.value)} />
          </Field>
          <Field label="SNR" id="snr">
            <input id="snr" type="number" step="0.5" className={inputClass} value={form.snr}
              onChange={e => set('snr', +e.target.value)} />
          </Field>
        </div>

        <motion.button
          type="submit"
          disabled={isPending}
          className="w-full py-3 rounded-lg bg-star-blue/20 border border-star-blue/40 text-sm font-mono text-white hover:bg-star-blue/30 transition-all disabled:opacity-50"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {isPending ? 'Running habitability engine...' : 'Run TRINETRA habitability engine →'}
        </motion.button>

        {error && (
          <p className="text-red-400/70 text-xs font-mono mt-3 text-center">
            Error: {error.message}
          </p>
        )}
      </motion.form>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-6"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs font-mono text-white/30 mb-1">{result.star_id}</p>
                <TierBadge tier={result.habitability_tier} size="md" />
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-white/30 mb-1">TRINETRA score</p>
                <p className="text-4xl font-bold font-mono" style={{ color: scoreColor }}>
                  {result.trinetra_score.toFixed(4)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { l: 'ESI',          v: result.esi_adjusted.toFixed(4)   },
                { l: 'T_surface',    v: `${Math.round(result.T_surface_K)} K` },
                { l: 'Hab. prob',    v: result.habitability_prob.toFixed(4) },
                { l: 'Composition',  v: result.composition                },
                { l: 'In HZ',        v: result.in_habitable_zone ? 'YES' : 'No' },
                { l: 'Tidally locked', v: result.tidally_locked ? 'YES' : 'No' },
              ].map(({ l, v }) => (
                <div key={l} className="bg-space-800/40 rounded-lg p-3">
                  <p className="text-[10px] font-mono text-white/30 mb-1">{l}</p>
                  <p className="text-sm font-bold text-white">{v}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2.5">
              <ScoreBar label="ESI"              value={result.esi_adjusted}       color="#97C459" delay={0.0} />
              <ScoreBar label="Atmosphere"       value={result.atm_retention}      color="#1D9E75" delay={0.1} />
              <ScoreBar label="Temperature"      value={result.temperature_score}  color="#EF9F27" delay={0.2} />
              <ScoreBar label="HZ score"         value={result.hz_score}           color="#85B7EB" delay={0.3} />
              <ScoreBar label="Water retention"  value={result.water_retention}    color="#5DCAA5" delay={0.4} />
              <ScoreBar label="Climate stability"value={result.climate_stability}  color="#B5D4F4" delay={0.5} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
