'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ModeManifest, SourcedFact } from '../modes/types';
import { getModes } from '../modes/registry';
import { getAtlasFacts, exportResearchLogCSV, exportResearchLogJSON, getResearchLogs } from '../domain/researchLog';
import { artManifest } from '../assets/artManifest';

interface ModeSelectHubProps {
  onSelectMode: (mode: ModeManifest) => void;
  initialShowAll?: boolean;
}

export default function ModeSelectHub({ onSelectMode, initialShowAll = false }: ModeSelectHubProps) {
  const [showAll, setShowAll] = useState(initialShowAll);
  const [atlasOpen, setAtlasOpen] = useState(false);
  const [researchOpen, setResearchOpen] = useState(false);
  const [atlasFacts, setAtlasFacts] = useState<SourcedFact[]>([]);
  const [logCount, setLogCount] = useState(0);

  useEffect(() => {
    setAtlasFacts(getAtlasFacts());
    setLogCount(getResearchLogs().length);
    if (typeof window !== 'undefined' && window.location.search.includes('allmodes=1')) {
      setShowAll(true);
    }
  }, []);

  const modes = getModes(showAll);

  return (
    <div className="voyage-hub-root" role="region" aria-label="Voyage Mode Select Hub">
      <header className="voyage-hub-header">
        <div className="voyage-hub-title-block">
          <h1 className="voyage-hub-title">VOYAGE OF THE COMPASS</h1>
          <p className="voyage-hub-subtitle">
            Earth System Research Fleet · {modes.length} {modes.length === 1 ? 'Mode' : 'Modes'} Available
          </p>
        </div>
        <div className="voyage-hub-actions">
          <button
            className="voyage-hub-btn"
            onClick={() => {
              setAtlasFacts(getAtlasFacts());
              setAtlasOpen(true);
            }}
            aria-label="View Piper's Log / Atlas"
          >
            PIPER&apos;S LOG ({atlasFacts.length})
          </button>
          <button
            className="voyage-hub-btn"
            onClick={() => {
              setLogCount(getResearchLogs().length);
              setResearchOpen(true);
            }}
            aria-label="Export Research Log"
          >
            RESEARCH LOG ({logCount})
          </button>
          <button
            className={`voyage-hub-btn voyage-hub-toggle ${showAll ? 'active' : ''}`}
            onClick={() => setShowAll(!showAll)}
            aria-pressed={showAll}
          >
            {showAll ? 'SHOWING ALL MODES' : 'SHIPPABLE ONLY'}
          </button>
        </div>
      </header>

      {/* Piper Bridge Dialogue */}
      <section className="voyage-hub-piper-card" aria-label="First Mate Piper Briefing">
        <div className="voyage-hub-piper-avatar">
          <Image
            src={artManifest.piper}
            alt="First Mate Piper"
            width={72}
            height={90}
            priority
            unoptimized
          />
        </div>
        <div className="voyage-hub-piper-dialogue">
          <div className="voyage-hub-piper-name">FIRST MATE PIPER</div>
          <p className="voyage-hub-piper-text">
            &ldquo;Welcome to the Bridge, Captain! Select an expedition to set sail. Every mode is powered by real NASA Earth observations.&rdquo;
          </p>
        </div>
      </section>

      {/* Mode Grid */}
      <main className="voyage-hub-grid" role="list">
        {modes.map((mode) => (
          <article
            key={mode.id}
            role="listitem"
            className={`voyage-mode-card ${!mode.shippable ? 'mode-pending' : ''}`}
            style={{
              borderColor: mode.hudFrameColor,
              boxShadow: `0 4px 20px ${mode.palette.primary}22`,
            }}
          >
            <div className="voyage-card-media">
              <Image
                src={mode.cardKey}
                alt={`${mode.title} pixel illustration`}
                width={256}
                height={256}
                className="voyage-card-image"
                unoptimized
              />
              {!mode.shippable && (
                <div className="voyage-card-pending-badge" role="status">
                  {mode.statusLabel || 'DATA PENDING'}
                </div>
              )}
            </div>

            <div className="voyage-card-content">
              <div className="voyage-card-header">
                <h2 className="voyage-card-title" style={{ color: mode.palette.primary }}>
                  {mode.title}
                </h2>
                <span className="voyage-card-tagline">{mode.tagline}</span>
              </div>

              <div className="voyage-card-twist">
                <span className="voyage-twist-label">TWIST:</span> {mode.twist}
              </div>

              <div className="voyage-card-meta">
                <span className="voyage-meta-item">
                  <strong>TOOLS:</strong> {mode.tools.join(' · ')}
                </span>
                <span className="voyage-meta-item">
                  <strong>DATASET:</strong> {mode.datasetKeys.join(', ')}
                </span>
              </div>

              <div className="voyage-card-footer">
                {mode.shippable ? (
                  <button
                    className="voyage-launch-btn"
                    style={{
                      backgroundColor: mode.palette.primary,
                      color: mode.palette.background,
                      borderColor: mode.hudFrameColor,
                    }}
                    onClick={() => onSelectMode(mode)}
                  >
                    SET SAIL →
                  </button>
                ) : (
                  <div className="voyage-pending-notice">
                    {mode.statusLabel || 'Awaiting Data Ingestion'}
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </main>

      {/* Piper's Log / Atlas Modal */}
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

      {/* Research Log Modal */}
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
