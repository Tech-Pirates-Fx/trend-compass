# Antigravity: repair Render and add owner-authenticated Vercel Actions

Work in D:\Git\nasa-app. Read AGENTS.md, TEAM_PLAYBOOK, the current TASKS track and latest STATUS. Preserve current uncommitted UI changes. This task concerns deployment, not another visual redesign. Implement reviewable configuration/scripts and local verification first. Do not commit, push, activate workflows, change account settings, purchase services or trigger external deployment without Joshua's approval. Once approved/enabled, the intended workflow automatically deploys approved main-branch code regardless of which authorized collaborator pushed it.

## Facts already checked by CODEX

- Remote: https://github.com/samjoshua7/nasa-app.git. Actual repository visibility, Vercel plan/project IDs and Render dashboard settings were NOT inspected; obtain them rather than inventing values.
- Frontend: Next.js in `web/`, with `web/package-lock.json`.
- `web/next.config.mjs` rewrites `/api/py/*` to server-side `PY_API_URL`, defaulting to localhost:8000. Production needs the real Render HTTPS URL at frontend BUILD time and server runtime.
- `render.yaml` currently installs `api/requirements.txt`, starts `python main.py`, and selects `DATA_ADAPTER=mock`.
- Supplied Render log: dependencies installed successfully, then pip tried to install `/opt/render/project/src` as a Python package and failed because it had no setup.py/pyproject.toml. This proves a subsequent local-project installation step failed, not a dependency installation failure. The exact command is not in the supplied log. The checked-in Blueprint contains no editable-install step: inspect the complete active build command, deployed commit and dashboard/Blueprint drift.
- Actual FastAPI app is `api.app.main:app`; imports are repository-root based.
- GISTEMP processed store defaults to `data-pipeline/processed/gistemp` and is gitignored. A new deployment cannot inherit the developer's local files.
- Existing acquisition/build scripts are `data-pipeline/download_gistemp.py` and `data-pipeline/build_gistemp.py`. Both support their existing documented CLI arguments. Downloader defaults to official combined grid plus global reference CSV; builder defaults match those acquired filenames.
- Current data-management writes are deliberately local-only. Vercel and Render do not share the local `.cache/data-admin-token` file. Do not remove the security checks to make cloud writes succeed.

## 1. Repair Render completely

Use repository root as service Root Directory (blank/default), not `api/`, because imports use `api.app.*`. Inspect the selected branch/commit and actual dashboard command; reconcile both the service settings and render.yaml. A YAML change alone does not prove an existing manually configured service adopted it.

Create a checked-in fail-fast build script using these existing commands, from repository root:

```sh
python -m pip install -r api/requirements.txt
python data-pipeline/download_gistemp.py
python data-pipeline/build_gistemp.py
```

Each command must stop the build on failure. Then perform a small readiness assertion that the manifest and required arrays exist and the adapter can load real, verified observations. Use this script as the Render build command. Remove the unnecessary local-project installation command from the ACTUAL Render configuration. Do not invent a setup.py just to silence pip unless packaging is demonstrably required.

Use this start command from repository root:

```sh
python -m uvicorn api.app.main:app --host 0.0.0.0 --port "$PORT"
```

Set DATA_ADAPTER=gistemp, choose and verify the Python version against the actual dependencies, and use one worker initially. Set health check `/health`; verify it reports real verified data, not merely HTTP 200 from a mock adapter.

Default data strategy: acquire and build real observations during each Render build so no paid disk or developer machine is assumed. Confirm the generated files are included in the runtime build artifact and that time/RAM/disk fit the actual service tier. Preserve real acquisition dates/checksums/citations; fresh NASA revisions must not inherit a historical receipt or forced result. Keep saved investigations clearly identified as their recorded data vintage. No mirrors, TLS bypass, fabricated provenance, mock fallback or infinite download retry. If official acquisition is blocked, record the exact error and a concrete verified-artifact alternative requiring owner approval; do not call the service fixed while real data is absent.

Render's filesystem is ephemeral by default. This build-artifact strategy restores datasets on a redeploy but does not make runtime switch edits durable across restarts. Document that distinction. Do not silently add a paid persistent disk/database. A disk, if later approved, is unavailable to normal build steps; do not assume its mount exists during the build.

## 2. Add the Vercel GitHub Actions workflow

First inspect the exact Vercel failure, actual project/owner/scope, repository visibility and plan. Distinguish an author/team-permission rejection from a build error. Use the supported CLI workflow authenticated by Joshua's account; do not promise it bypasses plan restrictions. Do not forge commit authors, rewrite Git history or strip metadata to impersonate Joshua. If a verified account restriction still blocks it, document the supported account/repository/team remedy and any cost for approval.

