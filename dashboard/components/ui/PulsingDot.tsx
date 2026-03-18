'use client'

export function PulsingDot({ color = '#639922' }: { color?: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
        style={{ background: color }}
      />
      <span
        className="relative inline-flex rounded-full h-2.5 w-2.5"
        style={{ background: color }}
      />
    </span>
  )
}
