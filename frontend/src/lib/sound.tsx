import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * Tavern sound effects, generated with Web Audio — no assets.
 * tick: hover blip · chime: click · arpeggio: copy fanfare.
 * The AudioContext is created lazily and resumed on first gesture
 * (browser autoplay policy). `soundOn` gates everything.
 */
type Sound = {
  soundOn: boolean;
  toggle: () => void;
  tick: () => void;
  chime: () => void;
  arpeggio: () => void;
};

const SoundContext = createContext<Sound | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem("mission.land:sound") !== "0");
  const acRef = useRef<AudioContext | null>(null);
  const onRef = useRef(soundOn);
  onRef.current = soundOn;

  const beep = useCallback((freq: number, dur: number, type: OscillatorType, vol: number) => {
    if (!onRef.current) return;
    if (!acRef.current) {
      try {
        acRef.current = new AudioContext();
      } catch {
        return;
      }
    }
    const ac = acRef.current;
    if (ac.state === "suspended") void ac.resume();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(vol, ac.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
    o.connect(g);
    g.connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + dur + 0.02);
  }, []);

  const value = useMemo<Sound>(
    () => ({
      soundOn,
      toggle: () =>
        setSoundOn((v) => {
          localStorage.setItem("mission.land:sound", v ? "0" : "1");
          return !v;
        }),
      tick: () => beep(880, 0.05, "square", 0.03),
      chime: () => {
        beep(523, 0.09, "triangle", 0.06);
        setTimeout(() => beep(784, 0.12, "triangle", 0.06), 80);
      },
      arpeggio: () => {
        [523, 659, 784, 1047].forEach((f, i) =>
          setTimeout(() => beep(f, 0.12, "triangle", 0.05), i * 70),
        );
      },
    }),
    [soundOn, beep],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound(): Sound {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound outside SoundProvider");
  return ctx;
}
