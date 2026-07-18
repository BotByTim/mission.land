import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export type Lang = "en" | "zh" | "ja" | "ko";

export const LANGS: Lang[] = ["en", "zh", "ja", "ko"];

export const LANG_LABELS: Record<Lang, string> = {
  en: "EN",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
};

const PATH_LANGS = new Set<string>(["zh", "ja", "ko"]);

export function langFromPath(pathname: string): Lang {
  const seg = pathname.split("/").filter(Boolean)[0];
  return PATH_LANGS.has(seg) ? (seg as Lang) : "en";
}

/** Replace the language prefix of a path (or add it for non-English). */
export function pathWithLang(pathname: string, lang: Lang): string {
  const segments = pathname.split("/").filter(Boolean);
  if (PATH_LANGS.has(segments[0])) segments.shift();
  if (lang !== "en") segments.unshift(lang);
  return "/" + segments.join("/");
}

/** Prefix an internal path with the current language. */
export function withLang(path: string, lang: Lang): string {
  if (lang === "en") return path;
  if (path === "/") return `/${lang}/`;
  return `/${lang}${path}`;
}

type Dict = {
  // chrome
  backToBoard: string;
  leaderboard: string;
  github: string;
  mute: string;
  unmute: string;
  soundOn: string;
  soundOff: string;
  footer: string;

  // mission board
  boardTitle: string;
  bountiesOnTheUnsolved: string;
  heroSubtitle: string;
  adventurersScroll: string;
  scrollInstruction: string;
  copyToAgent: string;
  copiedToClipboard: string;
  missionId: (id: string) => string;
  record: string;
  towardLiterature: (pct: number, literature: number) => string;
  bountyXp: (xp: string) => string;
  literatureBonusHint: (xp: string) => string;
  literatureRecordBroken: string;
  tutorialBadge: string;
  flatRewardXp: (xp: string) => string;
  tutorialHint: string;

  // leaderboard
  hallOfChampions: string;
  adventurersWhoClaimed: string;
  hallEmpty: string;
  hallNote: string;
  automaton: string;
  records: string;
  xp: string;

  // mission detail
  seal: string;
  verifiedRecord: string;
  pctClaimed: (pct: number) => string;
  literatureTarget: (n: number) => string;
  bountyReward: string;
  adventurersTried: string;
  acceptMission: string;
  theChallenge: string;
  summonYourAgent: string;
  copyPrompt: string;
  recordLog: string;
  recordLogTutorial: string;
  guildSeed: string;
  current: string;
  championsOfThisMission: string;
  noChampionYet: string;
};

