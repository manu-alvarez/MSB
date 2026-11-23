#!/usr/bin/env python3
"""Check local assets referenced by static HTML, without fetching remote URLs."""
from __future__ import annotations

import argparse
import html.parser
import pathlib
import sys
import urllib.parse


class AssetParser(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.assets: list[tuple[str, str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = dict(attrs)
        for attr in ("src", "href", "poster", "data-src"):
            if not data.get(attr):
                continue
            if attr == "href" and tag not in ("link", "a"):
                continue
            self.assets.append((tag, attr, data[attr] or ""))


def check(repo: pathlib.Path, web_dir: pathlib.Path) -> int:
    html_files = sorted(web_dir.rglob("*.html"))
    if not html_files:
        print("ERROR: no HTML files", file=sys.stderr)
        return 1

    missing: list[str] = []
    referenced = 0
    for html in html_files:
        parser = AssetParser()
        parser.feed(html.read_text(encoding="utf-8", errors="replace"))
        for tag, attr, value in parser.assets:
            url = value.strip()
            if not url or url.startswith(("#", "//", "data:", "javascript:", "mailto:", "tel:")):
                continue
            if ("{" in url or "}" in url or "${" in url or "<%" in url):
                continue  # Runtime-generated reference; requires browser acceptance.
            parsed = urllib.parse.urlsplit(url)
            if parsed.scheme or parsed.netloc:
                continue  # External; not an offline integrity assertion.
            p = urllib.parse.unquote(parsed.path)
            if not p or p.startswith("/"):
                continue  # Root-relative path; hosting base is deployment-specific.
            candidate = (html.parent / p).resolve()
            referenced += 1
            if not candidate.is_relative_to(repo.resolve()) or not candidate.exists():
                missing.append(f"{html.relative_to(repo)}: <{tag} {attr}={url!r}>")

    print(f"HTML pages: {len(html_files)}, local references checked: {referenced}")
    if missing:
        print("Missing local assets (max 40):", file=sys.stderr)
        for item in missing[:40]:
            print(" -", item, file=sys.stderr)
        return 1
    print("PASS: all checked HTML-relative assets exist")
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("repo", type=pathlib.Path)
    parser.add_argument("web_dir", type=pathlib.Path)
    args = parser.parse_args()
    sys.exit(check(args.repo.resolve(), (args.repo / args.web_dir).resolve()))
