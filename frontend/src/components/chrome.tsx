import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { REPO_URL } from "../lib/data";
import { LANGS, LANG_LABELS, useI18n, withLang, type Lang } from "../lib/i18n";
import { useSound } from "../lib/sound";

export function Nav({ back }: { back?: boolean }) {
  const { tick, chime, soundOn, toggle } = useSound();
  const { lang, setLang, t } = useI18n();
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!langOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (!langRef.current?.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [langOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  return (
    <div className="flex items-center justify-between px-1 text-ondark">
      {back ? (
        <Link
          to={withLang("/", lang)}
          className="text-[19px] text-ondark"
          onMouseEnter={tick}
          onClick={chime}
        >
          {t.backToBoard}
        </Link>
      ) : (
        <Link
          to={withLang("/", lang)}
          className="font-display text-[22px] font-black uppercase tracking-[1px] text-ondark"
          onMouseEnter={tick}
          onClick={chime}
        >
          mission.land
        </Link>
      )}

      <div ref={navRef} className="relative">
        <button
          type="button"
          onClick={() => {
            setMenuOpen((v) => !v);
            chime();
          }}
          onMouseEnter={tick}
          aria-label="Menu"
          aria-expanded={menuOpen}
          className="hidden cursor-pointer rounded border border-ondark-soft/40 px-3 py-1 text-[18px] leading-none text-ondark-soft hover:text-ondark max-md:block"
        >
          ☰
        </button>

        <nav
          className={`items-center gap-6 text-[17px] tracking-[.5px] max-md:absolute max-md:right-0 max-md:top-full max-md:z-20 max-md:mt-2 max-md:min-w-[190px] max-md:flex-col max-md:items-stretch max-md:gap-1 max-md:rounded max-md:border max-md:border-divider max-md:bg-card max-md:p-3 max-md:text-ink-body max-md:shadow-lg ${
            menuOpen ? "flex" : "flex max-md:hidden"
          }`}
        >
          <Link
            to={withLang("/leaderboard", lang)}
            onMouseEnter={tick}
            onClick={() => setMenuOpen(false)}
            className="max-md:rounded max-md:px-2 max-md:py-1.5 max-md:hover:bg-card-hover"
          >
            {t.leaderboard}
          </Link>
          <a
            href={REPO_URL}
            onMouseEnter={tick}
            className="max-md:rounded max-md:px-2 max-md:py-1.5 max-md:hover:bg-card-hover"
          >
            {t.github}
          </a>
          <div ref={langRef} className="relative max-md:px-2 max-md:py-1">
            <button
              type="button"
              onClick={() => {
                setLangOpen((v) => !v);
                chime();
              }}
              onMouseEnter={tick}
              className="cursor-pointer rounded border border-ondark-soft/40 px-2 py-0.5 text-[14px] text-ondark-soft hover:text-ondark max-md:border-divider max-md:text-ink-soft"
            >
              {LANG_LABELS[lang]} ▾
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 flex min-w-[110px] flex-col overflow-hidden rounded border border-divider bg-card shadow-lg">
                {LANGS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => {
                      setLang(l);
                      setLangOpen(false);
                      setMenuOpen(false);
                      chime();
                    }}
                    onMouseEnter={tick}
                    className={`cursor-pointer px-3 py-2 text-left text-[15px] ${
                      l === lang
                        ? "bg-gold-bright/20 font-semibold text-ink"
                        : "text-ink-body hover:bg-card-hover"
                    }`}
                  >
                    {LANG_LABELS[l as Lang]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="max-md:px-2 max-md:py-1">
            <button
              type="button"
              onClick={() => {
                toggle();
                chime();
              }}
              onMouseEnter={tick}
              title={soundOn ? t.mute : t.unmute}
              className="cursor-pointer rounded border border-ondark-soft/40 px-2 py-0.5 text-[14px] text-ondark-soft hover:text-ondark max-md:border-divider max-md:text-ink-soft"
            >
              {soundOn ? t.soundOn : t.soundOff}
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}

export function Sheet({ children }: { children: ReactNode }) {
  return <div className="sheet px-11 py-10 max-md:px-5 max-md:py-6">{children}</div>;
}

export function Footer() {
  const { t } = useI18n();
  return (
    <div className="mt-[18px] text-center text-[17px] italic text-ondark-soft">
      {t.footer}
    </div>
  );
}

export function GithubAvatar({
  author,
  size,
  border,
}: {
  author: string;
  size: number;
  border: string;
}) {
  const isAgent = author.startsWith("agent://") || author.endsWith("-baseline");
  if (isAgent) {
    return (
      <div
        className="flex items-center justify-center rounded-full font-display text-[16px] text-ink"
        style={{
          width: size,
          height: size,
          border: `2px solid ${border}`,
          background: "repeating-linear-gradient(45deg,#c8ad78 0 5px,#b89a63 5px 10px)",
        }}
      >
        ⚙
      </div>
    );
  }
  return (
    <img
      src={`https://github.com/${author}.png?size=${size * 2}`}
      alt={author}
      loading="lazy"
      className="rounded-full object-cover bg-bar-track"
      style={{ width: size, height: size, border: `2px solid ${border}` }}
    />
  );
}

export function authorLabel(author: string): string {
  return author.startsWith("agent://") || author.endsWith("-baseline") ? author : `@${author}`;
}
