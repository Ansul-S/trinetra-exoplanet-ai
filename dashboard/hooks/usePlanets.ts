'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { planetAPI, statsAPI, scoreAPI } from '@/lib/api'
import type { ScoreRequest, Planet } from '@/lib/types'

export function usePlanets() {
  return useQuery({
    queryKey : ['planets'],
    queryFn  : () => planetAPI.getAll(),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePlanet(starId: string) {
  return useQuery({
    queryKey : ['planet', starId],
    queryFn  : async () => {
      const res = await fetch(`/api/planets/${encodeURIComponent(starId)}`)
      if (!res.ok) throw new Error('Planet not found')
      const json = await res.json()
      return json.data as Planet
    },
    staleTime: 5 * 60 * 1000,
    enabled  : !!starId,
  })
}

export function useStats() {
  return useQuery({
    queryKey : ['stats'],
    queryFn  : () => statsAPI.get(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useScore() {
  return useMutation({
    mutationFn: (req: ScoreRequest) => scoreAPI.score(req),
  })
}
