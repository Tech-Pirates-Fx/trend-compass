# Contributing to Trend Compass

Thank you for your interest in contributing to **Trend Compass**! This project was created for the NASA Space Apps 2026 Challenge *"Be An Earth System Trend Detective"*.

---

## Code of Conduct & Scientific Integrity
As an Earth science application, Trend Compass adheres to principles of rigorous scientific transparency:
- **Preserve Documentation & Comments**: Always document physical units, statistical assumptions, and data sources.
- **Do Not Mask Disagreements**: When parametric (OLS) and non-parametric (Mann-Kendall) tests disagree, report the discrepancy explicitly.
- **Label Mock Data Clearly**: All synthetic test vectors must retain `is_mock: True` and explicit attribution tags.

---

## Monorepo Architecture

- `/api`: FastAPI Python service (Python 3.11+, pydantic v2, numpy, pandas, scipy, statsmodels, pymannkendall).
- `/web`: Next.js 14 App Router frontend (TypeScript, Tailwind CSS, react-plotly.js, react-leaflet).
- `/docs`: Technical and statistical documentation.

---

## Development Workflow

### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/samjoshua7/nasa-app.git
cd nasa-app

# Set up virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install requirements
pip install -r api/requirements.txt

# Run backend tests
pytest api/tests -v

# Run FastAPI dev server
uvicorn api.app.main:app --port 8000 --reload
```

### 2. Frontend Setup
```bash
cd web
npm install
npm run dev
```

Next.js will proxy `/api/py/*` to `http://127.0.0.1:8000/*`.

---

## Testing Guidelines

All statistical calculations must be accompanied by automated tests in `api/tests`:
1. **Known-Slope Recovery**: Assert recovered slopes from synthetic series are within 10% of ground-truth slopes.
2. **Type I Error Bounds**: Verify pure noise series without trend are not flagged as statistically significant at an elevated rate.
3. **Determinism**: Assert repeated calls with identical coordinates and seed return identical results.
4. **Boundary & Gap Handling**: Verify NaN observations are counted and interpolated without crashing the statistical engines.

To run tests:
```bash
pytest api/tests -v
```

---

## Pull Request Guidelines

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Commit your changes with clear, descriptive commit messages following the Conventional Commits specification (`feat:`, `fix:`, `docs:`, `test:`).
3. Ensure all tests pass (`pytest api/tests -v`) and the frontend builds cleanly (`npm run build`).
4. Push your branch and open a Pull Request against `main`.

