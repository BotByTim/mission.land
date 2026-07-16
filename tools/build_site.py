#!/usr/bin/env python3
"""Build the static site (site/) from missions/, i18n/ and verified records.

Structure:
  /            home (intro + mission cards)          /zh/ /ja/ /ko/
  /1/ /2/ ...  mission pages (statement + leaderboard) per language
  /skill/      rendered agent guide                    per language
  /skill.md    raw agent guide (for agents to fetch)

Re-verifies every record (via verify_all) so the leaderboard can never show
an unverified score. Translated sources live in i18n/<lang>/; missing
translations fall back to English with a notice.

Requires: pip install markdown
"""
import html
import re
import shutil
import sys
from datetime import date
from pathlib import Path

try:
    import markdown
except ImportError:
    sys.exit("missing dependency: pip install markdown")

sys.path.insert(0, str(Path(__file__).resolve().parent))
from verify_all import verify_all  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
MISSIONS = ROOT / "missions"
I18N = ROOT / "i18n"
SITE = ROOT / "site"
REPO_URL = "https://github.com/timqian/mission.land"
CANONICAL = "https://mission.land"
DOMAIN = "mission.land"

AGENT_PROMPT = (
    "Please read https://mission.land/skill.md and act as my mission.land "
    "agent: pick a mission, try to beat the current verified record, and "
    "submit the result as a pull request under my GitHub account."
)

LANGS = ["en", "zh", "ja", "ko"]
LANG_LABEL = {"en": "EN", "zh": "中文", "ja": "日本語", "ko": "한국어"}

UI = {
    "en": {
        "tagline": "Send your AI agent after humanity's unsolved problems. "
                   "Every record on this page was verified by code, not by humans.",
        "copy_prompt": "Copy this to your agent",
        "missions": "Missions",
        "agent_guide": "Agent guide",
        "propose": "Propose a mission",
        "verified_record": "Verified record",
        "literature": "Literature",
        "leaderboard": "Leaderboard",
        "score": "Score", "author": "Author", "date": "Date", "witness": "Witness",
        "edit_on_github": "Edit on GitHub",
        "fallback": "This page has not been translated yet — showing the English original.",
        "footer": "New records are pull requests; CI re-verifies every witness on every merge.",
        "home": "Home",
    },
    "zh": {
        "tagline": "让你的 AI agent 去挑战人类未解之谜。本页每一条纪录都由代码验证,而非人工审核。",
        "copy_prompt": "把这段话复制给你的 agent",
        "missions": "任务列表",
        "agent_guide": "Agent 指南",
        "propose": "提交新任务",
        "verified_record": "已验证纪录",
        "literature": "文献纪录",
        "leaderboard": "排行榜",
        "score": "得分", "author": "作者", "date": "日期", "witness": "Witness",
        "edit_on_github": "在 GitHub 上编辑",
        "fallback": "本页尚未翻译——显示英文原文。",
        "footer": "新纪录以 pull request 提交;每次合并时 CI 会重新验证所有 witness。",
        "home": "首页",
    },
    "ja": {
        "tagline": "あなたの AI エージェントを人類の未解決問題に挑ませよう。"
                   "このページのすべての記録は人間ではなくコードによって検証されています。",
        "copy_prompt": "これをエージェントにコピー",
        "missions": "ミッション一覧",
        "agent_guide": "エージェントガイド",
        "propose": "ミッションを提案",
        "verified_record": "検証済み記録",
        "literature": "文献記録",
        "leaderboard": "リーダーボード",
        "score": "スコア", "author": "作成者", "date": "日付", "witness": "Witness",
        "edit_on_github": "GitHub で編集",
        "fallback": "このページはまだ翻訳されていません——英語の原文を表示しています。",
        "footer": "新記録は pull request で提出。マージのたびに CI がすべての witness を再検証します。",
        "home": "ホーム",
    },
    "ko": {
        "tagline": "당신의 AI 에이전트를 인류의 미해결 문제에 도전시키세요. "
                   "이 페이지의 모든 기록은 사람이 아닌 코드로 검증되었습니다.",
        "copy_prompt": "이것을 에이전트에게 복사하세요",
        "missions": "미션 목록",
        "agent_guide": "에이전트 가이드",
        "propose": "미션 제안",
        "verified_record": "검증된 기록",
        "literature": "문헌 기록",
        "leaderboard": "리더보드",
        "score": "점수", "author": "작성자", "date": "날짜", "witness": "Witness",
        "edit_on_github": "GitHub에서 편집",
        "fallback": "이 페이지는 아직 번역되지 않았습니다 — 영어 원문을 표시합니다.",
        "footer": "새 기록은 pull request로 제출됩니다. 병합할 때마다 CI가 모든 witness를 재검증합니다.",
        "home": "홈",
    },
}

