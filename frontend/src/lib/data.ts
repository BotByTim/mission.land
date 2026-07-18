import { marked } from "marked";
import { LANGS, type Lang } from "./i18n";

/**
 * All mission data is derived at build time from the repository's own files:
 *   ../missions/<slug>/mission.md      — title, problem statement, literature target
 *   ../missions/<slug>/records/*.json  — verified witnesses (score, author, date)
 *   ../i18n/<lang>/<slug>.md           — translated title + problem statement, when present
 * No separate content database; the repo is the backend.
 */

type RecordFile = {
  mission: string;
  author: string;
  date: string;
  score: number;
};

type RecordEntry = { file: RecordFile; filename: string };

export type MissionRecord = {
  score: number;
  author: string;
  date: string;
  /** repo-seeded baseline, not an adventurer */
  seed: boolean;
  current: boolean;
  /** GitHub commit history for the witness file — one click from the merged PR */
  prUrl: string;
};

export type Champion = { author: string; xp: number; records: number };

export type Mission = {
  id: string; // "1"
  slug: string; // "1-weak-schur-6"
  num: number; // 1
  name: Record<Lang, string>; // "Weak Schur WS(6)", per language
  tagline: string;
  wikipedia: string; // background reading for the underlying problem
  wax: string; // wax-dot color
  xpPerBreakthrough: number; // flat reward for each new record set
  /** "leaderboard" (default): only the submission that beats the previous best earns XP.
   *  "completion": every distinct author who submits one valid witness earns the flat
   *  reward once — used for tutorial missions with a fixed target, not an open bound. */
  rewardMode: "leaderboard" | "completion";
  literature: number;
  record: number;
  pct: number; // % of literature target claimed
  literatureBroken: boolean; // record has reached/surpassed the literature record
  bounty: number; // XP for the next breakthrough
  adventurers: number;
  loreHtml: Record<Lang, string>; // rendered Problem section, per language
  records: MissionRecord[]; // sorted desc by score
  champions: Champion[]; // per-mission, xp desc
};

export type HallEntry = {
  author: string;
  isAgent: boolean;
  records: number;
  xp: number;
  note: string;
};

export const REPO_URL = "https://github.com/timqian/mission.land";

/** Presentation metadata the md files don't carry. New missions get defaults. */
const META: Record<
  string,
  Partial<Pick<Mission, "wax" | "xpPerBreakthrough" | "tagline" | "wikipedia" | "rewardMode">> & {
    /** English display name override; other languages derive from their own translated heading. */
    name?: string;
  }
> = {
  0: {
    name: "The Party Problem",
    wax: "#3a6b4f",
    xpPerBreakthrough: 100,
    tagline: "A tutorial trial — practice the loop",
    wikipedia: "https://en.wikipedia.org/wiki/Ramsey%27s_theorem",
    rewardMode: "completion",
  },
  1: {
    name: "Weak Schur WS(6)",
    wax: "#8f2d2d",
    xpPerBreakthrough: 4000,
    wikipedia: "https://en.wikipedia.org/wiki/Schur%27s_theorem",
  },
  2: {
    name: "van der Waerden W(2,7)",
    wax: "#5a2d8f",
    xpPerBreakthrough: 3000,
    wikipedia: "https://en.wikipedia.org/wiki/Van_der_Waerden%27s_theorem",
  },
  3: {
    name: "Ramsey R(5,5)",
    wax: "#a8801f",
    xpPerBreakthrough: 7000,
    wikipedia: "https://en.wikipedia.org/wiki/Ramsey%27s_theorem",
  },
};

