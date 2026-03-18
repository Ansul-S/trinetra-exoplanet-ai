'use client'

export function CardSkeleton() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex justify-between items-start">
        <div className="skeleton h-4 w-28 rounded" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
      <div className="skeleton h-8 w-20 rounded" />
      <div className="skeleton h-1.5 w-full rounded" />
      <div className="flex gap-2">
        <div className="skeleton h-5 w-16 rounded" />
        <div className="skeleton h-5 w-14 rounded" />
        <div className="skeleton h-5 w-18 rounded" />
      </div>
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="glass-card p-4 text-center">
      <div className="skeleton h-8 w-16 rounded mx-auto mb-2" />
      <div className="skeleton h-3 w-24 rounded mx-auto" />
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-24 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-lg" />
        ))}
      </div>
      <div className="skeleton h-48 w-full rounded-xl" />
    </div>
  )
}
