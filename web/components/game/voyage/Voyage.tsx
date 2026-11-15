'use client';
import { useEffect, useRef, useState } from 'react';
import { useDataControl } from '../../DataControl';
import { loadCase } from './domain/voyage';
import { ModeManifest, SourcedFact } from './modes/types';
import { heatMode } from './modes/heat/mode';
import { getModeById } from './modes/registry';
import ModeSelectHub from './hub/ModeSelectHub';
import { getAtlasFacts, exportResearchLogCSV, exportResearchLogJSON } from './domain/researchLog';
import './voyage.css';

export default function Voyage() {
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('Loading verified offline charts…');
  const [error, setError] = useState('');
  const [activeMode, setActiveMode] = useState<ModeManifest | null>(heatMode);
  const [atlasOpen, setAtlasOpen] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);
  const [atlasFacts, setAtlasFacts] = useState<SourcedFact[]>([]);
  const { inventory } = useDataControl();

  const disabled =
    !!inventory &&
    (!inventory.controls.enabled ||
      !inventory.controls.gistemp ||
      !inventory.controls.saved_voyages);
  const imagery = inventory?.controls.nasa_imagery !== false;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('hub') === '1') {
        setActiveMode(null);
      } else if (params.get('mode')) {
        const found = getModeById(params.get('mode')!);
        if (found) setActiveMode(found);
      }
    }
  }, []);

  useEffect(() => {
    if (!activeMode) return;
    if (disabled) {
      setError('Voyage data is disabled in Data Management.');
      return;
    }
    setError('');
    let dispose: (() => void) | undefined;
    let cancelled = false;
    const controller = new AbortController();

    Promise.all([loadCase(controller.signal), import('./scenes/boot')])
      .then(([c, m]) => {
        if (!cancelled && host.current) {
          dispose = m.boot(
            host.current,
            c,
            setStatus,
            imagery,
            activeMode,
            () => setActiveMode(null)
          );
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });

    return () => {
      cancelled = true;
      controller.abort();
      dispose?.();
    };
  }, [disabled, imagery, activeMode]);

  return (
    <div className="voyage-root">
      {activeMode ? (
        <>
          {/* Top navigation overlay during game */}
          <nav className="voyage-nav-overlay" aria-label="Game quick actions">
            <button
              className="voyage-nav-btn"
              onClick={() => setActiveMode(null)}
              title="Return to Mode Select Bridge [B]"
            >
              BRIDGE / MODES
            </button>
            <button
              className="voyage-nav-btn"
              onClick={() => {
                setAtlasFacts(getAtlasFacts());
                setAtlasOpen(true);
              }}
              title="View Piper's Log Atlas"
            >
              PIPER&apos;S LOG
            </button>
            <button
              className="voyage-nav-btn"
              onClick={() => setResearchOpen(true)}
              title="Export Research Artifacts"
            >
              RESEARCH LOG
            </button>
          </nav>

          <div
            ref={host}
            className="voyage-host"
            aria-label="Sea of Time. Arrows or WASD sail; E interacts; M mutes; P pauses; R toggles reduced motion; B opens Bridge. Each tool announces its keyboard controls."
            role="application"
            tabIndex={0}
          />
          <p className="voyage-sr" aria-live="polite">
            {status}
          </p>
          {error && (
            <div className="voyage-error">
              <h1>Chart unavailable</h1>
              <p>{error}</p>
              <a href="/data">Data Management</a>
              <button onClick={() => location.reload()}>Retry</button>
            </div>
          )}
        </>
      ) : (
        <ModeSelectHub
          onSelectMode={(mode) => setActiveMode(mode)}
        />
      )}

      {/* Piper's Log Atlas Modal */}
      {atlasOpen && (
        <div className="voyage-modal-overlay" role="dialog" aria-modal="true" aria-label="Piper's Log Atlas">
          <div className="voyage-modal-content">
            <div className="voyage-modal-header">
              <h2>PIPER&apos;S LOG · ATLAS OF SOURCED FACTS</h2>
              <button className="voyage-modal-close" onClick={() => setAtlasOpen(false)}>✕</button>
            </div>
            <div className="voyage-modal-body">
              {atlasFacts.length === 0 ? (
                <p className="voyage-empty-msg">
                  No facts collected yet. Set sail on a voyage to discover and verify NASA scientific facts!
                </p>
              ) : (
                <ul className="voyage-facts-list">
                  {atlasFacts.map((fact) => (
                    <li key={fact.id} className="voyage-fact-item">
                      <p className="voyage-fact-text">&ldquo;{fact.text}&rdquo;</p>
                      <div className="voyage-fact-meta">
                        <span>Source: <a href={fact.sourceUrl} target="_blank" rel="noreferrer">{fact.sourceTitle}</a></span>
                        <span>Retrieved: {fact.retrievedDate}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Research Log Export Modal */}
      {researchOpen && (
        <div className="voyage-modal-overlay" role="dialog" aria-modal="true" aria-label="Research Log Export">
          <div className="voyage-modal-content">
            <div className="voyage-modal-header">
              <h2>RESEARCH LOG · ED-TECH ARTIFACT</h2>
              <button className="voyage-modal-close" onClick={() => setResearchOpen(false)}>✕</button>
            </div>
            <div className="voyage-modal-body">
              <p className="voyage-research-desc">
                Every tool measurement, player estimate, engine verification receipt, confidence rating, and crew calibration score is recorded here.
              </p>
              <div className="voyage-export-actions">
                <button className="voyage-hub-btn" onClick={exportResearchLogCSV}>
                  EXPORT CSV FILE
                </button>
                <button className="voyage-hub-btn" onClick={exportResearchLogJSON}>
                  EXPORT JSON FILE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
