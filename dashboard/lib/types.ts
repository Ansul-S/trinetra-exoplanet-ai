// ─────────────────────────────────────────────────────────────────────────────
// TRINETRA Dashboard — TypeScript Types
// ─────────────────────────────────────────────────────────────────────────────
export type DetectionStatus =
  | 'CATALOG_VALIDATED'
  | 'CATALOG_WEAK_SIGNAL'
  | 'FALSE_POSITIVE'
  | 'CANDIDATE'
  | 'REJECTED'

export type CNNTier = 'HIGH' | 'MODERATE' | 'LOW' | 'REJECTED'

export type HabitabilityTier =
  | 'EARTH-LIKE'
  | 'PROMISING'
  | 'WARM'
  | 'COLD'
  | 'HOT'
  | 'HOSTILE'
  | 'TIDALLY LOCKED'

export type Composition =
  | 'Rocky'
  | 'Water World'
  | 'Gas/Mini-Neptune'
  | 'Iron-rich'

export interface Planet {
  id: number
  // Identity
  star_id          : string
  planet_name      : string
  kic_id           : string

  // Detection Layer
  true_label           : string
  detection_status     : DetectionStatus
  is_independent_detection: boolean
  validation_source    : string
  cnn_probability      : number
  cnn_confidence_tier  : CNNTier
  tls_snr              : number
  tls_period_days      : number

  // Evaluation Layer (null if gated)
  esi_score            : number | null
  esi_mean             : number | null
  esi_std              : number | null
  habitability_tier    : string
  habitability_prob    : number | null
  hab_prob_std         : number | null
  planet_probability   : number | null
  trinetra_score_v4    : number | null
  trinetra_score_v3    : number | null

  // Physical
  orbital_period_days  : number
  t_surface_k          : number | null
  hz_score             : number | null
  composition          : string | null
  tidally_locked       : boolean
  r_p_from_transit     : number | null
  radius_agreement_pct : number | null
  inclination_deg      : number | null
  eccentricity         : number | null
  in_early_hz          : boolean | null
  hz_frac_lifetime     : number | null
  climate_stability    : number | null
  water_retention      : number | null
  atm_retention        : number | null
  temperature_score    : number | null

  // Stellar
  stellar_stability    : number | null
  flare_risk_factor    : number | null
  stellar_activity     : number | null
  stellar_age_gyr      : number | null
  tidal_heating_pen    : number | null
  greenhouse_factor    : number | null

  data_source          : string
  created_at           : string
}

export interface Star {
  id: number
  star_id: string
  label: 'CONFIRMED' | 'FALSE_POSITIVE'
  n_quarters: number
  n_cadences: number
  time_span_days: number
  noise_ppm: number
  median_flux: number
  npz_filename: string
  pipeline_version: string
  created_at: string
}

export interface TCE {
  id: number
  star_id: string
  true_label: string
  is_tce: boolean
  tls_sde: number
  tls_period_days: number
  tls_depth_ppm: number
  tls_duration_hours: number
  tls_rp_rs: number
  tls_snr: number
  n_transits: number
  planet_name: string
  period_source: string
  created_at: string
}

export interface Stats {
  pipeline_phases: number
  total_stars_processed: number
  total_tce_detected: number
  total_planet_candidates: number
  habitability_tiers: Record<string, number>
  planets_in_hz: number
  tidally_locked: number
  top_trinetra_score: number
  top_candidate: string
  model_auc: number
  training_stars: number
  data_source: string
}

export interface ScoreRequest {
  star_id: string
  T_eff: number
  L_star: number
  spectral_type: string
  period_days: number
  a_AU: number
  R_planet_earth: number
  M_planet_earth: number
  albedo?: number
  cnn_probability?: number
  snr?: number
  eccentricity?: number
}

export interface ScoreResult {
  star_id: string
  spectral_type: string
  period_days: number
  a_AU: number
  T_eq_K: number
  T_surface_K: number
  esi_raw: number
  esi_adjusted: number
  habitability_tier: HabitabilityTier
  habitability_prob: number
  trinetra_score: number
  composition: Composition
  tidally_locked: boolean
  climate_stability: number
  water_retention: number
  atm_retention: number
  temperature_score: number
  hz_score: number
  in_habitable_zone: boolean
  cnn_probability: number
  snr_normalized: number
  computed_at: string
}

export interface APIResponse<T> {
  success: boolean
  count: number
  data: T
  timestamp: string
}

// Filter types for planets page
export interface PlanetFilters {
  tier: HabitabilityTier | 'ALL'
  composition: Composition | 'ALL'
  inHzOnly: boolean
  earthLikeOnly: boolean
  search: string
}