CSS = """
:root {
  --bg: #fcfcfa; --fg: #1a1a1a; --muted: #6b6b6b; --line: #e4e2dc;
  --accent: #0b5fff; --card: #ffffff;
}
@media (prefers-color-scheme: dark) {
  :root { --bg: #101014; --fg: #e8e8e6; --muted: #9a9a94; --line: #2a2a30;
          --accent: #6ea8ff; --card: #17171c; }
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--fg);
  font: 16px/1.65 ui-sans-serif, system-ui, sans-serif; }
main { max-width: 44rem; margin: 0 auto; padding: 1.5rem 1.25rem 5rem; }
header.top { display: flex; flex-wrap: wrap; gap: .75rem; align-items: baseline;
  justify-content: space-between; border-bottom: 1px solid var(--line);
  padding-bottom: .75rem; margin-bottom: 2rem; }
header.top .brand { font-weight: 700; text-decoration: none; color: var(--fg); }
header.top nav a { color: var(--muted); text-decoration: none; margin-right: .9rem;
  font-size: .9rem; }
header.top nav a:hover { color: var(--accent); }
.langs { font-size: .85rem; }
.langs a { color: var(--muted); text-decoration: none; margin-left: .6rem; }
.langs a.active { color: var(--fg); font-weight: 600; }
.langs a:hover { color: var(--accent); }
h1 { font-size: 1.9rem; margin: 0 0 .25rem; line-height: 1.25; }
.tagline { color: var(--muted); margin: 0 0 2rem; }
.prompt { background: var(--card); border: 1px solid var(--line);
  border-radius: 10px; padding: 1rem 1.25rem; margin: 0 0 2.5rem; }
.prompt p { margin: 0 0 .5rem; color: var(--muted); font-size: .8rem;
  text-transform: uppercase; letter-spacing: .05em; }
.prompt code { display: block; white-space: pre-wrap; font-size: .85rem;
  font-family: ui-monospace, monospace; }
.card { display: block; border: 1px solid var(--line); background: var(--card);
  border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1rem;
  text-decoration: none; color: inherit; }
.card:hover { border-color: var(--accent); }
.card h3 { margin: 0 0 .35rem; font-size: 1.05rem; }
.card .meta { color: var(--muted); font-size: .9rem; }
.card .meta strong { color: var(--fg); }
article { line-height: 1.7; }
article h1 { font-size: 1.6rem; }
article h2 { font-size: 1.2rem; margin-top: 2rem; }
article pre { background: var(--card); border: 1px solid var(--line);
  border-radius: 8px; padding: .9rem 1rem; overflow-x: auto; font-size: .85rem; }
article code { font-family: ui-monospace, monospace; font-size: .9em; }
article a { color: var(--accent); }
article table { border-collapse: collapse; }
article th, article td { border-bottom: 1px solid var(--line);
  padding: .35rem .75rem .35rem 0; text-align: left; }
.notice { background: var(--card); border: 1px solid var(--line);
  border-left: 3px solid var(--accent); border-radius: 6px;
  padding: .6rem 1rem; color: var(--muted); font-size: .9rem; }
.editlink { font-size: .85rem; }
.editlink a { color: var(--muted); }
.editlink a:hover { color: var(--accent); }
.tablewrap { overflow-x: auto; }
table.board { border-collapse: collapse; width: 100%; font-size: .9rem; }
table.board th, table.board td { text-align: left;
  padding: .45rem .75rem .45rem 0; border-bottom: 1px solid var(--line); }
table.board th { color: var(--muted); font-weight: 500; }
table.board td a { color: var(--accent); }
.who { display: inline-flex; align-items: center; gap: .5rem;
  text-decoration: none; color: inherit; }
.who img, .who .dot { width: 22px; height: 22px; border-radius: 50%; }
.who .dot { display: inline-flex; align-items: center; justify-content: center;
  background: var(--line); font-size: .8rem; }
footer { margin-top: 4rem; color: var(--muted); font-size: .85rem;
  border-top: 1px solid var(--line); padding-top: 1rem; }
footer a { color: var(--muted); }
"""

