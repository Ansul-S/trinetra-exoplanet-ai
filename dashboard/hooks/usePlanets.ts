'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { planetAPI, statsAPI, scoreAPI } from '@/lib/api'
import type { ScoreRequest } from '@/lib/types'

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
    queryFn  : () => planetAPI.getById(starId),
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
