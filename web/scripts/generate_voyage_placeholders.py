"""Generates crisp 16-bit pixel-art styled placeholders for Voyage modes."""
import zlib
import struct
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parents[1] / "public/voyage-art"
OUT_DIR.mkdir(parents=True, exist_ok=True)

def write_png(filename, width, height, get_rgb):
    raw = bytearray()
    for y in range(height):
        raw.append(0)
        for x in range(width):
            r, g, b = get_rgb(x, y)
            raw.extend((r, g, b))
    compressed = zlib.compress(bytes(raw), 6)
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0))
    png += chunk(b'IDAT', compressed)
    png += chunk(b'IEND', b'')
    with open(filename, 'wb') as f:
        f.write(png)

MODES = {
    'heat': {
        'top': (180, 50, 30),
        'mid': (235, 140, 45),
        'sea': (10, 45, 65),
        'accent': (255, 215, 115)
    },
    'rain': {
        'top': (20, 30, 50),
        'mid': (45, 75, 110),
        'sea': (15, 25, 45),
        'accent': (180, 210, 240)
    },
    'ocean': {
        'top': (5, 25, 40),
        'mid': (12, 50, 75),
        'sea': (4, 18, 30),
        'accent': (90, 220, 200)
    },
    'green': {
        'top': (15, 40, 25),
        'mid': (35, 95, 55),
        'sea': (10, 28, 18),
        'accent': (220, 195, 75)
    },
    'sky': {
        'top': (40, 20, 55),
        'mid': (90, 55, 120),
        'sea': (25, 15, 38),
        'accent': (215, 175, 245)
    },
    'tide': {
        'top': (190, 210, 230),
        'mid': (110, 155, 195),
        'sea': (25, 60, 95),
        'accent': (250, 250, 255)
    },
    'lab': {
        'top': (20, 28, 38),
        'mid': (45, 60, 80),
        'sea': (12, 18, 26),
        'accent': (100, 210, 225)
    }
}

for mode_id, colors in MODES.items():
    # 512x512 card
    def make_card(x, y, c=colors):
        # Pixel block size 8
        bx, by = x // 8, y // 8
        # Horizon at by = 36 (y = 288)
        if by < 36:
            # Sky
            factor = by / 36.0
            r = int(c['top'][0] * (1 - factor) + c['mid'][0] * factor)
            g = int(c['top'][1] * (1 - factor) + c['mid'][1] * factor)
            b = int(c['top'][2] * (1 - factor) + c['mid'][2] * factor)
            # Add sun or moon in center sky
            dist = (bx - 32)**2 + (by - 18)**2
            if dist < 64:
                return c['accent']
            # Pixel grid pattern
            if (bx + by) % 12 == 0:
                r, g, b = min(255, r + 15), min(255, g + 15), min(255, b + 15)
            return (r, g, b)
        else:
            # Sea / Ground
            factor = (by - 36) / 28.0
            r = int(c['sea'][0] * (1 - factor) + c['top'][0] * 0.2 * factor)
            g = int(c['sea'][1] * (1 - factor) + c['top'][1] * 0.2 * factor)
            b = int(c['sea'][2] * (1 - factor) + c['top'][2] * 0.2 * factor)
            if (bx + by) % 8 == 0:
                return c['accent']
            return (r, g, b)

    card_file = OUT_DIR / f"card-{mode_id}.png"
    write_png(card_file, 512, 512, make_card)

    # 1280x720 background
    def make_bg(x, y, c=colors):
        bx, by = x // 16, y // 16
        if by < 26:
            factor = by / 26.0
            r = int(c['top'][0] * (1 - factor) + c['mid'][0] * factor)
            g = int(c['top'][1] * (1 - factor) + c['mid'][1] * factor)
            b = int(c['top'][2] * (1 - factor) + c['mid'][2] * factor)
            if (bx + by) % 16 == 0:
                r, g, b = min(255, r + 10), min(255, g + 10), min(255, b + 10)
            return (r, g, b)
        else:
            factor = (by - 26) / 19.0
            r = int(c['sea'][0] * (1 - factor) + c['top'][0] * 0.2 * factor)
            g = int(c['sea'][1] * (1 - factor) + c['top'][1] * 0.2 * factor)
            b = int(c['sea'][2] * (1 - factor) + c['top'][2] * 0.2 * factor)
            if (bx * 3 + by) % 15 == 0:
                return (min(255, r + 20), min(255, g + 20), min(255, b + 20))
            return (r, g, b)

    bg_file = OUT_DIR / f"bg-{mode_id}.png"
    write_png(bg_file, 1280, 720, make_bg)

print("Generated all cards and backgrounds.")
