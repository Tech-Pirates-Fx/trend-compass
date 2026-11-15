# Samjosh → Ramakrishna: Trend Compass Handoff & Project Roadmap

**Project:** Trend Compass  
**Team:** Tech Pirates  
**Competition:** NASA Space Apps Challenge 2026  
**Challenge:** *Be An Earth System Trend Detective!*  
**Date & Location:** 14 November 2026, Asia/Kolkata  
**Current HEAD Baseline:** `8882cdb` + approved local working tree  
**Working State:** Real NASA GISTEMP v4 engine active, live API verified on port `8000`, Next.js 14 frontend verified on port `3000`, First Mate Piper mascot guide implemented, in-app handbook pages active, competition submission artifacts complete in `docs/`.

---

## 1. Instructions for Ramakrishna's AI Agent

> [!IMPORTANT]
> **Read this first before executing any commands.**
> 
> You are continuing **Trend Compass** for team **Tech Pirates**. You own the frontend, backend, data pipeline, and documentation within the approved scope.
> 
> **Mandatory Reading Order:**
> 1. This file (`samjosh_handoff_to_ramakrishna.md`)
> 2. The override at the top of [docs/TEAM_PLAYBOOK.md](file:///c:/Users/RAMAKRISHNA%20S/nasa-app/docs/TEAM_PLAYBOOK.md)
> 3. The approved delivery track at the top of [docs/TASKS.md](file:///c:/Users/RAMAKRISHNA%20S/nasa-app/docs/TASKS.md)
> 4. The last 30 lines of [docs/STATUS.md](file:///c:/Users/RAMAKRISHNA%20S/nasa-app/docs/STATUS.md)
> 5. [docs/RESOURCE_PLAN.md](file:///c:/Users/RAMAKRISHNA%20S/nasa-app/docs/RESOURCE_PLAN.md)
> 6. [docs/VALIDATION.md](file:///c:/Users/RAMAKRISHNA%20S/nasa-app/docs/VALIDATION.md)

### Agent Operating Rules:
- **Do not restart completed research or rewrite functioning components.**
- **Do not ask questions in chat.** If a strategic choice is required, write a `DECISION NEEDED` block in `docs/STATUS.md` and proceed with other unblocked work.
- **Port Discipline:** The FastAPI Python backend runs on port `8000`. The Next.js frontend runs on port `3000`. Do **NOT** launch background servers that hold open ports and collide with Ramakrishna's local terminal commands (`EADDRINUSE` / `[Errno 10048]`).
- **Never fabricate data or claims:** Never invent team members, biographies, community test results, submission deadlines, or deployment links. If something is unknown, label it `UNKNOWN`.
- **Maintain TLS & Provenance:** Never disable TLS or replace real NASA observations with synthetic/mock data.
- **Git Restrictions:** Do **NOT** push to Git, deploy publicly, change repository visibility, or spend money without explicit owner approval.
- **Logging:** Log AI tool usage in [docs/AI_LOG.md](file:///c:/Users/RAMAKRISHNA%20S/nasa-app/docs/AI_LOG.md) and append concise progress lines (max 10 lines) to [docs/STATUS.md](file:///c:/Users/RAMAKRISHNA%20S/nasa-app/docs/STATUS.md).

---

## 2. What We Have Done Until Now

### A. Data Pipeline & Scientific Engine (100% Real NASA Data)
1. **Acquisition with TLS & Cryptographic SHA-256 Receipts:**
   - Script: `data-pipeline/download_gistemp.py`
   - Downloaded official NASA GISTEMP v4 NetCDF: `data-raw/gistemp1200_GHCNv4_ERSSTv5.nc.gz` (25,885,943 bytes, SHA-256: `f7788db9044d0f0e3f9561ad5d0fd82e59cdfdb82ea8a10244f78f2cb032a3c7` — exact match).
   - Downloaded global monthly comparison table: `data-raw/GLB.Ts+dSST.csv` (12,887 bytes, SHA-256: `a7b1939db2e7e484c798e925e0f07f8184356c52ac0e7ce264adcd0f25e81253` — exact match).
   - Receipts recorded in `data-raw/acquisition.json`.
2. **Processed Memory-Mapped Store:**
   - Script: `data-pipeline/build_gistemp.py`
   - Built a 114.2 MB float32 memory-mapped store at `data-pipeline/processed/gistemp/` covering **1880-01 to 2026-10 (1,762 months)** on a regular 2° × 2° grid (1200 km smoothing) relative to the 1951–1980 baseline.
   - Global weighted mean comparison vs. NASA GISS published CSV: Mean Absolute Error (MAE) = `0.0120 °C`, RMSE = `0.0155 °C`, Pearson correlation $r = 0.9994$.
3. **Statistical Pipeline (Five Methods):**
   - **OLS:** Parametric linear slope with standard error and t-test p-value.
   - **Theil–Sen Robust Slope:** Non-parametric median of all pairwise monthly slopes. Immune to extreme heatwaves, volcanic eruptions, or sensor spikes. (Reported as rate per decade).
   - **Mann–Kendall (Original):** Non-parametric rank correlation test for monotonic trends.
   - **Hamed–Rao Modified Mann–Kendall:** Non-parametric trend significance test adjusting variance for serial autocorrelation ($r_1$). Prevents false alarms from natural climate persistence.
   - **Seasonal Mann–Kendall:** Tests across calendar months without forcing deseasonalization.
4. **Golden Region Audit:**
   - Audited 5 reference regions in `tests/audit/gistemp_audit.py` (Western Arctic, East Antarctic, Sahel, Amazon, Bering Strait). All categorical significance decisions are **100% concordant** with documented tolerances in [docs/VALIDATION.md](file:///c:/Users/RAMAKRISHNA%20S/nasa-app/docs/VALIDATION.md).
   - Backend automated tests: **24/24 passed** in `tests/audit/run_pytest.py`.
5. **Real Demo Presets:**
   - Script: `data-pipeline/cache_presets.py`
   - Generated `web/public/demo/presets.json` with 6 real precalculated investigations (Sahel, Mediterranean, Western Arctic, East Antarctic, Amazon, Great Barrier Reef).
6. **Live Backend API (FastAPI):**
   - Running on `http://127.0.0.1:8000` with the `gistemp` adapter.
   - Verified endpoints:
     - `GET /health` -> `status: healthy, adapter: gistemp, is_mock: false, verified: true`
     - `GET /catalog` -> `surface_temperature_anomaly (1880-01 to 2026-10)`
     - `POST /analyze` (Sahel `[-15, 12, 15, 18]`) -> `rate: +0.2405 °C/dec, verdict: significant, p = 9.75e-07, n = 310, is_mock: false, verified: true`.

---

### B. UI/UX & Game-Style Transformation
1. **Visual Theme: Space + Pirates + Ship + Earth Exploration:**
   - Eliminated conventional SaaS marketing filler and replaced it with a high-impact, story-driven Star Galleon expedition experience.
   - Preserved all scientific explanations, data citations, 1951–1980 baseline, and cosine-latitude weighting caveats.
2. **Interactive Mascot: First Mate Piper (Bottom-Left):**
   - Original 3D-shaded vector character: space corsair tricorn hat with golden star-compass medallion, cyan cyber-plume, cybernetic astrolabe comms monocle, brass frogging, and friendly anime-game-guide expressions.
   - **Clash of Clans Style Village Guide Dialogue Bubble:**
     - Connected speech bubble pointing directly to Piper.
     - Nameplate: `FIRST MATE PIPER · NAVIGATOR LV. 5 ⚓`.
     - Welcoming dialogue on arrival:
       > *"AHOY! Welcome aboard, Captain! I'm your navigator. Need help exploring Earth's secrets?"*
     - Interactive choices: `[ 🚀 Let's begin! ]`, `[ 🧭 Guide me ]`, `[ 📖 Translate Science ]`, `[ 📜 Story (1-6) ]`, `[ Maybe later ]`.
     - Persists dismissal in `localStorage` (`tc_pirate_onboarded`).
     - Collapses to a floating anchor coin (`⚓ Piper`) that can be restored with one click at any time.
3. **Beginner-Friendly Science Translator:**
   - Dedicated `📖 Translate Science` tab inside Piper explaining complex terms in simple plain English:
     - *GISTEMP v4, Temperature Anomaly, Precipitation, Historical Observations, Trend, Region Selection, Theil-Sen Robust Slope, Hamed-Rao MK, p-value, Serial Autocorrelation*.
4. **Context-Aware Guidance Across Every Page:**
   - Piper detects the active route and gives station-specific advice for:
     - `/` (Star Deck / Bridge)
     - `/demo` (Chart Room / Logbook)
     - `/investigate` (Expedition Bay)
     - `/results` (Evidence Chest)
     - `/mission` (Mission Briefing)
     - `/judge` (Judge Fast-Track)
     - `/sources` (Receipts & AI)
     - `/crew` (Crew Quarters)
5. **Preserved Core Functionality:**
   - Interactive 3D Earth Globe with NASA GIBS Blue Marble imagery, drag-to-rotate, and Natural Earth country selection.
   - 2D coordinate map and custom numeric bounding-box inputs ($S, W, N, E$).
   - Interactive Plotly time-series chart with observed anomaly points and Theil-Sen trend line.
   - Direct CSV export (`[ 📥 Plunder CSV ]`) and cryptographic provenance receipts.

---

### C. Competition Pages & Submission Artifacts Completed
1. **In-App Handbook Pages (Built in `web/app/`):**
   - [/mission](file:///c:/Users/RAMAKRISHNA%20S/nasa-app/web/app/mission/page.tsx): Challenge alignment, scientific problem, 4 Detective Quests, societal benefits.
   - [/crew](file:///c:/Users/RAMAKRISHNA%20S/nasa-app/web/app/crew/page.tsx): Tech Pirates manifest (Joshua, Ramakrishna, honest placeholder for Task H4).
   - [/judge](file:///c:/Users/RAMAKRISHNA%20S/nasa-app/web/app/judge/page.tsx): Judge fast-track terminal with 5 audited presets, honest caveats, and local verification commands.
   - [/sources](file:///c:/Users/RAMAKRISHNA%20S/nasa-app/web/app/sources/page.tsx): Dataset checksums, citations, software licenses, and AI disclosures.
2. **Submission Markdown Artifacts (Built in `docs/`):**
   - [docs/PROJECT_PAGE.md](file:///c:/Users/RAMAKRISHNA%20S/nasa-app/docs/PROJECT_PAGE.md): Formatted text ready to copy-paste into the official NASA Space Apps submission portal.
   - [docs/DEMO_SCRIPT.md](file:///c:/Users/RAMAKRISHNA%20S/nasa-app/docs/DEMO_SCRIPT.md): Exactly calibrated 28-second screen recording script for the mandatory <30-second YouTube video.
   - [docs/PITCH.md](file:///c:/Users/RAMAKRISHNA%20S/nasa-app/docs/PITCH.md): 30-second elevator pitch and four pillars.
   - [docs/USABILITY.md](file:///c:/Users/RAMAKRISHNA%20S/nasa-app/docs/USABILITY.md): 5-student usability test protocol and SUS questionnaire.
   - [docs/DATA_AND_AI.md](file:///c:/Users/RAMAKRISHNA%20S/nasa-app/docs/DATA_AND_AI.md): Exhaustive data provenance and AI utilization log.

---

## 3. What Needs to Be Completed (The Remaining Roadmap)

### A. Data & Research Part
| Priority | Task | Status | Action Required |
| :---: | :--- | :---: | :--- |
| **D1** | **Authentic Precipitation Export (Task A2 / H2)** | **BLOCKED (Human Step)** | Anonymous API access returns 401. A human teammate must log into [NASA Giovanni](https://giovanni.gsfc.nasa.gov/giovanni/), export monthly IMERG V07 Final (`2001-01` to `2025-12`) for Sahel (`W=-15, S=12, E=15, N=18`) into `data-samples/imerg-monthly.csv` per [docs/RAINFALL_NEXT.md](file:///c:/Users/RAMAKRISHNA%20S/nasa-app/docs/RAINFALL_NEXT.md). |
| **D2** | **Precipitation Parser & Integration** | Pending D1 | Build Giovanni CSV parser, wire dual-variable analysis (temperature vs. rainfall) into the API and UI charts. |
| **D3** | **Vegetation Feasibility Spike (Task A3)** | Backlog | Evaluate MOD13C2 Collection 6.1 monthly 0.05° access, QA flags, and file sizes. |
| **D4** | **Hamed–Rao Theoretical Documentation** | Documented | Document mathematical root of tie-correction variance differences in `docs/VALIDATION.md`. |

---

### B. UI, Video & Submission Part
| Priority | Task | Status | Action Required |
| :---: | :--- | :---: | :--- |
| **U1** | **Demo Video Recording (Task T14)** | Ready for Human | Record the screen walkthrough following [docs/DEMO_SCRIPT.md](file:///c:/Users/RAMAKRISHNA%20S/nasa-app/docs/DEMO_SCRIPT.md) (timed to 28 seconds to comply with the <30s rule), upload to YouTube, and paste the link into `docs/PROJECT_PAGE.md`. |
| **U2** | **Team Photos & Bios (Task H4)** | Ready for Human | Gather verified teammate photos and bios into `docs/team/`, then update [web/app/crew/page.tsx](file:///c:/Users/RAMAKRISHNA%20S/nasa-app/web/app/crew/page.tsx) and the NASA submission page. |
| **U3** | **Usability Feedback Execution (Task H5)** | Ready for Human | Run the 4-task protocol from [docs/USABILITY.md](file:///c:/Users/RAMAKRISHNA%20S/nasa-app/docs/USABILITY.md) with 5 non-expert students and record real SUS scores and quotes. |
| **U4** | **Public Repo Pre-Flight (Task H6)** | Pending Approval | Verify that all gitignored files remain clean, test incognito repository access, and get explicit owner approval before making the GitHub repo public. |
| **U5** | **NASA Portal Submission** | Ready | Fill in all 8 tabs of the NASA Space Apps submission page using the copy in [docs/PROJECT_PAGE.md](file:///c:/Users/RAMAKRISHNA%20S/nasa-app/docs/PROJECT_PAGE.md). |

---

## 4. NASA Space Apps Handbook Mapping & Rulebook Analysis

The table below maps the official **Award-Winning Project Page** handbook requirements to where they are fulfilled in Trend Compass:

| Handbook Tab / Rule | Rulebook Requirement | In-App Location | Submission Artifact | Status |
| :--- | :--- | :--- | :--- | :---: |
| **01 / About Tab** | Story about the team, skills, passion for the challenge, and societal impact. | `/mission` & `/crew` | `docs/PROJECT_PAGE.md` (Tab 1) | **Ready** |
| **02 / Member Tab** | List every member with photo and role. Add team picture. | `/crew` | `docs/PROJECT_PAGE.md` (Tab 2) | **Awaiting Photos (H4)** |
| **03 / High-Level Summary** | Name of project, what it does, who it helps, why it matters. | `/` & `/mission` | `docs/PROJECT_PAGE.md` (Tab 3) & `docs/PITCH.md` | **Ready** |
| **04 / Project Demo** | YouTube video demonstration **MUST be less than 30 seconds** ("30 Seconds of Glory"). | `/demo` (UI explorer) | `docs/DEMO_SCRIPT.md` (28s timed script) | **Ready to Record** |
| **05 / Project Prototype** | Working app or prototype link. | Localhost / Vercel | `docs/PROJECT_PAGE.md` (Tab 5) | **Ready for Deploy** |
| **06 / Project Details** | 1. Why, What, How (data used)<br>2. Community Involvement (hopes, benefits, feedback)<br>3. Tools & Technologies (languages, AI usage). | `/mission` & `/sources` | `docs/PROJECT_PAGE.md` (Tab 6) & `docs/USABILITY.md` | **Ready** |
| **07 / Data & AI Tab** | List every NASA dataset, explain how it was used, name AI tools/prompts, and credit assets. | `/sources` | `docs/DATA_AND_AI.md` & `docs/AI_LOG.md` | **Ready** |
| **08 / Public GitHub Link** | Open and public repository link. Must open without login or access request. | Navbar / Footer | Repository checklist in `docs/PROJECT_PAGE.md` | **Awaiting Sign-off (H6)** |

---

## 5. What Samjosh Must Send Ramakrishna (Gitignored Files Checklist)

Because data files and environments are gitignored, send the following files via Google Drive or email:

```
nasa-app-data-pack/
├── data-raw/
│   ├── gistemp1200_GHCNv4_ERSSTv5.nc.gz   (25.88 MB - SHA-256: f7788db9044d0f0e3f9561ad5d0fd82e59cdfdb82ea8a10244f78f2cb032a3c7)
│   ├── GLB.Ts+dSST.csv                     (12.89 KB - SHA-256: a7b1939db2e7e484c798e925e0f07f8184356c52ac0e7ce264adcd0f25e81253)
│   └── acquisition.json                    (Receipts metadata)
├── data-pipeline/processed/gistemp/        (Optional: 114.2 MB prebuilt mmap store; or Ramakrishna builds it in 15s)
│   ├── values.npy
│   ├── lat.npy
│   ├── lon.npy
│   ├── months.npy
│   └── manifest.json
└── .env.example                            (Environment template)
```

> [!WARNING]
> **Do NOT email passwords, personal Earthdata credentials, `.venv`, or `web/node_modules`.**
> Ramakrishna’s machine will install fresh dependencies and rebuild cleanly.

### Suggested Email Text from Samjosh to Ramakrishna:
```text
Subject: Tech Pirates / Trend Compass — Handoff Pack & NASA Data Files

Hi Ramakrishna,

Attached is our official NASA GISTEMP v4 raw data pack (with verified SHA-256 receipts) and samjosh_handoff_to_ramakrishna.md. 

Please clone the repository and drop the data-raw folder into your repo root. Have your AI agent read samjosh_handoff_to_ramakrishna.md first—it contains the exact startup commands, port rules, and completed work.

Current status:
1. GISTEMP v4 temperature analysis and GIBS imagery are 100% working with real data.
2. First Mate Piper navigator mascot and the game-like expedition UI are active.
3. Competition routes (/mission, /judge, /sources, /crew) and submission docs (PROJECT_PAGE, DEMO_SCRIPT) are ready.
4. Next for us: human export of monthly IMERG precipitation from NASA Giovanni (docs/RAINFALL_NEXT.md), recording the 28s demo video, and gathering crew photos.

Best,
Samjosh
```

---

## 6. Setup & Startup Instructions for Ramakrishna's Machine

### Step 1: Clone & Place Data Pack
```powershell
git clone <REPOSITORY_URL>
cd nasa-app

# Place the received data-raw/ folder in the root directory:
# Verify SHA-256 hashes:
Get-FileHash data-raw/gistemp1200_GHCNv4_ERSSTv5.nc.gz -Algorithm SHA256
# Expected: f7788db9044d0f0e3f9561ad5d0fd82e59cdfdb82ea8a10244f78f2cb032a3c7

Get-FileHash data-raw/GLB.Ts+dSST.csv -Algorithm SHA256
# Expected: a7b1939db2e7e484c798e925e0f07f8184356c52ac0e7ce264adcd0f25e81253
```

### Step 2: Python Environment Setup
```powershell
# Create Python 3.11 virtual environment:
python -m venv .venv

# Activate and install dependencies:
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r api/requirements.txt
```

### Step 3: Build the Processed Grid Store (Takes ~15 seconds)
```powershell
# Build the 114MB memory-mapped float32 store:
.\.venv\Scripts\python.exe data-pipeline/build_gistemp.py

# Generate real cached demo presets:
.\.venv\Scripts\python.exe data-pipeline/cache_presets.py
```

### Step 4: Run Backend Tests & Independent Audit
```powershell
# Run the 24 automated unit tests:
$env:OPENBLAS_NUM_THREADS='1'
.\.venv\Scripts\python.exe tests/audit/run_pytest.py

# Run golden region independent audit (5 regions):
.\.venv\Scripts\python.exe tests/audit/gistemp_audit.py
```

### Step 5: Start the Application

#### Terminal 1 — Python API (Port 8000)
```powershell
$env:DATA_ADAPTER='gistemp'
$env:OPENBLAS_NUM_THREADS='1'
.\.venv\Scripts\python.exe -m uvicorn api.app.main:app --host 127.0.0.1 --port 8000
```

#### Terminal 2 — Next.js Frontend (Port 3000)
```powershell
cd web
npm install
npm run dev
```

Open **`http://localhost:3000`** in your browser.

---

## 7. Verification Endpoints (Smoke Test)

In a third PowerShell window, verify system health:

```powershell
# 1. API Health:
Invoke-RestMethod http://127.0.0.1:8000/health
# Expected: status="healthy", adapter="gistemp", is_mock=false, verified=true

# 2. Dataset Catalog:
Invoke-RestMethod http://127.0.0.1:8000/catalog
# Expected: surface_temperature_anomaly (1880-01 to 2026-10)

# 3. Live Sahel Investigation Query:
$body = @{
    variable_id = "surface_temperature_anomaly"
    bbox = @{ west = -15.0; south = 12.0; east = 15.0; north = 18.0 }
    start = "2001-01"
    end = "2026-10"
    resolution = "monthly"
    deseasonalize = $false
    alpha = 0.05
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/analyze -ContentType 'application/json' -Body $body
# Expected: rate_per_decade ~ +0.241, verdict="significant", is_mock=false, verified=true
```

---

## 8. Final Checklist Before Submission

- [x] Official GISTEMP v4 acquired with TLS and exact SHA-256 checksum match.
- [x] Memory-mapped store compiled (1,762 months) and cached in `presets.json`.
- [x] 24/24 backend pytest tests passing.
- [x] Raw-grid golden region audit verified within documented tolerances.
- [x] Space + Pirates + Ship theme active with First Mate Piper mascot guide.
- [x] In-app competition pages built (`/mission`, `/judge`, `/sources`, `/crew`).
- [x] Submission copy drafted in `docs/PROJECT_PAGE.md`.
- [x] 28-second demo video script prepared in `docs/DEMO_SCRIPT.md`.
- [ ] Human export of monthly IMERG precipitation from NASA Giovanni (`data-samples/imerg-monthly.csv`).
- [ ] Record 28-second screen video, upload to YouTube, and paste link.
- [ ] Place crew photos in `docs/team/` and update manifest.
- [ ] Run usability testing protocol with 5 students (`docs/USABILITY.md`).
- [ ] Perform public repository pre-flight check and obtain owner sign-off to make public.
