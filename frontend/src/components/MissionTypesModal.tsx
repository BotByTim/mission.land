import { useEffect } from "react";
import { MISSION_TYPES, type MissionTypeKey } from "../lib/data";
import { useI18n } from "../lib/i18n";

/** The catalog of mission types — what mission.land can pose today and what's on
 *  the roadmap. Opened by tapping a mission's seal; the mission's own type is
 *  highlighted. */
export function MissionTypesModal({
  currentKey,
  onClose,
}: {
  currentKey?: MissionTypeKey;
  onClose: () => void;
}) {
  const { t } = useI18n();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const groups = [
    { supported: true, label: t.missionTypesSupported },
    { supported: false, label: t.missionTypesPlanned },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-5 pt-[8vh]"
      onClick={onClose}
    >
      <div
        className="qcard max-h-[80vh] w-full max-w-[620px] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="font-display text-[22px] font-black text-ink">
            {t.missionTypesHeading}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer border-0 bg-transparent text-[26px] leading-none text-ink-soft hover:text-ink"
          >
            ×
          </button>
        </div>

        {groups.map(({ supported, label }) => (
          <div key={label} className="mb-5 last:mb-0">
            <div className="mb-2 font-display text-[13px] tracking-[2px] text-ink-soft">{label}</div>
            <div className="flex flex-col gap-2">
              {MISSION_TYPES.filter((tp) => tp.supported === supported).map((tp) => {
                const info = t.missionTypes[tp.key];
                const isCurrent = tp.key === currentKey;
                return (
                  <div
                    key={tp.key}
                    className={`flex items-start gap-3 rounded border px-3 py-2.5 ${
                      isCurrent ? "border-crimson/50 bg-lore" : "border-cardline bg-card"
                    } ${supported ? "" : "opacity-75"}`}
                  >
                    <span
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-[10px] font-black leading-none text-[#f7dede]"
                      style={{ background: tp.accent }}
                    >
                      {info.short}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-display text-[16px] font-bold text-ink">
                          {info.name}
                        </span>
                        {isCurrent && (
                          <span className="rounded-[3px] border border-crimson/40 px-1.5 py-0.5 text-[11px] text-crimson">
                            {t.missionTypeCurrent}
                          </span>
                        )}
                      </div>
                      <div className="text-[14px] leading-[1.45] text-ink-body">{info.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
