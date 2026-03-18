'use client'

import type { PlanetFilters, HabitabilityTier, Composition } from '@/lib/types'

const TIERS: (HabitabilityTier | 'ALL')[] = ['ALL', 'EARTH-LIKE', 'PROMISING', 'WARM', 'HOT', 'COLD']
const COMPOSITIONS: (Composition | 'ALL')[] = ['ALL', 'Rocky', 'Water World', 'Gas/Mini-Neptune', 'Iron-rich']

interface Props {
  filters  : PlanetFilters
  onChange : (f: PlanetFilters) => void
  total    : number
  filtered : number
}

function FilterPill({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all duration-150 ${
        active
          ? 'bg-star-blue/20 border-star-blue/50 text-white'
          : 'bg-transparent border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
      }`}
    >
      {label}
    </button>
  )
}

export function FilterBar({ filters, onChange, total, filtered }: Props) {
  const set = (patch: Partial<PlanetFilters>) => onChange({ ...filters, ...patch })

  return (
    <div className="space-y-3 mb-6">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm font-mono">
          /&gt;
        </span>
        <input
          type="text"
          placeholder="search Kepler-22, KIC-9388479..."
          value={filters.search}
          onChange={e => set({ search: e.target.value })}
          className="w-full bg-space-800/60 border border-white/10 rounded-lg pl-8 pr-4 py-2 text-sm font-mono text-white placeholder-white/20 focus:outline-none focus:border-star-blue/50"
        />
        {filters.search && (
          <button
            onClick={() => set({ search: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-white/30 font-mono">tier:</span>
        {TIERS.map(t => (
          <FilterPill
            key={t}
            label={t === 'ALL' ? 'all' : t.toLowerCase()}
            active={filters.tier === t}
            onClick={() => set({ tier: t, earthLikeOnly: false })}
          />
        ))}
        <div className="w-px h-4 bg-white/10 mx-1" />
        {/* Earth-like quick filter */}
        <FilterPill
          label="🌍 earth-like only"
          active={filters.earthLikeOnly}
          onClick={() => set({ earthLikeOnly: !filters.earthLikeOnly, tier: 'ALL' })}
        />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-white/30 font-mono">type:</span>
        {COMPOSITIONS.map(c => (
          <FilterPill
            key={c}
            label={c === 'ALL' ? 'all' : c.toLowerCase()}
            active={filters.composition === c}
            onClick={() => set({ composition: c })}
          />
        ))}
        <div className="w-px h-4 bg-white/10 mx-1" />
        <FilterPill
          label="in HZ only"
          active={filters.inHzOnly}
          onClick={() => set({ inHzOnly: !filters.inHzOnly })}
        />
      </div>

      {/* Count */}
      <p className="text-xs font-mono text-white/30">
        showing <span className="text-white/60">{filtered}</span> of {total} candidates
        {filtered < total && (
          <button
            onClick={() => onChange({ tier: 'ALL', composition: 'ALL', inHzOnly: false, earthLikeOnly: false, search: '' })}
            className="ml-2 text-star-blue/60 hover:text-star-blue underline"
          >
            clear filters
          </button>
        )}
      </p>
    </div>
  )
}