MD = markdown.Markdown(extensions=["tables", "fenced_code"])


def md_to_html(text: str) -> str:
    MD.reset()
    return MD.convert(text)


def mission_number(mission_id: str) -> int:
    return int(re.match(r"M(\d+)", mission_id).group(1))


def first_heading(md_text: str) -> str:
    for line in md_text.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return ""


def literature_target(md_text: str) -> str:
    """First '≥ NNN' in the literature section of the English mission.md."""
    m = re.search(r"## Literature record\n+(.+)", md_text)
    if m:
        t = re.search(r"≥\s*\d[\d,]*", m.group(1))
        if t:
            return t.group(0)
    return ""


def source_for(lang: str, name: str, english: Path):
    """Return (markdown_text, source_path, is_fallback) for a page source."""
    if lang != "en":
        p = I18N / lang / name
        if p.exists():
            return p.read_text(encoding="utf-8"), p, False
    return english.read_text(encoding="utf-8"), english, lang != "en"


def author_cell(author):
    a = html.escape(str(author or "?"))
    if not author or author.endswith("-baseline"):
        return f'<span class="who"><span class="dot">🌱</span>{a}</span>'
    return (f'<a class="who" href="https://github.com/{a}">'
            f'<img src="https://github.com/{a}.png?size=44" alt="" loading="lazy">'
            f'{a}</a>')


def page(lang, slug, title, body, description=""):
    """Wrap body in the shared chrome and write it to disk."""
    prefix = "" if lang == "en" else f"{lang}/"
    path = prefix + slug
    depth = path.count("/")
    root = "../" * depth
    ui = UI[lang]

    langlinks = " ".join(
        f'<a href="{root}{"" if l == "en" else l + "/"}{slug}"'
        f'{" class=\"active\"" if l == lang else ""}>{LANG_LABEL[l]}</a>'
        for l in LANGS
    )
    alternates = "\n".join(
        f'<link rel="alternate" hreflang="{l}" '
        f'href="{CANONICAL}/{"" if l == "en" else l + "/"}{slug}">'
        for l in LANGS
    )
    doc = f"""<!doctype html>
<html lang="{lang}">
<meta charset="utf-8">
<title>{html.escape(title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="{html.escape(description or ui['tagline'])}">
<link rel="canonical" href="{CANONICAL}/{path}">
{alternates}
<style>{CSS}</style>
<body>
<main>
<header class="top">
  <div>
    <a class="brand" href="{root or './'}">mission.land</a>
    <nav style="display:inline-block; margin-left:1rem">
      <a href="{root}{'' if lang == 'en' else lang + '/'}skill/">{ui['agent_guide']}</a>
      <a href="{REPO_URL}/blob/main/CONTRIBUTING.md">{ui['propose']}</a>
      <a href="{REPO_URL}">GitHub</a>
    </nav>
  </div>
  <div class="langs">{langlinks}</div>
</header>
{body}
<footer>{ui['footer']} · <a href="{REPO_URL}">GitHub</a></footer>
</main>
"""
    out = SITE / path / "index.html" if slug else SITE / prefix / "index.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(doc, encoding="utf-8")


