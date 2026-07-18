#!/usr/bin/env python3
"""Fill in missing i18n translations using the Claude API.

Sources: skill.md and missions/*/mission.md. Targets: i18n/{zh,ja,ko}/.
Only files that don't exist yet are translated — committed translations
always win, so human (or agent) review sticks.

Intended flow: run locally, review, commit the generated files. The site
workflow also runs it as a fallback so a brand-new mission gets translated
pages on the next deploy even before anyone commits translations.

Requires ANTHROPIC_API_KEY (exits 0 quietly when unset) and the
`anthropic` package.
"""
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
I18N = ROOT / "i18n"
MODEL = "claude-opus-4-8"

LANG_NAMES = {"zh": "Simplified Chinese", "ja": "Japanese", "ko": "Korean"}

PROMPT = """Translate the following markdown document into {language}.

Rules:
- Preserve all markdown structure, code blocks, JSON examples, URLs, and
  LaTeX-ish math notation exactly as they are. Translate comments inside
  code blocks only when they are prose.
- Keep established technical terms in English where that is the norm for
  {language} technical writing (e.g. witness, verifier, PR, commit, SAT).
- Keep paper titles and author names in their original language.
- Output ONLY the translated markdown, no preamble.

Document:

{document}"""


def sources():
    # skill.md is English-only (agents work best in English), so it is not
    # translated. Only mission pages get localized.
    for mdir in sorted((ROOT / "missions").iterdir()):
        if mdir.is_dir() and (mdir / "mission.md").exists():
            yield f"{mdir.name}.md", mdir / "mission.md"


def main():
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("translate: ANTHROPIC_API_KEY not set, skipping")
        return
    try:
        import anthropic
    except ImportError:
        sys.exit("translate: pip install anthropic")

    client = anthropic.Anthropic()
    todo = [
        (lang, name, src)
        for lang in LANG_NAMES
        for name, src in sources()
        if not (I18N / lang / name).exists()
    ]
    if not todo:
        print("translate: all translations present")
        return

    for lang, name, src in todo:
        print(f"translate: {name} -> {lang}")
        with client.messages.stream(
            model=MODEL,
            max_tokens=32000,
            messages=[{
                "role": "user",
                "content": PROMPT.format(
                    language=LANG_NAMES[lang],
                    document=src.read_text(encoding="utf-8"),
                ),
            }],
        ) as stream:
            message = stream.get_final_message()
        text = "".join(b.text for b in message.content if b.type == "text")
        out = I18N / lang / name
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(text.rstrip() + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
