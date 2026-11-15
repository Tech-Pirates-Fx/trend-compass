# Trend Compass · Comprehensive Agent Handoff

**Project:** Trend Compass  
**Team:** Tech Pirates  
**Challenge:** NASA Space Apps Challenge 2026 — *"Be An Earth System Trend Detective!"*  
**Date:** 15 November 2026  
**Status:** 100% Real NASA Data Engine Active + Complete Space-Pirate Exploration Game Experience Delivered  
**Next Agent Owner:** Incoming Collaborator AI Agent  

---

## 1. Quick Orientation & Mandatory Reading Order

Welcome to **Trend Compass**! You are stepping in to continue work on an educational, polished space-pirate Earth trend exploration game built with real NASA Earth observations.

Before running commands or altering code, read these files in order:
1. This file: [AGENT_HANDOFF.md](AGENT_HANDOFF.md)
2. [docs/TEAM_PLAYBOOK.md](docs/TEAM_PLAYBOOK.md) (operating rules, honesty rules, token saving)
3. The latest entries in [docs/STATUS.md](docs/STATUS.md) and [docs/AI_LOG.md](docs/AI_LOG.md)
4. [docs/VALIDATION.md](docs/VALIDATION.md) (mathematical and statistical proof of GISTEMP v4 concordance)
5. [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) (Vercel GitHub Actions and Render deployment setup)

### Core Rules for AI Agents:
- **Do not restart completed work or rewrite functioning components.**
- **Do not ask questions in chat.** If a strategic choice is required, append a `DECISION NEEDED` block to `docs/STATUS.md` and continue with unblocked work.
- **Port Discipline:** FastAPI backend runs on port `8000`. Next.js frontend runs on port `3000`.
- **Honesty Rule:** Never fabricate numbers, citations, or synthetic results. If a dataset is not yet integrated (e.g. Rainfall or Vegetation), keep it locked with an honest explanation modal.
- **Git & Push Rule:** Never push to Git or deploy externally without Joshua's explicit approval in the conversation.

---

## 2. What Is Built and Working

### A. The Complete Game Experience ([web/app/page.tsx](web/app/page.tsx))
Play is structured as a 6-scene journey aboard the **Star Galleon** alongside **First Mate Piper**:
1. **Scene 1 (Intro)**: Skippable opening introducing Tech Pirates and the goal: investigating verified planetary evidence without speculation. Welcoming Piper sprite (`piper-fullbody-intro.png`) with Continue, Skip, and an accessible HUD `Replay Intro` button.
2. **Scene 2 (Hub - Earth Expedition Hub)**: Lively expedition catalog with status tags:
   - **Mission 01 (Temperature Horizons)**: 🟢 Playable now with real NASA GISTEMP v4 NetCDF data.
   - **Mission 02 (Rainfall Patterns)**: 🔒 Locked. Honest explanation that authenticated NASA Giovanni IMERG export is in progress (no fake data).
   - **Mission 03 (Green Cover & Canopy)**: 🔒 Locked. Scheduled Phase 2 extension for MODIS MOD13C2 vegetation index.
   - **Planetary Astrolabe**: Rotatable 3D NASA Blue Marble globe, territory search with instant filtering, and presets with both warming (India, Australia, Kenya, Brazil, USA, Japan) and inconclusive/natural variability regions (Norway, Weddell Sea).
3. **Scene 3 (Briefing)**: Grounded thoughtful Piper sprite (`piper-fullbody-thinking.png`) introducing the locked territory and 2000–2020 record window.
4. **Scene 4 (Prediction)**: 4 scientifically valid choices:
   - 🔺 **Rising (+🌡️)**: Warming trend expected.
   - 🔻 **Falling (-❄️)**: Cooling trend expected.
   - ⚖️ **No Statistically Significant Trend**: Natural fluctuations / flat baseline.
   - ❓ **Unsure**: Respected scientific choice; withhold judgment until data arrives.
