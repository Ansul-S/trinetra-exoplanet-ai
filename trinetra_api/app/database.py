# ─────────────────────────────────────────────────────────────────────────────
# TRINETRA - Database Layer
# All Supabase queries in one place
# ─────────────────────────────────────────────────────────────────────────────

import os
from supabase import create_client, Client
from typing import Optional, List, Dict, Any


class TrinetraDB:
    """
    Async-compatible wrapper around Supabase client.
    All methods return plain Python dicts/lists for JSON serialization.
    """

    def __init__(self):
        url = os.environ.get("SUPABASE_URL")
        key = os.environ.get("SUPABASE_KEY")
        if not url or not key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_KEY environment variables required."
            )
        self._client: Client = create_client(url, key)

    async def ping(self) -> bool:
        """Check database connectivity."""
        try:
            self._client.table("planet_candidates").select("id").limit(1).execute()
            return True
        except Exception:
            return False

    # ── planet_candidates ────────────────────────────────────────────────────

    async def get_all_planets(self) -> List[Dict[str, Any]]:
        """All rows from planet_candidates."""
        try:
            result = self._client.table("planet_candidates").select("*").execute()
            return result.data or []
        except Exception:
            return []

    async def get_planet_by_id(self, star_id: str) -> Optional[Dict[str, Any]]:
        """Single planet by star_id."""
        try:
            result = (
                self._client.table("planet_candidates")
                .select("*")
                .eq("star_id", star_id)
                .execute()
            )
            return result.data[0] if result.data else None
        except Exception:
            return None

    async def get_planets_by_tier(self, tier: str) -> List[Dict[str, Any]]:
        """Filter planets by habitability tier."""
        try:
            result = (
                self._client.table("planet_candidates")
                .select("*")
                .eq("habitability_tier", tier)
                .execute()
            )
            return result.data or []
        except Exception:
            return []

    async def upsert_planet(self, data: Dict[str, Any]) -> bool:
        """Insert or update a planet candidate."""
        try:
            self._client.table("planet_candidates").upsert(
                data, on_conflict="star_id"
            ).execute()
            return True
        except Exception:
            return False

    # ── processed_stars ──────────────────────────────────────────────────────

    async def get_all_stars(self) -> List[Dict[str, Any]]:
        """All rows from processed_stars."""
        try:
            result = self._client.table("processed_stars").select("*").execute()
            return result.data or []
        except Exception:
            return []

    async def get_star_by_id(self, star_id: str) -> Optional[Dict[str, Any]]:
        """Single star by star_id."""
        try:
            result = (
                self._client.table("processed_stars")
                .select("*")
                .eq("star_id", star_id)
                .execute()
            )
            return result.data[0] if result.data else None
        except Exception:
            return None

    # ── tce_candidates ───────────────────────────────────────────────────────

    async def get_all_tce(self) -> List[Dict[str, Any]]:
        """All rows from tce_candidates."""
        try:
            result = self._client.table("tce_candidates").select("*").execute()
            return result.data or []
        except Exception:
            return []

    async def get_tce_by_id(self, star_id: str) -> Optional[Dict[str, Any]]:
        """Single TCE record by star_id."""
        try:
            result = (
                self._client.table("tce_candidates")
                .select("*")
                .eq("star_id", star_id)
                .execute()
            )
            return result.data[0] if result.data else None
        except Exception:
            return None


# Singleton instance
db = TrinetraDB()
