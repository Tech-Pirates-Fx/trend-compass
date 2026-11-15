import * as Phaser from 'phaser';
import { assets } from '../assets/manifest';
import { initial, reduce, type Action, type State, type VoyageCase } from '../domain/voyage';
import { tools, toolSceneKeys, type Settings } from './tools';
import { ModeManifest } from '../modes/types';
import { saveFactToAtlas } from '../domain/researchLog';
import { heatMode, heatFacts } from '../modes/heat/mode';

export function boot(
  host: HTMLElement,
  c: VoyageCase,
  announce: (s: string) => void,
  useImagery = true,
  mode: ModeManifest = heatMode,
  onOpenHub?: () => void
) {
  let state = initial();
  if (mode.mentorIntro?.length) {
    state.message = mode.mentorIntro.join(' ');
  }
  // Auto-collect seed facts for active mode
  if (mode.id === 'heat') {
    heatFacts.forEach(saveFactToAtlas);
  }

  let audio: AudioContext | undefined;
  const settings: Settings = {
    muted: false,
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    paused: false,
    save: () => {
      try {
        localStorage.setItem(
          'voyage-settings-v1',
          JSON.stringify({ muted: settings.muted, reduced: settings.reduced })
        );
      } catch {}
    },
    beep: () => {
      if (settings.muted) return;
      try {
        audio ??= new AudioContext();
        void audio.resume();
        const o = audio.createOscillator(),
          g = audio.createGain();
        o.type = 'triangle';
        o.frequency.value = 450;
        g.gain.setValueAtTime(0.025, audio.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.06);
        o.connect(g).connect(audio.destination);
        o.start();
        o.stop(audio.currentTime + 0.06);
      } catch {}
    },
  };
  try {
    const saved = JSON.parse(localStorage.getItem('voyage-settings-v1') || 'null');
    if (saved) {
      settings.muted = saved.muted === true;
      settings.reduced = settings.reduced || saved.reduced === true;
    }
  } catch {}
  let lastAnnouncement = '';
  const reflect = () => {
    host.dataset.phase = state.phase;
    host.dataset.distance = String(Math.round(state.distance));
    host.dataset.trust = String(state.trust);
    host.dataset.estimate = String(state.estimate);
    host.dataset.volleys = String(state.volleys);
    host.dataset.receipts = String(Object.keys(state.slots).length);
    const detail =
      state.phase === 'compass'
        ? ` Estimate ${state.estimate.toFixed(3)} degrees Celsius per decade.`
        : state.phase === 'storm'
        ? ` ${state.volleys * 50} noise slopes. ${
            state.significant ? 'Significant' : 'Not significant'
          } claim.`
        : state.phase === 'court'
        ? ` ${Object.keys(state.slots).length} receipts placed; confidence ${state.confidence}.`
        : ` Trust ${state.trust}.`;
    const message = state.message + detail;
    if (message !== lastAnnouncement) {
      lastAnnouncement = message;
      announce(message);
    }
  };
  const act = (a: Action) => {
    const start = performance.now();
    state = reduce(state, a, c);
    reflect();
    host.dataset.feedbackMs = (performance.now() - start).toFixed(2);
  };
  class Sea extends Phaser.Scene {
    ship!: Phaser.GameObjects.Container;
    hud!: Phaser.GameObjects.Text;
    hint!: Phaser.GameObjects.Text;
    keys!: Record<string, Phaser.Input.Keyboard.Key>;
    target?: Phaser.Math.Vector2;
    bx = 0;
    by = 0;
    x = 0;
    y = 0;
    lastMoveSound = 0;
    fog!: Phaser.GameObjects.Graphics;
    lastFogX = -999;
    lastFogY = -999;
    constructor() {
      super('SeaOfTime');
    }
    preload() {
      this.load.image('world', assets.world);
      if (useImagery) this.load.image('earth', assets.earth);
      this.load.image('piper', assets.piper);
      if (mode.backgroundKey) this.load.image('mode-bg', mode.backgroundKey);
    }
    create() {
      this.target = undefined;
      settings.paused = false;
      this.bx = ((c.bbox.west + c.bbox.east) / 2 + 180) * 8;
      this.by = (90 - (c.bbox.north + c.bbox.south) / 2) * 8;
      this.x = this.bx + 240;
      this.y = this.by + 40;
      this.cameras.main.setBounds(0, 0, 2880, 1440).setBackgroundColor(mode.palette.background);
      if (useImagery)
        this.add
          .image(1440, 720, 'earth')
          .setDisplaySize(2880, 1440)
          .setTint(0x6699aa)
          .setAlpha(0.5)
          .setName('NASA basemap');
      const tint = this.add.image(1440, 720, 'world').setDisplaySize(2880, 1440).setAlpha(0.85);
      this.fog = this.add.graphics().setVisible(false);
      this.fog.fillStyle(0xffffff).fillCircle(this.x, this.y, 155);
      tint.setMask(this.fog.createGeometryMask());
      const grid = this.add.graphics().lineStyle(1, 0x71bcc0, 0.14);
      for (let x = 0; x <= 2880; x += 160) grid.lineBetween(x, 0, x, 1440);
      for (let y = 0; y <= 1440; y += 160) grid.lineBetween(0, y, 2880, y);
      this.add.circle(this.bx, this.by, 25, 0xf6c76a, 0.2).setStrokeStyle(3, 0xffdd80);
      this.add.text(
        this.bx + 35,
        this.by - 10,
        `${mode.title.toUpperCase()}\n[E] / tap beacon`,
        { fontFamily: 'monospace', fontSize: '18px', color: '#ffe0a0' }
      );
      this.add.rectangle(this.bx + 240, this.by + 40, 55, 30, 0x70d5ba).setStrokeStyle(2, 0xffde8a);
      this.add.text(this.bx + 206, this.by + 65, 'FREE PORT', {
        fontFamily: 'monospace',
        fontSize: '14px',
      });
      const body = this.add
        .graphics()
        .fillStyle(0xbb8648)
        .fillPoints(
          [
            { x: -27, y: -8 },
            { x: 27, y: -8 },
            { x: 15, y: 14 },
            { x: -17, y: 14 },
          ],
          true
        )
        .lineStyle(3, 0xffd18b)
        .lineBetween(0, -35, 0, 6)
        .fillStyle(0xe8efcf)
        .fillTriangle(3, -35, 3, -10, 27, -10);
      this.ship = this.add.container(this.x, this.y, [body]);
      this.cameras.main.startFollow(this.ship, true, 0.12, 0.12);
      this.hud = this.add
        .text(24, 18, '', {
          fontFamily: 'monospace',
          fontSize: '21px',
          color: mode.palette.text,
          backgroundColor: '#081827',
          padding: { x: 15, y: 12 },
        })
        .setScrollFactor(0)
        .setDepth(20);
      this.hint = this.add
        .text(140, 625, state.message, {
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#f8e5b4',
          backgroundColor: '#0b2335',
          padding: { x: 16, y: 14 },
          wordWrap: { width: 1050 },
        })
        .setScrollFactor(0)
        .setDepth(20);
      this.add.image(80, 640, 'piper').setDisplaySize(86, 110).setScrollFactor(0).setDepth(20);
      const kb = this.input.keyboard!;
      this.keys = kb.addKeys(
        'UP,DOWN,LEFT,RIGHT,W,A,S,D,E,ENTER,SPACE,N,M,P,R,ESC,B'
      ) as typeof this.keys;
      kb.addCapture(['UP', 'DOWN', 'LEFT', 'RIGHT', 'SPACE']);
      const enter = () => this.enter(),
        mute = () => {
          settings.muted = !settings.muted;
          settings.save();
          this.refresh();
        },
        pause = () => {
          settings.paused = !settings.paused;
          this.refresh();
        },
        motion = () => {
          settings.reduced = !settings.reduced;
          settings.save();
          this.refresh();
        },
        openBridge = () => {
          if (onOpenHub) onOpenHub();
        };
      kb.on('keydown-E', enter);
      kb.on('keydown-ENTER', enter);
      kb.on('keydown-M', mute);
      kb.on('keydown-P', pause);
      kb.on('keydown-R', motion);
      kb.on('keydown-B', openBridge);
      this.events.once('shutdown', () => {
        kb.off('keydown-E', enter);
        kb.off('keydown-ENTER', enter);
        kb.off('keydown-M', mute);
        kb.off('keydown-P', pause);
        kb.off('keydown-R', motion);
        kb.off('keydown-B', openBridge);
      });
      this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
        if (state.phase === 'sea') {
          if (Phaser.Math.Distance.Between(p.worldX, p.worldY, this.bx, this.by) < 45) this.enter();
          else this.target = new Phaser.Math.Vector2(p.worldX, p.worldY);
        }
      });
      this.add
        .text(
          24,
          118,
          `TINT = annual Sen slope, 1986–2025 · °C/decade\nBlue −0.8 ← neutral 0 → orange +0.8 (clipped)\nMode: ${mode.title} · Twist: ${mode.twist}\nLocal official verdict uses Hamed–Rao.`,
          {
            fontFamily: 'monospace',
            fontSize: '15px',
            color: '#c2d9db',
            backgroundColor: '#081827',
            padding: { x: 12, y: 9 },
          }
        )
        .setScrollFactor(0)
        .setDepth(20);
      const control = (x: number, label: string, fn: () => void) => {
        this.add
          .text(x, 585, label, {
            fontFamily: 'monospace',
            fontSize: '15px',
            backgroundColor: '#21465a',
            padding: { x: 10, y: 8 },
          })
          .setScrollFactor(0)
          .setDepth(30)
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', fn);
      };
      control(30, 'E · INTERACT', () => this.enter());
      control(200, 'M · MUTE', mute);
      control(340, 'P · PAUSE', pause);
      control(480, 'R · REDUCED MOTION', motion);
      if (onOpenHub) control(700, 'B · BRIDGE (MODES)', openBridge);
      this.refresh();
      host.focus();
    }
    beep() {
      settings.beep();
    }
    dispatch(a: Action) {
      if (settings.paused) return;
      act(a);
      this.beep();
      this.refresh();
      if (state.phase !== 'sea') this.scene.start(toolSceneKeys[state.phase]);
    }
    enter() {
      this.dispatch({
        type: 'enter',
        near: Phaser.Math.Distance.Between(this.x, this.y, this.bx, this.by) < 90,
      });
    }
    refresh() {
      this.hud.setText(
        `${mode.title.toUpperCase()}   Fuel ${state.fuel.toFixed(0)}   Crew Trust ${
          state.trust
        }   Sailed ${state.distance.toFixed(0)}\n${mode.datasetKeys.join(', ')} · ${
          settings.muted ? 'MUTED' : 'SOUND'
        } · Motion ${settings.reduced ? 'reduced' : 'full'} ${settings.paused ? 'PAUSED' : ''}`
      );
      this.hint.setText(state.message);
      reflect();
    }
    update(time: number, delta: number) {
      if (settings.paused || state.phase !== 'sea') return;
      let dx =
        Number(this.keys.RIGHT.isDown || this.keys.D.isDown) -
        Number(this.keys.LEFT.isDown || this.keys.A.isDown);
      let dy =
        Number(this.keys.DOWN.isDown || this.keys.S.isDown) -
        Number(this.keys.UP.isDown || this.keys.W.isDown);
      if (dx || dy) this.target = undefined;
      else if (this.target) {
        dx = this.target.x - this.x;
        dy = this.target.y - this.y;
        if (Math.hypot(dx, dy) < 5) {
          this.target = undefined;
          return;
        }
      }
      const length = Math.hypot(dx, dy);
      if (!length) return;
      const step = Math.min(delta, 40) * 0.24;
      const ox = this.x,
        oy = this.y;
      this.x = Phaser.Math.Clamp(this.x + (dx / length) * step, 30, 2850);
      this.y = Phaser.Math.Clamp(this.y + (dy / length) * step, 100, 1340);
      this.ship.setPosition(this.x, this.y);
      this.ship.setScale(dx < 0 ? -1 : 1, 1);
      if (Math.hypot(this.x - this.lastFogX, this.y - this.lastFogY) > 25) {
        this.fog.fillStyle(0xffffff).fillCircle(this.x, this.y, 155);
        this.lastFogX = this.x;
        this.lastFogY = this.y;
      }
      act({
        type: 'sail',
        distance: Math.hypot(this.x - ox, this.y - oy),
        atPort:
          Phaser.Math.Distance.Between(this.x, this.y, this.bx + 240, this.by + 40) < 45,
      });
      if (time - this.lastMoveSound > 250) {
        this.beep();
        this.lastMoveSound = time;
      }
      this.refresh();
    }
  }
  const Deck = tools(c, () => state, act, settings, mode);
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: host,
    width: 1280,
    height: 720,
    backgroundColor: mode.palette.background,
    pixelArt: true,
    antialias: false,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [Sea, ...Object.values(toolSceneKeys).map((key) => new Deck(key))],
    audio: { noAudio: true },
    render: { roundPixels: true },
    fps: { target: 60 },
  });
  const visibility = () => {
    if (document.hidden) game.loop.sleep();
    else game.loop.wake();
  };
  document.addEventListener('visibilitychange', visibility);
  return () => {
    document.removeEventListener('visibilitychange', visibility);
    void audio?.close();
    game.destroy(true);
  };
}
