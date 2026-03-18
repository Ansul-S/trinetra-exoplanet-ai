'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface Props {
  label : string
  value : number
  max?  : number
  color?: string
  delay?: number
}

export function ScoreBar({ label, value, max = 1, color = '#378ADD', delay = 0 }: Props) {
  const ref     = useRef<HTMLDivElement>(null)
  const inView  = useInView(ref, { once: true, margin: '-20px' })
  const pct     = Math.min(Math.max(value / max, 0), 1) * 100

  return (
    <div ref={ref} className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-mono text-white/50">{label}</span>
        <span className="text-xs font-mono text-white/70">{value.toFixed(4)}</span>
      </div>
      <div className="h-1.5 bg-space-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${pct}%` } : { width: 0 }}
          transition={{ duration: 0.9, delay, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
