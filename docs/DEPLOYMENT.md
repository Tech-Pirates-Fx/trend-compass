# Deployment Guide for Trend Compass

This guide details the complete deployment setup for **Trend Compass**, featuring automated Vercel deployments via owner-authenticated GitHub Actions for the Next.js frontend and reproducible NASA GISTEMP observation builds for the FastAPI backend on Render.

---

## 1. System Architecture & Monorepo Layout

Trend Compass is a two-tier application hosted in a monorepo:

| Component | Directory | Stack | Hosting Target | Configuration / Entrypoint |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | `/web` | Next.js 14 (App Router, Tailwind CSS, Plotly.js, Leaflet) | **Vercel** | `web/next.config.mjs`, Root Directory: `web` |
| **Backend** | `/api` | Python 3.11+ FastAPI (xarray, numpy, scipy, pymannkendall) | **Render** | Root: repository root (`.`), `api.app.main:app` |
| **Data Pipeline** | `/data-pipeline` | Memory-mapped binary store (float32 GISTEMP v4) | Built in Render CI | `download_gistemp.py` + `build_gistemp.py` |

```
Browser -> https://<project>.vercel.app/api/py/analyze
           | (Next.js server-side rewrite via PY_API_URL)
           v
           https://<backend>.onrender.com/analyze
```

---

## 2. Vercel Deployment via GitHub Actions

### Desired Collaborator Workflow
Any authorized teammate or collaborator pushes to `main` &rarr; GitHub Actions checks out that exact commit, runs type checks and linting, builds the precompiled bundle, and deploys directly to the existing Vercel project using the owner's credentials.

### GitHub Repository Secrets
These three secrets must be configured in your GitHub repository (**Settings &rarr; Secrets and variables &rarr; Actions**):

| Secret Name | Description | Source |
| :--- | :--- | :--- |
| `VERCEL_TOKEN` | Personal Access Token of the Vercel project owner | Vercel Dashboard &rarr; Account Settings &rarr; Tokens |
| `VERCEL_ORG_ID` | Owner / Team Organization ID | Found in `.vercel/project.json` or Project Settings |
| `VERCEL_PROJECT_ID` | Existing Vercel Project ID | Found in Project Settings &rarr; General &rarr; Project ID |

> **Security Rule:** Secret values are never printed, logged, or checked into repository files.

### Workflow Specification (`.github/workflows/deploy-vercel.yml`)
- **Triggers:**
  - This source snapshot uses manual dispatch only; its initial push does not deploy.
  - `workflow_dispatch` (restricted to `main`).
- **Permissions:** Read-only default repository permissions (`contents: read`).
- **Concurrency:** `concurrency: group: vercel-production, cancel-in-progress: false` ensures serial production deployments.
- **Pre-publish Validation:**
  - `npm ci` in `web/` with Node.js 20 and npm cache.
  - TypeScript type check (`npx tsc --noEmit`).
  - ESLint validation (`npm run lint`).
  - **Latest `main` SHA Check:** Before deploying, the workflow queries `origin/main`. If another commit landed while building, the workflow skips deployment of the stale build to prevent out-of-order rollbacks.
- **CLI Sequence:**
  ```bash
  vercel pull --yes --environment=production --token="$VERCEL_TOKEN"
  vercel build --prod --token="$VERCEL_TOKEN"
  vercel deploy --prebuilt --prod --token="$VERCEL_TOKEN"
  ```
- **Job Summary:** Outputs the deployed commit SHA, actor, and live Vercel deployment URL to `$GITHUB_STEP_SUMMARY`.

---

## 3. Crucial Vercel Dashboard Settings

Before activating GitHub Actions or pushing to `main`, verify these settings on the **existing** Vercel Project:

### 1. Root Directory Setting (CRITICAL)
- Navigate to: **Vercel Dashboard &rarr; Project Settings &rarr; General &rarr; Root Directory**.
- Click **Edit** and set to: `web`.
- *Why:* The Next.js frontend lives in `/web`. When `vercel pull` runs from repository root, it records `"rootDirectory": "web"` into `.vercel/project.json`, instructing `vercel build` to compile `web/` into `.vercel/output`.

### 2. Environment Variables
- Navigate to: **Project Settings &rarr; Environment Variables**.
- Add the following for **Production**:
  - `PY_API_URL`: Your live Render backend HTTPS base URL (e.g. `https://trend-compass-api.onrender.com`, without trailing slash).