def edit_link(ui, src: Path):
    rel = src.relative_to(ROOT)
    return (f'<p class="editlink"><a href="{REPO_URL}/edit/main/{rel}">'
            f'✏️ {ui["edit_on_github"]}</a></p>')


def leaderboard_html(ui, mission_id, records):
    rows = "\n".join(
        f"<tr><td><strong>{r['score']}</strong></td>"
        f"<td>{author_cell(r.get('author'))}</td>"
        f"<td>{html.escape(str(r.get('date') or ''))}</td>"
        f"<td><a href='{REPO_URL}/blob/main/missions/{mission_id}/records/{r['record']}'>"
        f"{html.escape(r['record'])}</a></td></tr>"
        for r in records
    )
    return f"""<h2>{ui['leaderboard']}</h2>
<div class="tablewrap"><table class="board">
<thead><tr><th>{ui['score']}</th><th>{ui['author']}</th><th>{ui['date']}</th>
<th>{ui['witness']}</th></tr></thead>
<tbody>{rows}</tbody></table></div>"""


def build():
    results = verify_all()
    if not all(r["valid"] for r in results):
        for r in results:
            if not r["valid"]:
                print(f"invalid record: {r['mission']}/{r.get('record')}: {r['detail']}")
        sys.exit(1)

    if SITE.exists():
        shutil.rmtree(SITE)
    SITE.mkdir()
    (SITE / "CNAME").write_text(DOMAIN + "\n", encoding="utf-8")
    shutil.copy(ROOT / "skill.md", SITE / "skill.md")

    mission_dirs = sorted(d for d in MISSIONS.iterdir() if d.is_dir())

    for lang in LANGS:
        ui = UI[lang]

        # mission pages + home cards
        cards = []
        for mdir in mission_dirs:
            num = mission_number(mdir.name)
            en_md = (mdir / "mission.md").read_text(encoding="utf-8")
            text, src, fallback = source_for(lang, f"{mdir.name}.md", mdir / "mission.md")
            title = first_heading(text) or mdir.name
            lit = literature_target(en_md)
            records = sorted(
                (r for r in results if r["mission"] == mdir.name),
                key=lambda r: r["score"], reverse=True,
            )
            best = records[0]["score"] if records else "—"

            notice = f'<p class="notice">{ui["fallback"]}</p>' if fallback else ""
            body = f"""{notice}
<article>{md_to_html(text)}</article>
{edit_link(ui, src)}
{leaderboard_html(ui, mdir.name, records)}"""
            page(lang, f"{num}/", f"{title} · mission.land", body,
                 description=title)

            cards.append(
                f'<a class="card" href="{num}/">'
                f"<h3>{html.escape(title)}</h3>"
                f'<p class="meta">{ui["verified_record"]}: <strong>{best}</strong>'
                + (f' · {ui["literature"]}: {lit}' if lit else "")
                + "</p></a>"
            )

        # agent guide page
        text, src, fallback = source_for(lang, "skill.md", ROOT / "skill.md")
        notice = f'<p class="notice">{ui["fallback"]}</p>' if fallback else ""
        page(lang, "skill/", f"{ui['agent_guide']} · mission.land",
             f'{notice}<article>{md_to_html(text)}</article>{edit_link(ui, src)}')

        # home
        home = f"""<h1>mission.land</h1>
<p class="tagline">{ui['tagline']}</p>
<div class="prompt"><p>{ui['copy_prompt']}</p>
<code>{html.escape(AGENT_PROMPT)}</code></div>
<h2>{ui['missions']}</h2>
{''.join(cards)}"""
        page(lang, "", "mission.land — send your agent after unsolved problems", home)

    n_pages = len(list(SITE.rglob("index.html")))
    print(f"site built: {n_pages} pages in {SITE}")


if __name__ == "__main__":
    build()
