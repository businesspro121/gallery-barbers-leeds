# Source photos

The originals every image on the site is built from. After adding or replacing
anything here, run from the repo root:

```bash
python tools/build-images.py
```

| File | What it is | Used for |
|------|------------|----------|
| `logo.png` | The shopfront at Kirkgate Market | About section, gallery, share card reference |
| `1.png` | Shop interior, barbers working | Hero backdrop, gallery, social share card |
| `2.png` | Quiff with a high skin fade | Gallery — Haircuts |
| `3.png` | 2x2 sheet of the shop's own cuts | Split into four gallery tiles |
| `4.png` | Ombre colour and curls | Gallery — Ladies' & Colour |
| `5.png` | Six short women's styles | Split into six gallery tiles |
| `6.png` | Four textured / afro-hair cuts | Split into four gallery tiles |
| `7.png` | Nine undercut and nape designs | Split into six gallery tiles |
| `8.png` | Straight-razor shave | Reviews feature band, gallery — Beards |
| `9.png` | Copper colour with a sliced fringe | Gallery — Ladies' & Colour |

The contact sheets are split into individual tiles by `tools/build-images.py`,
which holds the crop boxes. Adjust them there if a crop needs nudging.

## Rights

`logo.png`, `1.png`, `3.png` and `4.png` are demonstrably the shop's own work —
the same white brick wall runs through them.

The rest are style-reference and portfolio shots on backgrounds that do not
match the shop, so they were most likely collected from elsewhere. `5.png` in
particular is built from celebrity press photographs. That is fine while the
client is reviewing the sample, but before the site is published publicly these
should either be confirmed as owned or replaced with the shop's own photographs.

Any photograph showing a recognisable customer needs that customer's permission.
