# Resource plan — awaiting Joshua's approval

Date: 2026-11-13. Status: APPROVED A. No application code, adapter, download pipeline or Git publication is authorized by this document alone. This session reviewed resources and prepared this proposal; it did not acquire new observation files or implement integrations.

The user's latest instruction replaces the old agent relay: CODEX will handle frontend, backend, pipeline and validation after scope approval. HUMAN supplies any unavoidable account/authentication or browser-download step. The existing task ownership/Claude-gate workflow should be reconciled after approval, rather than used to force another relay.

## Recommended scope (option A)

A finished temperature investigation, followed by precipitation investigations; NASA imagery for geographic context; one shared results/provenance/CSV workflow. Keep the existing Tech Pirates UI. Do not implement every linked portal or display unsupported variables.

| Priority | Resource/product | Where in Trend Compass | Reason / boundary |
| --- | --- | --- | --- |
| First | GISTEMP v4 Land–Ocean Temperature Index, monthly 2° grid, 1200 km smoothing | Temperature catalog option, selected-region series, chart and trend results | Long-record regional analysis. Describe it as a blended temperature anomaly, not absolute temperature or a purely satellite measurement. Official download page states a 1951–1980 baseline. |
| First | GISTEMP matching published global monthly CSV | Internal reproducibility/validation evidence | Compare against grid-derived global means with dates/vintage held consistent; explain differences, never adjust results to force agreement. This table cannot replace the regional grid. |
| Alongside temperature | GIBS/WMTS, selected NASA geographic imagery | Globe/2D map context and source credit | Pre-generated visualization imagery. Numerical trend calculations use the underlying science product, not rendered image colours. Verify the chosen layer and attribution before implementation. |
| Next, conditional on an actual sample | GPM IMERG Final monthly V07, product GPM_3IMERGM | Precipitation catalog, regional time series, comparison investigations | NASA lists a monthly 0.1° product. Verify the current collection/revision, field, units, quality information and dates from the actual input; inspect one sample before any bulk acquisition. |
| Shared acquisition/validation tool | Giovanni | Export/import authentic regional CSV and preserve source metadata; compare regional reductions where the same product/version/mask/period is available | This is an extraction/analysis tool, not a dataset name. Exported regional series are a bounded initial rainfall path. They do not provide arbitrary-region capability outside the exported area. |
| Supporting discovery | Earthdata Search / Earthdata | Find the exact collection, granule access and product documentation | Keep discovery separate from successful data download. Product-level URLs, version and attribution travel with every result. |

