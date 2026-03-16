# ─────────────────────────────────────────────────────────────────────────────
# TRINETRA - Phase 5: FastAPI Backend
# AI System for Exoplanet Discovery and Analysis
# ─────────────────────────────────────────────────────────────────────────────

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import Optional
import os

from .database import db
from .models import (
    HealthResponse, StatsResponse,
    PlanetResponse, PlanetListResponse,
    StarResponse, StarListResponse,
    TCEResponse, TCEListResponse,
    ScoreRequest, ScoreResponse,
)
from .habitability import compute_habitability_score

# ── App setup ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title       = "TRINETRA API",
    description = """
## TRINETRA — AI System for Exoplanet Discovery and Analysis

TRINETRA is a research-grade platform that combines deep learning transit
detection with multi-factor habitability scoring to rank exoplanet candidates
by their potential to support life.

### Pipeline Summary
- **Phase 1**: Kepler light curve processing (15 stars, 65,000 cadences each)
- **Phase 2**: Transit signal detection via BLS period search
- **Phase 3**: AstroNet CNN classifier (AUC=0.979, trained on 5,087 stars)
- **Phase 4**: Habitability Intelligence Engine (ESI + Monte Carlo + 14 factors)

### Scientific References
- Shallue & Vanderburg 2018 (AstroNet CNN architecture)
- Kopparapu et al. 2013 (Habitable zone boundaries)
- Schulze-Makuch et al. 2011 (Earth Similarity Index)
- Hippke & Heller 2019 (Transit Least Squares)
    """,
    version     = "1.0.0",
    contact     = {"name": "TRINETRA Project"},
    license_info= {"name": "MIT"},
)