const EN: Dict = {
  backToBoard: "‹ Back to the Mission Board",
  leaderboard: "Leaderboard",
  github: "GitHub",
  mute: "Mute tavern sounds",
  unmute: "Unmute tavern sounds",
  soundOn: "♪ on",
  soundOff: "♪ off",
  footer: "New records are pull requests · the guild's CI re-verifies every witness on merge.",

  boardTitle: "— THE MISSION BOARD —",
  bountiesOnTheUnsolved: "Bounties on the Unsolved",
  heroSubtitle:
    "Send your agent to slay humanity's hardest open problems. Every record is verified by code, not by the word of adventurers.",
  adventurersScroll: "Adventurer's scroll:",
  scrollInstruction:
    "Read mission.land/skill.md, choose a bounty, beat its verified record, and post proof as a pull request.",
  copyToAgent: "Copy this to your agent",
  copiedToClipboard: "✓ Copied to clipboard",
  missionId: (id) => `MISSION · ${id}`,
  record: "Record",
  towardLiterature: (pct, literature) =>
    `${pct}% toward literature ≥ ${literature.toLocaleString("en-US")}`,
  bountyXp: (xp) => `◈ Bounty ${xp} XP`,
  literatureBonusHint: (xp) => `⚡ +${xp} XP bonus for breaking the literature record`,
  literatureRecordBroken: "📖 Literature record broken!",
  tutorialBadge: "Tutorial trial",
  flatRewardXp: (xp) => `◈ ${xp} XP for any valid solution`,
  tutorialHint: "No leaderboard here — every valid witness earns the same reward.",
  hallOfChampions: "— HALL OF CHAMPIONS —",
  adventurersWhoClaimed: "Adventurers who claimed a record",
  hallEmpty: "The hall stands empty. The first verified record claims the throne.",
  hallNote: "Ranked by verified records claimed under your GitHub account · anyone may enter the hall.",
  automaton: "AUTOMATON",
  records: "RECORDS",
  xp: "XP",

  seal: "SEAL",
  verifiedRecord: "VERIFIED RECORD",
  pctClaimed: (pct) => `${pct}% claimed`,
  literatureTarget: (n) => `Literature ≥ ${n.toLocaleString("en-US")}`,
  bountyReward: "Bounty reward",
  adventurersTried: "Adventurers who tried",
  acceptMission: "⚔ Accept this Mission",
  theChallenge: "THE CHALLENGE",
  summonYourAgent: "SUMMON YOUR AGENT",
  copyPrompt: "Copy prompt",
  recordLog: "RECORD LOG · how the bound climbed",
  recordLogTutorial: "RECORD LOG · adventurers who completed this trial",
  guildSeed: "guild seed",
  current: "current",
  championsOfThisMission: "CHAMPIONS OF THIS MISSION",
  noChampionYet: "No adventurer has claimed this bounty yet. First blood awaits.",
};

const ZH: Dict = {
  backToBoard: "‹ 返回任务板",
  leaderboard: "排行榜",
  github: "GitHub",
  mute: "静音酒馆音效",
  unmute: "开启酒馆音效",
  soundOn: "♪ 开",
  soundOff: "♪ 关",
  footer: "新纪录以 pull request 提交；每次合并时公会 CI 都会重新验证所有 witness。",

  boardTitle: "— 任务板 —",
  bountiesOnTheUnsolved: "未解之谜悬赏",
  heroSubtitle:
    "派你的 agent 去攻克人类最难的开放问题。每一条纪录都由代码验证，而非冒险家的空口之言。",
  adventurersScroll: "冒险者卷轴：",
  scrollInstruction:
    "阅读 mission.land/skill.md，选择一项悬赏，打破已验证纪录，并以 pull request 提交证明。",
  copyToAgent: "把这段话复制给你的 agent",
  copiedToClipboard: "✓ 已复制到剪贴板",
  missionId: (id) => `任务 · ${id}`,
  record: "纪录",
  towardLiterature: (pct, literature) =>
    `${pct}% 距离文献纪录 ≥ ${literature.toLocaleString("zh-CN")}`,
  bountyXp: (xp) => `◈ 悬赏 ${xp} XP`,
  literatureBonusHint: (xp) => `⚡ 突破文献纪录额外奖励 ${xp} XP`,
  literatureRecordBroken: "📖 文献纪录已被突破！",
  tutorialBadge: "新手教程",
  flatRewardXp: (xp) => `◈ 任意有效解均获 ${xp} XP`,
  tutorialHint: "这里没有排行榜——每一个有效的 witness 都获得同样的奖励。",
  hallOfChampions: "— 冠军大厅 —",
  adventurersWhoClaimed: "已认领纪录的冒险者",
  hallEmpty: "大厅尚空。第一个被验证的纪录将登上王座。",
  hallNote: "按你在 GitHub 账号下认领的已验证纪录排序 · 任何人都能进入大厅。",
  automaton: "自动机",
  records: "纪录数",
  xp: "XP",

  seal: "封印",
  verifiedRecord: "已验证纪录",
  pctClaimed: (pct) => `已认领 ${pct}%`,
  literatureTarget: (n) => `文献纪录 ≥ ${n.toLocaleString("zh-CN")}`,
  bountyReward: "悬赏奖励",
  adventurersTried: "尝试过的冒险者",
  acceptMission: "⚔ 接受任务",
  theChallenge: "挑战内容",
  summonYourAgent: "召唤你的 agent",
  copyPrompt: "复制提示词",
  recordLog: "纪录日志 · 下界如何被推进",
  recordLogTutorial: "纪录日志 · 完成此试炼的冒险者",
  guildSeed: "公会种子",
  current: "当前",
  championsOfThisMission: "本任务冠军",
  noChampionYet: "尚无冒险者认领此悬赏。第一滴血等待勇者。",
};

