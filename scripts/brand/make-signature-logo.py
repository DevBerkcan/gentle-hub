"""
Renders the Gentle Group e-mail signature logo: the website's wordmark
("Gentle Group Studios", Clash Display Semibold, white on #010A30) with the
lime brand accent (#D7FF3F).

Outputs (2x resolution, shown at 180 x 48 px in mails):
  gentle-group-logo.png   static, anti-aliased, transparent corners
  gentle-group-logo.gif   plays once (~2.4 s); first and last frame are the
                          complete logo, so clients that do not animate
                          (Outlook desktop) still show the full mark.

Usage: python make-signature-logo.py <ClashDisplay-Semibold.ttf> <out-dir>
The font comes from Fontshare (ITF Free Font License); it is not committed.
"""

import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SCALE = 2
W, H = 180 * SCALE, 48 * SCALE
RADIUS = 8 * SCALE
NAVY = (1, 10, 48)
WHITE = (240, 239, 244)
LIME = (215, 255, 63)
TEXT = "Gentle Group Studios"


def ease(t: float) -> float:
    return 0.5 - 0.5 * math.cos(math.pi * max(0.0, min(1.0, t)))


def layout(font_path: str):
    size = 40
    while True:
        font = ImageFont.truetype(font_path, size)
        left, top, right, bottom = font.getbbox(TEXT)
        if right - left <= W - 2 * 18 * SCALE / 2 - 24 or size <= 20:
            return font, (left, top, right, bottom)
        size -= 1


def frame(font, box, bar_len: float, shine_x: float | None) -> Image.Image:
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, W - 1, H - 1), RADIUS, fill=255)
    badge = Image.new("RGBA", (W, H), NAVY + (255,))

    draw = ImageDraw.Draw(badge)
    left, top, right, bottom = box
    text_w, text_h = right - left, bottom - top
    x = (W - text_w) // 2 - left
    y = (H - text_h) // 2 - top - 4
    draw.text((x, y), TEXT, font=font, fill=WHITE)

    # Lime accent bar under the start of the wordmark: the "yellow brand element".
    bar_y = y + bottom + 7
    draw.rounded_rectangle((x + left, bar_y, x + left + int(bar_len), bar_y + 5), 3, fill=LIME)

    if shine_x is not None:
        # Soft lime light passing over the badge; very low opacity.
        shine = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        sd = ImageDraw.Draw(shine)
        for i in range(-40, 41):
            alpha = int(34 * (1 - abs(i) / 40) ** 2)
            cx = shine_x + i
            sd.line([(cx + 30, 0), (cx - 30, H)], fill=LIME + (alpha,), width=1)
        badge = Image.alpha_composite(badge, shine)

    img.paste(badge, (0, 0), mask)
    return img


def main() -> None:
    font_path, out_dir = sys.argv[1], Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)
    font, box = layout(font_path)
    base_bar = 22 * SCALE
    long_bar = 46 * SCALE

    rest = frame(font, box, base_bar, None)
    rest.save(out_dir / "gentle-group-logo.png", optimize=True)

    frames, durations = [rest], [450]
    steps = 18
    for i in range(1, steps):
        t = i / steps
        bar = base_bar + (long_bar - base_bar) * math.sin(math.pi * ease(t))
        shine = -60 + (W + 120) * ease(t)
        frames.append(frame(font, box, bar, shine))
        durations.append(80)
    frames.append(rest)
    durations.append(500)

    # One shared palette keeps frames consistent and the file small.
    palette_src = Image.new("RGB", (W, H * 3))
    palette_src.paste(rest.convert("RGB"), (0, 0))
    palette_src.paste(frames[steps // 2].convert("RGB"), (0, H))
    palette_src.paste(frames[steps // 3].convert("RGB"), (0, 2 * H))
    palette = palette_src.quantize(colors=63, method=Image.Quantize.MEDIANCUT)

    gif_frames = []
    for f in frames:
        p = f.convert("RGB").quantize(palette=palette, dither=Image.Dither.NONE)
        # Index 63 = transparent (the rounded corners).
        p.putpalette(palette.getpalette()[: 63 * 3] + [255, 255, 255])
        alpha = f.getchannel("A")
        p.paste(63, mask=alpha.point(lambda a: 255 if a < 128 else 0))
        gif_frames.append(p)

    # No loop extension: the animation plays once and stays on the last frame.
    gif_frames[0].save(
        out_dir / "gentle-group-logo.gif",
        save_all=True,
        append_images=gif_frames[1:],
        duration=durations,
        transparency=63,
        disposal=1,
        optimize=False,
    )

    for name in ("gentle-group-logo.png", "gentle-group-logo.gif"):
        print(name, (out_dir / name).stat().st_size, "bytes")


if __name__ == "__main__":
    main()
