#!/usr/bin/env python3
"""
make-favicon.py — draws the browser-tab icon.

The icon is the curtain iris from the site intro, reduced to its simplest
form: a red circle opening in the dark. It has to stay readable at 16px,
so there is nothing in it but two circles.

Run it only if you change favicon/favicon.svg and want the .ico and the
iPhone home-screen icon to match again:

    python3 tools/make-favicon.py
"""

import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "favicon")

GROUND = (8, 8, 10)            # --black
RED = (166, 28, 0)             # --red-hot
GLOW = (255, 246, 236, 36)     # --glow, barely there


def draw(size):
    image = Image.new("RGB", (size, size), GROUND)
    pen = ImageDraw.Draw(image, "RGBA")
    centre = size / 2
    radius = size * 0.297
    lift = size * 0.094                       # the highlight sits slightly high
    pen.ellipse([centre - radius, centre - radius,
                 centre + radius, centre + radius], fill=RED)
    pen.ellipse([centre - radius, centre - radius - lift,
                 centre + radius, centre + radius - lift], fill=GLOW)
    return image


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    draw(180).save(os.path.join(OUT, "apple-touch-icon.png"))
    draw(256).save(os.path.join(OUT, "favicon.ico"),
                   sizes=[(16, 16), (32, 32), (48, 48)])
    print("wrote favicon/favicon.ico and favicon/apple-touch-icon.png")
