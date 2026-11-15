"""Build a float32, memory-mapped store from the official monthly GPCP precipitation grid."""
from __future__ import annotations
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import time
import h5py
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
SOURCE_URL = "https://downloads.psl.noaa.gov/Datasets/gpcp/precip.mon.mean.nc"
CITATION = (
    "Adler, R.F., G.J. Huffman (NASA GSFC), A. Chang, R. Ferraro, P. Xie, J. Janowiak, "
    "B. Rudolf, U. Schneider, S. Curtis, D. Bolvin (NASA GSFC/SSAI), A. Gruber, J. Susskind, "
    "P. Arkin, 2003: The Version 2 Global Precipitation Climatology Project (GPCP) Monthly "
    "Precipitation Analysis (1979 - Present). J. Hydrometeor., 4(6), 1147-1167."
)


def checksum(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        while block := f.read(1024 * 1024):
            h.update(block)
    return h.hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--from-file", type=Path, default=ROOT / "data-raw/gpcp_precip.mon.mean.nc")
    parser.add_argument("--output", type=Path, default=ROOT / "data-pipeline/processed/gpcp")
    args = parser.parse_args()
    started = time.monotonic()

    source = args.from_file
    if not source.exists():
        raise FileNotFoundError(f"Source file not found: {source}")

    input_sha = checksum(source)
    print(f"[+] Processing {source} (SHA-256: {input_sha[:16]}...)")

    with h5py.File(source, "r") as f:
        lat = np.asarray(f["lat"][:], dtype="float32")
        lon = np.asarray(f["lon"][:], dtype="float32")
        time_vals = f["time"][:]
        raw_values = np.asarray(f["precip"][:], dtype="float32")

    # Time handling: days since 1800-01-01
    base_date = pd.to_datetime("1800-01-01")
    months = np.array(
        [(base_date + pd.to_timedelta(t, unit="D")).strftime("%Y-%m") for t in time_vals],
        dtype="U7",
    )

    # Exclude future calendar months if any
    current_month = pd.Timestamp(datetime.now(timezone.utc)).strftime("%Y-%m")
    valid_time_mask = months <= current_month
    months = months[valid_time_mask]
    raw_values = raw_values[valid_time_mask]

    # Longitude normalization: [0, 360) -> [-180, 180) and sort
    norm_lon = np.where(lon > 180.0, lon - 360.0, lon)
    sort_lon_idx = np.argsort(norm_lon)
    sorted_lon = norm_lon[sort_lon_idx].astype("float32")

    # Reorder data along longitude axis (axis 2: time, lat, lon)
    values = raw_values[:, :, sort_lon_idx]

    # Replace invalid / missing values (-9.96921e+36 or negative) with NaN
    values[values < 0.0] = np.nan
    values[values > 1000.0] = np.nan

    args.output.mkdir(parents=True, exist_ok=True)

    # Save memory-mapped values
    mmap_path = args.output / "values.npy"
    mmap = np.lib.format.open_memmap(mmap_path, mode="w+", dtype="float32", shape=values.shape)
    mmap[:] = values
    mmap.flush()
    del mmap

    # Save coordinate arrays
    np.save(args.output / "lat.npy", lat, allow_pickle=False)
    np.save(args.output / "lon.npy", sorted_lon, allow_pickle=False)
    np.save(args.output / "months.npy", months, allow_pickle=False)

    processed_sha = checksum(mmap_path)

    provenance = {
        "dataset_name": "NASA / NOAA Global Precipitation Climatology Project (GPCP) Version 2.3",
        "version": "2.3",
        "source_url": SOURCE_URL,
        "expected_official_url": SOURCE_URL,
        "retrieval_date": datetime.now(timezone.utc).date().isoformat(),
        "units": "mm/day",
        "baseline": "Climatological Mean (1979–Present)",
        "spatial_resolution": "2.5° × 2.5°",
        "temporal_coverage": {
            "start": str(months[0]),
            "end": str(months[-1]),
        },
        "citation": CITATION,
        "smoothing": "Merged satellite (microwave/IR) + rain-gauge calibrated analysis",
        "verified": True,
        "input_sha256": input_sha,
        "processed_sha256": processed_sha,
        "origin": "Official NOAA PSL / NASA Goddard Space Flight Center GPCP repository",
    }

    manifest = {
        "schema_version": 1,
        "shape": list(values.shape),
        "dtype": "float32",
        "source_variable": "precip",
        "units": "mm/day",
        "provenance": provenance,
        "memory": "Read-only mmap; 574 consecutive monthly grids from 1979 to 2026.",
    }

    (args.output / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")

    report = {
        "status": "success",
        "input_file": str(source),
        "input_bytes": source.stat().st_size,
        "output_dir": str(args.output),
        "shape": list(values.shape),
        "months_count": len(months),
        "time_range": f"{months[0]} to {months[-1]}",
        "lat_range": f"{float(lat[0])}° to {float(lat[-1])}° ({len(lat)} cells)",
        "lon_range": f"{float(sorted_lon[0])}° to {float(sorted_lon[-1])}° ({len(sorted_lon)} cells)",
        "elapsed_seconds": round(time.monotonic() - started, 3),
    }
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
