"""Original decorative seamless orbital sky. No scientific observations are depicted.
Run from repository root after pip install -r api/requirements.txt.
"""
from pathlib import Path
import subprocess
import numpy as np
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parents[1] / 'public' / 'video'
ROOT.mkdir(parents=True, exist_ok=True)
W, H, FPS, SECONDS = 960, 540, 24, 12
ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
y, x = np.mgrid[0:H, 0:W]
base = np.zeros((H, W, 3), np.float32) + [3, 9, 19]
# Teal orbital horizon and distant diffuse starlight, entirely procedural.
glow = np.exp(-(((x-W*.72)/(W*.45))**2+((y-H*.9)/(H*.3))**2))
base += glow[...,None]*np.array([7, 42, 53])
halo = np.exp(-(((x-W*.85)/(W*.3))**2+((y-H*.14)/(H*.38))**2))
base += halo[...,None]*np.array([17, 15, 22])
rng = np.random.default_rng(27)
stars = [(rng.uniform(0,W),rng.uniform(0,H),rng.uniform(.5,1.5),rng.uniform(40,160),rng.uniform(0,2*np.pi)) for _ in range(140)]
movie = ROOT/'orbital-galleon.mp4'
cmd=[ffmpeg,'-y','-f','rawvideo','-vcodec','rawvideo','-s',f'{W}x{H}','-pix_fmt','rgb24','-r',str(FPS),'-i','-','-an','-c:v','libx264','-crf','25','-preset','medium','-pix_fmt','yuv420p','-movflags','+faststart',str(movie)]
process=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.DEVNULL)
for i in range(FPS*SECONDS):
    phase=2*np.pi*i/(FPS*SECONDS)
    frame=base.copy()
    for sx,sy,size,light,offset in stars:
        # Periodic drift closes exactly at the loop boundary.
        px=int(sx+8*np.sin(phase+offset))%W;py=int(sy+3*np.cos(phase+offset))%H
        brightness=light*(.8+.2*np.sin(phase+offset))
        frame[max(0,py-1):min(H,py+2),max(0,px-1):min(W,px+2)]+=brightness*.18
        frame[py,px]+=brightness
    # One soft distant meteor per loop; zero brightness at each endpoint.
    t=i/(FPS*SECONDS)
    strength=max(0,1-abs(t-.54)/.06)
    if strength:
        mx=int(W*(.25+(t-.48)*2));my=int(H*(.12+(t-.48)*1.2))
        for k in range(40):
            xx=mx-k;yy=my-k//2
            if 0<=xx<W and 0<=yy<H:frame[yy,xx]+=np.array([110,155,160])*strength*(1-k/40)
    process.stdin.write(np.clip(frame,0,255).astype(np.uint8).tobytes())
process.stdin.close()
if process.wait()!=0:raise RuntimeError('Video encoding failed')
subprocess.run([ffmpeg,'-y','-i',str(movie),'-frames:v','1','-q:v','2',str(ROOT/'orbital-galleon-poster.jpg')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
print(f'Created {movie.name}: {movie.stat().st_size:,} bytes; {W}x{H}, {FPS} fps, {SECONDS}s, silent H.264. Original decorative art, not NASA imagery.')
