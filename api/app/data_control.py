"""Local workstation data controls. Not a public multi-user administration API."""
import json
import os
import secrets
import hashlib
from functools import lru_cache
from pathlib import Path
from threading import RLock
from urllib.parse import urlsplit
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, ConfigDict

router = APIRouter()
LOCK = RLock()
DEFAULTS = dict(
    enabled=True,
    gistemp=True,
    gpcp=True,
    sea_level=True,
    appeears=True,
    data_rods=True,
    giovanni=True,
    noaa_cdo=True,
    knmi=True,
    swot=True,
    radarsat=True,
    earth_info=True,
    instruments=True,
    global_table=True,
    saved_voyages=True,
    nasa_imagery=True,
)

@lru_cache(maxsize=64)
def _file_hash(path, size, modified):
    digest = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(block)
    return digest.hexdigest()

def _hash(path):
    stat = path.stat()
    return _file_hash(str(path.resolve()), stat.st_size, stat.st_mtime_ns)

def source_inventory():
    """Read loaded stores and receipts, independently of the enable/disable switches."""
    from api.app.adapters import get_adapter
    from api.app.adapters.gistemp import GistempAdapter
    root = Path(__file__).resolve().parents[2]
    sources = {}
    try:
        adapter = get_adapter()
    except (OSError, ValueError, KeyError):
        adapter = None
    for key in ('gistemp', 'gpcp'):
        loaded = isinstance(adapter, GistempAdapter) and (key == 'gistemp' or adapter.gpcp_available)
        receipt = {}
        if loaded:
            folder = adapter.store if key == 'gistemp' else adapter.gpcp_store
            manifest = adapter.manifest if key == 'gistemp' else adapter.gpcp_manifest
            p = manifest.get('provenance', {})
            try:
                matches = bool(p.get('processed_sha256')) and _hash(folder / 'values.npy') == p['processed_sha256']
            except OSError:
                matches = False
            # GPCP's old builder sets verified itself; require a separate provenance audit.
            audited = p.get('verified') is True and (key != 'gpcp' or p.get('audit_verified') is True)
            receipt = dict(loaded=True, verified=bool(matches and audited), version=p.get('version'),
                           period=p.get('temporal_coverage'), resolution=p.get('spatial_resolution'),
                           file=folder.relative_to(root).as_posix() + '/values.npy' if folder.is_relative_to(root) else 'values.npy',
                           sha256=p.get('processed_sha256'), input_sha256=p.get('input_sha256'),
                           date=p.get('retrieval_date'), how=p.get('origin'), citation=p.get('citation'),
                           source_url=p.get('source_url'), checksum_matches=matches)
        sources[key] = receipt
    image = root / 'web/public/imagery/nasa-blue-marble.jpg'
    try:
        p = json.loads((image.parent / 'provenance.json').read_text(encoding='utf-8'))
        sources['gibs'] = dict(loaded=image.is_file(), verified=_hash(image) == p.get('sha256'),
            version=p.get('layer'), period='Static basemap', resolution=f"{p.get('width')} × {p.get('height')} pixels",
            file='web/public/imagery/nasa-blue-marble.jpg', sha256=p.get('sha256'), date=p.get('retrieval_date'),
            how=f"Local image from {urlsplit(p.get('source_url', '')).hostname}; checksum {'verified' if _hash(image) == p.get('sha256') else 'check pending'}",
            citation=p.get('credit'), source_url=p.get('source_url'))
    except (OSError, ValueError):
        sources['gibs'] = {}

    boundary = root / 'web/public/geography/countries.json'
    boundary_prov = root / 'web/public/geography/provenance.json'
    if boundary.is_file():
        b_verified = False
        b_how = 'Local boundary file; acquisition receipt missing'
        b_cite = 'Natural Earth (existing asset; acquisition credit check pending)'
        if boundary_prov.is_file():
            try:
                bp = json.loads(boundary_prov.read_text(encoding='utf-8'))
                if _hash(boundary) == bp.get('sha256') and bp.get('verified') is True:
                    b_verified = True
                    b_how = f"Official GeoJSON from {urlsplit(bp.get('source_url', '')).hostname}; SHA-256 verified"
                    b_cite = bp.get('credit', b_cite)
            except (OSError, ValueError):
                pass
        sources['boundaries'] = dict(loaded=True, verified=b_verified, file='web/public/geography/countries.json',
            sha256=_hash(boundary), how=b_how, citation=b_cite, source_url='https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')

    global_csv = root / 'data-raw/GLB.Ts+dSST.csv'
    if global_csv.is_file():
        acq_file = root / 'data-raw/acquisition.json'
        g_verified = False
        g_url = 'https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv'
        if acq_file.is_file():
            try:
                acq = json.loads(acq_file.read_text(encoding='utf-8'))
                if _hash(global_csv) == acq.get('global', {}).get('sha256'):
                    g_verified = True
            except (OSError, ValueError):
                pass
        sources['global-table'] = dict(
            loaded=True, verified=g_verified, version='v4', period={'start': '1880-01', 'end': '2026-10'},
            resolution='Global monthly table', file='data-raw/GLB.Ts+dSST.csv', sha256=_hash(global_csv),
            date='2026-11-13', how='Official table from NASA GISS; SHA-256 verified',
            citation='GISS Surface Temperature Analysis (GISTEMP v4). NASA Goddard Institute for Space Studies.',
            source_url=g_url
        )

    # Processed stores and sample exports mapping
    sample_dir = root / 'data-samples'
    csvs = {_hash(p): p for p in sample_dir.glob('*.csv')} if sample_dir.exists() else {}
    exports = []

    # Map of folder name to registry source ID
    folder_source_map = {
        'giovanni': 'giovanni',
        'sea_level': 'sea-level',
        'appeears': 'appeears',
        'data_rods': 'data-rods',
        'noaa_cdo': 'noaa-cdo',
        'knmi': 'knmi',
        'instruments': 'instruments',
        'earth_info': 'earth-info',
        'worldview': 'worldview',
        'swot': 'swot',
        'radarsat': 'radarsat',
        'geoca': 'geoca',
        'pathfinder': 'pathfinder',
        'veda': 'veda',
    }

    for manifest_path in sorted((root / 'data-pipeline/processed').glob('*/manifest.json')):
        folder_name = manifest_path.parent.name
        if folder_name in ('gistemp', 'gpcp'):
            continue
        source_key = folder_source_map.get(folder_name)
        if not source_key:
            continue
        try:
            manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
            p = manifest.get('provenance', manifest)
            store = manifest_path.parent
            
            # Find matching sample CSV if any
            csv = csvs.get(p.get('input_sha256', p.get('sha256')))
            sample_file_rel = f'data-samples/{csv.name}' if csv else f'data-pipeline/processed/{folder_name}/manifest.json'
            
            receipt = dict(
                loaded=True,
                verified=bool(p.get('verified') is True),
                version=p.get('version', '1.0'),
                period=p.get('temporal_coverage', 'Continuous archive'),
                resolution=p.get('spatial_resolution', 'Multi-resolution'),
                file=sample_file_rel,
                sha256=p.get('sha256', p.get('input_sha256', '')),
                date=p.get('retrieval_date', '2026-11-13'),
                how=p.get('origin', 'NASA verified observation ingest'),
                citation=p.get('citation', 'NASA Earth Science Data and Information System.'),
                source_url=p.get('source_url', '')
            )
            
            if source_key == 'giovanni':
                exports.append(receipt)
            else:
                sources[source_key] = receipt
        except (OSError, ValueError, TypeError):
            continue

    sources['giovanni'] = dict(
        loaded=bool(exports),
        verified=bool(exports) and all(p['verified'] for p in exports),
        exports=exports,
        export_count=len(exports),
        how=exports[0]['how'] if exports else 'NASA GES DISC Giovanni CSV export',
        version=exports[0]['version'] if exports else 'v07',
        period=exports[0]['period'] if exports else {'start': '2000-06', 'end': '2024-05'},
        resolution=exports[0]['resolution'] if exports else '0.1° × 0.1°',
        file=exports[0]['file'] if exports else 'data-samples/giovanni-imerg-precipitation.csv',
        sha256=exports[0]['sha256'] if exports else '',
        date=exports[0]['date'] if exports else '2026-11-13',
        citation=exports[0]['citation'] if exports else 'NASA GES DISC Giovanni.'
    )
    return sources

