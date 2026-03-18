'use client'

import type { HabitabilityTier } from '@/lib/types'

const TIER_CLASSES: Record<string, string> = {
  'EARTH-LIKE'    : 'tier-earthlike',
  'PROMISING'     : 'tier-promising',
  'HOT'           : 'tier-hot',
  'COLD'          : 'tier-cold',
  'WARM'          : 'tier-warm',
  'HOSTILE'       : 'tier-hostile',
  'TIDALLY LOCKED': 'tier-tl',
}

export function TierBadge({ tier, size = 'sm' }: { tier: HabitabilityTier; size?: 'xs' | 'sm' | 'md' }) {
  const cls = TIER_CLASSES[tier] ?? 'tier-hostile'
  const sizeClass = size === 'xs' ? 'text-[9px] px-1.5 py-0.5' : size === 'md' ? 'text-sm px-3 py-1' : 'text-[10px] px-2 py-0.5'
  return (
    <span className={`${cls} ${sizeClass} rounded-full font-mono font-medium tracking-wide whitespace-nowrap`}>
      {tier}
    </span>
  )
}
