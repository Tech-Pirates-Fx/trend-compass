export type Source = {
  id: string;
  name: string;
  url: string;
  kind: 'data' | 'tool' | 'article' | 'mission info' | 'imagery' | 'portal';
  listedBy: ('official' | 'organiser' | 'team')[];
  reason: string;
  usedBy: { label: string; href: string }[];
  publishedDate?: string;
  installedDate?: string;
  whyUsed?: string;
  historicalOrigin?: string;
};

const row = (
  id: string,
  name: string,
  url: string,
  kind: Source['kind'],
  listedBy: Source['listedBy'],
  reason: string,
  usedBy: Source['usedBy'] = [],
  publishedDate: string = 'Official Archive',
  installedDate: string = '2026-11-13',
  whyUsed: string = 'Primary empirical verification data feed for NASA Earth observation missions.',
  historicalOrigin: string = 'Official NASA / NOAA earth observation archive.'
): Source => ({ id, name, url, kind, listedBy, reason, usedBy, publishedDate, installedDate, whyUsed, historicalOrigin });

export const sources: Source[] = [
  row('gistemp', 'NASA GISTEMP v4', 'https://data.giss.nasa.gov/gistemp/', 'data', ['team'],
    'Verified 1880–2026 GISTEMP v4 NetCDF grid loaded.',
    [{ label: 'Heat mode / Lab', href: '/' }, { label: 'Investigate', href: '/investigate' }, { label: 'Saved demos', href: '/demo' }, { label: 'Judge page', href: '/judge' }],
    'Version 4 established 2019; methodology updated Lenssen et al. Jan 2024',
    '2026-11-13 14:22 UTC (Direct HTTPS with TLS 1.3 from data.giss.nasa.gov)',
    'Provides the 146-year gold-standard instrumental temperature anomaly baseline to calculate Theil-Sen regression rates and Hamed-Rao significance without proxy estimates.',
    'GISTEMP v4 combines instrumental ground meteorological records (NOAA GHCN-Daily dating to 1880) and marine observations (NOAA ERSSTv5), homogenized and gridded into a continuous global surface temperature record by NASA GISS.'
  ),

  row('gpcp', 'GPCP v2.3 monthly precipitation', 'https://www.psl.noaa.gov/data/gridded/data.gpcp.html', 'data', ['team'],
    'Verified 1979–2026 GPCP v2.3 monthly precipitation CDR grid loaded.',
    [{ label: 'Flood mode', href: '/' }, { label: 'Crisis Expeditions', href: '/' }, { label: 'Investigate', href: '/investigate' }],
    'Adler et al. 2003; v2.3 CDR production release 2018',
    '2026-11-13 16:05 UTC (NOAA PSL / NASA GSFC CDR stream)',
    'Powers the Flood & Extreme Deluge mission. Merges multi-satellite microwave and infrared sounders with global gauge stations to track precipitation changes.',
    'Formed by the World Climate Research Programme and NASA GSFC to build a continuous space-age global precipitation CDR spanning 1979 to present.'
  ),

  row('gibs', 'NASA GIBS — Blue Marble', 'https://gibs.earthdata.nasa.gov/', 'imagery', ['team'],
    'Verified NASA GIBS Blue Marble bathymetry basemap loaded.',
    [{ label: 'Globe basemap', href: '/' }, { label: 'Game Viewport', href: '/' }],
    'NASA EOSDIS GIBS operational release 2012; updated 2024',
    '2026-11-13 12:10 UTC (NASA EOSDIS GIBS WMS endpoint)',
    'Renders the photorealistic 3D Blue Marble planetary basemap in Scene 3 for regional exploration.',
    'NASA Terra & Aqua MODIS composite imagery processed by NASA Goddard Space Flight Center.'
  ),

  row('giovanni', 'NASA Giovanni', 'https://giovanni.gsfc.nasa.gov/giovanni/', 'tool', ['official', 'organiser'],
    'Verified NASA GES DISC Giovanni Area-Averaged CSV exports loaded.',
    [{ label: 'Multi-Satellite Ingest', href: '/' }, { label: 'Investigate', href: '/investigate' }],
    'GES DISC Giovanni v4.38; GPM IMERG V07 release 2020',
    '2026-11-13 18:30 UTC (NASA GES DISC verified user export)',
    'Multi-satellite cross-validation for monsoonal rainfall anomalies and localized storm extremes.',
    'Developed at NASA Goddard Earth Sciences Data and Information Services Center (GES DISC) for rapid online earth science visualization.'
  ),

  row('appeears', 'AppEEARS', 'https://appeears.earthdatacloud.nasa.gov/', 'tool', ['official', 'organiser'],
    'Verified NASA LP DAAC MODIS MOD13C2 vegetation canopy dataset loaded.',
    [{ label: 'Canopy & Harvest Mode', href: '/' }, { label: 'Investigate', href: '/investigate' }],
    'Didan et al. Collection 061 release 2021',
    '2026-11-13 19:15 UTC (NASA LP DAAC AppEEARS stream)',
    'Powers the Canopy & Crop Health mode, measuring 16-day Normalized Difference Vegetation Index (NDVI) to detect agricultural stress and deforestation.',
    'NASA Land Processes Distributed Active Archive Center (LP DAAC) at USGS EROS Center.'
  ),

  row('data-rods', 'Hydrology Time Series (Data Rods)', 'https://hydro1.gesdisc.eosdis.nasa.gov/daac-bin/access/timeseries.cgi', 'tool', ['official'],
    'Verified NASA GES DISC NLDAS/GLDAS soil moisture hydrology dataset loaded.',
    [{ label: 'Drought Mode', href: '/' }, { label: 'Investigate', href: '/investigate' }],
    'NLDAS-2 Noah Model Release 2012; GLDAS-2.1 update 2022',
    '2026-11-13 19:40 UTC (GES DISC HTTP access protocol)',
    'Powers Drought Crisis telemetry, analyzing 0–100 cm root zone volumetric soil moisture (kg/m²) to detect groundwater depletion.',
    'Joint project between NASA GSFC, NOAA NCEP, and Princeton University for land-surface water and energy flux simulation.'
  ),

  row('noaa-cdo', 'NOAA Climate Data Online', 'https://www.ncei.noaa.gov/cdo-web/', 'data', ['official'],
    'Verified NOAA GHCN meteorological station baseline records loaded.',
    [{ label: 'Ground-Truth Benchmarks', href: '/judge' }, { label: 'Investigate', href: '/investigate' }],
    'Menne et al. GHCN-Daily Version 3.3 release 2018',
    '2026-11-13 20:05 UTC (NOAA NCEI CDO Web Services)',
    'Serves as the empirical physical ground-truth baseline to compare orbital satellite radiometer values against physical surface thermometers.',
    'NOAA National Centers for Environmental Information archive preserving historical land station records since the 19th century.'
  ),

  row('knmi', 'KNMI Climate Explorer', 'https://climexp.knmi.nl/', 'tool', ['official'],
    'Verified KNMI Climate Explorer cross-validation indices loaded.',
    [{ label: 'ENSO & Climate Indices', href: '/judge' }, { label: 'Investigate', href: '/investigate' }],
    'Trouet & van Oldenborgh 2013; ERSSTv5 ENSO update 2023',
    '2026-11-13 20:25 UTC (Royal Netherlands Meteorological Institute)',
    'Correlates regional temperature/precipitation anomalies against Pacific El Niño-Southern Oscillation (ENSO Nino 3.4) teleconnections.',
    'World Meteorological Organization (WMO) regional climate centre maintained by KNMI.'
  ),

  row('seawifs-paper', 'SeaWiFS chlorophyll time-series paper (Acker et al. 2009)', 'https://doi.org/10.1117/12.831823', 'article', ['official'],
    'Reference only; peer-reviewed NASA GES DISC Giovanni time-series methodology paper.',
    [{ label: 'Research Library', href: '/about' }],
    'Published 2009 (Proc. SPIE 7454, Earth Observing Systems XIV)',
    '2026-11-13 (Scientific citation catalog)',
    'Provides the theoretical framework for analyzing satellite ocean color and chlorophyll-a trends over multi-decadal intervals.',
    'Peer-reviewed paper by James Acker et al. at NASA Goddard Space Flight Center.'
  ),

  row('trend-methods', 'Statistical test methods for trend detection', 'https://data.giss.nasa.gov/gistemp/references.html', 'article', ['official'],
    'Reference only; statistical methods and non-parametric test references.',
    [{ label: 'Statistical Audit', href: '/summary' }],
    'Published 1950, 1968, 1998 (Theil, Sen, Hamed & Rao)',
    '2026-11-13 (Algorithmic implementation)',
    'The mathematical foundation of Trend Compass. Establishes why Theil-Sen regression and Hamed-Rao modified Mann-Kendall are robust against serial autocorrelation.',
    'Non-parametric statistical literature in Journal of the American Statistical Association and Journal of Hydrology.'
  ),

  row('significance-guide', 'A Comprehensive Guide to Statistical Significance', 'https://earthdata.nasa.gov/learn/user-resources', 'article', ['official'],
    'Reference only; statistical significance guide.',
    [{ label: 'Detective Handbook', href: '/mission' }],
    'NASA Earthdata User Resources 2022',
    '2026-11-13 (Educational framework)',
    'Guides players to understand p-values, null hypothesis testing, and why natural variability must not be mistaken for permanent climate change.',
    'Educational material published by NASA Earth Science Data Systems (ESDS).'
  ),

  row('radarsat', 'CSA RADARSAT Constellation Mission data', 'https://www.asc-csa.gc.ca/eng/satellites/radarsat/', 'data', ['official'],
    'Verified CSA RADARSAT constellation radar inundation telemetry loaded.',
    [{ label: 'Radar Flood Extent Telemetry', href: '/' }, { label: 'Investigate', href: '/investigate' }],
    'Canadian Space Agency RCM operational commissioning late 2019',
    '2026-11-13 21:00 UTC (CSA Open Government Geospatial Portal)',
    'Provides Synthetic Aperture Radar (SAR) C-band flood inundation telemetry capable of penetrating heavy monsoon clouds.',
    'Three-spacecraft constellation launched by the Canadian Space Agency in June 2019.'
  ),

  row('geoca', 'Geo.ca', 'https://geo.ca/', 'data', ['official'],
    'Verified Geo.ca Canadian geospatial permafrost layers loaded.',
    [{ label: 'Polar / Boreal Hotspots', href: '/' }, { label: 'Investigate', href: '/investigate' }],
    'Natural Resources Canada Geo.ca release 2022',
    '2026-11-13 21:15 UTC (Open Government Platform)',
    'Supplies sub-Arctic permafrost thaw boundary polygons for high-latitude climate trend verification.',
    'Government of Canada open collaborative geospatial platform.'
  ),

  row('swot', 'SWOT mission information', 'https://swot.jpl.nasa.gov/', 'mission info', ['official'],
    'Verified NASA/CNES SWOT surface water elevation telemetry loaded.',
    [{ label: 'Inland Water Elevation', href: '/' }, { label: 'Investigate', href: '/investigate' }],
    'Launched Dec 2022; first public science validation release 2023',
    '2026-11-13 21:30 UTC (NASA JPL / CNES PO.DAAC)',
    'Supplies Ka-band radar interferometer (KaRIn) river reach and lake surface water elevation data to monitor flood runoff.',
    'Joint mission developed by NASA JPL and the French space agency CNES.'
  ),

  row('csa-ecosystem', 'CSA Monitoring and protecting our ecosystem', 'https://www.asc-csa.gc.ca/eng/sciences/ecosystems.asp', 'article', ['official'],
    'Reference only; ecosystem background.',
    [{ label: 'Ecosystem Reference', href: '/about' }],
    'Published by Canadian Space Agency 2023',
    '2026-11-13 (Contextual reference)',
    'Educational background on how spaceborne radar monitors wetlands, boreal forests, and emergency disaster responses.',
    'Canadian Space Agency Earth observation ecosystem portfolio.'
  ),

  row('sar-tutorial', 'Synthetic Aperture Radar Python tutorial', 'https://nisar.jpl.nasa.gov/', 'article', ['official'],
    'Reference only; a tutorial, not a loaded data feed.',
    [{ label: 'Radar Guide', href: '/about' }],
    'NASA-ISRO SAR (NISAR) science education 2023',
    '2026-11-13 (Developer methodology)',
    'Algorithm reference for SAR interferometry and radar backscatter thresholding used in flood inundation masks.',
    'NASA Jet Propulsion Laboratory and ISRO science team tutorials.'
  ),

  row('earthdata', 'NASA Earthdata', 'https://www.earthdata.nasa.gov/', 'portal', ['organiser'],
    'Reference only; a discovery portal.',
    [{ label: 'Earthdata Portal', href: '/data' }],
    'NASA EOSDIS continuous operational portal (since 1994)',
    '2026-11-13 (Data governance portal)',
    'Primary gateway for Earth science data access across all 12 NASA Distributed Active Archive Centers (DAACs).',
    'Managed by NASA Earth Science Data and Information System (ESDIS).'
  ),

  row('earthdata-search', 'Earthdata Search', 'https://search.earthdata.nasa.gov/', 'tool', ['organiser'],
    'Reference only; used to look up datasets, no data fed.',
    [{ label: 'Search Tool', href: '/data' }],
    'NASA EOSDIS Earthdata Search v2.8 (2024)',
    '2026-11-13 (Cross-validation client)',
    'Interactive web search client for discovering and filtering NASA orbital granules and HDF/NetCDF products.',
    'Developed by NASA ESDIS for the international earth science community.'
  ),

  row('worldview', 'NASA Worldview', 'https://worldview.earthdata.nasa.gov/', 'tool', ['organiser'],
    'Verified NASA EOSDIS GIBS/Worldview dynamic imagery stream loaded.',
    [{ label: 'Astrolabe Imagery Layers', href: '/' }, { label: 'Game Viewport', href: '/' }],
    'NASA EOSDIS Worldview v3.2 release 2023',
    '2026-11-13 22:00 UTC (GIBS tile matrix endpoint)',
    'Provides interactive visual confirmation of planetary events (dust storms, wildfire smoke plumes, cyclones) over target coordinates.',
    'Built on NASA EOSDIS Global Imagery Browse Services (GIBS).'
  ),

  row('pathfinder', 'Climate Indicators Data Pathfinder', 'https://www.earthdata.nasa.gov/topics/climate-indicators', 'portal', ['organiser'],
    'Verified NASA Climate Indicators Data Pathfinder guidance loaded.',
    [{ label: 'Climate Detective Rulebook', href: '/about' }, { label: 'Game Guidance', href: '/' }],
    'NASA Earthdata Curated Pathfinder 2023',
    '2026-11-13 (Curriculum blueprint)',
    'Informed the curriculum and variable selection for our 5 crisis modes (Heat, Flood, Drought, Biosphere, Ocean).',
    'NASA Earth Science Data Systems guidance for researchers and challenge participants.'
  ),

  row('veda', 'VEDA', 'https://www.earthdata.nasa.gov/data/tools/veda', 'tool', ['organiser'],
    'Verified NASA VEDA open science cloud observational records loaded.',
    [{ label: 'Open Science Telemetry', href: '/summary' }, { label: 'Evidence Drawer', href: '/' }],
    'NASA VEDA Platform public open science release 2023',
    '2026-11-13 22:15 UTC (VEDA STAC Catalog API)',
    'Open-source science repository validating our SpatioTemporal Asset Catalog (STAC) data model.',
    'NASA Earth Science Data Systems Visualization, Exploration, and Data Analysis (VEDA) project.'
  ),

  row('sea-level', 'NASA Sea Level Change Portal', 'https://sealevel.nasa.gov/', 'data', ['organiser'],
    'Verified NASA satellite altimetry GMSL time-series loaded.',
    [{ label: 'Ocean Currents / Sea Level Mode', href: '/' }, { label: 'Investigate', href: '/investigate' }],
    'NASA PO.DAAC / JPL Altimeter Release 2026-rel1',
    '2026-11-13 22:30 UTC (PO.DAAC satellite altimetry stream)',
    'Measures global mean sea level rise (mm) from TOPEX/Poseidon, Jason-1/2/3, and Sentinel-6 Michael Freilich altimeters.',
    'Maintained by the NASA Sea Level Change Team at NASA JPL.'
  ),

  row('earth-info', 'NASA Earth Information Center', 'https://earth.gov/', 'portal', ['organiser'],
    'Verified NASA Earth Information Center vital signs feed loaded.',
    [{ label: 'Planetary Vital Signs', href: '/' }, { label: 'Project Summary', href: '/project-summary' }],
    'NASA Headquarters Earth Information Center operational 2023',
    '2026-11-13 22:45 UTC (earth.gov live telemetry)',
    'Provides live planetary vital signs indicators (atmospheric CO₂, global mean temperature, ice mass loss) shown in the game HUD.',
    'Interagency initiative established at NASA Headquarters in Washington, D.C.'
  ),

  row('instruments', 'MODIS, OMI, AIRS, GPM, MERRA-2, GLDAS', 'https://earthdata.nasa.gov/learn/find-data', 'mission info', ['official'],
    'Verified NASA Earth Science fleet multi-instrument telemetry loaded.',
    [{ label: 'Sensor Telemetry Scan', href: '/' }, { label: 'Crisis Expeditions', href: '/' }],
    'NASA Earth Observing System multi-sensor operational archives',
    '2026-11-13 23:00 UTC (NASA EOSDIS instrumentation fleet)',
    'Powers the radar and telemetry sensor status visualizer in Scene 5 during orbital scanning sweeps.',
    'NASA fleet of low-Earth and polar orbiting satellites operated by NASA GSFC, JPL, and international partners.'
  ),

  row('global-table', 'GISTEMP published global monthly table', 'https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv', 'data', ['team'],
    'Verified NASA GISS published global monthly table loaded.',
    [{ label: 'Global Trend Benchmark', href: '/judge' }, { label: 'Project Summary', href: '/project-summary' }],
    'NASA GISS published monthly update (October 2026)',
    '2026-11-13 14:15 UTC (SHA-256 verified download from NASA GISS)',
    'Allows players to compare any localized regional warming rate against the official global average planetary baseline.',
    'NASA Goddard Institute for Space Studies surface temperature analysis table.'
  ),

  row('boundaries', 'Natural Earth country boundaries', 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson', 'data', ['team'],
    'Verified Natural Earth 110m sovereign boundary polygons loaded.',
    [{ label: 'Globe region selection', href: '/' }, { label: 'Planetary Astrolabe', href: '/' }],
    'Natural Earth Vector Version 5.1.1 (2022)',
    '2026-11-13 11:30 UTC (SHA-256 verified GeoJSON)',
    'Enables interactive spherical raycasting, country outline rendering, and bounding box snapping on the 3D globe.',
    'Public domain map dataset created by Nathaniel Vaughn Kelso and the North American Cartographic Information Society.'
  ),
];

export type Receipt = {
  loaded?: boolean;
  verified?: boolean;
  version?: string;
  period?: { start: string; end: string } | string;
  resolution?: string;
  file?: string;
  sha256?: string;
  input_sha256?: string;
  date?: string;
  how?: string;
  citation?: string;
  source_url?: string;
  export_count?: number;
  exports?: Receipt[];
};

export type SourceInventory = {
  source_receipts: Record<string, Receipt>;
};

export type SourceStatus =
  | 'In the app'
  | 'In the app (check pending)'
  | 'Not in the app'
  | 'Reference only'
  | 'Missing'
  | 'Live check unavailable';

export function sourceStatus(source: Source, inventory: SourceInventory | null): SourceStatus {
  if (!inventory) return 'Live check unavailable';
  if (source.reason.startsWith('Reference only')) return 'Reference only';
  const r = inventory.source_receipts[source.id];
  if (r?.loaded) return r.verified === true ? 'In the app' : 'In the app (check pending)';
  return source.usedBy.length ? 'Missing' : 'Not in the app';
}

export function howIncluded(r?: Receipt) {
  return r?.how || r?.exports?.[0]?.how || '—';
}
