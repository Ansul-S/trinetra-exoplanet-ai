# TRINETRA API

FastAPI backend for the TRINETRA Exoplanet Discovery and Analysis System.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | API health check |
| GET | /stats | Pipeline statistics |
| GET | /planets | All planet candidates |
| GET | /planets/top/{n} | Top N by TRINETRA score |
| GET | /planets/{star_id} | Single planet profile |
| GET | /habitability/earthlike | EARTH-LIKE tier only |
| GET | /habitability/inzone | Planets in habitable zone |
| GET | /habitability/promising | EARTH-LIKE + PROMISING |
| GET | /stars | All processed stars |
| GET | /stars/{star_id} | Single star metadata |
| GET | /tce | All TCE candidates |
| GET | /tce/{star_id} | TCE for one star |
| GET | /search | Filter by tier, composition, score |
| POST | /score | Score a new planet candidate |

## Local Development

```bash
# 1. Clone and enter directory
cd trinetra-api

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# 5. Run
python main.py

# API runs at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

## Deploy to Railway

1. Push this folder to GitHub at `api/` in your trinetra repo
2. Go to railway.app and create a new project
3. Connect your GitHub repo
4. Set environment variables: SUPABASE_URL and SUPABASE_KEY
5. Railway auto-deploys on every push

## Example Requests

```bash
# Get all planet candidates
curl https://your-api.railway.app/planets

# Get top 5 candidates
curl https://your-api.railway.app/planets/top/5

# Get Earth-like planets only
curl https://your-api.railway.app/habitability/earthlike

# Search for rocky planets in HZ with high score
curl "https://your-api.railway.app/search?composition=Rocky&in_hz=true&min_score=0.5"

# Score a new planet candidate
curl -X POST https://your-api.railway.app/score \
  -H "Content-Type: application/json" \
  -d '{
    "star_id": "KIC-9999999",
    "T_eff": 5500,
    "L_star": 0.85,
    "spectral_type": "G8V",
    "period_days": 180.0,
    "a_AU": 0.72,
    "R_planet_earth": 1.4,
    "M_planet_earth": 2.5,
    "cnn_probability": 0.78,
    "snr": 8.5
  }'
```