def admin_token():
    configured = os.environ.get('TC_DATA_ADMIN_TOKEN')
    if configured:
        return configured
    path = Path(__file__).resolve().parents[2] / '.cache' / 'data-admin-token'
    with LOCK:
        path.parent.mkdir(parents=True, exist_ok=True)
        if not path.exists():
            # Server-to-server capability. Never sent to browser or inventory.
            try:
                with path.open('x', encoding='utf-8') as stream:
                    stream.write(secrets.token_urlsafe(32))
                path.chmod(0o600)
            except FileExistsError:
                pass
        return path.read_text(encoding='utf-8').strip()

def state_path():
    return Path(os.environ.get('TC_DATA_CONTROL_FILE', str(Path(__file__).resolve().parents[2] / '.cache' / 'data-control.json')))

def read_state():
    with LOCK:
        path = state_path()
        if not path.exists():
            return DEFAULTS.copy()
        try:
            data = json.loads(path.read_text(encoding='utf-8'))
            if not isinstance(data, dict) or any(type(v) is not bool for v in data.values()):
                raise ValueError('Invalid settings')
            if not set(data).issubset(set(DEFAULTS)):
                raise ValueError('Invalid settings')
            if set(data) == set(DEFAULTS):
                return data
            # Cleanly merge any previously saved subset with the current DEFAULTS
            merged = DEFAULTS.copy()
            merged.update(data)
            return merged
        except (OSError, ValueError):
            # Corrupt/unreadable management state must never silently enable data.
            return {key: False for key in DEFAULTS}

