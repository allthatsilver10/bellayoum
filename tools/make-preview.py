#!/usr/bin/env python3
"""
make-preview.py — packs the whole website into one file you can send

The real site is a folder: index.html plus style.css, script.js and the
photo folders. Sending index.html on its own gives someone a broken page.

This makes site-preview.html, a single file with the stylesheet, the
script, the photo data and every photograph embedded inside it. Someone
can double-click it, or it can be published as a link. No server, no
internet, nothing else to send.

    python3 tools/make-preview.py

It is only for sharing. The real site stays the normal folder.
"""

import base64
import mimetypes
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "site-preview.html")

_cache = {}


def data_uri(rel_path):
    """Turn a file on disk into a data: URI, reading each file only once."""
    rel_path = rel_path.split("?")[0]
    if rel_path in _cache:
        return _cache[rel_path]

    full = os.path.join(ROOT, rel_path)
    if not os.path.isfile(full):
        print("  ! missing:", rel_path)
        _cache[rel_path] = rel_path
        return rel_path

    mime = mimetypes.guess_type(full)[0] or "application/octet-stream"
    with open(full, "rb") as f:
        encoded = base64.b64encode(f.read()).decode()

    uri = "data:%s;base64,%s" % (mime, encoded)
    _cache[rel_path] = uri
    return uri


def inline_sources(text):
    """Replace every src="images/..." style reference with the file itself."""
    pattern = r'(src=")((?:images|archive|projects|favicon)/[^"]+)(")'
    return re.sub(pattern, lambda m: m.group(1) + data_uri(m.group(2)) + m.group(3), text)


def inline_json_paths(text):
    """The photo data holds paths too — swap those for the files as well."""
    pattern = r'("src":\s*")((?:images|archive|projects)/[^"]+)(")'
    return re.sub(pattern, lambda m: m.group(1) + data_uri(m.group(2)) + m.group(3), text)


def read(name):
    with open(os.path.join(ROOT, name), encoding="utf-8") as f:
        return f.read()


def build():
    html = read("index.html")
    css = read("style.css")
    js = read("script.js")
    data = read("gallery-data.js")

    title = re.search(r"<title>(.*?)</title>", html, re.S).group(1).strip()
    body = re.search(r"<body>(.*?)</body>", html, re.S).group(1)

    # drop the two <script src> tags — both files are embedded below instead
    body = re.sub(r'<script src="[^"]*"></script>', "", body)

    body = inline_sources(body)
    data = inline_json_paths(data)
    css = inline_sources(css)

    # the favicon is an SVG file; embed it so the tab icon survives too
    icon = data_uri("favicon/favicon.svg")

    parts = [
        "<title>%s</title>" % title,
        '<link rel="icon" href="%s" type="image/svg+xml">' % icon,
        "<style>\n%s\n</style>" % css,
        body.strip(),
        "<script>\n%s\n</script>" % data,
        "<script>\n%s\n</script>" % js,
    ]

    with open(OUT, "w", encoding="utf-8") as f:
        f.write("\n\n".join(parts) + "\n")

    size = os.path.getsize(OUT) / 1024 / 1024
    print("\n  wrote site-preview.html  (%.1f MB, %d files embedded)" % (size, len(_cache)))


if __name__ == "__main__":
    print("packing the site into one file…")
    build()
