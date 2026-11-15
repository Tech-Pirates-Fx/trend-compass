"""Bounded official-only GISTEMP acquisition; local files are never silently verified."""
from __future__ import annotations
import argparse
from datetime import datetime, timezone
import gzip
import hashlib
import json
from pathlib import Path
import shutil
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
DATASETS = {
    'combined': ('gistemp1200_GHCNv4_ERSSTv5.nc.gz', 'https://data.giss.nasa.gov/pub/gistemp/gistemp1200_GHCNv4_ERSSTv5.nc.gz'),
    'global': ('GLB.Ts+dSST.csv', 'https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv'),
}

def checksum(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as f:
        for block in iter(lambda: f.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()

def acquire(key, target, source_dir=None, official_origin=False, retrieval_date=None):
    filename, url = DATASETS[key]
    dest = target / filename
    receipt_path = target / 'acquisition.json'
    receipt = json.loads(receipt_path.read_text()) if receipt_path.exists() else {}
    stamp = retrieval_date or datetime.now(timezone.utc).date().isoformat()
    if source_dir:
        source = Path(source_dir)
        if source.is_dir():
            source = source / filename
            if not source.exists() and filename.endswith('.gz'):
                source = source.with_suffix('')
        if not source.is_file():
            raise FileNotFoundError(f'Local source missing: {source}')
        dest = target / source.name
        if source.resolve() != dest.resolve():
            shutil.copyfile(source, dest)
        origin = 'human-declared official download' if official_origin else 'local file; original acquisition UNKNOWN'
        verified = official_origin
    else:
        if dest.exists() and receipt.get(key, {}).get('sha256') == checksum(dest) and receipt[key].get('verified'):
            print(f'{key}: verified cached download {dest.name}')
            return receipt[key]
        partial = dest.with_name(dest.name + '.part')
        # One request per invocation. A failed transfer is not a successful download.
        request = urllib.request.Request(url, headers={'User-Agent': 'TrendCompass/1.0 (NASA data research)'})
        with urllib.request.urlopen(request, timeout=25) as response, partial.open('wb') as f:
            shutil.copyfileobj(response, f, 1024 * 1024)
        if filename.endswith('.gz'):
            with gzip.open(partial, 'rb') as f:
                if f.read(3) not in (b'CDF', b'\x89HD'):
                    raise ValueError('Downloaded gzip is not a NetCDF container')
        elif b'Year,Jan,Feb' not in partial.read_bytes()[:2048]:
            raise ValueError('Downloaded response is not the GISTEMP monthly table')
        partial.replace(dest)
        verified = True
        origin = 'direct HTTPS download from NASA GISS with TLS verification'
    result = dict(file=dest.name, source_url=url if verified else None, expected_official_url=url,
                  retrieval_date=stamp if verified else None, local_ingestion_date=stamp,
                  origin=origin, verified=verified, size_bytes=dest.stat().st_size, sha256=checksum(dest))
    receipt[key] = result
    receipt_path.write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps({'dataset': key, **result}, indent=2))
    return result

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--target-dir', type=Path, default=ROOT / 'data-raw')
    parser.add_argument('--from-file', help='A local file or directory; no network is used')
    parser.add_argument('--official-origin', action='store_true', help='Human explicitly attests these files were downloaded from the printed NASA URLs')
    parser.add_argument('--retrieval-date', help='Original official retrieval date, YYYY-MM-DD')
    parser.add_argument('--dataset', choices=['all', *DATASETS], default='all')
    args = parser.parse_args()
    if args.official_origin and (not args.from_file or not args.retrieval_date):
        parser.error('--official-origin requires --from-file and --retrieval-date')
    args.target_dir.mkdir(parents=True, exist_ok=True)
    failed = False
    for key in DATASETS if args.dataset == 'all' else [args.dataset]:
        try:
            acquire(key, args.target_dir, args.from_file, args.official_origin, args.retrieval_date)
        except Exception as e:
            failed = True
            print(f'FAILED {key}: {type(e).__name__}: {e}. Save the official file in data-raw/ and use --from-file; no automatic retries or mirrors.')
    raise SystemExit(1 if failed else 0)
if __name__ == '__main__':
    main()