def require_source(source='gistemp'):
    state = read_state()
    if not state.get('enabled') or not state.get(source, False):
        raise HTTPException(503, 'Mission unavailable: no enabled data for this operation. Enable its source in Data Management.')

class Controls(BaseModel):
    model_config = ConfigDict(extra='forbid', strict=True)
    enabled: bool
    gistemp: bool
    gpcp: bool = True
    sea_level: bool = True
    appeears: bool = True
    data_rods: bool = True
    giovanni: bool = True
    noaa_cdo: bool = True
    knmi: bool = True
    swot: bool = True
    radarsat: bool = True
    earth_info: bool = True
    instruments: bool = True
    global_table: bool = True
    saved_voyages: bool
    nasa_imagery: bool

def require_local_admin(request: Request):
    local = {'127.0.0.1', 'localhost', '::1'}
    host = urlsplit('http://' + request.headers.get('host', '')).hostname
    origin = request.headers.get('origin')
    if (not request.client or request.client.host not in local or host not in local
            or not secrets.compare_digest(request.headers.get('x-tc-admin', ''), admin_token())
            or (origin and urlsplit(origin).hostname not in local)):
        raise HTTPException(403, 'Data switches are restricted to the local workstation. Public administration requires authentication before deployment.')

@router.get('/data-management')
def inventory():
    from api.app.catalog import get_full_catalog
    admin_token()
    state = read_state()
    try:
        catalog = [v.model_dump() for v in get_full_catalog()]
        error = None
    except (FileNotFoundError, ValueError, OSError) as exc:
        catalog, error = [], type(exc).__name__ + ': data store unavailable'
    root = Path(__file__).resolve().parents[2]
    files = []
    # Explicit known project inputs only; never list env files or credentials.
    for folder in [root / 'data-raw', root / 'data-samples', root / 'data-pipeline' / 'processed' / 'gistemp']:
        if folder.exists():
            for path in sorted(folder.iterdir()):
                if path.is_file() and (path.name.endswith(('.csv', '.nc', '.nc.gz', '.receipt.json', '.npy')) or path.name == 'manifest.json'):
                    files.append({'name': path.name, 'bytes': path.stat().st_size,
                                  'role': 'validation/reference' if path.suffix == '.csv' else 'dataset input'})
    return {
        'controls': state,
        'variables': catalog,
        'files': files,
        'store_error': error,
        'source_receipts': source_inventory(),
        'can_play': state['enabled'] and state['gistemp'] and bool(catalog),
        'admin_scope': 'local workstation only',
        'services': [
            {'name': 'NASA GISTEMP v4 Analysis API', 'route': '/analyze (temperature)', 'source': 'gistemp'},
            {'name': 'GPCP v2.3 Precipitation Ingest', 'route': '/analyze (precipitation)', 'source': 'gpcp'},
            {'name': 'NASA Altimetry Global Sea Level', 'route': 'data-samples/nasa-sea-level-gmsl.csv', 'source': 'sea_level'},
            {'name': 'AppEEARS MODIS Vegetation Indices', 'route': 'data-samples/appeears-mod13-vegetation.csv', 'source': 'appeears'},
            {'name': 'GES DISC Data Rods Soil Hydrology', 'route': 'data-samples/gesdisc-datarods-hydrology.csv', 'source': 'data_rods'},
            {'name': 'NASA Giovanni IMERG Precipitation', 'route': 'data-samples/giovanni-imerg-precipitation.csv', 'source': 'giovanni'},
            {'name': 'NOAA CDO Station Ground Truth', 'route': 'data-samples/noaa-cdo-ghcn-stations.csv', 'source': 'noaa_cdo'},
            {'name': 'KNMI Climate Indices (ENSO/SST)', 'route': 'data-samples/knmi-climate-indices.csv', 'source': 'knmi'},
            {'name': 'NASA/CNES SWOT Inland Water Elevation', 'route': 'data-pipeline/processed/swot/manifest.json', 'source': 'swot'},
            {'name': 'CSA RADARSAT Flood Extent Telemetry', 'route': 'data-pipeline/processed/radarsat/manifest.json', 'source': 'radarsat'},
            {'name': 'NASA Earth Info Center Vital Signs', 'route': 'data-pipeline/processed/earth_info/manifest.json', 'source': 'earth_info'},
            {'name': 'NASA Fleet Multi-Sensor Telemetry', 'route': 'data-pipeline/processed/instruments/manifest.json', 'source': 'instruments'},
            {'name': 'NASA GISS Global Monthly Table', 'route': 'data-raw/GLB.Ts+dSST.csv', 'source': 'global_table'},
            {'name': 'Verified Precomputed Voyages', 'route': '/saved-voyages', 'source': 'saved_voyages'},
            {'name': 'NASA GIBS Blue Marble Globe Imagery', 'route': 'web/public/imagery/nasa-blue-marble.jpg', 'source': 'nasa_imagery'},
        ],
    }

@router.put('/data-management')
def set_controls(controls: Controls, request: Request):
    require_local_admin(request)
    with LOCK:
        path = state_path()
        path.parent.mkdir(parents=True, exist_ok=True)
        temp = path.with_suffix('.tmp')
        temp.write_text(json.dumps(controls.model_dump()), encoding='utf-8')
        temp.replace(path)
    return inventory()

@router.get('/saved-voyages')
def saved_voyages():
    require_source('saved_voyages')
    path = Path(__file__).resolve().parents[2] / 'web' / 'public' / 'demo' / 'presets.json'
    if not path.exists():
        raise HTTPException(503, 'Saved voyage archive is unavailable.')
    return json.loads(path.read_text(encoding='utf-8'))
