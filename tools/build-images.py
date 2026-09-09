"""
Gallery Barbers - image pipeline.

Rebuilds assets/img/* from the supplied photos in source-photos/.
Run:  python tools/build-images.py     (needs Pillow)

Several of the sources are contact sheets - a single file holding four, six or
nine separate shots. Those are split into individual tiles here so the gallery
shows one piece of work per frame instead of a collage.
"""
from PIL import Image, ImageFilter
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "source-photos"
OUT = ROOT / "assets" / "img"
OUT.mkdir(parents=True, exist_ok=True)

LANCZOS = Image.Resampling.LANCZOS
PORTRAIT = 4 / 5          # every gallery tile lands on this ratio


def load(name):
    return Image.open(SRC / name).convert("RGB")


def crop_ratio(im, ratio, y_bias=0.5, x_bias=0.5):
    """Centre-crop `im` to the given width/height ratio."""
    w, h = im.size
    if w / h > ratio:
        nw = int(round(h * ratio))
        x = int((w - nw) * x_bias)
        box = (x, 0, x + nw, h)
    else:
        nh = int(round(w / ratio))
        y = int((h - nh) * y_bias)
        box = (0, y, w, y + nh)
    return im.crop(box)


def emit(im, stem, widths, quality=82):
    made = []
    for w in widths:
        h = max(1, int(round(w * im.height / im.width)))
        r = im.resize((w, h), LANCZOS)
        if w > im.width:
            r = r.filter(ImageFilter.UnsharpMask(radius=1.1, percent=58, threshold=3))
        p = OUT / f"{stem}-{w}.webp"
        r.save(p, "WEBP", quality=quality, method=6)
        made.append((p.name, w, h, p.stat().st_size))
    return made


jobs = []

# ── Hero / atmosphere ─────────────────────────────────────────────────────────
# The shop interior, wide. Sits under a heavy scrim as the hero's instant-paint
# poster, behind the woven-cloth canvas.
interior = load("1.png")
jobs.append(("hero", crop_ratio(interior, 16 / 9, y_bias=0.42), [960, 1440, 1920]))
jobs.append(("interior", interior, [560, 840]))

# ── The shopfront ─────────────────────────────────────────────────────────────
jobs.append(("storefront", load("logo.png"), [560, 900]))

# ── Feature band: the straight-razor shave ────────────────────────────────────
shave = load("8.png")
jobs.append(("shave-wide", crop_ratio(shave, 3 / 2, y_bias=0.42), [720, 1200]))
jobs.append(("shave", crop_ratio(shave, PORTRAIT, x_bias=0.58), [480, 720]))

# ── Single portraits ──────────────────────────────────────────────────────────
jobs.append(("colour-1", crop_ratio(load("4.png"), PORTRAIT, y_bias=0.05), [480, 720]))
jobs.append(("colour-2", crop_ratio(load("9.png"), PORTRAIT, y_bias=0.10), [480, 720]))
jobs.append(("cut-1", crop_ratio(load("2.png"), PORTRAIT, y_bias=0.20), [480, 720]))


def sheet(name, boxes, prefix):
    """Split a contact sheet into individually cropped tiles."""
    im = load(name)
    for key, box in boxes.items():
        jobs.append((f"{prefix}-{key}", crop_ratio(im.crop(box), PORTRAIT), [420, 640]))


# 3.png - 2x2 of the shop's own cuts
sheet("3.png", {
    1: (0, 0, 411, 412),
    2: (427, 0, 838, 412),
    3: (0, 428, 411, 840),
    4: (427, 428, 838, 840),
}, "work")

# 5.png - six women's short-hair styles
sheet("5.png", {
    1: (4, 4, 272, 268),
    2: (281, 4, 552, 268),
    3: (560, 4, 831, 268),
    4: (4, 286, 556, 849),
    5: (564, 286, 831, 564),
    6: (564, 572, 831, 849),
}, "short")

# 6.png - four textured / afro-hair cuts
sheet("6.png", {
    1: (4, 4, 268, 277),
    2: (4, 287, 268, 562),
    3: (4, 572, 268, 851),
    4: (284, 4, 845, 851),
}, "texture")

# 7.png - undercut and nape designs
sheet("7.png", {
    1: (4, 4, 250, 247),
    2: (258, 4, 505, 247),
    3: (513, 4, 761, 247),
    4: (462, 258, 761, 505),
    5: (4, 516, 250, 759),
    6: (258, 516, 505, 759),
}, "design")

total = 0
for stem, im, widths in jobs:
    for name, w, h, size in emit(im, stem, widths):
        total += size
        print(f"  {name:<22} {w}x{h:<5} {size/1024:6.1f} KB")

# ── Social share card ─────────────────────────────────────────────────────────
og = crop_ratio(interior, 1200 / 630, y_bias=0.42).resize((1200, 630), LANCZOS)
og.save(OUT / "og-image.jpg", "JPEG", quality=80, optimize=True, progressive=True)
print(f"  og-image.jpg           1200x630  {(OUT/'og-image.jpg').stat().st_size/1024:6.1f} KB")

print(f"\n{len(jobs)} sources -> {sum(len(w) for _,_,w in jobs)} files, {total/1024/1024:.2f} MB total")
print("Done ->", OUT)
