# ─────────────────────────────────────────────────────────────────────────────
# TRINETRA - Pydantic Models
# Request and response schemas with validation
# ─────────────────────────────────────────────────────────────────────────────

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Any, Dict
from datetime import datetime


# ── Response wrappers ─────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    success  : bool
    data     : Dict[str, Any]
    timestamp: str

class StatsResponse(BaseModel):
    success  : bool
    data     : Dict[str, Any]
    timestamp: str

class PlanetResponse(BaseModel):
    success  : bool
    count    : int
    data     : Dict[str, Any]
    timestamp: str

class PlanetListResponse(BaseModel):
    success  : bool
    count    : int
    data     : List[Dict[str, Any]]
    timestamp: str

class StarResponse(BaseModel):
    success  : bool
    count    : int
    data     : Dict[str, Any]
    timestamp: str

class StarListResponse(BaseModel):
    success  : bool
    count    : int
    data     : List[Dict[str, Any]]
    timestamp: str

class TCEResponse(BaseModel):
    success  : bool
    count    : int
    data     : Dict[str, Any]
    timestamp: str

class TCEListResponse(BaseModel):
    success  : bool
    count    : int
    data     : List[Dict[str, Any]]
    timestamp: str


# ── POST /score request body ──────────────────────────────────────────────────

class ScoreRequest(BaseModel):
    """
    Input parameters for scoring a new planet candidate.
    All physical parameters use standard astronomical units.
    """
    # Required stellar parameters
    star_id       : str   = Field(..., description="Unique star identifier e.g. KIC-12345")
    T_eff         : float = Field(..., ge=2000, le=40000,
                                  description="Stellar effective temperature (K)")
    L_star        : float = Field(..., gt=0, le=1000,
                                  description="Stellar luminosity (solar units)")
    spectral_type : str   = Field(..., description="Spectral type e.g. G5V, M0V, K2V")

    # Required orbital parameters
    period_days   : float = Field(..., gt=0, le=10000,
                                  description="Orbital period (days)")
    a_AU          : float = Field(..., gt=0, le=20,
                                  description="Semi-major axis (AU)")

    # Required planetary parameters
    R_planet_earth: float = Field(..., gt=0, le=20,
                                  description="Planet radius (Earth radii)")
    M_planet_earth: float = Field(..., gt=0, le=1000,
                                  description="Planet mass (Earth masses)")

    # Optional parameters with smart defaults
    albedo        : float = Field(0.30, ge=0, le=1,
                                  description="Bond albedo (default 0.30 = Earth-like)")
    cnn_probability: float = Field(0.50, ge=0, le=1,
                                   description="CNN planet probability from AstroNet")
    snr           : float = Field(5.0,  ge=0,
                                  description="Transit signal-to-noise ratio")
    eccentricity  : float = Field(0.05, ge=0, le=0.99,
                                  description="Orbital eccentricity (default 0.05)")
    transit_depth_ppm: Optional[float] = Field(
        None, description="Transit depth in parts per million (optional)"
    )
    R_star_rsun   : Optional[float] = Field(
        None, description="Stellar radius in solar units (for radius derivation)"
    )

    @validator("spectral_type")
    def validate_spectral_type(cls, v):
        if v[0].upper() not in ("F", "G", "K", "M", "A", "B", "O"):
            raise ValueError(f"Unrecognized spectral type: {v}")
        return v

    class Config:
        schema_extra = {
            "example": {
                "star_id"        : "KIC-9999999",
                "T_eff"          : 5500,
                "L_star"         : 0.85,
                "spectral_type"  : "G8V",
                "period_days"    : 180.0,
                "a_AU"           : 0.72,
                "R_planet_earth" : 1.4,
                "M_planet_earth" : 2.5,
                "albedo"         : 0.30,
                "cnn_probability": 0.78,
                "snr"            : 8.5,
                "eccentricity"   : 0.04,
            }
        }


class ScoreResponse(BaseModel):
    success  : bool
    count    : int
    data     : Dict[str, Any]
    timestamp: str