5. **Scene 5 (Scanning)**: Animated 360° radar sweep over the holotank with Web Audio sonar pulses and live telemetry querying real NASA GISTEMP v4 NetCDF. Includes an in-game master-switch restore button if sensors are toggled off.
6. **Scene 6 (Evidence Reveal & Debrief)**: Celebratory Piper sprite (`piper-fullbody-discovery.png`). Prominently answers the challenge's 4 core questions:
   - **Q1: What changed**: Surface Temperature Anomaly relative to 1951–1980 baseline.
   - **Q2: Where**: Territory name and exact bounding box coordinates.
   - **Q3: How much**: Decadal slope with 95% confidence intervals and total period change across 252 monthly observations.
   - **Q4: Is it significant**: Hamed-Rao modified Mann-Kendall test verdict and p-value, with the explicit scientific banner: **"Not statistically significant does NOT mean no change."**
   - **Interactive Tabs**: The 4 Answers Summary, Time Series Chart (Plotly), Statistical Comparison Table (Theil-Sen vs OLS vs Mann-Kendall vs Hamed-Rao), and Provenance.
   - **Honest Rewards**: Points and badges (*Keen Navigator*, *Careful Scientist*, *Prudent Skeptic*, *Honest Observer*) logged into the Voyage Logbook.
   - **Actions**: `🧭 Next Expedition`, `↺ Replay Territory`, and `Ship's Logbook`.

### B. Procedural Celestial Backdrop ([web/components/CosmicBackdrop.tsx](web/components/CosmicBackdrop.tsx))
- Lightweight HTML5 Canvas layered celestial horizon replacing static background images.
- Features: 3-layer parallax drifting and twinkling star fields, curved glowing planetary Earth limb with atmospheric haze, shifting procedural cosmic aurora, and periodic celestial meteors (~12–18s) and satellite transits.
- Automatically pauses when tab is hidden (`document.hidden`) to save CPU/GPU.
- Renders a clean static starfield when `prefers-reduced-motion` is active.
- Includes a bottom-right sky control pill (`⏸ Pause Sky` / `▶ Resume Sky`).

### C. Space-Themed Web Audio Synthesizer ([web/lib/game-audio.ts](web/lib/game-audio.ts))
- Pure Web Audio API: zero external audio assets, zero downloads.
- Procedural cues for: console click, skip, selection chime, rising/falling/flat/unsure prediction tones, radar sweep, evidence resolution chord, and discovery fanfare.
- Ultra-quiet ambient ship hum (55/110Hz detuned sine wave through 110Hz lowpass filter at 0.012 gain) starting safely only after a user gesture.
- Mute toggle in Navbar and HUD, persisted in `localStorage` (`tc-audio-muted`).

### D. Star Galleon Voyage Logbook ([web/components/VoyageLogModal.tsx](web/components/VoyageLogModal.tsx))
- Accessible modal dialog tracking expeditions completed, territories mapped, discovery points, and explorer rank (*Cadet Navigator* → *Planetary Explorer* → *Astrolabe Officer* → *Master Star Galleon Commander*).
- Persisted locally in `localStorage` (`tc-voyage-log`).

### E. Simplified 3-Destination Navigation ([web/components/Navbar.tsx](web/components/Navbar.tsx), [web/components/AppShell.tsx](web/components/AppShell.tsx))
- Top navigation bar has exactly 3 primary destinations:
  - **Play** (`/` or `/play` redirecting with parameters preserved)
  - **About Us** (`/about`, including Team, Mission, Impact, Tools, and links)
  - **Data Management** (`/data`, including local data switches, inventory, receipts, and citations)
- All 11 legacy routes (`/investigate`, `/results`, `/mission`, `/crew`, `/sources`, `/summary`, etc.) redirect cleanly with HTTP 307.

### F. Real NASA GISTEMP v4 Data Store & Statistical Engine
- Official NASA GISS combined grid (`gistemp1200_GHCNv4_ERSSTv5.nc.gz`, SHA-256 verified) ingested into a 114 MB memory-mapped float32 store at `data-pipeline/processed/gistemp/`.
- Covers **1880-01 to 2026-10 (1,762 months)** on a 2° × 2° grid.
- Weighted cosine-latitude mean matches published NASA tables with $r = 0.9994$ and MAE = $0.0120$ °C.
- Five statistical methods: Theil-Sen slope regression, OLS regression, Mann-Kendall rank correlation, Hamed-Rao modified Mann-Kendall (autocorrelation-corrected variance), and Seasonal Mann-Kendall.

