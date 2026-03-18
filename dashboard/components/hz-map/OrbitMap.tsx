'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import type { Planet } from '@/lib/types'
import { TIER_COLORS } from '@/lib/api'

interface Tooltip {
  x: number; y: number
  planet: Planet
}

export function OrbitMap({ planets }: { planets: Planet[] }) {
  const svgRef     = useRef<SVGSVGElement>(null)
  const animRef    = useRef<number>(0)
  const anglesRef  = useRef<number[]>([])
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || !planets.length) return

    const W = svg.clientWidth || 700
    const H = 520
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`)

    const cx = W * 0.38
    const cy = H * 0.5

    // Max a_AU in data
    const maxA = d3.max(planets, p => p.hz_outer_au ?? p.a_au ?? 2.0) ?? 2.0
    const scale = d3.scaleLinear().domain([0, maxA * 1.15]).range([0, Math.min(cx, cy) - 30])

    d3.select(svg).selectAll('*').remove()

    const g = d3.select(svg).append('g')

    // Grid rings
    ;[0.25, 0.5, 0.75, 1.0, 1.5, 2.0].forEach(au => {
      const r = scale(au)
      if (r > scale(maxA * 1.1)) return
      g.append('circle')
        .attr('cx', cx).attr('cy', cy).attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', 'rgba(55,138,221,0.06)')
        .attr('stroke-dasharray', '3,4')

      g.append('text')
        .attr('x', cx + r + 4).attr('y', cy)
        .attr('fill', 'rgba(255,255,255,0.15)')
        .attr('font-size', '9px').attr('font-family', 'monospace')
        .attr('dominant-baseline', 'central')
        .text(`${au}AU`)
    })

    // Star (center)
    const starGrad = d3.select(svg).append('defs')
      .append('radialGradient').attr('id', 'starGrad')
    starGrad.append('stop').attr('offset', '0%').attr('stop-color', '#FAEEDA')
    starGrad.append('stop').attr('offset', '100%').attr('stop-color', '#EF9F27')

    g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 14)
      .attr('fill', 'url(#starGrad)')
    g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', 22)
      .attr('fill', 'none').attr('stroke', 'rgba(239,159,39,0.2)').attr('stroke-width', '1')

    // Per-planet: HZ band + orbit ring
    planets.forEach(p => {
      const a = p.a_au ?? p.hz_inner_au ?? 0.5
      if (!a) return

      // HZ band
      const hzIn  = p.hz_inner_au
      const hzOut = p.hz_outer_au
      if (hzIn && hzOut) {
        const rIn  = scale(hzIn)
        const rOut = scale(hzOut)
        g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', rOut)
          .attr('fill', 'none').attr('stroke', 'rgba(99,153,34,0.25)').attr('stroke-width', rOut - rIn)
      }

      // Orbit path
      const r = scale(a)
      g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', r)
        .attr('fill', 'none').attr('stroke', 'rgba(55,138,221,0.1)').attr('stroke-width', '0.8')
    })

    // Initialize angles randomly
    if (anglesRef.current.length !== planets.length) {
      anglesRef.current = planets.map(() => Math.random() * Math.PI * 2)
    }

    // Planet dots
    const planetGroups = planets.map((p, i) => {
      const a    = p.a_au ?? 0.5
      const r    = scale(a)
      const color= TIER_COLORS[p.habitability_tier]?.dot ?? '#888'
      const size = 4 + (p.esi_score ?? 0.5) * 5

      const dotG = g.append('g').style('cursor', 'pointer')

      // Outer glow for earth-like
      if (p.habitability_tier === 'EARTH-LIKE') {
        dotG.append('circle').attr('r', size + 4)
          .attr('fill', 'none').attr('stroke', color)
          .attr('stroke-width', '0.8').attr('opacity', '0.3')
          .attr('class', `glow-ring-${i}`)
      }

      dotG.append('circle').attr('r', size).attr('fill', color).attr('opacity', '0.9')

      dotG
        .on('mouseenter', (event) => {
          const [mx, my] = d3.pointer(event, svg)
          setTooltip({ x: mx, y: my, planet: p })
          dotG.select('circle').attr('r', size * 1.4)
        })
        .on('mouseleave', () => {
          setTooltip(null)
          dotG.select('circle').attr('r', size)
        })

      return { group: dotG, r, a, period: p.orbital_period_days ?? 365 }
    })

    // Animation loop
    const SPEED = 0.0003
    const animate = () => {
      planetGroups.forEach(({ group, r, period }, i) => {
        anglesRef.current[i] += SPEED * (365 / (period || 365))
        const angle = anglesRef.current[i]
        const x = cx + r * Math.cos(angle)
        const y = cy + r * Math.sin(angle)
        group.attr('transform', `translate(${x}, ${y})`)
      })
      animRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Legend (right side)
    const legendX = W * 0.78
    const legendData = [
      { color: 'rgba(99,153,34,0.3)', label: 'Habitable zone', type: 'band' },
      { color: '#639922', label: 'EARTH-LIKE', type: 'dot' },
      { color: '#378ADD', label: 'PROMISING',  type: 'dot' },
      { color: '#E24B4A', label: 'HOT / other',type: 'dot' },
    ]
    legendData.forEach(({ color, label, type }, i) => {
      const ly = 40 + i * 22
      if (type === 'band') {
        g.append('rect').attr('x', legendX).attr('y', ly - 5).attr('width', 16).attr('height', 10)
          .attr('rx', 2).attr('fill', color)
      } else {
        g.append('circle').attr('cx', legendX + 8).attr('cy', ly).attr('r', 5).attr('fill', color)
      }
      g.append('text').attr('x', legendX + 22).attr('y', ly)
        .attr('fill', 'rgba(255,255,255,0.45)').attr('font-size', '10px')
        .attr('font-family', 'monospace').attr('dominant-baseline', 'central')
        .text(label)
    })

    return () => cancelAnimationFrame(animRef.current)
  }, [planets])

  return (
    <div className="relative">
      <svg ref={svgRef} width="100%" height="520" />
      {tooltip && (
        <div
          className="absolute z-20 glass-card px-3 py-2 text-xs font-mono pointer-events-none"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10, minWidth: 160 }}
        >
          <p className="text-white font-semibold mb-1">{tooltip.planet.star_id}</p>
          <div className="space-y-0.5 text-white/60">
            <p>ESI: <span className="text-white">{tooltip.planet.esi_score?.toFixed(4)}</span></p>
            <p>T_surface: <span className="text-white">{Math.round(tooltip.planet.t_surface_k)}K</span></p>
            <p>HZ score: <span className="text-white">{tooltip.planet.hz_score?.toFixed(4)}</span></p>
            <p>Tier: <span className="text-white">{tooltip.planet.habitability_tier}</span></p>
          </div>
        </div>
      )}
    </div>
  )
}
