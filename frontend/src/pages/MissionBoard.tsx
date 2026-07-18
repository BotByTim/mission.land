import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Footer, Nav, Sheet } from "../components/chrome";
import { LITERATURE_BREAKTHROUGH_XP, genericAgentPrompt, missions } from "../lib/data";
import type { Mission } from "../lib/data";
import { formatNumber, useI18n, withLang } from "../lib/i18n";
import { useSound } from "../lib/sound";

function MissionCard({ q }: { q: Mission }) {
  const { tick, chime } = useSound();
  const { t, lang } = useI18n();
  return (
    <Link
      to={withLang(`/m/${q.num}`, lang)}
      onMouseEnter={tick}
      onClick={chime}
      className="qcard relative block origin-top p-5 transition-transform duration-200 ease-out hover:rotate-[1.8deg] motion-reduce:hover:rotate-0"
    >
      <div
        className="absolute -top-[11px] left-1/2 h-[22px] w-[22px] -translate-x-1/2 rounded-full shadow-[0_1px_3px_rgba(0,0,0,.4)]"
        style={{ background: q.wax }}
      />
      <div className="mb-1.5 text-center font-display text-[12px] tracking-[2px] text-ink-soft">
        {t.missionId(q.id)}
      </div>
      <h3 className="mb-3 text-center font-display text-[19px] font-bold text-ink">{q.name[lang]}</h3>
      {q.rewardMode === "completion" ? (
        <>
          <div className="flex items-baseline justify-between border-t border-dashed border-cardline pt-2 text-[19px]">
            <span>{t.tutorialBadge}</span>
            <b className="text-[24px]">{q.adventurers}</b>
          </div>
          <div className="mt-2 mb-1 text-[15px] text-ink-muted">{t.tutorialHint}</div>
          <div className="mt-3 text-center text-[17px] font-bold text-gold">
            {t.flatRewardXp(formatNumber(q.bounty, lang))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-baseline justify-between border-t border-dashed border-cardline pt-2 text-[19px]">
            <span>{t.record}</span>
            <b className="text-[24px]">{q.record}</b>
          </div>
          <div className="mt-2 mb-1 h-3 border border-divider bg-bar-track">
            <div
              className="h-full"
              style={{
                width: `${Math.min(q.pct, 100)}%`,
                background: q.literatureBroken ? "var(--color-gold)" : "var(--color-quest-green)",
              }}
            />
          </div>
          {q.literatureBroken ? (
            <div className="text-[16px] font-bold text-gold">{t.literatureRecordBroken}</div>
          ) : (
            <div className="text-[16px] text-ink-muted">
              {t.towardLiterature(q.pct, q.literature)}
            </div>
          )}
          <div className="mt-3 text-center text-[17px] font-bold text-gold">
            {t.bountyXp(formatNumber(q.bounty, lang))}
          </div>
          {!q.literatureBroken && (
            <div className="mt-1 text-center text-[13px] text-ink-soft">
              {t.literatureBonusHint(formatNumber(LITERATURE_BREAKTHROUGH_XP, lang))}
            </div>
          )}
        </>
      )}
    </Link>
  );
}

function AdventurerScroll() {
  const { t } = useI18n();
  const { tick, arpeggio } = useSound();
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prompt = genericAgentPrompt();

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const copy = () => {
    void navigator.clipboard?.writeText(prompt).catch(() => {});
    arpeggio();
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="relative mx-auto mt-[30px] max-w-[640px]">
      {/* parchment: clipped from the right, revealed as the roller travels */}
      <div
        className="scroll-paper px-10 py-6 pb-[52px] text-left transition-[clip-path] duration-[900ms] ease-out motion-reduce:transition-none"
        style={{ clipPath: open ? "inset(-24px 0 -24px 0)" : "inset(-24px 100% -24px 0)" }}
      >
        <p className="font-body text-[18px] italic leading-[1.6] text-ink-body">
          <span className="font-display not-italic text-[15px] tracking-[1.5px] text-crimson">
            {t.adventurersScroll}
          </span>{" "}
          {t.scrollInstruction}
        </p>
        <button
          type="button"
          onClick={copy}
          onMouseEnter={tick}
          className={`absolute right-5 bottom-4 cursor-pointer rounded-[3px] border-0 bg-gold-bright px-4 py-[7px] font-body text-[15px] text-darkbox transition-opacity delay-700 duration-500 hover:bg-[#f0cf6a] motion-reduce:transition-none motion-reduce:delay-0 ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {copied ? t.copiedToClipboard : t.copyToAgent}
        </button>
      </div>
      {/* left roller stays put; right roller travels, unrolling the sheet */}
      <div className="scroll-dowel left-[-9px]" />
      <div
        className="scroll-dowel transition-[left] duration-[900ms] ease-out motion-reduce:transition-none"
        style={{ left: open ? "calc(100% - 9px)" : "-9px" }}
      />
    </div>
  );
}

export default function MissionBoard() {
  const { t } = useI18n();

  return (
    <div className="bg-tavern min-h-screen">
      <div className="mx-auto max-w-[1120px] p-[26px] max-md:p-3">
        <div className="mb-[22px]">
          <Nav />
        </div>
        <Sheet>
          {/* hero */}
          <div className="mb-7 border-b-2 border-divider pb-6 text-center">
            <div className="mb-2 font-display text-[15px] tracking-[6px] text-ink-soft">
              {t.boardTitle}
            </div>
            <h1 className="mx-auto mb-3.5 font-display text-[44px] font-black leading-tight text-ink max-md:text-[30px]">
              {t.bountiesOnTheUnsolved}
            </h1>
            <p className="mx-auto max-w-[640px] text-[22px] italic text-ink-body">
              {t.heroSubtitle}
            </p>
            <AdventurerScroll />
          </div>

          {/* mission cards */}
          <div className="grid grid-cols-3 gap-[22px] max-md:grid-cols-1 max-md:gap-7">
            {missions.map((q) => (
              <MissionCard key={q.id} q={q} />
            ))}
          </div>
        </Sheet>
        <Footer />
      </div>
    </div>
  );
}