---

## 3. How to Run and Verify the System

### Start All Services (1-Click)
Run `.\start-all.bat` from the repo root.
- **Backend API**: `http://127.0.0.1:8000`
- **Frontend App**: `http://localhost:3000`
- **Health Check**: `http://127.0.0.1:8000/health`

### Run Verification Commands
```bash
# 1. Backend Pytest (29 passed)
$env:PYTHONPATH="."
pytest

# 2. Frontend TypeScript Check (0 errors)
cd web
npx tsc --noEmit

# 3. Frontend Lint (0 errors)
npm run lint

# 4. Next.js Production Build (18 routes green)
npm run build
```

### Live Test Queries
```bash
# Test GISTEMP Analysis for India (Significant Warming)
python -c "import urllib.request, json; data = json.dumps({'variable_id': 'surface_temperature_anomaly', 'bbox': {'south': 8.0, 'north': 37.0, 'west': 68.0, 'east': 97.0}, 'start': '2000-01', 'end': '2020-12', 'resolution': 'monthly'}).encode('utf-8'); req = urllib.request.Request('http://localhost:3000/api/py/analyze', data=data, headers={'Content-Type': 'application/json'}); res = urllib.request.urlopen(req); d = json.loads(res.read().decode()); print('India:', d['summary']['verdict'], d['summary']['rate_per_decade'], '°C/dec, p-val:', d['summary']['p_value'], 'is_mock:', d['is_mock'])"
# Expected: India: significant 0.157 °C/dec, p-val: 0.001339 is_mock: False

# Test GISTEMP Analysis for Norway (Inconclusive / Natural Variability)
python -c "import urllib.request, json; data = json.dumps({'variable_id': 'surface_temperature_anomaly', 'bbox': {'south': 57.9, 'north': 71.2, 'west': 4.5, 'east': 31.1}, 'start': '2000-01', 'end': '2020-12', 'resolution': 'monthly'}).encode('utf-8'); req = urllib.request.Request('http://localhost:3000/api/py/analyze', data=data, headers={'Content-Type': 'application/json'}); res = urllib.request.urlopen(req); d = json.loads(res.read().decode()); print('Norway:', d['summary']['verdict'], d['summary']['rate_per_decade'], '°C/dec, p-val:', d['summary']['p_value'], 'is_mock:', d['is_mock'])"
# Expected: Norway: not_significant 0.3234 °C/dec, p-val: 0.1081 is_mock: False
```

---

## 4. Remaining Tasks for the Incoming Agent

1. **Rainfall IMERG Integration (Task H2 / A2)**:
   - The IMERG anonymous HTTPS archive returned HTTP 401. A teammate needs to log into NASA Giovanni and export **one authenticated area-averaged monthly CSV** (IMERG V07 Final, 2001–2025, box $W=-15, S=12, E=15, N=18$) into `data-samples/imerg-monthly.csv`.
   - See [docs/RAINFALL_NEXT.md](docs/RAINFALL_NEXT.md) for the exact step-by-step instructions.
   - Once acquired, build the CSV/NetCDF adapter and unlock Mission 02.
2. **Demo Video Recording (<30 seconds)**:
   - The competition requires a walk-through video under 30 seconds.
   - The exact spoken script and screen sequence are written in [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).
3. **Usability Testing (Task T14)**:
   - Test the game with 5 students/users using the protocol in [docs/USABILITY.md](docs/USABILITY.md).
4. **Milestone Review (Gate G3)**:
   - Final review of project submission materials before making the GitHub repository public and submitting.

---

## 5. Deployment Setup Summary

- **Vercel**: GitHub Actions workflow at `.github/workflows/deploy-vercel.yml` handles deployment on pushes to `main` with collaborator safeguards and pre-publish checks.
- **Render**: Configured in `render.yaml` with a fail-fast pre-build script `render_build.sh` that checks Python dependencies and builds the GISTEMP binary store.
- Details in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
