# Validation — official GISTEMP milestone

Evidence date: 2026-11-13. These are measured local results, not a complete scientific certification or a deployment benchmark.

## Input and independent comparison

TESTED: `python data-pipeline/download_gistemp.py` obtained the combined GISTEMP archive and published global CSV directly from NASA GISS with TLS verification. Grid archive: 25,885,943 bytes, SHA-256 `f7788db9044d0f0e3f9561ad5d0fd82e59cdfdb82ea8a10244f78f2cb032a3c7`. CSV: 12,887 bytes, SHA-256 `a7b1939db2e7e484c798e925e0f07f8184356c52ac0e7ce264adcd0f25e81253`. Full source URLs/receipts: `docs/logs/A-acquisition.txt`. The old mirrored files in `data-pipeline/raw/` were not used.

The inspected grid has 1,762 months (1880-01 to 2026-10), 90 latitudes and 180 longitudes, and the documented 1951–1980 baseline. The memory-mapped processed store occupies about 114 MB. Builder timing and exact comparison metrics: `docs/logs/A-store.txt`; all monthly differences: `docs/logs/A-global-comparison.csv`.

Untuned global cosine-latitude averaging versus the published series: mean absolute difference about 0.0120 °C, RMSE about 0.0155 °C across all 1,762 months. A separate xarray weighted reduction in `tests/audit/gistemp_audit.py` agrees at the reported precision. Published GISS aggregation is not identical to a simple average of a remapped grid; no offsets or tuning were applied to force equality. Common retrieval time alone does not prove identical internal source vintages.

## Five regional checks

TESTED: `python tests/audit/gistemp_audit.py`. The script reads the raw grid separately from the adapter, uses xarray spatial weighting, directly computes pairwise-median slopes, tie-corrected original MK and a separately written Hamed–Rao variance correction. Its code/reference calculation is visible; this is not an independent institution's review.

All five regional series agree with the API to less than 6×10^-15 °C after using float64 latitude weights; slopes agree within the API's stated output rounding. Original MK p-values agree within 10^-10. **Strict Hamed–Rao numerical agreement is NOT achieved**: small p-value differences remain, although all five alpha=0.05 verdicts agree. Tiny reduction differences can affect detrended rank ties; that is a plausible explanation, not a proven resolution. We retained the differences without tuning inputs, thresholds or regions. Further numerical-method review is needed before claiming exact Hamed–Rao reproduction.

Period: **2001-01 through 2026-10**, fixed by the explicit last-25-years-through-latest-month audit rule before inspecting these results. Temperature rates are °C anomaly per decade.

| Region | API rate/decade | Independent HR p | API HR p | API verdict |
| --- | ---: | ---: | ---: | --- |
| Western Arctic | 0.3560 | 0.1236952 | 0.123706 | not_significant |
| East Antarctic | -0.1348 | 0.3152262 | 0.3152262 | not_significant |
| Bering Strait | 0.3211 | 0.114673 | 0.1146644 | not_significant |
| Sahel | 0.2405 | 9.786685E-07 | 9.75296E-07 | significant |
| Amazon region | 0.2601 | 1.39612E-16 | 2.220446E-16 | significant |

These checks do not demonstrate a pair of opposite significant trends. No such claim is made. A separate saved Mediterranean example is also available; the complete cache generation log is `docs/logs/A-presets.txt`.

## Corrections and limits

- Seasonal MK's library slope is per seasonal cycle. The old code multiplied by 12 again; this conversion is corrected and covered by a known-slope regression test.
- Real missing observations are retained. They are never zero-filled, edge-padded or interpolated into apparent measurements; all-missing records are rejected. Slopes retain elapsed calendar time across gaps, significance becomes inconclusive, and seasonal MK is skipped when missing rows would misalign calendar seasons.
- Hamed–Rao failures do not silently turn into an OLS significance verdict. Inconclusive is shown when the primary test is unavailable. Full p-value precision returned by the library is preserved; library floating-point underflow can still produce zero.
- The displayed Theil–Sen slope interval is explicitly labelled as not serial-dependence corrected; it is not represented as the confidence interval of the Hamed–Rao test. OLS/HR disagreements do not establish their physical cause.
- Grid-center inclusion and the 50% minimum available-weight rule are implementation policies. The averaging mask and spatial coverage must be considered when interpreting long records. Country selections are bounding boxes, not country-outline means.
- Mock data is selected explicitly by the legacy synthetic tests. The default application adapter is GISTEMP and missing input produces 503, with no mock fallback. Saved demo examples refuse unverified/mock inputs.
- No complete clean-clone reproduction or deployment-memory benchmark is claimed. Deployment target is not yet chosen. A Giovanni cross-check and precipitation validation remain pending a real export.

