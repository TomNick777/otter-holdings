import React, { useEffect, useMemo, useState } from "react";
import {
  buildReplay,
  sampleReplay,
  type CampusHistory,
} from "../../domain/replay.ts";

/** Initial playback speed; visitors can pause, seek or change it. */
export const CITY_REPLAY_DEFAULT_SPEED = 2;

export function useCityReplay(history: CampusHistory) {
  const [period, setPeriod] = useState<"current" | "month" | "year">("current");
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(CITY_REPLAY_DEFAULT_SPEED);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const replay = useMemo(
    () => buildReplay(history, period === "current" ? "year" : period),
    [history, period],
  );
  useEffect(() => {
    if (!playing || period === "current") return;
    let frame = 0,
      last: number | null = null;
    const tick = (now: number) => {
      // Background tabs pause the clock rather than fast-forwarding unseen events.
      const delta =
        last === null || document.hidden ? 0 : Math.min(100, now - last);
      last = now;
      setElapsed((value) => Math.min(replay.duration, value + delta * speed));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, period, replay, speed]);
  useEffect(() => {
    if (elapsed >= replay.duration) setPlaying(false);
  }, [elapsed, replay.duration, playing]);
  const choose = (value: typeof period) => {
    setPeriod(value);
    setElapsed(0);
    if (value === "current") {
      setPlaying(false);
      return;
    }
    setSpeed(CITY_REPLAY_DEFAULT_SPEED);
    setPlaying(true);
  };
  const sample = sampleReplay(
    replay,
    period === "current" ? replay.duration : elapsed,
  );
  if (reducedMotion) sample.mix = 1;
  return {
    period,
    elapsed,
    playing,
    speed,
    replay,
    sample,
    choose,
    setSpeed,
    seek: (value: number) => {
      setPlaying(false);
      setElapsed(value);
    },
    toggle: () => {
      if (elapsed >= replay.duration) setElapsed(0);
      setPlaying((value) => !value);
    },
    restart: () => {
      setElapsed(0);
      setPlaying(true);
    },
  };
}
const PERIOD_OPTIONS = [
  ["current", "当前"],
  ["month", "本月"],
  ["year", "本年"],
] as const;

function PeriodSwitch({ c }: { c: ReturnType<typeof useCityReplay> }) {
  return (
    <div className="city-periods" role="group" aria-label="时间范围">
      {PERIOD_OPTIONS.map(([key, label]) => (
        <button
          key={key}
          type="button"
          aria-pressed={c.period === key}
          onClick={() => c.choose(key)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function CityTimeline({
  controller: c,
  minimal = false,
}: {
  controller: ReturnType<typeof useCityReplay>;
  /** Formal route: only 当前/本月/本年; replay runs automatically at default speed. */
  minimal?: boolean;
}) {
  if (minimal) {
    return (
      <section
        className="city-timeline city-timeline-minimal"
        aria-label="城市时间视图：当前、本月、本年"
      >
        <PeriodSwitch c={c} />
      </section>
    );
  }
  return (
    <section className="city-timeline" aria-label="城市时间视图">
      <div className="city-time-heading">
        <div>
          <span className="eyebrow">THE CITY THROUGH TIME</span>
          <h2>看见持仓的变化</h2>
        </div>
        <PeriodSwitch c={c} />
      </div>
      {c.period === "current" ? (
        <p className="city-time-static">
          {c.sample.date} · 当前持仓，静态展示 <span>建筑只随持仓数量变化</span>
        </p>
      ) : (
        <>
          <div className="city-playback city-playback-compact">
            <strong data-replay-date>{c.sample.date}</strong>
            <span className="city-playback-state" role="status">
              {c.elapsed >= c.replay.duration
                ? "播放完成"
                : c.playing
                  ? "播放中"
                  : "已暂停"}
            </span>
            <button onClick={c.toggle}>
              {c.playing
                ? "暂停"
                : c.elapsed >= c.replay.duration
                  ? "重播"
                  : "继续"}
            </button>
            <button onClick={c.restart}>从头播放</button>
            <label>
              倍数{" "}
              <select
                aria-label="回放倍数"
                value={c.speed}
                onChange={(e) => {
                  c.setSpeed(Number(e.target.value));
                }}
              >
                <option value={1}>1×</option>
                <option value={2}>2×</option>
                <option value={4}>4×</option>
              </select>
            </label>
          </div>
          <input
            aria-label="城市回放进度"
            type="range"
            min={0}
            max={c.replay.duration}
            step={1}
            value={c.elapsed}
            onChange={(e) => c.seek(Number(e.target.value))}
          />
          <div className="city-time-extents">
            <span>{c.replay.startDate}</span>
            <span>无变化的日期加速经过 · 拖动可查看任意阶段</span>
            <span>{c.replay.endDate}</span>
          </div>
        </>
      )}
    </section>
  );
}