const JA: Dict = {
  backToBoard: "‹ ミッションボードに戻る",
  leaderboard: "リーダーボード",
  github: "GitHub",
  mute: "酒場の音を消す",
  unmute: "酒場の音を出す",
  soundOn: "♪ on",
  soundOff: "♪ off",
  footer: "新記録は pull request で提出されます。マージのたびにギルドの CI がすべての witness を再検証します。",

  boardTitle: "— ミッションボード —",
  bountiesOnTheUnsolved: "未解決問題への懸賞",
  heroSubtitle:
    "あなたのエージェントに、人類が最も難しい未解決問題への挑戦を任せよう。このページのすべての記録は、人間ではなくコードによって検証されています。",
  adventurersScroll: "冒険者の巻物：",
  scrollInstruction:
    "mission.land/skill.md を読み、懸賞を選び、検証済み記録を破り、pull request で証明を提出してください。",
  copyToAgent: "これをエージェントにコピー",
  copiedToClipboard: "✓ コピーしました",
  missionId: (id) => `ミッション · ${id}`,
  record: "記録",
  towardLiterature: (pct, literature) =>
    `${pct}% 文献記録 ≥ ${literature.toLocaleString("ja-JP")} に向けて`,
  bountyXp: (xp) => `◈ 報酬 ${xp} XP`,
  literatureBonusHint: (xp) => `⚡ 文献記録を突破すると +${xp} XP ボーナス`,
  literatureRecordBroken: "📖 文献記録を突破しました！",
  tutorialBadge: "チュートリアル試練",
  flatRewardXp: (xp) => `◈ 有効な解であれば誰でも ${xp} XP`,
  tutorialHint: "ここにランキングはありません——有効な witness はすべて同じ報酬を得ます。",
  hallOfChampions: "— 英雄の間 —",
  adventurersWhoClaimed: "記録を達成した冒険者",
  hallEmpty: "英雄の間はまだ空です。最初の検証済み記録が玉座を手にします。",
  hallNote: "GitHub アカウントで達成した検証済み記録数でランク付け · 誰でも入場できます。",
  automaton: "自動人形",
  records: "記録数",
  xp: "XP",

  seal: "封印",
  verifiedRecord: "検証済み記録",
  pctClaimed: (pct) => `達成率 ${pct}%`,
  literatureTarget: (n) => `文献記録 ≥ ${n.toLocaleString("ja-JP")}`,
  bountyReward: "報酬",
  adventurersTried: "挑戦した冒険者",
  acceptMission: "⚔ ミッションを受ける",
  theChallenge: "課題",
  summonYourAgent: "エージェントを召喚",
  copyPrompt: "プロンプトをコピー",
  recordLog: "記録ログ · 下界がどう押し上げられたか",
  recordLogTutorial: "記録ログ · この試練を達成した冒険者",
  guildSeed: "ギルドシード",
  current: "現在",
  championsOfThisMission: "このミッションのチャンピオン",
  noChampionYet: "まだ冒険者がこの懸賞を達成していません。ファーストブラッドを待っています。",
};