Create `.github/workflows/deploy-vercel.yml` with:
- Production triggers: push to main and workflow_dispatch restricted to main. Authorized collaborator pushes to main must not be filtered by `github.actor == owner`. PR checks can run without deployment secrets; no secret-bearing deployment on arbitrary branches, fork PRs or pull_request_target.
- Read-only repository permissions, deployment timeout, appropriate production concurrency and a current-main-SHA check before publishing so stale builds are not intentionally promoted over newer main code.
- Checkout exact commit; supported pinned Node/action/CLI versions; `npm ci` using the existing frontend lockfile. Verify the installed runtime compatibility rather than picking versions blindly.
- GitHub Actions secrets named VERCEL_TOKEN, VERCEL_ORG_ID and VERCEL_PROJECT_ID. The token belongs to Joshua with access to the EXISTING project. Read IDs from project settings or local Vercel project linkage; do not create a second Vercel project. Never expose token values in chat, YAML, artifacts, shell tracing or logs.
- Set the existing project's root to the intended `web/` directory. Verify the CLI working directory and generated `.vercel/output` location against that project setting; do not accidentally resolve `web/web` or deploy the backend to Vercel.
- Supported production sequence, with token passed securely via the runner environment:

```sh
vercel pull --yes --environment=production --token="$VERCEL_TOKEN"
vercel build --prod --token="$VERCEL_TOKEN"
vercel deploy --prebuilt --prod --token="$VERCEL_TOKEN"
```

Do not run a second full Next build unnecessarily before `vercel build`. Add the appropriate type/test checks before publication. Capture the resulting deployment URL and commit SHA in the Actions summary without printing secrets.

Production Vercel environment must have PY_API_URL set to the ACTUAL healthy Render HTTPS base URL. Verify the resulting rewrite and server route use it, and production never calls localhost. Keep API/admin secrets server-only; do not use NEXT_PUBLIC_* for credentials. Ensure NEXT_DIST_DIR is unset in production, or explicitly validated for Vercel; local preview build folders must not leak into hosting configuration.

Provide the exact native Vercel Git-auto-deploy setting to disable once this workflow is approved, avoiding duplicate builds and parallel failing Git deploys. Do not disconnect/change the linked repository blindly. Test the owner-token workflow before claiming collaborator deployment works. If the native Git permission check remains separately visible, explain which integration emits it and verify whether Actions actually published successfully.

## 3. Cloud security and startup reality

Keep public data/source inventory readable. Default hosted data-management mutations to an explicit read-only/disabled state because the implemented controls are workstation-only; show that state clearly. Do not expose the master switch to anonymous public visitors or merely remove host/origin/loopback checks. A shared backend token is not end-user authentication. Production owner administration requires separately approved authentication and durable storage. Local controls must keep working.

## 4. Verification and handover

Verify a clean Linux-style build without local ignored NASA files; imports/startup, requirements compatibility, real-data readiness and API tests. Before external approval, clearly distinguish local verification from a successful cloud deployment.

After approved deployment, check both the Render URL and frontend proxy: `/health`, `/catalog`, `/data-management`, saved-voyage retrieval and one real `/analyze` request. Confirm is_mock=false, actual source provenance, expected failure behavior and working gameplay. HTTP 200 on a landing page is insufficient. Then demonstrate an authorized collaborator-originated main push deploys through the owner-authenticated workflow to the intended project, without changing author identity. If that test is not performed, mark it pending.

Deliver `.github/workflows/deploy-vercel.yml`, corrected render.yaml/build script, only necessary runtime fixes, and `docs/DEPLOYMENT.md`. Include an exact one-time owner checklist: where to add the three GitHub secrets, Vercel project/root/PY_API_URL settings, Render root/build/start/environment settings, approval/activation steps, rollback to the previous successful deployment, and anything not yet verified. Unknown IDs/URLs must remain explicit missing inputs, never plausible invented values. Keep current UI/mascot work intact.

Append at most ten concise lines to STATUS and one AI_LOG entry; save substantial logs separately. Stop repeating unchanged builds. If credentials/dashboard access are unavailable, finish all repository changes and tests first, then list the specific owner actions still required. Never label “configuration prepared” as “deployment fixed.”

## Official documentation read by CODEX

- Vercel CLI / Actions pattern: https://vercel.com/kb/guide/how-can-i-use-github-actions-with-vercel
- Vercel account/commit-author restrictions: https://vercel.com/docs/deployments/troubleshoot-project-collaboration
- GitHub Actions secrets: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets
- Render FastAPI build/start configuration: https://render.com/docs/deploy-fastapi
- Render filesystem/disk lifecycle and paid-disk scope: https://render.com/docs/disks

This brief is based on source inspection and official documentation, not authenticated inspection of the hosting accounts. CODEX changed documentation only for this handoff and did not deploy anything.
