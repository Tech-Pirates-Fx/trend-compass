import os
import re
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from api.app.adapters import get_adapter
from api.app.catalog import get_catalog, get_variable
from api.app.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    BoundingBox,
    HealthResponse,
    TimeSeries,
    TimeSeriesPoint,
    VariableMeta,
)
from api.app.stats.preprocess import preprocess_timeseries
from api.app.stats.summary import generate_summary
from api.app.stats.trend import analyze_trends
from api.app.data_control import router as data_router, require_source, read_state

app = FastAPI(
    title="Trend Compass API",
    description="Statistical trend detection engine for Earth system observations",
    version="2.0.0",
)
app.include_router(data_router)

@app.exception_handler(FileNotFoundError)
async def data_not_ready(request, exc):
    return JSONResponse(status_code=503, content={'detail': str(exc)})

# Enable CORS for local development and direct frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health_check():
    adapter = get_adapter()
    adapter_name = os.environ.get("DATA_ADAPTER", "gistemp").strip().lower()
    is_mock = getattr(adapter, "is_mock", True)
    return HealthResponse(
        status="healthy",
        service="trend-compass-api",
        phase=2,
        adapter=adapter_name,
        is_mock=is_mock,
        verified=getattr(getattr(adapter, 'provenance', None), 'verified', None),
    )


@app.get("/catalog", response_model=list[VariableMeta])
@app.get("/variables", response_model=list[VariableMeta])
def list_variables():
    """Retrieve catalog of Earth science variables."""
    state = read_state()
    return get_catalog() if state['enabled'] and state['gistemp'] else []


def validate_date_range(start: str, end: str, resolution: str = "monthly") -> None:
    """Strictly validate start and end date format, chronology, and minimum duration."""
    if not all(re.fullmatch(r'\d{4}-\d{2}(-\d{2})?', value) for value in (start, end)):
        raise HTTPException(status_code=422, detail='Dates must use YYYY-MM or YYYY-MM-DD.')
    try:
        s_dt = pd.to_datetime(f"{start}-01" if len(start) == 7 else start)
        e_dt = pd.to_datetime(f"{end}-01" if len(end) == 7 else end)
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid date format for start='{start}' or end='{end}'. Expected YYYY-MM or YYYY-MM-DD. Error: {str(e)}",
        )

    if s_dt >= e_dt:
        raise HTTPException(
            status_code=422,
            detail=f"Start date ({start}) must precede end date ({end}).",
        )

    if resolution == "monthly":
        months_span = (e_dt.year - s_dt.year) * 12 + (e_dt.month - s_dt.month) + 1
        if months_span < 24:
            raise HTTPException(
                status_code=422,
                detail=f"Time span ({months_span} months) is too short. Minimum required is 24 months (2 full annual cycles).",
            )
    else:  # daily
        days_span = (e_dt - s_dt).days
        if days_span < 730:
            raise HTTPException(
                status_code=422,
                detail=f"Time span ({days_span} days) is too short for daily resolution. Minimum required is 730 days (2 years).",
            )


@app.post("/timeseries", response_model=TimeSeries)
def fetch_timeseries(
    variable_id: str,
    bbox: BoundingBox,
    start: str | None = None,
    end: str | None = None,
    resolution: str = "monthly",
):
    """Retrieve raw timeseries without statistical evaluation."""
    require_source()
    variable = get_variable(variable_id)
    if not variable:
        raise HTTPException(status_code=404, detail=f"Variable '{variable_id}' not found in catalog.")
    start = start or variable.temporal_coverage.start
    end = end or variable.temporal_coverage.end

    if resolution not in variable.available_resolutions:
        raise HTTPException(
            status_code=422,
            detail=f"Resolution '{resolution}' not supported for '{variable_id}'. Available: {variable.available_resolutions}",
        )

    validate_date_range(start, end, resolution)

    adapter = get_adapter()
    try:
        return adapter.get_timeseries(
            variable_id=variable_id,
            bbox=bbox,
            start=start,
            end=end,
            resolution=resolution,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_endpoint(request: AnalyzeRequest):
    """End-to-end trend analysis: retrieval, preprocessing (gap interpolation + STL),

    multi-method statistical testing (OLS, Theil-Sen, Mann-Kendall, Hamed-Rao),
    diagnostics, and plain-language verdict generation.
    """
    require_source()
    variable = get_variable(request.variable_id)
    if not variable:
        raise HTTPException(
            status_code=404,
            detail=f"Variable '{request.variable_id}' not found in catalog.",
        )

    if request.resolution not in variable.available_resolutions:
        raise HTTPException(
            status_code=422,
            detail=f"Resolution '{request.resolution}' not supported for '{variable.id}'. Available: {variable.available_resolutions}",
        )

    validate_date_range(request.start, request.end, request.resolution)

    adapter = get_adapter()
    try:
        ts = adapter.get_timeseries(
            variable_id=request.variable_id,
            bbox=request.bbox,
            start=request.start,
            end=request.end,
            resolution=request.resolution,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch data: {str(e)}")

    if not ts.points:
        raise HTTPException(status_code=400, detail="Data adapter returned empty points.")

    # Preprocessing: period is 12 for monthly, 365 for daily
    period = 12 if request.resolution == "monthly" else 365
    try:
        clean_series, deseasonalized_series, missing_count, missing_pct, warnings = preprocess_timeseries(
            points=ts.points, deseasonalize=request.deseasonalize, period=period, interpolate_gaps=ts.is_mock)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    warnings = list(ts.warnings) + warnings
    if not ts.is_mock and clean_series.notna().sum() < 24:
        raise HTTPException(status_code=422, detail='Fewer than 24 valid monthly observations in the selected region and period.')

    # Determine which series to run trend analysis on
    target_series = deseasonalized_series if (request.deseasonalize and deseasonalized_series is not None) else clean_series
    raw_dates = [p.t for p in ts.points]

    # Run trend tests and diagnostics
    methods, diagnostics, trend_line = analyze_trends(
        series=target_series,
        raw_dates=raw_dates,
        missing_count=missing_count,
        missing_pct=missing_pct,
        preprocess_warnings=warnings,
        is_deseasonalized=(request.deseasonalize and deseasonalized_series is not None),
        alpha=request.alpha,
        resolution=request.resolution,
    )

    # Convert deseasonalized series to points list if generated
    deseas_points: list[TimeSeriesPoint] | None = None
    if deseasonalized_series is not None:
        deseas_points = [
            TimeSeriesPoint(t=d_str, value=round(float(val), 4))
            for d_str, val in zip(raw_dates, deseasonalized_series.values)
        ]

    # Generate template-based plain language summary
    start_yr = raw_dates[0][:4]
    end_yr = raw_dates[-1][:4]
    summary = generate_summary(
        variable_name=variable.name,
        units=variable.units,
        start_year=start_yr,
        end_year=end_yr,
        methods=methods,
        alpha=request.alpha,
        inconclusive_reason='The requested record contains missing observations; choose a complete period before interpreting significance.' if missing_count and not ts.is_mock else None,
    )

    return AnalyzeResponse(
        provenance=ts.provenance,
        variable=variable,
        bbox=request.bbox,
        resolution=request.resolution,
        units=variable.units,
        source=ts.source,
        is_mock=ts.is_mock,
        deseasonalize_applied=(deseasonalized_series is not None),
        raw_timeseries=ts.points,
        deseasonalized_timeseries=deseas_points,
        trend_line=trend_line,
        methods=methods,
        diagnostics=diagnostics,
        summary=summary,
    )
