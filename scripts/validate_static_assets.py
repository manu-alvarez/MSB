#!/usr/bin/env python3
"""Check local asset references for a published static HTML entry point.

This is a deterministic packaging check; it does not claim that dynamic JS
behavior, remote API calls or browser rendering are functioning.
"""
import argparse
import html.parser
import pathlib
from urllib.parse import unquote, urlsplit


class AssetReferences(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.assets = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in {"script", "img", "audio", "video", "source", "iframe"}:
            if attrs.get("src"):
                self.assets.append(attrs["src"])
        if tag == "video" and attrs.get("poster"):
            self.assets.append(attrs["poster"])
        if tag == "link" and attrs.get("href"):
            rel = attrs.get("rel", "").lower().split()
            if any(r in {"stylesheet", "icon", "manifest", "modulepreload", "preload"} for r in rel):
                self.assets.append(attrs["href"])


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("repository")
    parser.add_argument("entry")
    args = parser.parse_args()
    root = pathlib.Path(args.repository).resolve()
    page = (root / args.entry).resolve()
    if not page.is_file() or not page.is_relative_to(root):
        parser.error(f"Missing or invalid HTML entry: {args.entry}")
    content = page.read_text(encoding="utf-8")
    if "<html" not in content.lower():
        parser.error(f"Invalid HTML entry: {args.entry}")
    refs = AssetReferences()
    refs.feed(content)
    missing = []
    checked = 0
    for ref in refs.assets:
        url = ref.strip()
        if not url or url.startswith(("#", "//", "data:", "blob:", "javascript:")):
            continue
        parsed = urlsplit(url)
        if parsed.scheme or parsed.netloc or not parsed.path:
            continue
        path = unquote(parsed.path)
        local = (root / path.lstrip("/")) if path.startswith("/") else (page.parent / path)
        local = local.resolve()
        checked += 1
        if not local.is_relative_to(root) or not local.is_file():
            missing.append(ref)
    print(f"ENTRY={args.entry} ASSET_LINKS={checked} MISSING={len(missing)}")
    for url in missing:
        print(f"MISSING: {url}")
    if missing:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