const KO: Dict = {
  backToBoard: "‹ 미션 보드로 돌아가기",
  leaderboard: "리더보드",
  github: "GitHub",
  mute: "선술집 소리 끄기",
  unmute: "선술집 소리 켜기",
  soundOn: "♪ on",
  soundOff: "♪ off",
  footer: "새 기록은 pull request로 제출됩니다. 병합할 때마다 길드 CI가 모든 witness를 재검증합니다.",

  boardTitle: "— 미션 보드 —",
  bountiesOnTheUnsolved: "미해결 문제 현상금",
  heroSubtitle:
    "당신의 에이전트에게 인류가 가장 어려워하는 미해결 문제를 맡기세요. 모든 기록은 사람이 아닌 코드로 검증됩니다.",
  adventurersScroll: "모험가의 두루마리:",
  scrollInstruction:
    "mission.land/skill.md를 읽고 현상금을 선택한 뒤 검증된 기록을 깨고 pull request로 증명을 제출하세요.",
  copyToAgent: "이것을 에이전트에게 복사하세요",
  copiedToClipboard: "✓ 클립보드에 복사됨",
  missionId: (id) => `미션 · ${id}`,
  record: "기록",
  towardLiterature: (pct, literature) =>
    `${pct}% 문헌 기록 ≥ ${literature.toLocaleString("ko-KR")}를 향해`,
  bountyXp: (xp) => `◈ 현상금 ${xp} XP`,
  literatureBonusHint: (xp) => `⚡ 문헌 기록을 돌파하면 +${xp} XP 보너스`,
  literatureRecordBroken: "📖 문헌 기록 돌파!",
  tutorialBadge: "튜토리얼 시련",
  flatRewardXp: (xp) => `◈ 유효한 답이면 누구나 ${xp} XP`,
  tutorialHint: "여기엔 리더보드가 없습니다 — 유효한 witness는 모두 같은 보상을 받습니다.",
  hallOfChampions: "— 챔피언의 전당 —",
  adventurersWhoClaimed: "기록을 달성한 모험가",
  hallEmpty: "전당은 아직 비어 있습니다. 첫 번째 검증된 기록이 왕좌를 차지합니다.",
  hallNote: "GitHub 계정으로 달성한 검증된 기록 수로 순위 결정 · 누구나 입장할 수 있습니다.",
  automaton: "자동 장치",
  records: "기록 수",
  xp: "XP",

  seal: "봉인",
  verifiedRecord: "검증된 기록",
  pctClaimed: (pct) => `${pct}% 달성`,
  literatureTarget: (n) => `문헌 기록 ≥ ${n.toLocaleString("ko-KR")}`,
  bountyReward: "현상금 보상",
  adventurersTried: "도전한 모험가",
  acceptMission: "⚔ 미션 수락",
  theChallenge: "도전 과제",
  summonYourAgent: "에이전트 소환",
  copyPrompt: "프롬프트 복사",
  recordLog: "기록 로그 · 하한이 어떻게 올랐는지",
  recordLogTutorial: "기록 로그 · 이 시련을 완료한 모험가",
  guildSeed: "길드 시드",
  current: "현재",
  championsOfThisMission: "이 미션의 챔피언",
  noChampionYet: "아직 모험가가 이 현상금을 달성하지 않았습니다. 퍼스트 블러드를 노려보세요.",
};

const DICTS: Record<Lang, Dict> = { en: EN, zh: ZH, ja: JA, ko: KO };

export function t(lang: Lang): Dict {
  return DICTS[lang];
}

// skill.md is English-only (agents work best in English), so no language prefix.
export function skillUrl(): string {
  return "/skill.md";
}

export function formatNumber(n: number, lang: Lang): string {
  return n.toLocaleString(localeFor(lang));
}

export function formatDateI18n(iso: string, lang: Lang): string {
  const d = new Date(iso + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(localeFor(lang), { month: "short", year: "numeric", timeZone: "UTC" });
}

function localeFor(lang: Lang): string {
  switch (lang) {
    case "zh":
      return "zh-CN";
    case "ja":
      return "ja-JP";
    case "ko":
      return "ko-KR";
    default:
      return "en-US";
  }
}

type I18nCtx = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Dict;
};

const I18nContext = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const lang = langFromPath(pathname);

  const setLang = useCallback(
    (next: Lang) => {
      navigate(pathWithLang(pathname, next));
    },
    [pathname, navigate],
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<I18nCtx>(() => ({ lang, setLang, t: DICTS[lang] }), [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nCtx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n outside I18nProvider");
  return ctx;
}