## Checks and provenance

TESTED: 24 backend tests passed (including real golden-series/provenance, default missing-store behavior, date-line/mock regressions, slope conversion and missing-data cases); one third-party deprecation warning. Log: `docs/logs/A-tests.txt`. The first sandboxed Python runs stalled; outside the sandbox, tests completed in seconds. The initial golden test failed because audit generation had stopped on an HR mismatch; the corrected audit records HR differences and generated a raw-grid golden reference before the passing run.

The production UI build passed (`docs/logs/A-web-build-release.txt`). Real API health/catalog/analyze and the UI proxy report `is_mock=false`, `verified=true`; all current UI routes, saved examples and the NASA image returned HTTP 200 (`A-live-api.txt`, `A-ui-live.txt`). These are API/build checks, not browser visual/interaction certification.

READ method sources: [SciPy Theil–Sen](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.theilslopes.html), [SciPy OLS](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.linregress.html), [pyMannKendall source/documentation](https://github.com/mmhs013/pyMannKendall). READ dataset documentation: [NASA GISTEMP](https://data.giss.nasa.gov/gistemp/), [downloads](https://data.giss.nasa.gov/gistemp/data_v4.html).

Precipitation: the bounded anonymous IMERG archive check returned HTTP 401; no rainfall observation was downloaded or validated. See `docs/RAINFALL_NEXT.md`. Vegetation remains a planned extension, not an available result variable.

## Browser review completed after API/build verification

The previously blocked browser path became usable for the elevated local preview. Checked the rendered NASA globe, country-to-wizard transfer, date-line selection, catalog-derived dates, a real live regional result with provenance, theme switching, rain/low-power controls and responsive horizontal-overflow checks. Browser error-log checks were empty. Screenshots and exact capture dimensions/limits are recorded in `docs/logs/A-browser.txt`. This supersedes the earlier statement that no browser checks had run. It is not an exhaustive accessibility or cross-browser certification.
# Voyage M0/M1 validation — 2026-11-15

READ: existing local GISTEMP acquisition manifest and existing `api/app/stats/trend.py`; no new network acquisition. TESTED: real-store builders and tests recorded in `docs/logs/voyage-M0-*` and `voyage-M1-*`.

`build_cases.py` verifies the processed-store SHA-256 before use. It chooses the first qualifying 20° box in a fixed south-to-north, west-to-east sequence. The last 40 complete years are 1986–2025. Monthly cos(latitude)-weighted box means come from the existing adapter. No missing month is interpolated. The selected Clear Current is 40°S–20°S, 180°W–160°W. Engine answer: Theil–Sen 0.2611 °C/decade, with the engine's stored interval and Hamed–Rao result retained unchanged in the JSON. A p-value of zero in the engine output denotes numerical underflow, not proof that an event is impossible. Every annual-boundary 15+ year window must have the same nonzero sign; all such windows are checked before the 600-entry display-table cap. Deterministic thinning affects only shorter windows.

Visual Storm Test approximation: remove the monthly Sen line; measure lag-1 correlation and sample SD of residuals; clip rho to [-0.98,0.98] for a stationary AR(1) demonstration. With NumPy seed 20261115, initialize from N(0,SD), then use innovations SD*sqrt(1-rho²); compute 300 monthly Sen slopes ×120. This assumes stationary Gaussian AR(1) noise and a single fitted correlation, omits parameter uncertainty and higher-order dependence, and supplies no official p-value. The case records seed, measured residual rho and SD. This visual distribution must never override Hamed–Rao. Tests regenerate both noise draws and the full qualifying window set.

World: per-cell annual means require all 12 months in each of all 40 years. Annual Sen slopes use elapsed years ×10. 15,813 of 16,200 cells qualify; 387 are transparent. `world.json` includes exploratory original annual Kendall p-values after Benjamini–Hochberg q=.05 (serial dependence uncorrected). Hatching is deferred to M4 and is not displayed as a confirmed local trend. Tint scale is symmetric ±0.8 °C/decade and explicitly clipped. It is a navigation aid, distinct from the monthly regional engine answer.

Development-browser evidence covers keyboard and pointer paths, one deliberately overconfident wrong claim, Crew Trust zero, one-click retry, and an engine-matching estimate/claim. The final production build passes, but two production-browser runs failed intermittently around rapid court inputs / confidence; see `voyage-M1-production-smoke*.txt`. Production acceptance is unresolved, not inferred from development success. Scientific values are read from static engine-built receipts; browser tests do not inject game state. Human game-feel, uncoached completion and real-user reading time remain unknown until P1.
