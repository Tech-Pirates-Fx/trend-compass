import * as Phaser from 'phaser';
import { range, type State, type Action, type VoyageCase, type Slot } from '../domain/voyage';
import { ModeManifest } from '../modes/types';
import { heatMode } from '../modes/heat/mode';
import { saveResearchLog } from '../domain/researchLog';

export type Settings = {
  muted: boolean;
  reduced: boolean;
  paused: boolean;
  beep: () => void;
  save: () => void;
};

export const toolSceneKeys = {
  net: 'Net',
  compass: 'Compass',
  storm: 'Storm',
  court: 'CrewCourt',
  reveal: 'Reveal',
  mutiny: 'Mutiny',
} as const;

export function tools(
  c: VoyageCase,
  get: () => State,
  act: (a: Action) => void,
  settings: Settings,
  mode: ModeManifest = heatMode
) {
  return class EvidenceDeck extends Phaser.Scene {
    root!: Phaser.GameObjects.Container;
    live!: Phaser.GameObjects.Text;
    graph!: Phaser.GameObjects.Graphics;
    dragStart?: { x: number; y: number };
    netDrag!: Phaser.GameObjects.Graphics;
    dialDrag = false;
    flagDrag = false;
    held?: string;
    clock = 0;
    hintVisible = true;
    started = 0;
    mirageTested = false;
    currentWindowIndex = 0;

    constructor(key: string) {
      super(key);
    }

    create() {
      this.started = performance.now();
      this.root = this.add.container(0, 0);
      this.netDrag = this.add.graphics().setDepth(20);
      this.input.keyboard!.addCapture(['UP', 'DOWN', 'LEFT', 'RIGHT', 'SPACE']);
      const down = (event: KeyboardEvent) => this.key(event);
      this.input.keyboard!.on('keydown', down);
      this.input.on('pointerdown', this.pointerDown, this);
      this.input.on('pointermove', this.pointerMove, this);
      this.input.on('pointerup', this.pointerUp, this);
      this.events.once('shutdown', () => {
        this.input.keyboard!.off('keydown', down);
        this.input.off('pointerdown', this.pointerDown, this);
        this.input.off('pointermove', this.pointerMove, this);
        this.input.off('pointerup', this.pointerUp, this);
      });
      this.paint();
    }

    text(x: number, y: number, value: string, size = 20, color = '#f5ecd7', width = 1100) {
      const t = this.add.text(x, y, value, {
        fontFamily: 'monospace',
        fontSize: `${size}px`,
        color,
        wordWrap: { width },
        lineSpacing: 6,
      });
      this.root.add(t);
      return t;
    }

    rect(x: number, y: number, w: number, h: number, color = 0x12354b) {
      const r = this.add.rectangle(x, y, w, h, color).setStrokeStyle(2, 0x397584);
      this.root.add(r);
      return r;
    }

    button(x: number, y: number, label: string, fn: () => void, w = 220) {
      const b = this.rect(x, y, w, 44, 0x21465a).setInteractive({ useHandCursor: true });
      this.text(x - w / 2 + 12, y - 12, label, 18, '#ffe0a0', w - 18);
      b.on('pointerdown', () => {
        settings.beep();
        fn();
      });
    }

    dispatch(a: Action) {
      if (settings.paused && a.type !== 'retry') return;
      const previous = get().phase;
      act(a);
      settings.beep();
      const next = get().phase;
      if (next === 'sea') {
        this.scene.start('SeaOfTime');
        return;
      }
      if (previous !== next) {
        // If entering reveal or mutiny, record research log
        if (next === 'reveal' || next === 'mutiny') {
          const s = get();
          saveResearchLog({
            timestamp: new Date().toISOString(),
            modeId: mode.id,
            caseId: c.id,
            dataset: c.provenance.dataset,
            bbox: c.bbox,
            period: c.period,
            playerEstimate: s.estimate,
            engineSenSlope: c.answerKey.senSlopePerDecade,
            ci95: c.answerKey.ci95,
            hrPValue: c.answerKey.hrP,
            engineVerdict: c.answerKey.verdict,
            playerVerdict: s.significant ? 'significant' : 'not_significant',
            confidence: s.confidence,
            score: s.score,
            trust: s.trust,
            limitations: c.limitations,
            mirageFound: this.mirageTested,
          });
        }
        this.scene.start(toolSceneKeys[next]);
        return;
      }
      this.paint();
      if (!settings.reduced) this.cameras.main.flash(50, 12, 32, 42);
    }

    chart(x = 90, y = 180, w = 640, h = 300, estimate?: number, showInterval = false) {
      const points = c.series.filter((p) => p.v !== null) as { t: string; v: number }[];
      const min = Math.min(...points.map((p) => p.v)),
        max = Math.max(...points.map((p) => p.v));
      const span = max - min || 1;
      const g = this.add.graphics();
      this.root.add(g);
      this.graph = g;
      g.fillStyle(0x091d2d).fillRect(x, y, w, h).lineStyle(1, 0x37616d).strokeRect(x, y, w, h);
      const yy = (v: number) => y + h - 15 - ((v - min) / span) * (h - 30);
      g.fillStyle(0x79bcd0, 0.55);
      points.forEach((p, i) => g.fillCircle(x + (i / (c.series.length - 1)) * w, yy(p.v), 2));
      this.text(
        x,
        y + h + 10,
        `${c.period.start}                  ${c.period.end} · ${c.units}`,
        15,
        '#a5cbd3',
        w
      );
      if (estimate !== undefined) {
        const mean = points.reduce((s, p) => s + p.v, 0) / points.length;
        const decades = c.series.length / 120;
        if (showInterval) {
          const [lo, hi] = c.answerKey.ci95;
          g.fillStyle(0x83d4bf, 0.25).fillPoints(
            [
              { x, y: yy(mean - (lo * decades) / 2) },
              { x: x + w, y: yy(mean + (lo * decades) / 2) },
              { x: x + w, y: yy(mean + (hi * decades) / 2) },
              { x: x + w, y: yy(mean - (hi * decades) / 2) },
            ],
            true
          );
        }
        g.lineStyle(4, 0xffcf79).lineBetween(
          x,
          yy(mean - (estimate * decades) / 2),
          x + w,
          yy(mean + (estimate * decades) / 2)
        );
      }
    }

    paint() {
      this.root.removeAll(true);
      const s = get();
      this.cameras.main.setBackgroundColor('#071725');
      // Frame styled with mode's hudFrameColor
      const frameColorNum = parseInt(mode.hudFrameColor.replace('#', '0x'), 16) || 0x397584;
      const frameBgNum = parseInt(mode.palette.background.replace('#', '0x'), 16) || 0x0a2132;
      this.rect(640, 360, 1250, 690, frameBgNum).setStrokeStyle(3, frameColorNum);
      this.text(
        35,
        22,
        `${mode.title.toUpperCase()} / FIRST LIGHT · ${s.phase.toUpperCase()}`,
        25,
        mode.palette.primary
      );
      this.text(
        36,
        65,
        `Trust ${s.trust}  ·  Fuel ${s.fuel.toFixed(0)}  ·  Receipts ${
          s.tokens.length
        }  ·  ${c.period.start}—${c.period.end}`,
        17,
        '#acced4'
      );
      this.button(
        1008,
        45,
        settings.muted ? 'M · MUTED' : 'M · SOUND',
        () => {
          settings.muted = !settings.muted;
          settings.save();
          this.paint();
        },
        170
      );
      this.button(
        1190,
        45,
        settings.paused ? 'P · RESUME' : 'P · PAUSE',
        () => {
          settings.paused = !settings.paused;
          this.paint();
        },
        155
      );
      if (s.phase === 'net') this.net();
      if (s.phase === 'compass') this.compass();
      if (s.phase === 'storm') this.storm();
      if (s.phase === 'court') this.court();
      if (s.phase === 'reveal' || s.phase === 'mutiny') this.reveal();
      this.rect(640, 659, 1210, 76, 0x102e41);
      const piper = this.add.image(76, 652, 'piper').setDisplaySize(70, 88);
      this.root.add(piper);
      this.text(
        130,
        635,
        this.hintVisible ? s.message : 'Piper hidden. H shows the hint.',
        17,
        '#ffe4ad',
        1080
      );
      if (settings.paused) {
        this.rect(640, 350, 700, 160, 0x071522);
        this.text(440, 310, 'PAUSED · P / tap RESUME', 26);
      }
    }

    testMirage() {
      const mirageWindow = c.windowTable.find(
        (w) => w.senSlopePerDecade * c.answerKey.senSlopePerDecade < 0
      );
      if (mirageWindow) {
        this.mirageTested = true;
        settings.beep();
        act({
          type: 'sail',
          distance: 0,
          atPort: false,
        }); // trigger announcement refresh
        get().message = `MIRAGE UNMASKED! In window ${mirageWindow.s}–${mirageWindow.e}, short-term slope is ${mirageWindow.senSlopePerDecade.toFixed(2)} °C/dec (opposing 40-yr warming). Short windows mislead!`;
        this.paint();
      }
    }

    net() {
      this.text(
        80,
        115,
        'THE NET · Fix WHERE and uncover window mirages in the timeline',
        23,
        '#96e5d3'
      );
      this.rect(640, 340, 900, 390, 0x0d3549);
      if (this.textures.exists('earth')) {
        const earth = this.add.image(640, 340, 'earth').setDisplaySize(900, 390).setAlpha(0.4);
        this.root.add(earth);
      }
      this.rect(640, 330, 440, 220, 0x174d60).setFillStyle(0x174d60, 0.6).setStrokeStyle(3, 0xffd180);
      const g = this.add.graphics().lineStyle(1, 0xa6d7c2, 0.6);
      this.root.add(g);
      for (let x = 420; x <= 860; x += 44) g.lineBetween(x, 220, x, 440);
      for (let y = 220; y <= 440; y += 22) g.lineBetween(420, y, 860, y);
      const width = c.bbox.east - c.bbox.west,
        height = c.bbox.north - c.bbox.south;
      this.text(
        440,
        250,
        `ARCHIVE CAST\n${width}° × ${height}° · ${
          (width * height) / 4
        } grid cells\nDrag across both gold corners`,
        21,
        '#fff0b8',
        400
      );
      this.text(
        220,
        545,
        `Exact region: S ${c.bbox.south} / N ${c.bbox.north} / W ${c.bbox.west} / E ${c.bbox.east}`,
        18
      );
      this.text(
        220,
        577,
        'Keyboard N casts this fixed net. [M] probe mirage windows.',
        17,
        '#acd5da'
      );
      this.button(
        1040,
        310,
        'N · CAST NET',
        () => this.dispatch({ type: 'net', bbox: c.bbox }),
        230
      );
      this.button(1040, 370, 'M · TEST MIRAGE', () => this.testMirage(), 230);
    }

    compass() {
      const s = get(),
        r = range(c);
      this.text(
        80,
        115,
        'THE COMPASS · Estimate HOW MUCH before revealing the engine',
        23,
        '#96e5d3'
      );
      this.chart(70, 200, 620, 280, s.estimate);
      const g = this.add.graphics();
      this.root.add(g);
      const cx = 950,
        cy = 320;
      g.lineStyle(3, 0x5f9da7).strokeCircle(cx, cy, 115);
      for (let i = 0; i <= 10; i++) {
        const a = Math.PI + (i * Math.PI) / 10;
        g.lineBetween(
          cx + Math.cos(a) * 96,
          cy + Math.sin(a) * 96,
          cx + Math.cos(a) * 111,
          cy + Math.sin(a) * 111
        );
      }
      const angle = Math.PI + ((s.estimate / r + 1) * Math.PI) / 2;
      g.lineStyle(5, 0xffcd72)
        .lineBetween(cx, cy, cx + Math.cos(angle) * 104, cy + Math.sin(angle) * 104)
        .fillStyle(0xffcd72)
        .fillCircle(cx, cy, 9);
      this.text(
        810,
        455,
        `${s.estimate >= 0 ? '+' : ''}${s.estimate.toFixed(3)} °C/decade`,
        26,
        '#ffe1a1'
      );
      this.text(
        795,
        500,
        `Symmetric dial ±${r.toFixed(2)}\nDrag needle / ← → fine steps`,
        17,
        '#bad2db',
        390
      );
      this.button(
        960,
        570,
        'ENTER · LOCK ESTIMATE',
        () => this.dispatch({ type: 'lockCompass' }),
        300
      );
      this.text(
        70,
        550,
        'GISTEMP anomalies already use a baseline.\nSails: these seas are already calm.',
        17,
        '#bad2db',
        650
      );
    }

    storm() {
      const s = get();
      this.text(
        80,
        115,
        'THE STORM TEST · Can zero-trend noise make a slope this large?',
        22,
        '#96e5d3'
      );
      this.text(
        80,
        155,
        'Visual noise test (AR(1) surrogates). The official verdict uses the Hamed–Rao test.',
        17,
        '#ffe1a1'
      );
      const extent = Math.max(
        range(c),
        Math.abs(c.answerKey.senSlopePerDecade) * 1.25,
        ...c.stormSlopes.map(Math.abs)
      );
      const xx = (v: number) => 640 + (v / extent) * 490;
      const g = this.add.graphics();
      this.root.add(g);
      g.lineStyle(2, 0x75aebc).lineBetween(150, 370, 1130, 370);
      g.lineStyle(1, 0x809fac).lineBetween(640, 220, 640, 400);
      c.stormSlopes.slice(0, s.volleys * 50).forEach((v, i) => {
        g.fillStyle(0x7ccce5, 0.8).fillCircle(
          xx(v),
          350 - Math.floor(i / 50) * 20 - (i % 7) * 3,
          4
        );
      });
      const flagX = xx(c.answerKey.senSlopePerDecade);
      g.lineStyle(3, 0xffcf78)
        .lineBetween(flagX, 205, flagX, 390)
        .fillStyle(0xffcf78)
        .fillTriangle(flagX, 205, flagX + 30, 217, flagX, 230);
      this.text(
        flagX - 50,
        402,
        `REAL ${c.answerKey.senSlopePerDecade.toFixed(3)}`,
        17,
        '#ffdc92',
        200
      );
      this.text(150, 400, `−${extent.toFixed(2)}`, 16);
      this.text(1050, 400, `+${extent.toFixed(2)}`, 16);
      this.button(
        290,
        505,
        `SPACE · FIRE ${s.volleys * 50}/300`,
        () => this.dispatch({ type: 'fire' }),
        280
      );
      this.text(480, 465, 'Place verdict flag (drag / ← →)', 17, '#bad4d9', 500);
      this.rect(750, 520, 420, 48, 0x133f52);
      this.text(550, 510, 'NOT SIGNIFICANT', 16);
      this.text(775, 510, 'SIGNIFICANT', 16);
      const flag = this.rect(s.significant ? 920 : 570, 555, 48, 24, 0xffcd72);
      flag.setInteractive();
      this.text(
        510,
        585,
        `Your claim: ${s.significant ? 'significant' : 'not significant'}`,
        17,
        '#ffe0a0'
      );
      if (s.volleys === 6)
        this.button(1090, 570, 'ENTER · COURT', () => this.dispatch({ type: 'lockStorm' }), 230);
    }

    court() {
      const s = get();
      this.text(60, 112, 'CREW COURT · Build your claim from the receipts you earned', 23, '#96e5d3');
      const slots: Slot[] = ['WHAT', 'WHERE', 'HOW MUCH', 'SIGNIFICANT'];
      slots.forEach((slot, i) => {
        const x = 190 + i * 300;
        this.rect(x, 245, 275, 135, s.slots[slot] ? 0x225d57 : 0x102e40);
        this.text(x - 123, 190, slot, 22, '#ffdb94', 260);
        const t = s.tokens.find((t) => t.id === s.slots[slot]);
        this.text(x - 122, 230, t ? this.label(t.id) : 'Drop matching receipt', 16, '#c5e5e6', 250);
      });
      this.rect(640, 365, 1000, 65, s.limitation ? 0x225d57 : 0x102e40);
      this.text(
        160,
        343,
        s.limitation ? c.limitations[0] : 'LIMITATION · Attach an earned limitation receipt',
        18,
        '#ffe4b6',
        960
      );
      s.tokens.forEach((t, i) => {
        const x = 147 + i * 246;
        const r = this.rect(x, 470, 228, 90, 0x244556).setInteractive({
          draggable: true,
          useHandCursor: true,
        });
        r.setData('tokenId', t.id);
        this.text(x - 100, 442, `${i + 1} · ${t.slot}\n${this.label(t.id)}`, 15, '#fff0c7', 210);
        r.on('pointerdown', () => {
          this.held = t.id;
        });
      });
      this.text(
        60,
        540,
        'Keyboard 1–5: place matching receipt. Drag mismatches to see why they bounce.',
        17,
        '#b7d6db'
      );
      this.button(
        300,
        585,
        `C · CONFIDENCE ${s.confidence}`,
        () => this.dispatch({ type: 'confidence' }),
        370
      );
      this.button(1000, 585, 'ENTER · SUBMIT CLAIM', () => this.dispatch({ type: 'submit' }), 320);
    }

    label(id: string) {
      const s = get();
      if (id === 'what') return s.estimate > 0 ? 'Rising' : s.estimate < 0 ? 'Falling' : 'Flat';
      if (id === 'how') return `${s.estimate.toFixed(3)} °C/decade`;
      if (id === 'where')
        return `${c.bbox.south}…${c.bbox.north}°N\n${c.bbox.west}…${c.bbox.east}°E`;
      if (id === 'sig') return s.significant ? 'Significant' : 'Not significant';
      return 'Regional box average';
    }

    reveal() {
      const s = get(),
        key = c.answerKey;
      this.text(
        80,
        115,
        s.phase === 'mutiny'
          ? 'MUTINY · Crew Trust reached zero'
          : 'DEBRIEF · Compare your work with the engine',
        27,
        s.phase === 'mutiny' ? '#ffb1a1' : '#96e5d3'
      );
      this.chart(70, 200, 570, 270, s.estimate, true);
      const [lo, hi] = key.ci95;
      const mark =
        s.estimate >= lo && s.estimate <= hi
          ? 'Bullseye'
          : Math.abs(s.estimate - key.senSlopePerDecade) <= 2 * (hi - lo)
          ? 'Close'
          : 'Off Course';
      this.text(70, 175, `Compass: ${mark} · shaded engine slope interval`, 17, '#a5e2c9', 610);
      this.text(
        700,
        185,
        `WHAT · ${
          key.senSlopePerDecade > 0 ? 'Rising' : 'Falling'
        } temperature anomaly\nWHERE · latitude ${c.bbox.south} to ${c.bbox.north}\nLongitude ${
          c.bbox.west
        } to ${c.bbox.east}\nHOW MUCH · ${key.senSlopePerDecade.toFixed(
          4
        )} °C/decade\nYour estimate · ${s.estimate.toFixed(
          4
        )}\n95% Sen interval · ${key.ci95[0]} to ${key.ci95[1]}\nSIGNIFICANT · ${
          key.verdict
        }\nHamed–Rao p = ${
          key.hrP === 0 ? '0 (numerical underflow)' : key.hrP.toExponential(3)
        }\nCalibration · ${s.score}`,
        18,
        '#f4e8cc',
        515
      );
      this.text(
        70,
        520,
        'Sen interval ignores serial dependence. Significance is not causality. Free retry.',
        16,
        '#bad6dd'
      );
      this.button(640, 575, 'RETRY VOYAGE · R', () => this.dispatch({ type: 'retry' }), 330);
      this.text(
        700,
        470,
        `Mode: ${mode.title} · Research logged to ed-tech artifact.`,
        16,
        '#ffdb94',
        490
      );
    }

    key(e: KeyboardEvent) {
      const s = get();
      if (e.code === 'KeyM' && s.phase !== 'net') {
        settings.muted = !settings.muted;
        settings.save();
        this.paint();
        return;
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        settings.paused = !settings.paused;
        this.paint();
        return;
      }
      if (e.code === 'KeyH') {
        this.hintVisible = !this.hintVisible;
        this.paint();
        return;
      }
      if (settings.paused) return;
      if (e.code === 'KeyN' && s.phase === 'net') this.dispatch({ type: 'net', bbox: c.bbox });
      if (e.code === 'KeyM' && s.phase === 'net') this.testMirage();
      if (e.code === 'Enter') {
        if (s.phase === 'compass') this.dispatch({ type: 'lockCompass' });
        else if (s.phase === 'storm') this.dispatch({ type: 'lockStorm' });
        else if (s.phase === 'court') this.dispatch({ type: 'submit' });
      }
      if (e.code === 'Space' && s.phase === 'storm') this.dispatch({ type: 'fire' });
      if (s.phase === 'storm' && (e.code === 'ArrowLeft' || e.code === 'ArrowRight'))
        this.dispatch({ type: 'flag', significant: e.code === 'ArrowRight' });
      if (s.phase === 'compass' && (e.code === 'ArrowLeft' || e.code === 'ArrowRight'))
        this.dispatch({
          type: 'estimate',
          value: s.estimate + (e.code === 'ArrowLeft' ? -1 : 1) * (range(c) / 150),
        });
      if (s.phase === 'court' && e.code === 'KeyC') this.dispatch({ type: 'confidence' });
      if (s.phase === 'court' && /^Digit[1-5]$/.test(e.code)) {
        const t = s.tokens[Number(e.code.slice(-1)) - 1];
        if (t) this.dispatch({ type: 'place', tokenId: t.id, slot: t.slot });
      }
      if (e.code === 'KeyR') this.dispatch({ type: 'retry' });
    }

    pointerDown(p: Phaser.Input.Pointer) {
      if (settings.paused) return;
      const s = get();
      if (s.phase === 'net' && p.y > 160 && p.y < 530 && p.x < 900) {
        this.dragStart = { x: p.x, y: p.y };
      }
      if (s.phase === 'compass' && Phaser.Math.Distance.Between(p.x, p.y, 950, 320) < 150) {
        this.dialDrag = true;
        this.pointerMove(p);
      }
      if (s.phase === 'storm' && p.y > 480 && p.y < 585) {
        this.flagDrag = true;
        this.pointerMove(p);
      }
    }

    pointerMove(p: Phaser.Input.Pointer) {
      if (!p.isDown || settings.paused) return;
      if (this.held)
        this.netDrag
          .clear()
          .fillStyle(0xffd180, 0.65)
          .fillRoundedRect(p.x - 70, p.y - 25, 140, 50, 5)
          .lineStyle(3, 0xffffff)
          .strokeRect(p.x - 70, p.y - 25, 140, 50);
      if (this.dragStart) {
        const a = this.dragStart;
        this.netDrag.clear().lineStyle(3, 0xffdc8a).strokeRect(a.x, a.y, p.x - a.x, p.y - a.y);
      }
      if (this.dialDrag) {
        let a = Math.atan2(p.y - 320, p.x - 950);
        if (a > 0) a = p.x < 950 ? -Math.PI : 0;
        this.dispatch({ type: 'estimate', value: (((a + Math.PI) / Math.PI) * 2 - 1) * range(c) });
      }
      if (this.flagDrag) this.dispatch({ type: 'flag', significant: p.x > 750 });
    }

    pointerUp(p: Phaser.Input.Pointer) {
      if (this.dragStart) {
        const a = this.dragStart;
        this.dragStart = undefined;
        this.netDrag.clear();
        const x = Math.min(a.x, p.x),
          y = Math.min(a.y, p.y),
          w = Math.abs(p.x - a.x),
          h = Math.abs(p.y - a.y);
        this.dispatch({
          type: 'net',
          bbox:
            x <= 440 && y <= 240 && x + w >= 840 && y + h >= 420
              ? c.bbox
              : { ...c.bbox, east: c.bbox.west + 2 },
        });
      }
      this.dialDrag = false;
      this.flagDrag = false;
      this.netDrag.clear();
      if (this.held) {
        const id = this.held;
        this.held = undefined;
        let slot: Slot | 'LIMITATION' | undefined;
        if (p.y >= 175 && p.y <= 315)
          slot = (['WHAT', 'WHERE', 'HOW MUCH', 'SIGNIFICANT'] as Slot[])[
            Math.max(0, Math.min(3, Math.floor((p.x - 40) / 300)))
          ];
        if (p.y >= 330 && p.y <= 400) slot = 'LIMITATION';
        if (slot) this.dispatch({ type: 'place', tokenId: id, slot });
      }
    }
  };
}
