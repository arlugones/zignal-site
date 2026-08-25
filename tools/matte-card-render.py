"""Re-mattes a product-card render for use in both themes.

The card renders (assets/card-*.webp) are 3D glow objects shot on a near-black
backdrop. A straight opacity/filter trick on that flat backdrop is what used to wash
the images out in light theme (see CLAUDE.md). This script instead keys the backdrop
out to real alpha and un-premultiplies the recovered color, so the same file renders
correctly on both a dark and a light card face with no per-theme CSS filter.

Technique: for a glow/light element composited over pure black, alpha ~= max(R,G,B)
per pixel (the "screen matte" identity: displayed = true_color * alpha_fraction when
background is black). Dividing the displayed color by that derived alpha_fraction
recovers the saturated true color, which is what makes the result look vivid instead
of pastel/washed once it's placed over a light background.

Usage:
    python tools/matte-card-render.py <in.webp> <out.webp> [floor] [quality] [max_w]

floor:   0-255 brightness cutoff below which a pixel becomes fully transparent.
         Also determines the crop bounding box, so raising it trims dim halos/floor
         reflections that would otherwise survive as a visible band. Per-image, tuned
         by eye against both a light and a dark composite - there is no single correct
         value across images with different backdrop brightness. Values used for the
         current assets: card-whatsapp 90, card-automation 90, card-dashboards 90,
         card-omnichannel 170 (wide thin threads reach further into the dim range),
         card-analytics 165 (brighter ambient backdrop than the others).
quality: lossy WebP quality for the RGBA output (alpha included). 65-82 used above;
         card-omnichannel needed the lower end to stay a reasonable file size given
         how much of its frame the threads cover.
max_w:   downscale cap in px after cropping to content. The cards render well under
         900px wide at typical card sizes; there is no reason to ship the source's
         full 1100px width once the transparent margin is cropped away.

Re-run this whenever a new render is added to assets/, tuning floor per image by
checking both theme composites (see CLAUDE.md's Hero & product imagery note) before
committing the result.
"""
import sys
from PIL import Image
import numpy as np


def matte(path_in, path_out, floor=90, quality=80, max_w=800, pad_frac=0.08):
    img = Image.open(path_in).convert('RGB')
    arr = np.asarray(img).astype(np.float32)

    alpha = arr.max(axis=2)
    alpha = np.where(alpha < floor, 0, alpha)

    safe_alpha = np.where(alpha <= 0, 1, alpha)
    unpre = np.clip(arr * (255.0 / safe_alpha[..., None]), 0, 255)
    unpre = np.where(alpha[..., None] <= 0, 0, unpre)

    rgba = Image.fromarray(np.dstack([unpre, alpha]).astype(np.uint8), 'RGBA')

    bbox = rgba.getbbox()
    if bbox:
        l, t, r, b = bbox
        w, h = rgba.size
        pad_x = int((r - l) * pad_frac)
        pad_y = int((b - t) * pad_frac)
        l, t = max(0, l - pad_x), max(0, t - pad_y)
        r, b = min(w, r + pad_x), min(h, b + pad_y)
        rgba = rgba.crop((l, t, r, b))

    if rgba.width > max_w:
        new_h = round(rgba.height * (max_w / rgba.width))
        rgba = rgba.resize((max_w, new_h), Image.LANCZOS)

    rgba.save(path_out, quality=quality, method=6)
    return rgba.size


if __name__ == '__main__':
    size = matte(
        sys.argv[1], sys.argv[2],
        floor=int(sys.argv[3]) if len(sys.argv) > 3 else 90,
        quality=int(sys.argv[4]) if len(sys.argv) > 4 else 80,
        max_w=int(sys.argv[5]) if len(sys.argv) > 5 else 800,
    )
    print(f'wrote {sys.argv[2]} at {size[0]}x{size[1]}')
