import os
import sys
from pathlib import Path

# Automatically inject root and api directories into sys.path
root_dir = Path(__file__).resolve().parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

api_dir = root_dir / "api"
if str(api_dir) not in sys.path:
    sys.path.insert(0, str(api_dir))

from api.app.main import app

if __name__ == "__main__":
    import uvicorn
    port = int(str(os.environ.get("PORT", "8000")).strip())
    host = os.environ.get("HOST", "0.0.0.0").strip()
    print(f"Starting Trend Compass API on {host}:{port}")
    uvicorn.run("main:app", host=host, port=port)