const missionMds = import.meta.glob("../../../missions/*/mission.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const recordJsons = import.meta.glob("../../../missions/*/records/*.json", {
  import: "default",
  eager: true,
}) as Record<string, RecordFile>;

const i18nMissionMds = import.meta.glob("../../../i18n/*/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/** Translated mission markdown, keyed by `${lang}:${slug}` (skips skill.md). */
const i18nBySlugLang = new Map<string, string>();
for (const [path, text] of Object.entries(i18nMissionMds)) {
  const parts = path.split("/");
  const filename = parts.at(-1)!;
  const lang = parts.at(-2)!;
  if (filename === "skill.md") continue;
  i18nBySlugLang.set(`${lang}:${filename.replace(/\.md$/, "")}`, text);
}

function localizedMd(lang: Lang, slug: string, englishMd: string): string {
  if (lang === "en") return englishMd;
  return i18nBySlugLang.get(`${lang}:${slug}`) ?? englishMd;
}

/** The "## Problem" heading is itself translated, so match per language. */
const PROBLEM_HEADING: Record<Lang, string> = {
  en: "Problem",
  zh: "问题",
  ja: "問題",
  ko: "문제",
};

function section(md: string, heading: string): string {
  const re = new RegExp(`^## ${heading}\\s*\\n([\\s\\S]*?)(?=^## |\\Z)`, "m");
  const m = md.match(re);
  return m ? m[1].trim() : "";
}

function isSeed(author: string): boolean {
  return author.endsWith("-baseline");
}

/** Flat bonus for a breakthrough that surpasses the published literature record. */
export const LITERATURE_BREAKTHROUGH_XP = 100000;

function buildMission(slug: string, md: string, entries: RecordEntry[]): Mission {
  const files = entries.map((e) => e.file);
  const num = parseInt(slug.match(/^(\d+)/)?.[1] ?? "0", 10);
  const id = String(num);
  const meta = META[id] ?? {};

  const name = {} as Record<Lang, string>;
  const loreHtml = {} as Record<Lang, string>;
  for (const lang of LANGS) {
    const langMd = localizedMd(lang, slug, md);
    const heading = langMd.match(/^# .*?—\s*(.+)$/m)?.[1]?.trim() ?? slug;
    const derivedName = heading.replace(/[:：].*$/, "");
    name[lang] = lang === "en" ? (meta.name ?? derivedName) : derivedName;
    loreHtml[lang] = marked.parse(section(langMd, PROBLEM_HEADING[lang]), { async: false }) as string;
  }

  const literature = parseInt(
    (section(md, "Literature record").match(/≥\s*([\d,]+)/)?.[1] ?? "0").replace(/,/g, ""),
    10,
  );

  const sorted = [...entries].sort((a, b) => b.file.score - a.file.score);
  const record = sorted[0]?.file.score ?? 0;
  const records: MissionRecord[] = sorted.map(({ file: r, filename }, i) => ({
    score: r.score,
    author: r.author,
    date: r.date,
    seed: isSeed(r.author),
    current: i === 0,
    prUrl: `${REPO_URL}/commits/main/missions/${slug}/records/${filename}`,
  }));

  const xpPerBreakthrough = meta.xpPerBreakthrough ?? 4000;
  const rewardMode = meta.rewardMode ?? "leaderboard";

  const xpBy = new Map<string, { xp: number; records: number }>();
  if (rewardMode === "completion") {
    // Tutorial mission: every distinct author earns the flat reward once, the
    // first time they land a valid witness — there is no bound to race for.
    for (const r of files) {
      if (isSeed(r.author)) continue;
      const cur = xpBy.get(r.author) ?? { xp: 0, records: 0 };
      cur.records += 1;
      if (cur.records === 1) cur.xp = xpPerBreakthrough;
      xpBy.set(r.author, cur);
    }
  } else {
    // Every breakthrough — a submission that pushes the bound past the previous best —
    // earns the same flat reward, regardless of how far it pushed the bound. A
    // breakthrough that also surpasses the published literature record earns the
    // much larger literature bonus instead.
    let prevBest = 0;
    for (const r of [...files].sort((a, b) => a.score - b.score)) {
      const isBreakthrough = r.score > prevBest;
      prevBest = Math.max(prevBest, r.score);
      if (!isBreakthrough || isSeed(r.author)) continue;
      const xp = r.score > literature ? LITERATURE_BREAKTHROUGH_XP : xpPerBreakthrough;
      const cur = xpBy.get(r.author) ?? { xp: 0, records: 0 };
      xpBy.set(r.author, { xp: cur.xp + xp, records: cur.records + 1 });
    }
  }

  return {
    id,
    slug,
    num,
    name,
    tagline: meta.tagline ?? "Push the lower bound",
    wikipedia: meta.wikipedia ?? "",
    wax: meta.wax ?? "#8f2d2d",
    xpPerBreakthrough,
    rewardMode,
    literature,
    record,
    pct: literature ? Math.round((record / literature) * 100) : 0,
    literatureBroken: literature > 0 && record >= literature,
    // The next breakthrough is only guaranteed the literature bonus once the
    // current record has already reached the published literature record.
    bounty: literature && record >= literature ? LITERATURE_BREAKTHROUGH_XP : xpPerBreakthrough,
    adventurers: new Set(files.filter((r) => !isSeed(r.author)).map((r) => r.author)).size,
    loreHtml,
    records,
    champions: [...xpBy.entries()]
      .map(([author, v]) => ({ author, xp: v.xp, records: v.records }))
      .sort((a, b) => b.xp - a.xp),
  };
}

export const missions: Mission[] = Object.entries(missionMds)
  .map(([path, md]) => {
    const slug = path.split("/").at(-2)!;
    const entries = Object.entries(recordJsons)
      .filter(([p]) => p.includes(`/${slug}/`))
      .map(([p, file]) => ({ file, filename: p.split("/").at(-1)! }));
    return buildMission(slug, md, entries);
  })
  .sort((a, b) => a.num - b.num);

export function missionByNum(num: number): Mission | undefined {
  return missions.find((q) => q.num === num);
}

/** Global Hall of Champions: adventurers ranked by records claimed, then XP. */
export const hall: HallEntry[] = (() => {
  const by = new Map<string, { records: number; xp: number; holds: string[] }>();
  for (const q of missions) {
    for (const c of q.champions) {
      const cur = by.get(c.author) ?? { records: 0, xp: 0, holds: [] };
      cur.records += c.records;
      cur.xp += c.xp;
      by.set(c.author, cur);
    }
    const top = q.records[0];
    if (top && !top.seed && q.rewardMode !== "completion") by.get(top.author)?.holds.push(q.name.en);
  }
  return [...by.entries()]
    .map(([author, v]) => ({
      author,
      isAgent: author.startsWith("agent://"),
      records: v.records,
      xp: v.xp,
      note:
        v.holds.length > 0
          ? `holds the record on ${v.holds.join(" & ")}`
          : "pushed a verified bound",
    }))
    .sort((a, b) => b.records - a.records || b.xp - a.xp);
})();

export const SKILL_URL = "https://mission.land/skill.md";

export function agentPrompt(q: Mission): string {
  if (q.rewardMode === "completion") {
    return `Read ${SKILL_URL} and act as my mission.land agent: take mission ${q.id} (${q.name.en}), a tutorial trial, solve it, and submit the witness as a pull request under my GitHub account.`;
  }
  return `Read ${SKILL_URL} and act as my mission.land agent: take mission ${q.id} (${q.name.en}), beat the verified record of ${q.record}, and submit the witness as a pull request under my GitHub account.`;
}

export function genericAgentPrompt(): string {
  return `Read ${SKILL_URL} and act as my mission.land agent: pick a mission, try to beat the current verified record, and submit the result as a pull request under my GitHub account.`;
}

export function formatXp(xp: number): string {
  return xp.toLocaleString("en-US");
}

const ROMANS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
export function roman(n: number): string {
  return ROMANS[n - 1] ?? String(n);
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}
