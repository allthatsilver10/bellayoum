#!/usr/bin/env python3
"""
build-gallery.py — reads the photo folders and rewrites gallery-data.json
==============================================================================

Bella never has to run this. She drops photos into a folder and says
"Archive 폴더 다시 읽어" / "새 프로젝트 추가", and Claude runs it.

WHAT IT DOES
  1. Walks  archive/pottery, archive/photography, archive/boxing
     and     projects/<folder>/
  2. Reads each image's real pixel size (so the page can lay the gallery
     out with no loading jump and no cropping).
  3. Writes gallery-data.json  — the file the website reads.
     Writes gallery-data.js    — the identical data as a <script> file, so
                                 the site also works when you just
                                 double-click index.html (see note below).

WHY TWO FILES
  Chrome refuses to fetch() a .json file from your own hard drive (file://).
  It works fine once the site is on GitHub Pages. So the page tries the
  .json first and quietly falls back to the .js copy when opened locally.
  Both are written here from the same data — they can never disagree.

FILE NAMING
  Put the date at the front of a photo's filename and the site sorts it
  newest-first and captions it automatically:

      2025-10-04_hangang.jpg   ->   "2025 · Hangang"

  A plain name like IMG_4821.jpg also works — it just sorts alphabetically
  and gets no caption.

ANYTHING WRITTEN BY HAND IS KEPT
  Project titles, directors, roles, hand-written captions and "feature"
  flags already in gallery-data.json are preserved. Only the photo lists
  and image sizes are regenerated.
"""

import json, os, re, sys
from datetime import datetime, timezone

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required:  python3 -m pip install --user Pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(ROOT, "gallery-data.json")
JS_PATH   = os.path.join(ROOT, "gallery-data.js")

IMAGE_TYPES = (".jpg", ".jpeg", ".png", ".webp", ".avif")

# the three archive rooms, in the order they appear on the Archive page
ARCHIVE_ROOMS = [
    ("pottery",     "Pottery",     "도예",   "images/archive-pottery.jpg"),
    ("photography", "Photography", "사진",   "images/archive-photography.jpg"),
    ("boxing",      "Boxing",      "복싱",   "images/archive-boxing.jpg"),
]

DATED = re.compile(r"^(\d{4})-(\d{2})(?:-(\d{2}))?[_-]?(.*)$")


def list_images(folder, newest_first=True):
    """
    Every image in a folder, in filename order.

    Archive rooms run newest-first — the latest work should greet you.
    A production's own photographs run forward, in the order they are
    numbered, because that is the order they are meant to be looked at.
    """
    path = os.path.join(ROOT, folder)
    if not os.path.isdir(path):
        return []
    names = [n for n in os.listdir(path)
             if n.lower().endswith(IMAGE_TYPES) and not n.startswith(".")]
    return sorted(names, reverse=newest_first)


def caption_from(name):
    """2025-10-04_hangang.jpg -> '2025 · Hangang'. Undated files get ''."""
    stem = os.path.splitext(name)[0]
    m = DATED.match(stem)
    if not m:
        return ""
    year, _, _, rest = m.groups()
    words = re.sub(r"[-_]+", " ", rest).strip()
    return f"{year} · {words.title()}" if words else year


def measure(rel_path):
    """Real pixel size, so the layout can be built before images load."""
    try:
        with Image.open(os.path.join(ROOT, rel_path)) as im:
            return im.width, im.height
    except Exception as err:
        print(f"  ! could not read {rel_path}: {err}")
        return 1600, 1067


def photo_entry(rel_path, name, previous):
    """One image. Keeps any caption/feature flag already written by hand."""
    w, h = measure(rel_path)
    entry = {"src": rel_path, "w": w, "h": h, "caption": caption_from(name)}
    old = previous.get(rel_path)
    if old:
        if old.get("caption_manual"):
            entry["caption"] = old["caption"]
            entry["caption_manual"] = True
        if old.get("feature"):
            entry["feature"] = True            # gets a full-width row
    return entry


def index_previous(data):
    """Flatten the last run so hand-written details survive."""
    seen = {}
    for room in data.get("archive", {}).values():
        for item in room.get("items", []):
            seen[item["src"]] = item
    return seen


def title_from_slug(slug):
    """2025-11-stupid-fucking-bird -> 'Stupid Fucking Bird'"""
    stripped = re.sub(r"^\d{4}(-\d{2})?[-_]", "", slug)
    return re.sub(r"[-_]+", " ", stripped).strip().title()


def build():
    previous = {}
    old_projects = {}
    if os.path.exists(JSON_PATH):
        with open(JSON_PATH, encoding="utf-8") as f:
            old = json.load(f)
        previous = index_previous(old)
        old_projects = {p["slug"]: p for p in old.get("projects", [])}

    # ── archive rooms ────────────────────────────────────────────────
    archive = {}
    for key, name_en, name_kr, cover in ARCHIVE_ROOMS:
        folder = f"archive/{key}"
        names = list_images(folder)
        archive[key] = {
            "title": name_en,
            "title_kr": name_kr,
            "cover": cover,
            "count": len(names),
            "items": [photo_entry(f"{folder}/{n}", n, previous) for n in names],
        }
        print(f"  archive/{key:<12} {len(names)} photos")

    # ── productions ──────────────────────────────────────────────────
    projects_dir = os.path.join(ROOT, "projects")
    slugs = sorted(
        (d for d in os.listdir(projects_dir)
         if os.path.isdir(os.path.join(projects_dir, d)) and not d.startswith(".")),
        reverse=True,                                   # newest production first
    ) if os.path.isdir(projects_dir) else []

    projects = []
    for slug in slugs:
        names = list_images(f"projects/{slug}", newest_first=False)
        kept = old_projects.get(slug, {})
        projects.append({
            "slug":     slug,
            "title":    kept.get("title")    or title_from_slug(slug),
            "date":     kept.get("date")     or "",
            "director": kept.get("director") or "",
            "venue":    kept.get("venue")    or "",
            "role":     kept.get("role")     or "",
            "photos":   [{"src": f"projects/{slug}/{n}", **dict(zip(("w", "h"), measure(f"projects/{slug}/{n}")))}
                         for n in names],
        })
        print(f"  projects/{slug:<34} {len(names)} photos")

    data = {
        "generated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "projects": projects,
        "archive": archive,
    }

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")

    with open(JS_PATH, "w", encoding="utf-8") as f:
        f.write("/* Generated by tools/build-gallery.py — do not edit by hand.\n"
                "   Identical to gallery-data.json; exists so the site also works\n"
                "   when index.html is opened directly from the hard drive. */\n")
        f.write("window.GALLERY_DATA = ")
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write(";\n")

    print(f"\n  wrote gallery-data.json and gallery-data.js")


if __name__ == "__main__":
    print("reading photo folders…")
    build()