Sources READ: [GISTEMP downloads](https://data.giss.nasa.gov/gistemp/data_v4.html), [GISTEMP overview and citation](https://data.giss.nasa.gov/gistemp/), [NASA IMERG monthly product record](https://data.nasa.gov/dataset/gpm-imerg-final-precipitation-l3-1-month-0-1-degree-x-0-1-degree-v07-gpm-3imergm-at-ges-di-75e72), [NASA precipitation directory](https://gpm.nasa.gov/data/directory), [Giovanni user guide](https://giovanni.gsfc.nasa.gov/giovanni/doc/UsersManualworkingdocument.docx.html), [GIBS overview](https://nasa-gibs.github.io/gibs-api-docs/), [GIBS access documentation](https://nasa-gibs.github.io/gibs-api-docs/access-basics/).

## Disposition of every supplied resource

These are scope choices, not claims that deferred resources are prohibited or poor quality.

| Supplied resource | Decision | Intended use / why |
| --- | --- | --- |
| NASA Earthdata | Supporting | Discovery, documentation and access ecosystem; some landing pages returned 403 to this reader. |
| Earthdata Search | Use during acquisition | Identify exact collections/granules; application shell opened, JavaScript required for interactive search. |
| Giovanni | Use | Regional time-series export/import and matched-product cross-checks. Guide opened, not a successful observation download. |
| Worldview | Reference / optional source link | Visual reconnaissance/context. App shell opened; no numerical series acquired. |
| GIBS/WMTS | Use for imagery | Geographic context with attribution; no pixel-colour trend estimates. |
| Climate Indicators Data Pathfinder | Reference | Product-selection guide, not an extra variable. Landing page returned 403 here; its content was not read. |
| AppEEARS | Later, if land data is approved | Authenticated point/area extraction. API docs were opened and describe Earthdata authentication. No extraction job was submitted. |
| VEDA | Defer integration | NASA catalog describes an analysis/visualization platform. We already have an application; no need to migrate its architecture for the initial scope. |
| GISTEMP | Core | Temperature anomaly grid plus published validation table. |
| NASA Sea Level Change Portal | Later coastal/ocean feature | Portal opened and offers global/local tools. A regional data product needs its own selection and validation; a global scalar must not be presented as an arbitrary country's series. |
| Earth.gov / Earth Information Center | Reference / contextual links | Opened; useful portal and examples. Not the identity of the numerical dataset used in a result. |
| Hydrology Time Series | Defer | Current page yielded only an app shell. Prior repo evidence reported an anonymous-access gate. No new download or automated route was demonstrated here. |
| NOAA CDO | Permitted supporting reference, no initial adapter | Official page opened; useful weather/station archive, but another ingestion/aggregation path is unnecessary for the proposed NASA-focused scope. It is not rejected as disallowed. |
| SeaWiFS time-series paper | Use as a worked-method reference | PDF text opened: regional series and significance workflow; do not copy its reported coastal results into our selected regions or treat it as validation of our current engine. |
| KNMI Climate Explorer | Optional manual comparison | Official page opened; currently includes a human-verification prompt. No dependency in the application runtime. |
| Medium trend-method article | Background only | Opened; secondary educational material, not the sole specification or validation for the statistical implementation. |
| Statsig significance guide | Background only | Opened; secondary explanatory material. Primary method references and implementation-specific checks should support our computation. |
| CSA RCM data | Defer | Supplied listing timed out here; do not claim access. Proposed exclusion from first build avoids introducing a radar-scene processing workflow. |
| GEO.ca | Defer | Country resource portal; language page opened. No specific required dataset identified for this scope. |
| SWOT mission information | Later focused water-level feature | Official CSA page opened: launch December 2022. My recommendation is to avoid making this short mission record the main long-record trend demonstration. |
| CSA ecosystem monitoring page | Reference | Official explanatory page opened; use for background only if a relevant feature is actually built. |
| CSA SAR Python/QGIS tutorial | Defer | Official repository opened. Relevant if a radar feature is selected later; no code/assets copied or executed. |

Additional candidate, not approved in A: MODIS/Terra MOD13C2 Collection 6.1 monthly 0.05° vegetation index. The [NASA LAADS product page](https://ladsweb.modaps.eosdis.nasa.gov/missions-and-measurements/products/MOD13C2) was READ and identifies that product. Actual access, QA decoding, file sizes and aggregate-volume practicality remain untested. Do not substitute MOD13A3 while pretending it is a coarse global grid.

Further primary sources READ: [AppEEARS API](https://appeears.earthdatacloud.nasa.gov/api/), [NASA VEDA software catalog](https://software.nasa.gov/software/MFS-34306-1), [Sea Level portal](https://sealevel.nasa.gov/), [Earth.gov](https://earth.gov/), [NOAA CDO](https://www.ncei.noaa.gov/cdo-web/), [KNMI](https://climexp.knmi.nl/), [SeaWiFS paper](https://ntrs.nasa.gov/api/citations/20090042747/downloads/20090042747.pdf), [CSA SWOT](https://www.asc-csa.gc.ca/eng/satellites/swot/), [CSA ecosystems](https://www.asc-csa.gc.ca/eng/satellites/everyday-lives/monitoring-and-protecting-our-ecosystems-from-space.asp), [CSA SAR repository](https://github.com/asc-csa/Synthetic_Aperture_Radar_Tutorial).

## What approval authorizes, in order

1. Reconcile project instructions/tasks for a single CODEX implementation owner, while preserving provenance, honest reporting and no Git push without approval.
2. Inspect the existing downloader/adapter/statistics implementation within the chosen scope. Reuse sound work. Treat earlier mirror-origin observation files as provisional; do not present them as verified official inputs.
3. Obtain the official GISTEMP combined grid and matching published global CSV. Do not require the separate 250 km land-only grid just to deliver the combined-temperature feature. No Earthdata credential is planned for these public GISS downloads. If access fails, stop after the bounded attempts and provide a precise local-file/browser fallback; never disable TLS.
4. Build the real temperature adapter/processed store and connect the existing UI. Region choice, period and units come from actual metadata. Keep country bounding-box wording accurate; exact national polygon averages and city-scale accuracy are not promised by the 2° grid.
5. Check the global comparison and independently verify regional aggregation and statistical outputs. Use one reported primary significance method with its assumptions and diagnostics; audit the existing Theil–Sen/Hamed–Rao implementation before trusting it. Default seasonal treatment must fit the actual variable. No forced opposite trends, causal claims, or automatic equation of significance with practical importance.
6. Integrate selected NASA imagery in parallel with the data feature, preserving clear source/attribution separation from numerical observations. Continue usable UI and reduced-motion/low-power paths.
7. Acquire one real monthly IMERG sample or a metadata-rich Giovanni regional CSV; inspect access/units/quality and report measured size before bulk processing. Initial rainfall support may be restricted to exported/cached regions/imports. Enable free-region rainfall only after the needed grid store is actually available. Do not claim live country-wide rainfall from unrelated saved CSVs.
8. Deliver real results with source/version/retrieval date/checksum, coverage, units, missingness, rate, interval, named test/p-value and reproducible evidence. Run checks appropriate to changed functionality; no repeated whole-suite runs while nothing changed.

No paid services, public deployment, Git push, new account creation or credential transmission is included. Additional high-volume products or a materially different architecture need a separate scope decision.

## Access and unknowns

- An Earthdata Login and any required archive authorization are expected for the Giovanni/archived-precipitation route; the exact route is checked after approval. No credentials should be pasted into chat or frontend code. The Giovanni guide explicitly documents login and GES DISC authorization for full access.
- NASA has documented IMERG use through Giovanni; a [NASA tutorial](https://gpm.nasa.gov/education/sites/default/files/interactive_files3/From%20Satellites%20to%20Your%20Backyard_final_0.pdf) points to monthly V07 selection and mm/month output. File field units and any rate-to-amount conversion must still be inspected and recorded.
- The precipitation archive's exact latest valid month, transfer sizes and practical acquisition route are UNKNOWN until a real sample is obtained. NASA pages have differing historical coverage descriptions; never hardcode a start date from one overview.
- Some NASA landing pages returned 403; several applications exposed only JavaScript shells. This does not establish that their datasets are unavailable. Documentation access is READ evidence only, never TESTED observation access.
- No new observation downloads, access tests involving credentials, deployments or app modifications were performed in this proposal task.

## Approval choices

**A — Recommended:** GISTEMP regional analysis + NASA imagery first; monthly IMERG/Giovanni precipitation next, with the access/volume check and bounded regional fallback above. Other variables/features deferred.

**B — Fastest:** GISTEMP + NASA imagery only; no rainfall implementation in this approval.

**C — Broader:** A plus a vegetation access/volume spike for MOD13C2. Do not enable the vegetation variable until that spike demonstrates viable real data; greater time/access/QA scope.

Decision: A approved by Joshua in chat on 2026-11-13. Implement the temperature/imagery milestone, then precipitation; keep vegetation as the next extension. No Git push without separate approval.

