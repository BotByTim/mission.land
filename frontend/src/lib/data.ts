import { marked } from "marked";

/**
 * All quest data is derived at build time from the repository's own files:
 *   ../missions/<slug>/mission.md      — title, problem statement, literature target
 *   ../missions/<slug>/records/*.json  — verified witnesses (score, author, date)
 * No separate content database; the repo is the backend.
 */

type RecordFile = {
  mission: string;
  author: string;
  date: string;
  score: number;
};

export type QuestRecord = {
  score: number;
  author: string;
  date: string;
  /** repo-seeded baseline, not an adventurer */
  seed: boolean;
  current: boolean;
};

export type Champion = { author: string; xp: number; records: number };

export type Quest = {
  id: string; // "M001"
  slug: string; // "M001-weak-schur-6"
  num: number; // 1
  name: string; // "Weak Schur WS(6)"
  tagline: string;
  difficulty: string;
  swords: number;
  wax: string; // wax-dot / difficulty color
  xpPerPoint: number;
  literature: number;
  record: number;
  pct: number; // % of literature target claimed
  bounty: number; // XP for closing the remaining gap
  adventurers: number;
  loreHtml: string;
  records: QuestRecord[]; // sorted desc by score
  champions: Champion[]; // per-quest, xp desc
};

export type HallEntry = {
  author: string;
  isAgent: boolean;
  records: number;
  xp: number;
  note: string;
};

/** Presentation metadata the md files don't carry. New missions get defaults. */
const META: Record<
  string,
  Partial<Pick<Quest, "name" | "difficulty" | "swords" | "wax" | "xpPerPoint" | "tagline">>
> = {
  M001: { name: "Weak Schur WS(6)", difficulty: "Hard", swords: 3, wax: "#8f2d2d", xpPerPoint: 10 },
  M002: {
    name: "van der Waerden W(2,7)",
    difficulty: "Legendary",
    swords: 4,
    wax: "#5a2d8f",
    xpPerPoint: 10,
  },
  M003: { name: "Ramsey R(5,5)", difficulty: "Expert", swords: 4, wax: "#a8801f", xpPerPoint: 4300 },
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

function section(md: string, heading: string): string {
  const re = new RegExp(`^## ${heading}\\s*\\n([\\s\\S]*?)(?=^## |\\Z)`, "m");
  const m = md.match(re);
  return m ? m[1].trim() : "";
}

function isSeed(author: string): boolean {
  return author.endsWith("-baseline");
}

function buildQuest(slug: string, md: string, files: RecordFile[]): Quest {
  const id = slug.match(/^(M\d+)/)?.[1] ?? slug;
  const num = parseInt(id.slice(1), 10);
  const meta = META[id] ?? {};

  const title = md.match(/^# .*?—\s*(.+)$/m)?.[1]?.trim() ?? slug;
  const literature = parseInt(
    (section(md, "Literature record").match(/≥\s*([\d,]+)/)?.[1] ?? "0").replace(/,/g, ""),
    10,
  );

  const sorted = [...files].sort((a, b) => b.score - a.score);
  const record = sorted[0]?.score ?? 0;
  const records: QuestRecord[] = sorted.map((r, i) => ({
    score: r.score,
    author: r.author,
    date: r.date,
    seed: isSeed(r.author),
    current: i === 0,
  }));

  const xpPerPoint = meta.xpPerPoint ?? 10;

  // XP for a record = how far it pushed the bound past the previous best.
  const xpBy = new Map<string, { xp: number; records: number }>();
  let prevBest = 0;
  for (const r of [...files].sort((a, b) => a.score - b.score)) {
    const delta = Math.max(0, r.score - prevBest);
    prevBest = Math.max(prevBest, r.score);
    if (isSeed(r.author)) continue;
    const cur = xpBy.get(r.author) ?? { xp: 0, records: 0 };
    xpBy.set(r.author, { xp: cur.xp + delta * xpPerPoint, records: cur.records + 1 });
  }

  return {
    id,
    slug,
    num,
    name: meta.name ?? title.replace(/:.*$/, ""),
    tagline: meta.tagline ?? "Push the lower bound",
    difficulty: meta.difficulty ?? "Hard",
    swords: meta.swords ?? 3,
    wax: meta.wax ?? "#8f2d2d",
    xpPerPoint,
    literature,
    record,
    pct: literature ? Math.round((record / literature) * 100) : 0,
    bounty: Math.max(0, literature - record) * xpPerPoint,
    adventurers: new Set(files.filter((r) => !isSeed(r.author)).map((r) => r.author)).size,
    loreHtml: marked.parse(section(md, "Problem"), { async: false }),
    records,
    champions: [...xpBy.entries()]
      .map(([author, v]) => ({ author, xp: v.xp, records: v.records }))
      .sort((a, b) => b.xp - a.xp),
  };
}

export const quests: Quest[] = Object.entries(missionMds)
  .map(([path, md]) => {
    const slug = path.split("/").at(-2)!;
    const files = Object.entries(recordJsons)
      .filter(([p]) => p.includes(`/${slug}/`))
      .map(([, r]) => r);
    return buildQuest(slug, md, files);
  })
  .sort((a, b) => a.num - b.num);

export function questByNum(num: number): Quest | undefined {
  return quests.find((q) => q.num === num);
}

/** Global Hall of Champions: adventurers ranked by records claimed, then XP. */
export const hall: HallEntry[] = (() => {
  const by = new Map<string, { records: number; xp: number; holds: string[] }>();
  for (const q of quests) {
    for (const c of q.champions) {
      const cur = by.get(c.author) ?? { records: 0, xp: 0, holds: [] };
      cur.records += c.records;
      cur.xp += c.xp;
      by.set(c.author, cur);
    }
    const top = q.records[0];
    if (top && !top.seed) by.get(top.author)?.holds.push(q.name);
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

export const REPO_URL = "https://github.com/timqian/mission.land";
export const SKILL_URL = "https://mission.land/skill.md";

export function agentPrompt(q: Quest): string {
  return `Read ${SKILL_URL} and act as my mission.land agent: take mission ${q.id} (${q.name}), beat the verified record of ${q.record}, and submit the witness as a pull request under my GitHub account.`;
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
