# Precipitation next — one authenticated sample needed

Status on 2026-11-13: the approved IMERG monthly archive route returned **HTTP 401 Unauthorized** to the bounded anonymous check. No credentials were used, and no actual rainfall file was obtained. Exact attempt/result: `docs/logs/A-imerg-spike.txt` and `data-pipeline/spike_imerg.py`. Do not repeat unauthenticated requests as a workaround.

The simplest handoff avoids sharing passwords:

1. Open [NASA Giovanni](https://giovanni.gsfc.nasa.gov/giovanni/) and sign in with your Earthdata Login. Create an account at [NASA Earthdata Login](https://urs.earthdata.nasa.gov/) if needed. Complete any GES DISC authorization yourself.
2. Choose **Area-Averaged Time Series**. Search for **GPM_3IMERGM**, **IMERG V07**, and the **Final monthly** precipitation product. Do not select an Early/Late, daily, half-hourly or climatology product.
3. For this first sample, select a box with west **-15**, south **12**, east **15**, north **18** (the app's Sahel box). Request **2001-01 through 2025-12**, within whatever valid record Giovanni displays. This is an intended request, not a claim a file has already been produced.
4. Select **mm/month** if available and retain the exact displayed variable name, version and units. Generate the plot and download the underlying **CSV**, not a screenshot.
5. Save the original unedited file to **`D:\Git\nasa-app\data-samples\imerg-monthly.csv`**. If the export omits metadata, save its variable/product/version, region, actual exported dates, units, download date and Giovanni source/session link in **`data-samples/README.txt`**. Never include account credentials.

After the file exists, CODEX can inspect the actual format/metadata, implement and verify its import, calculate real precipitation results, and show those results only for the exported region. Arbitrary-region precipitation requires a demonstrated grid acquisition route later. No rainfall values, units conversions or transfer-volume estimates will be invented in advance.

This authentication requirement does not block the verified GISTEMP app at [localhost:3101](http://localhost:3101).
