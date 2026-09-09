"""
Gallery Barbers - image pipeline.

Rebuilds assets/img/* from the owner-supplied source photos in the repo root.
Run:  python tools/build-images.py

ONLY the four photos verifiably taken at the shop are processed here.
2.png / 5.png / 6.png / 7.png are deliberately EXCLUDED - they are style-reference
collages (5.png contains celebrity press photography) and we have no licence for them.
"""
from PIL import Image, ImageFilter
import pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "img"
OUT.mkdir(parents=True, exist_ok=True)

LANCZOS = Image.Resampling.LANCZOS


def load(name):
    return Image.open(ROOT / "source-photos" / name).convert("RGB")


def crop_ratio(im, ratio, y_bias=0.5, x_bias=0.5):
    """Centre-crop `im` to the given width/height ratio."""
    w, h = im.size
    if w / h > ratio:                       # too wide -> trim sides
        nw = int(round(h * ratio))
        x = int((w - nw) * x_bias)
        box = (x, 0, x + nw, h)
    else:                                   # too tall -> trim top/bottom
        nh = int(round(w / ratio))
        y = int((h - nh) * y_bias)
        box = (0, y, w, y + nh)
    return im.crop(box)


def emit(im, stem, widths, quality=82, sharpen=True):
    """Write <stem>-<w>.webp for each width. Returns intrinsic size of the largest."""
    made = []
    for w in widths:
        h = max(1, int(round(w * im.height / im.width)))
        r = im.resize((w, h), LANCZOS)
        if sharpen and w > im.width:        # gentle unsharp when upscaling
            r = r.filter(ImageFilter.UnsharpMask(radius=1.1, percent=58, threshold=3))
        p = OUT / f"{stem}-{w}.webp"
        r.save(p, "WEBP", quality=quality, method=6)
        made.append((p.name, w, h, p.stat().st_size))
    return made


jobs = []

# --- Hero / atmosphere: shop interior, wide crop (sits under a heavy dark overlay)
interior = load("1.png")
jobs.append(("hero", crop_ratio(interior, 16 / 9, y_bias=0.42), [960, 1440, 1920]))

# --- Gallery: interior at its natural ratio
jobs.append(("interior", interior, [560, 840]))

# --- About / gallery: the real shopfront in Kirkgate Market
jobs.append(("storefront", load("logo.png"), [560, 900]))

# --- Work shots: 3.png is a 2x2 grid of the shop's own cuts -> split into quadrants
grid = load("3.png")
W, H = grid.size
mx, my, pad = W // 2, H // 2, 8
quads = {
    "work-1": (0, 0, mx - pad, my - pad),
    "work-2": (mx + pad, 0, W, my - pad),
    "work-3": (0, my + pad, mx - pad, H),
    "work-4": (mx + pad, my + pad, W, H),
}
for stem, box in quads.items():
    jobs.append((stem, crop_ratio(grid.crop(box), 4 / 5), [420, 640]))

# --- Colour / long-hair work
jobs.append(("colour-1", crop_ratio(load("4.png"), 4 / 5, y_bias=0.05), [480, 720]))

for stem, im, widths in jobs:
    for name, w, h, size in emit(im, stem, widths):
        print(f"  {name:<22} {w}x{h:<5} {size/1024:6.1f} KB")

# --- Social share card (JPEG: some scrapers still dislike WebP)
og = crop_ratio(interior, 1200 / 630, y_bias=0.42).resize((1200, 630), LANCZOS)
og.save(OUT / "og-image.jpg", "JPEG", quality=80, optimize=True, progressive=True)
print(f"  og-image.jpg           1200x630  {(OUT/'og-image.jpg').stat().st_size/1024:6.1f} KB")

# --- Apple touch icon: charcoal tile, gold monogram is drawn by favicon.svg instead
print("\nDone ->", OUT)
