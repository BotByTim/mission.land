import { useRef, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Footer, GithubAvatar, Nav, Sheet, authorLabel } from "../components/chrome";
import { agentPrompt, formatDate, formatXp, questByNum, roman } from "../lib/data";
import { useSound } from "../lib/sound";

export default function MissionDetail() {
  const { num } = useParams();
  const q = questByNum(Number(num));
  const { tick, chime, arpeggio } = useSound();
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const summonRef = useRef<HTMLDivElement>(null);

  if (!q) return <Navigate to="/" replace />;

  const prompt = agentPrompt(q);
  const almost = q.pct >= 90;
  const diffColor = q.difficulty === "Legendary" ? "var(--color-legendary)" : "var(--color-crimson)";

  const copy = () => {
    void navigator.clipboard?.writeText(prompt).catch(() => {});
    arpeggio();
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1800);
  };

  const accept = () => {
    chime();
    summonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="bg-tavern-deep min-h-screen">
      <div className="mx-auto max-w-[1000px] px-5 pb-[60px] pt-6 text-[#3a2c1a] max-md:px-3">
        <div className="mb-5">
          <Nav back />
        </div>
        <Sheet>
          {/* quest header */}
          <div className="mb-[26px] flex items-start justify-between border-b-2 border-divider pb-[22px]">
            <div>
              <div className="mb-2 font-display text-[14px] tracking-[5px] text-ink-soft">
                QUEST · {q.id}
              </div>
              <h1 className="mb-2 font-display text-[42px] font-black leading-tight text-ink max-md:text-[28px]">
                {q.name}
              </h1>
              <div className="text-[22px]" style={{ color: diffColor }}>
                {"⚔ ".repeat(q.swords).trim()} · {q.difficulty} &nbsp;·&nbsp;{" "}
                <span className="text-ink-body">{q.tagline}</span>
              </div>
            </div>
            <div className="seal flex h-[74px] w-[74px] shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_40%_35%,#c0433f,#7a1f1f)] font-display text-[15px] font-black text-[#f7dede]">
              SEAL
            </div>
          </div>

          {/* record + actions */}
          <div className="mb-7 grid grid-cols-2 gap-[26px] max-md:grid-cols-1">
            <div className="qcard px-6 py-[22px]">
              <div className="mb-0.5 text-[18px] text-ink-muted">VERIFIED RECORD</div>
              <div className="font-display text-[72px] font-black leading-[.9] text-ink">
                {q.record}
              </div>
              <div className="mt-4 mb-1.5 h-4 border border-divider bg-bar-track">
                <div
                  className="h-full"
                  style={{
                    width: `${Math.min(q.pct, 100)}%`,
                    background: almost ? "var(--color-gold)" : "var(--color-quest-green)",
                  }}
                />
              </div>
              <div className="flex justify-between text-[17px] text-ink-muted">
                <span>{q.pct}% claimed</span>
                <span>Literature ≥ {q.literature.toLocaleString("en-US")}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between border border-cardline bg-card px-5 py-4">
                <span className="text-[20px]">Bounty reward</span>
                <b className="font-display text-[24px] text-gold">{formatXp(q.bounty)} XP</b>
              </div>
              <div className="flex items-center justify-between border border-cardline bg-card px-5 py-4">
                <span className="text-[20px]">Adventurers who tried</span>
                <b className="font-display text-[24px] text-ink">{q.adventurers}</b>
              </div>
              <button
                type="button"
                className="btn-quest p-4 text-[22px]"
                onMouseEnter={tick}
                onClick={accept}
              >
                ⚔ Accept this Quest
              </button>
            </div>
          </div>

          {/* lore, straight from mission.md's Problem section */}
          <div className="mb-7 border-l-[5px] border-divider bg-lore px-[22px] py-[18px]">
            <div className="mb-2 font-display text-[16px] tracking-[2px] text-ink-soft">
              THE CHALLENGE
            </div>
            <div className="lore-md" dangerouslySetInnerHTML={{ __html: q.loreHtml }} />
          </div>

          {/* summon your agent */}
          <div ref={summonRef} className="mb-[30px] rounded bg-darkbox px-[22px] py-5 text-callout">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="font-display text-[16px] tracking-[2px] text-gold-bright">
                SUMMON YOUR AGENT
              </span>
              <button
                type="button"
                onMouseEnter={tick}
                onClick={copy}
                className="cursor-pointer rounded-[3px] border-0 bg-gold-bright px-4 py-[7px] font-body text-[17px] text-darkbox transition-colors duration-150 hover:bg-[#f0cf6a]"
              >
                {copied ? "✓ Copied to clipboard" : "Copy prompt"}
              </button>
            </div>
            <code className="block font-mono text-[16px] leading-[1.6] text-[#d6c39a]">
              {prompt}
            </code>
          </div>

          {/* record log */}
          <div className="mb-[30px]">
            <div className="mb-3.5 font-display text-[16px] tracking-[3px] text-ink-soft">
              RECORD LOG · how the bound climbed
            </div>
            <div className="flex flex-col gap-2">
              {q.records.map((r) => (
                <div
                  key={`${r.score}-${r.author}`}
                  onMouseEnter={tick}
                  className="qrow qrow-slide grid grid-cols-[70px_44px_1fr_150px] items-center gap-3.5 px-4 py-[9px] max-md:grid-cols-[56px_40px_1fr]"
                >
                  <span className="font-display text-[26px] font-black text-ink">{r.score}</span>
                  <GithubAvatar author={r.author} size={36} border="#b89a63" />
                  <span className="text-[19px] text-ink-body">
                    {authorLabel(r.author)}
                    {r.seed && <span className="ml-2 text-[15px] italic text-ink-soft">guild seed</span>}
                  </span>
                  <span className="text-right text-[16px] text-ink-soft max-md:hidden">
                    {formatDate(r.date)}
                    {r.current && " · current"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* champions of this quest */}
          <div className="border-t-2 border-divider pt-[22px]">
            <div className="mb-3.5 font-display text-[16px] tracking-[3px] text-ink-soft">
              CHAMPIONS OF THIS QUEST
            </div>
            <div className="flex max-w-[640px] flex-col gap-2">
              {q.champions.length === 0 ? (
                <div className="py-3 text-[18px] italic text-ink-soft">
                  No adventurer has claimed this bounty yet. First blood awaits.
                </div>
              ) : (
                q.champions.map((c, i) => (
                  <div
                    key={c.author}
                    onMouseEnter={tick}
                    className="qrow grid grid-cols-[44px_44px_1fr_120px] items-center gap-3.5 px-4 py-[9px]"
                  >
                    <span className="text-center font-display text-[22px] text-medal-gold">
                      {roman(i + 1)}
                    </span>
                    <GithubAvatar author={c.author} size={36} border="#c9a227" />
                    <span className="text-[19px] text-ink-body">{authorLabel(c.author)}</span>
                    <span className="text-right text-[16px] font-bold text-gold">
                      {formatXp(c.xp)} XP
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </Sheet>
        <Footer />
      </div>
    </div>
  );
}
