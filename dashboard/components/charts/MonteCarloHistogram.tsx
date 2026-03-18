'use client'

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts'

interface Props {
  esiMean : number
  esiStd  : number
}

function generateHistogram(mean: number, std: number, bins = 30) {
  const lo  = mean - 3.5 * std
  const hi  = mean + 3.5 * std
  const step= (hi - lo) / bins

  return Array.from({ length: bins }, (_, i) => {
    const x    = lo + i * step
    const xMid = x + step / 2
    const z    = (xMid - mean) / std
    const count= Math.round(500 * Math.exp(-0.5 * z * z) * step / (std * Math.sqrt(2 * Math.PI)))
    return { x: +xMid.toFixed(4), count, binStart: +x.toFixed(4) }
  })
}

export function MonteCarloHistogram({ esiMean, esiStd }: Props) {
  const data   = generateHistogram(esiMean, esiStd)
  const lo1s   = esiMean - esiStd
  const hi1s   = esiMean + esiStd

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-mono text-white/50">Monte Carlo ESI Distribution (N=500)</p>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-white/70">μ = {esiMean.toFixed(4)}</span>
          <span className="text-white/40">σ = {esiStd.toFixed(4)}</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="x"
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'monospace' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            interval={4}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: 'rgba(7,21,37,0.95)',
              border     : '1px solid rgba(55,138,221,0.3)',
              borderRadius: '8px',
              fontSize   : '11px',
              fontFamily : 'monospace',
              color      : '#e8edf5',
            }}
            formatter={(v: number) => [v, 'count']}
          />
          {/* ±1σ shaded region via colored bars */}
          <Bar dataKey="count" maxBarSize={12} radius={[2, 2, 0, 0]}>
            {data.map((entry, i) => {
              const inSigma = entry.x >= lo1s && entry.x <= hi1s
              return (
                <Cell
                  key={i}
                  fill={inSigma ? 'rgba(55,138,221,0.7)' : 'rgba(55,138,221,0.25)'}
                />
              )
            })}
          </Bar>
          <ReferenceLine
            x={esiMean}
            stroke="#97C459"
            strokeWidth={2}
            strokeDasharray="4 2"
          />
          <ReferenceLine x={lo1s} stroke="rgba(55,138,221,0.4)" strokeDasharray="3 3" />
          <ReferenceLine x={hi1s} stroke="rgba(55,138,221,0.4)" strokeDasharray="3 3" />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-2 text-[10px] font-mono text-white/30">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-sm bg-star-blue/70" />
          <span>±1σ confidence</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 border-t-2 border-dashed border-star-green" />
          <span>mean</span>
        </div>
      </div>
    </div>
  )
}
