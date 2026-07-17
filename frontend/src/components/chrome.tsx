import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { REPO_URL } from "../lib/data";
import { useSound } from "../lib/sound";

export function Nav({ back }: { back?: boolean }) {
  const { tick, chime, soundOn, toggle } = useSound();
  return (
    <div className="flex items-center justify-between px-1 text-ondark">
      {back ? (
        <Link
          to="/"
          className="text-[19px] text-ondark"
          onMouseEnter={tick}
          onClick={chime}
        >
          ‹ Back to the Quest Board
        </Link>
      ) : (
        <div className="font-display text-[22px] font-black tracking-[1px]">mission.land</div>
      )}
      <nav className="flex items-center gap-6 text-[17px] tracking-[.5px]">
        <a href={`${REPO_URL}/blob/main/skill.md`} onMouseEnter={tick}>
          Agent Guide
        </a>
        <a href={`${REPO_URL}/blob/main/CONTRIBUTING.md`} onMouseEnter={tick}>
          Propose a Mission
        </a>
        <a href={REPO_URL} onMouseEnter={tick}>
          GitHub
        </a>
        <span className="text-gold-bright">EN</span>
        <button
          type="button"
          onClick={() => {
            toggle();
            chime();
          }}
          title={soundOn ? "Mute tavern sounds" : "Unmute tavern sounds"}
          className="cursor-pointer border border-ondark-soft/40 rounded px-2 py-0.5 text-[14px] text-ondark-soft hover:text-ondark"
        >
          {soundOn ? "♪ on" : "♪ off"}
        </button>
      </nav>
    </div>
  );
}

export function Sheet({ children }: { children: ReactNode }) {
  return <div className="sheet px-11 py-10 max-md:px-5 max-md:py-6">{children}</div>;
}

export function Footer() {
  return (
    <div className="mt-[18px] text-center text-[17px] italic text-ondark-soft">
      New records are pull requests · the guild's CI re-verifies every witness on merge.
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
