"""Puts the generated summary at the top of a PR description.

Usage: python3 pr-summary-body.py <summary-file> <current-body-file> <output-file>

The summary is wrapped in marker comments, so running it again replaces the
previous summary instead of adding a second one. The rest of the description
(for example the PR template checklist) is kept unchanged below it.
"""

import re
import sys
from pathlib import Path

START = "<!-- copilot-pr-summary:start -->"
END = "<!-- copilot-pr-summary:end -->"


def build_body(summary: str, body: str) -> str:
    body = re.sub(re.escape(START) + r".*?" + re.escape(END) + r"\s*", "", body, flags=re.S)
    block = (
        f"{START}\n"
        "## 🤖 Copilot summary\n\n"
        f"{summary.strip()}\n\n"
        "_Generated automatically by Copilot from the diff. Review it before merging._\n"
        f"{END}\n\n"
    )
    return block + body.lstrip()


def main() -> None:
    summary_file, body_file, out_file = sys.argv[1:4]
    summary = Path(summary_file).read_text(encoding="utf-8")
    if not summary.strip():
        sys.exit("Copilot returned an empty summary")
    body = Path(body_file).read_text(encoding="utf-8")
    Path(out_file).write_text(build_body(summary, body), encoding="utf-8")


if __name__ == "__main__":
    main()