- Ensure `NEXT_DIST_DIR` is **NOT** set in Vercel environment variables (defaults to `.next`).

### 3. Disabling Native Vercel Git Auto-Deployments
Because GitHub Actions is now the authoritative deployment pipeline, you must disable or ignore Vercel's native Git auto-deployments to avoid duplicate builds or commit-author collision errors.

- **Recommended Method (Vercel Dashboard):**
  1. Go to **Project Settings &rarr; Git**.
  2. Under **Ignored Build Step**, select **Custom**.
  3. Enter the command:
     ```bash
     exit 0
     ```
     *(In Vercel, exit code 0 skips the native Git build, leaving all deployments exclusively to GitHub Actions).*

---

## 4. Account-Plan Restrictions & Collaborator Policy

### The Vercel Hobby Plan Restriction
- On Vercel **Hobby (Free)** accounts, Vercel enforces a collaboration restriction on private repositories: only commits authored by the account owner are permitted to trigger native deployments.
- If a collaborator commits using their own email/identity, Vercel's native Git integration rejects the build:
  ```
  Commit author '<author>' is not a member of team '<owner>' and cannot deploy to this project.
  ```
- **How GitHub Actions Addresses This:**
  Our workflow triggers via Joshua's owner `VERCEL_TOKEN`. The API deployment is initiated by the owner account.
- **Honesty Rule:**
  We do **not** forge commit authors (`git commit --amend --reset-author`) or rewrite Git history to impersonate the owner.
  If Vercel's server-side API still enforces account-plan restrictions against the commit author's metadata on private repos:
  1. **Make Repository Public:** NASA Space Apps challenge rules mandate that the repository must be public before judging. On public GitHub repositories, Vercel Hobby accounts allow open-source collaborator deployments without restriction.
  2. **Upgrade to Vercel Pro:** If private repository collaboration is required, upgrade the Vercel team to Pro ($20/month per seat) and add team members.
  3. **Owner Merge:** The owner can merge collaborator pull requests directly into `main` or trigger `workflow_dispatch`.

---

## 5. Render Backend Configuration (Python FastAPI)

### Service Settings
- **Service Type:** Web Service
- **Root Directory:** *(Leave blank / default `.`)*
- **Build Command:** `bash render_build.sh`
- **Start Command:** `python -m uvicorn api.app.main:app --host 0.0.0.0 --port "$PORT"`
- **Health Check Path:** `/health`

### Environment Variables on Render
| Variable | Value | Purpose |
| :--- | :--- | :--- |
| `PYTHON_VERSION` | `3.11.9` | Enforces verified Python runtime |
| `PYTHONPATH` | `.` | Enables `api.app.*` module resolution from root |
| `DATA_ADAPTER` | `gistemp` | Activates verified NASA GISTEMP binary store (no mock) |

### The `render_build.sh` Script
Because Render disks are ephemeral and cloud instances do not share the developer's local `.cache` or ignored files, `render_build.sh` builds the verified store during each deployment:
1. Installs pinned dependencies from `api/requirements.txt`.
2. Downloads official NASA GISTEMP v4 NetCDF grids and reference tables.
3. Builds the float32 memory-mapped binary store (`data-pipeline/processed/gistemp/`).
4. Precomputes regional presets (`data-pipeline/cache_presets.py`).
5. Executes an explicit readiness assertion proving real observations and metadata load correctly before traffic is routed.

---

## 6. Verification and Rollback Procedures

### Post-Deployment Verification
Once GitHub Actions completes:
1. Check GitHub Actions run summary for the live deployment URL.
2. Visit `https://<frontend-url>/`: Verify homepage loads with 3D Earth globe, Star Galleon theme, and First Mate Piper guide.
3. Test Backend Proxy: Visit `https://<frontend-url>/api/py/health`:
   - Expected JSON: `{"status": "healthy", "phase": 1, "adapter": "gistemp", "is_mock": false}`.
4. Test Live Analysis: Run an expedition on `/` or query:
   - Expected: Real GISTEMP trend calculation with statistical significance and full provenance.

### Rollback Procedure
If a regression occurs on production:
1. Go to **Vercel Dashboard &rarr; Project &rarr; Deployments**.
2. Locate the previous known-good deployment.
3. Click the three dots (`...`) &rarr; **Instant Rollback** (or **Promote to Production**).
4. Vercel immediately points production traffic to the previous deployment within seconds without rebuilding.

