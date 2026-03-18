import type { Planet, Star, TCE, Stats, ScoreRequest, ScoreResult, APIResponse } from './types'

const BASE = '/api'

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail || `API error ${res.status}`)
  }
  const json: APIResponse<T> = await res.json()
  return json.data
}

export const planetAPI = {
  getAll      : () => apiFetch<Planet[]>('/planets'),
  getTop      : (n: number) => apiFetch<Planet[]>(`/planets?top=${n}`),
  getById     : (starId: string) => apiFetch<Planet>(`/planets/${encodeURIComponent(starId)}`),
  getValidated: () => apiFetch<Planet[]>('/planets?validated=true'),
}

export const statsAPI = {
  get: () => apiFetch<Stats>('/stats'),
}

export const scoreAPI = {
  score: (req: ScoreRequest) =>
    apiFetch<ScoreResult>('/score', { method: 'POST', body: JSON.stringify(req) }),
}

// ── Detection status utilities ────────────────────────────────────────────────

export const DETECTION_CONFIG: Record<string, {
  label: string; color: string; bg: string; border: string; description: string
}> = {
  'CATALOG_VALIDATED'  : {
    label      : 'CATALOG VALIDATED',
    color      : '#97C459',
    bg         : 'rgba(99,153,34,0.15)',
    border     : 'rgba(99,153,34,0.4)',
    description: 'NASA confirmed + TRINETRA CNN agrees (≥0.70)',
  },
  'CATALOG_WEAK_SIGNAL': {
    label      : 'CATALOG — WEAK CNN',
    color      : '#FAC775',
    bg         : 'rgba(186,117,23,0.15)',
    border     : 'rgba(186,117,23,0.4)',
    description: 'NASA confirmed planet. CNN below threshold — likely domain shift on long-period orbit.',
  },
  'FALSE_POSITIVE'     : {
    label      : 'FALSE POSITIVE',
    color      : '#F09595',
    bg         : 'rgba(226,75,74,0.15)',
    border     : 'rgba(226,75,74,0.4)',
    description: 'Transit signal classified as false positive. Habitability not evaluated.',
  },
  'CANDIDATE'          : {
    label      : 'TRINETRA CANDIDATE',
    color      : '#5DCAA5',
    bg         : 'rgba(29,158,117,0.15)',
    border     : 'rgba(29,158,117,0.4)',
    description: 'Independently detected by TRINETRA. CNN ≥ 0.70, SDE ≥ 7.0.',
  },
  'REJECTED'           : {
    label      : 'REJECTED',
    color      : '#B4B2A9',
    bg         : 'rgba(136,135,128,0.15)',
    border     : 'rgba(136,135,128,0.4)',
    description: 'Signal below detection thresholds.',
  },
}

export const CNN_TIER_CONFIG: Record<string, { color: string; label: string }> = {
  'HIGH'    : { color: '#97C459', label: 'HIGH (≥0.90)'     },
  'MODERATE': { color: '#378ADD', label: 'MODERATE (≥0.70)' },
  'LOW'     : { color: '#FAC775', label: 'LOW (≥0.50)'      },
  'REJECTED': { color: '#F09595', label: 'REJECTED (<0.50)' },
}

export const TIER_COLORS: Record<string, {
  bg: string; text: string; border: string; dot: string
}> = {
  'PROMISING'     : { bg: '#E6F1FB', text: '#185FA5', border: '#85B7EB', dot: '#378ADD' },
  'EARTH-LIKE'    : { bg: '#EAF3DE', text: '#3B6D11', border: '#97C459', dot: '#639922' },
  'UNCONFIRMED'   : { bg: '#FAEEDA', text: '#633806', border: '#FAC775', dot: '#BA7517' },
  'HOT'           : { bg: '#FCEBEB', text: '#A32D2D', border: '#F09595', dot: '#E24B4A' },
  'COLD'          : { bg: '#E6F1FB', text: '#0C447C', border: '#B5D4F4', dot: '#185FA5' },
  'NOT_EVALUATED' : { bg: '#F1EFE8', text: '#444441', border: '#D3D1C7', dot: '#888780' },
  'HOSTILE'       : { bg: '#F1EFE8', text: '#444441', border: '#D3D1C7', dot: '#888780' },
}

export const SCORE_COLOR = (score: number | null) => {
  if (!score) return '#888780'
  if (score >= 0.7) return '#639922'
  if (score >= 0.5) return '#378ADD'
  if (score >= 0.3) return '#BA7517'
  return '#E24B4A'
}

export const isHabitabilityValid = (planet: Planet): boolean =>
  planet.detection_status !== 'FALSE_POSITIVE' &&
  planet.habitability_tier !== 'NOT_EVALUATED' &&
  planet.esi_score !== null