# ── CORS — allow Next.js dashboard and any origin during development ───────────
app.add_middleware(
    CORSMiddleware,
    allow_origins     = ["*"],
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ── Utility ───────────────────────────────────────────────────────────────────
def success_response(data, count: int = None):
    return {
        "success"  : True,
        "count"    : count if count is not None else (
            len(data) if isinstance(data, list) else 1
        ),
        "data"     : data,
        "timestamp": datetime.utcnow().isoformat(),
    }

# ─────────────────────────────────────────────────────────────────────────────
# HEALTH
# ─────────────────────────────────────────────────────────────────────────────
@app.get(
    "/health",
    tags        = ["System"],
    summary     = "Health check",
    description = "Returns API status and database connectivity.",
)
async def health():
    db_status = await db.ping()
    return success_response({
        "status"      : "operational",
        "version"     : "1.0.0",
        "database"    : "connected" if db_status else "error",
        "pipeline"    : "TRINETRA Phase 1-4 complete",
        "model"       : "AstroNet V2 (AUC=0.979)",
    })

# ─────────────────────────────────────────────────────────────────────────────
# STATS
# ─────────────────────────────────────────────────────────────────────────────
@app.get(
    "/stats",
    tags        = ["System"],
    summary     = "Pipeline statistics",
    description = "Returns aggregate statistics across the full TRINETRA pipeline.",
)
async def stats():
    planets = await db.get_all_planets()
    stars   = await db.get_all_stars()
    tces    = await db.get_all_tce()

    if not planets:
        raise HTTPException(status_code=503, detail="Database not populated")

    tier_counts = {}
    for p in planets:
        tier = p.get("habitability_tier", "UNKNOWN")
        tier_counts[tier] = tier_counts.get(tier, 0) + 1

    in_hz    = sum(1 for p in planets if p.get("in_habitable_zone"))
    tl_count = sum(1 for p in planets if p.get("tidally_locked"))
    top_score= max((p.get("planet_probability", 0) or 0) for p in planets)
    top_star = next(
        (p["star_id"] for p in planets
         if (p.get("planet_probability") or 0) == top_score), None
    )

    return success_response({
        "pipeline_phases"      : 4,
        "total_stars_processed": len(stars),
        "total_tce_detected"   : len(tces),
        "total_planet_candidates": len(planets),
        "habitability_tiers"   : tier_counts,
        "planets_in_hz"        : in_hz,
        "tidally_locked"       : tl_count,
        "top_trinetra_score"   : round(top_score, 4),
        "top_candidate"        : top_star,
        "model_auc"            : 0.979,
        "training_stars"       : 5087,
        "data_source"          : "NASA Kepler Mission",
    })

# ─────────────────────────────────────────────────────────────────────────────
# PLANETS
# ─────────────────────────────────────────────────────────────────────────────
@app.get(
    "/planets",
    tags        = ["Planets"],
    summary     = "All planet candidates",
    description = "Returns all planet candidates ranked by TRINETRA composite score.",
)
async def get_planets(
    sort_by: str = Query("planet_probability", description="Sort field"),
    limit  : int = Query(50, ge=1, le=100, description="Max results"),
    tier   : Optional[str] = Query(None, description="Filter by tier e.g. EARTH-LIKE"),
):
    planets = await db.get_all_planets()
    if not planets:
        raise HTTPException(status_code=404, detail="No planet data found")

    if tier:
        planets = [p for p in planets
                   if p.get("habitability_tier","").upper() == tier.upper()]

    planets.sort(key=lambda x: x.get(sort_by, 0) or 0, reverse=True)
    planets = planets[:limit]

    return success_response(planets, count=len(planets))


@app.get(
    "/planets/top/{n}",
    tags        = ["Planets"],
    summary     = "Top N planet candidates",
    description = "Returns the top N candidates by TRINETRA score.",
)
async def get_top_planets(n: int):
    if n < 1 or n > 50:
        raise HTTPException(status_code=400, detail="n must be between 1 and 50")
    planets = await db.get_all_planets()
    if not planets:
        raise HTTPException(status_code=404, detail="No planet data found")
    planets.sort(
        key=lambda x: x.get("planet_probability", 0) or 0, reverse=True
    )
    return success_response(planets[:n], count=n)


@app.get(
    "/planets/{star_id}",
    tags        = ["Planets"],
    summary     = "Single planet full profile",
    description = "Returns complete habitability profile for one planet candidate.",
)
async def get_planet(star_id: str):
    planet = await db.get_planet_by_id(star_id)
    if not planet:
        raise HTTPException(
            status_code=404,
            detail=f"Planet candidate for star '{star_id}' not found"
        )
    # Enrich with TCE data
    tce = await db.get_tce_by_id(star_id)
    if tce:
        planet["tce_data"] = tce
    return success_response(planet)

# ─────────────────────────────────────────────────────────────────────────────
# HABITABILITY
# ─────────────────────────────────────────────────────────────────────────────
@app.get(
    "/habitability/earthlike",
    tags        = ["Habitability"],
    summary     = "Earth-like planets only",
    description = "Returns only planets classified as EARTH-LIKE tier.",
)
async def get_earthlike():
    planets = await db.get_planets_by_tier("EARTH-LIKE")
    if not planets:
        raise HTTPException(status_code=404, detail="No Earth-like planets found")
    planets.sort(
        key=lambda x: x.get("planet_probability", 0) or 0, reverse=True
    )
    return success_response(planets)


@app.get(
    "/habitability/inzone",
    tags        = ["Habitability"],
    summary     = "Planets inside habitable zone",
    description = "Returns all planets with continuous HZ score above 0.3.",
)
async def get_in_hz():
    planets = await db.get_all_planets()
    if not planets:
        raise HTTPException(status_code=404, detail="No planet data found")
    in_hz = [p for p in planets if p.get("in_habitable_zone")]
    in_hz.sort(
        key=lambda x: x.get("planet_probability", 0) or 0, reverse=True
    )
    return success_response(in_hz)


@app.get(
    "/habitability/promising",
    tags        = ["Habitability"],
    summary     = "Promising candidates",
    description = "Returns EARTH-LIKE and PROMISING tier planets combined.",
)
async def get_promising():
    planets = await db.get_all_planets()
    if not planets:
        raise HTTPException(status_code=404, detail="No planet data found")
    promising = [
        p for p in planets
        if p.get("habitability_tier") in ("EARTH-LIKE", "PROMISING")
    ]
    promising.sort(
        key=lambda x: x.get("planet_probability", 0) or 0, reverse=True
    )
    return success_response(promising)

# ─────────────────────────────────────────────────────────────────────────────
# STARS
# ─────────────────────────────────────────────────────────────────────────────
@app.get(
    "/stars",
    tags        = ["Stars"],
    summary     = "All processed stars",
    description = "Returns metadata for all stars in the processed_stars table.",
)
async def get_stars():
    stars = await db.get_all_stars()
    if not stars:
        raise HTTPException(status_code=404, detail="No star data found")
    return success_response(stars)


@app.get(
    "/stars/{star_id}",
    tags        = ["Stars"],
    summary     = "Single star metadata",
    description = "Returns processing metadata for one star.",
)
async def get_star(star_id: str):
    star = await db.get_star_by_id(star_id)
    if not star:
        raise HTTPException(
            status_code=404,
            detail=f"Star '{star_id}' not found in processed_stars"
        )
    return success_response(star)

# ─────────────────────────────────────────────────────────────────────────────
# TCE
# ─────────────────────────────────────────────────────────────────────────────
@app.get(
    "/tce",
    tags        = ["Detection"],
    summary     = "All TCE candidates",
    description = "Returns all Threshold Crossing Events from Phase 2 detection.",
)
async def get_tce(
    flagged_only: bool = Query(False, description="Only return is_tce=True rows"),
):
    tces = await db.get_all_tce()
    if not tces:
        raise HTTPException(status_code=404, detail="No TCE data found")
    if flagged_only:
        tces = [t for t in tces if t.get("is_tce")]
    tces.sort(key=lambda x: x.get("tls_sde", 0) or 0, reverse=True)
    return success_response(tces)


@app.get(
    "/tce/{star_id}",
    tags        = ["Detection"],
    summary     = "TCE data for one star",
    description = "Returns transit detection data for a specific star.",
)
async def get_tce_star(star_id: str):
    tce = await db.get_tce_by_id(star_id)
    if not tce:
        raise HTTPException(
            status_code=404,
            detail=f"No TCE data for star '{star_id}'"
        )
    return success_response(tce)

# ─────────────────────────────────────────────────────────────────────────────
# SEARCH
# ─────────────────────────────────────────────────────────────────────────────
@app.get(
    "/search",
    tags        = ["Search"],
    summary     = "Search planet candidates",
    description = """
Search and filter planet candidates by multiple criteria.

**Examples:**
- `/search?tier=EARTH-LIKE` — all Earth-like planets
- `/search?min_score=0.5&in_hz=true` — high scoring HZ planets
- `/search?composition=Rocky&min_esi=0.8` — rocky Earth-like planets
    """,
)
async def search_planets(
    tier       : Optional[str]  = Query(None,  description="Habitability tier"),
    composition: Optional[str]  = Query(None,  description="Rocky, Water World, etc"),
    in_hz      : Optional[bool] = Query(None,  description="Inside habitable zone"),
    min_score  : Optional[float]= Query(None,  description="Min TRINETRA score"),
    max_score  : Optional[float]= Query(None,  description="Max TRINETRA score"),
    min_esi    : Optional[float]= Query(None,  description="Min ESI score"),
    tidally_locked: Optional[bool] = Query(None, description="Tidally locked flag"),
    limit      : int            = Query(20, ge=1, le=100),
):
    planets = await db.get_all_planets()
    if not planets:
        raise HTTPException(status_code=404, detail="No planet data found")

    results = planets

    if tier:
        results = [p for p in results
                   if p.get("habitability_tier","").upper() == tier.upper()]
    if composition:
        results = [p for p in results
                   if composition.lower() in
                   (p.get("composition") or "").lower()]
    if in_hz is not None:
        results = [p for p in results if p.get("in_habitable_zone") == in_hz]
    if min_score is not None:
        results = [p for p in results
                   if (p.get("planet_probability") or 0) >= min_score]
    if max_score is not None:
        results = [p for p in results
                   if (p.get("planet_probability") or 0) <= max_score]
    if min_esi is not None:
        results = [p for p in results
                   if (p.get("esi_score") or 0) >= min_esi]
    if tidally_locked is not None:
        results = [p for p in results
                   if p.get("tidally_locked") == tidally_locked]

    results.sort(
        key=lambda x: x.get("planet_probability", 0) or 0, reverse=True
    )
    results = results[:limit]

    return success_response(results, count=len(results))

# ─────────────────────────────────────────────────────────────────────────────
# SCORE — Run habitability engine on new star
# ─────────────────────────────────────────────────────────────────────────────
@app.post(
    "/score",
    tags        = ["Analysis"],
    summary     = "Score a new planet candidate",
    description = """
Submit stellar and planetary parameters to compute a full TRINETRA habitability
profile on demand. This runs the Phase 4 engine in real time.

**Required fields:** star_id, T_eff, L_star, spectral_type, period_days,
a_AU, R_planet_earth, M_planet_earth

**Optional:** albedo (default 0.30), cnn_probability (default 0.5), snr (default 5.0)
    """,
)
async def score_planet(request: ScoreRequest):
    try:
        result = compute_habitability_score(request.dict())
        return success_response(result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ── Root redirect to docs ──────────────────────────────────────────────────────
@app.get("/", include_in_schema=False)
async def root():
    return JSONResponse({
        "message" : "TRINETRA API is running.",
        "docs"    : "/docs",
        "redoc"   : "/redoc",
        "health"  : "/health",
        "version" : "1.0.0",
    })
