# ─────────────────────────────────────────────────────────────────────────────
# TRINETRA - Habitability Engine (API version)
# Runs Phase 4 models on demand for any new planet candidate
# ─────────────────────────────────────────────────────────────────────────────

import numpy as np
from typing import Dict, Any

# ── Physical constants ────────────────────────────────────────────────────────
L_SUN   = 3.828e26
AU      = 1.496e11
SIGMA   = 5.67e-8
R_EARTH = 6.371e6
M_EARTH = 5.972e24
G       = 6.674e-11
R_SUN_EARTH = 109.076

EARTH_REF = {"radius":1.0, "density":5.515, "escape_vel":11.19, "surf_temp":288.0}
ESI_W     = {"radius":0.57, "density":1.07, "escape_vel":0.70, "surf_temp":5.58}
W_TOTAL   = sum(ESI_W.values())

STELLAR_PROPS = {
    "F": {"stability":0.90, "activity":0.90, "flare_risk":1.00},
    "G": {"stability":1.00, "activity":1.00, "flare_risk":1.00},
    "K": {"stability":0.95, "activity":0.85, "flare_risk":0.90},
    "M": {"stability":0.75, "activity":0.70, "flare_risk":0.70},
}

# ── Model functions ───────────────────────────────────────────────────────────

def _eq_temperature(L_star, a_AU, albedo=0.30):
    return float((L_star*L_SUN*(1-albedo)/(16*np.pi*SIGMA*(a_AU*AU)**2))**0.25)

def _habitable_zone(T_eff, L_star):
    dT    = T_eff - 5780.0
    S_in  = 1.7763 + 1.4335e-4*dT + 3.3954e-9*dT**2
    S_out = 0.3207 + 5.4471e-5*dT + 1.5275e-9*dT**2
    return float(np.sqrt(L_star/S_in)), float(np.sqrt(L_star/S_out))

def _density(R_p, M_p):
    return float(M_p*M_EARTH / ((4/3)*np.pi*(R_p*R_EARTH)**3) / 1000)

def _escape_vel(R_p, M_p):
    return float(np.sqrt(2*G*M_p*M_EARTH/(R_p*R_EARTH))/1000)

def _esi(R_p, density, v_esc, T_surf):
    params = [
        (R_p,     EARTH_REF["radius"],     ESI_W["radius"]),
        (density, EARTH_REF["density"],    ESI_W["density"]),
        (v_esc,   EARTH_REF["escape_vel"], ESI_W["escape_vel"]),
        (T_surf,  EARTH_REF["surf_temp"],  ESI_W["surf_temp"]),
    ]
    esi = 1.0
    for x, xe, w in params:
        if x+xe > 0:
            esi *= (1-abs(x-xe)/(x+xe))**(w/W_TOTAL)
    return float(esi)

def _hz_score(a_AU, hz_in, hz_out):
    if hz_out <= hz_in:
        return 0.0
    center = (hz_in + hz_out) / 2.0
    width  = hz_out - hz_in
    return float(max(0.0, 1.0 - abs(a_AU-center)/width))

def _atm_retention(v_esc):
    return float(min(v_esc/11.2, 1.0)), v_esc > 6.0

def _surface_temp(T_eq, retention):
    return float(T_eq + retention*33.0)

def _temp_score(T_surf):
    if 273 <= T_surf <= 373:
        return float(max(0.0, 1.0 - abs(T_surf-288.0)/85.0))
    elif 200 <= T_surf < 273:
        return float((T_surf-200)/(273-200)*0.5)
    elif 373 < T_surf <= 500:
        return float((500-T_surf)/(500-373)*0.3)
    return 0.0

def _water_retention(v_esc, T_surf, flare):
    v_sc = min(v_esc/11.2, 1.0)
    if 200 <= T_surf <= 373:
        t_sc = max(0.0, 1.0 - abs(T_surf-288.0)/85.0)
    elif T_surf < 200:
        t_sc = max(0.0, (T_surf-100.0)/100.0)*0.5
    elif T_surf <= 500:
        t_sc = max(0.0, (500.0-T_surf)/127.0)*0.3
    else:
        t_sc = 0.0
    return float(0.50*v_sc + 0.30*t_sc + 0.20*flare)

def _climate_stability(spectral_type, eccentricity, tidal_locked):
    variability = {"F":0.15,"G":0.08,"K":0.12,"M":0.30}
    var = variability.get(spectral_type[0].upper(), 0.10)
    return float((1-var) * (1-eccentricity) * (0.70 if tidal_locked else 1.0))

def _composition(density_gcm3):
    if   density_gcm3 < 3.0: return "Gas/Mini-Neptune"
    elif density_gcm3 < 5.0: return "Water World"
    elif density_gcm3 < 8.0: return "Rocky"
    else:                     return "Iron-rich"

def _tier(esi_adj, T_surf, hz_score, tidal_locked):
    in_hz  = hz_score > 0.3
    liquid = 220 <= T_surf <= 380
    if esi_adj >= 0.75 and in_hz and liquid and not tidal_locked:
        return "EARTH-LIKE"
    elif esi_adj >= 0.60 and (in_hz or liquid):
        return "PROMISING"
    elif tidal_locked and in_hz:
        return "TIDALLY LOCKED"
    elif in_hz:
        return "WARM"
    elif T_surf > 380:
        return "HOT"
    elif T_surf < 200:
        return "COLD"
    return "HOSTILE"

