"""
TRINETRA API - Entry Point

Run locally:
    python main.py

Or with uvicorn directly:
    uvicorn app.main:app --reload --port 8000

Swagger docs at: http://localhost:8000/docs
"""

import uvicorn
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host    = "0.0.0.0",
        port    = 8000,
        reload  = True,
        log_level = "info",
    )