def _radius_from_transit(depth_ppm, R_star_rsun):
    if not depth_ppm or not R_star_rsun:
        return None
    return round(float(np.sqrt(depth_ppm/1e6)) * R_star_rsun * R_SUN_EARTH, 3)

# ── Main scoring function ─────────────────────────────────────────────────────

def compute_habitability_score(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run the full TRINETRA habitability pipeline on a new planet candidate.
    Returns a complete profile matching Phase 4 V4 output format.
    """
    T_eff    = float(params["T_eff"])
    L_star   = float(params["L_star"])
    spec     = str(params["spectral_type"])
    a_AU     = float(params["a_AU"])
    R_p      = float(params["R_planet_earth"])
    M_p      = float(params["M_planet_earth"])
    period   = float(params["period_days"])
    albedo   = float(params.get("albedo", 0.30))
    cnn_p    = float(params.get("cnn_probability", 0.50))
    snr      = float(params.get("snr", 5.0))
    ecc      = float(params.get("eccentricity", 0.05))
    depth    = params.get("transit_depth_ppm")
    R_star   = params.get("R_star_rsun")

    # Stellar properties
    sp       = STELLAR_PROPS.get(spec[0].upper(), STELLAR_PROPS["G"])
    stability= sp["stability"]
    activity = sp["activity"]
    flare    = sp["flare_risk"]
    tidal_lock = spec[0].upper() == "M" and period < 50.0

    # Physics
    T_eq          = _eq_temperature(L_star, a_AU, albedo)
    hz_in, hz_out = _habitable_zone(T_eff, L_star)
    density       = _density(R_p, M_p)
    v_esc         = _escape_vel(R_p, M_p)
    ret_sc, can_ret = _atm_retention(v_esc)
    T_surf        = _surface_temp(T_eq, ret_sc)
    esi_raw       = _esi(R_p, density, v_esc, T_surf)
    esi_adj       = esi_raw * activity
    hz_sc         = _hz_score(a_AU, hz_in, hz_out)
    t_sc          = _temp_score(T_surf)
    water_sc      = _water_retention(v_esc, T_surf, flare)
    clim_sc       = _climate_stability(spec, ecc, tidal_lock)
    tidal_pen     = 0.80 if (a_AU < 0.2 and spec[0].upper() in ("M","K")) else 1.0
    comp          = _composition(density)
    tier          = _tier(esi_adj, T_surf, hz_sc, tidal_lock)

    # Habitability probability
    hab_prob = (
        0.30 * esi_adj +
        0.20 * hz_sc +
        0.15 * ret_sc +
        0.15 * t_sc +
        0.10 * stability +
        0.10 * flare
    ) * tidal_pen

    # TRINETRA V4 composite score
    snr_norm = min(max(snr, 0.0)/30.0, 1.0)
    trinetra_score = (
        0.25 * esi_adj +
        0.20 * cnn_p +
        0.18 * snr_norm +
        0.12 * ret_sc +
        0.10 * t_sc +
        0.08 * hz_sc +
        0.07 * water_sc
    )

    # Optional transit-derived radius
    r_transit = _radius_from_transit(depth, R_star) if depth and R_star else None

    return {
        "star_id"            : params["star_id"],
        "spectral_type"      : spec,
        # Orbital
        "period_days"        : round(period, 4),
        "a_AU"               : round(a_AU, 4),
        "eccentricity"       : round(ecc, 4),
        # Stellar
        "T_eff_K"            : T_eff,
        "L_star_solar"       : L_star,
        "stellar_stability"  : round(stability, 3),
        "flare_risk_factor"  : round(flare, 3),
        "stellar_activity"   : round(activity, 3),
        # Habitable zone
        "hz_inner_AU"        : round(hz_in, 4),
        "hz_outer_AU"        : round(hz_out, 4),
        "hz_score"           : round(hz_sc, 4),
        "in_habitable_zone"  : hz_sc > 0.3,
        # Planetary physics
        "R_planet_earth"     : round(R_p, 3),
        "M_planet_earth"     : round(M_p, 3),
        "density_gcm3"       : round(density, 3),
        "composition"        : comp,
        "escape_vel_kms"     : round(v_esc, 3),
        "can_retain_atmosphere": can_ret,
        "atm_retention"      : round(ret_sc, 4),
        # Temperatures
        "T_eq_K"             : round(T_eq, 1),
        "T_surface_K"        : round(T_surf, 1),
        "temperature_score"  : round(t_sc, 4),
        # Habitability
        "esi_raw"            : round(esi_raw, 4),
        "esi_adjusted"       : round(esi_adj, 4),
        "habitability_prob"  : round(hab_prob, 4),
        "habitability_tier"  : tier,
        "tidally_locked"     : tidal_lock,
        "tidal_heating_pen"  : round(tidal_pen, 2),
        "climate_stability"  : round(clim_sc, 4),
        "water_retention"    : round(water_sc, 4),
        # TRINETRA scores
        "cnn_probability"    : round(cnn_p, 4),
        "snr_normalized"     : round(snr_norm, 4),
        "trinetra_score"     : round(trinetra_score, 4),
        # Optional
        "r_planet_from_transit": r_transit,
        "computed_at"        : __import__("datetime").datetime.utcnow().isoformat(),
    }
