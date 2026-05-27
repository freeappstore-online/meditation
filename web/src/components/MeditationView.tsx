import { useCallback, useState } from "react";
import { useMeditationTimer } from "../hooks/useMeditationTimer";
import { TimerRing } from "./TimerRing";
import { AmbientPicker } from "./AmbientPicker";
import { saveSession } from "../utils/storage";
import { stopAmbient } from "../utils/audio";
import { DURATION_OPTIONS } from "../utils/patterns";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const INTERVAL_OPTIONS = [0, 1, 2, 3, 5, 10, 15];

export function MeditationView() {
  const [duration, setDuration] = useState(10);
  const [customDuration, setCustomDuration] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [interval, setInterval_] = useState(0);
  const [state, actions] = useMeditationTimer();

  const handleStart = useCallback(() => {
    const dur = showCustom ? parseInt(customDuration, 10) || 10 : duration;
    actions.start(dur, interval);
  }, [duration, customDuration, showCustom, interval, actions]);

  const handleStop = useCallback(() => {
    if (state.elapsedSeconds > 5) {
      saveSession({
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        type: "meditation",
        durationSeconds: state.elapsedSeconds,
      });
    }
    actions.stop();
    stopAmbient();
  }, [state.elapsedSeconds, actions]);

  const handleDone = useCallback(() => {
    saveSession({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type: "meditation",
      durationSeconds: state.durationSeconds,
    });
    actions.stop();
    stopAmbient();
  }, [state.durationSeconds, actions]);

  const remaining = state.durationSeconds - state.elapsedSeconds;

  if (state.completed) {
    return (
      <div className="flex flex-col items-center gap-6 px-4 pb-8 pt-8">
        <TimerRing progress={1} size={220}>
          <div className="font-display text-2xl font-bold">Complete</div>
          <div className="text-sm text-[var(--color-muted)] mt-1">
            {formatTime(state.durationSeconds)}
          </div>
        </TimerRing>
        <p className="text-[var(--color-muted)] text-sm">
          Well done. Session saved.
        </p>
        <button
          onClick={handleDone}
          className="px-6 py-3 rounded-[var(--radius-btn)] bg-[var(--color-accent)] text-white font-semibold text-sm"
        >
          Done
        </button>
      </div>
    );
  }

  if (state.active) {
    return (
      <div className="flex flex-col items-center gap-6 px-4 pb-8 pt-4">
        <TimerRing progress={state.progress} size={240}>
          <div className="text-4xl font-bold tabular-nums text-[var(--color-accent)]">
            {formatTime(remaining)}
          </div>
          <div className="text-xs text-[var(--color-muted)] mt-1">remaining</div>
        </TimerRing>

        <div className="text-sm text-[var(--color-muted)]">
          Elapsed: {formatTime(state.elapsedSeconds)}
        </div>

        <div className="flex gap-3">
          <button
            onClick={state.paused ? actions.resume : actions.pause}
            className="px-6 py-3 rounded-[var(--radius-btn)] bg-[var(--color-accent)] text-white font-semibold text-sm"
          >
            {state.paused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={handleStop}
            className="px-6 py-3 rounded-[var(--radius-btn)] bg-[var(--color-panel)] text-[var(--color-ink)] font-semibold text-sm"
          >
            Stop
          </button>
        </div>

        <div className="w-full max-w-md mt-4">
          <AmbientPicker />
        </div>
      </div>
    );
  }

  // Setup screen
  return (
    <div className="flex flex-col items-center gap-6 px-4 pb-8">
      {/* Duration picker */}
      <div className="w-full max-w-md flex flex-col gap-3">
        <p className="text-sm font-medium text-[var(--color-muted)]">
          Duration (minutes)
        </p>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => {
                setDuration(d);
                setShowCustom(false);
              }}
              className="px-3 py-1.5 text-sm rounded-[var(--radius-btn)] transition-colors"
              style={{
                background:
                  !showCustom && duration === d
                    ? "var(--color-accent)"
                    : "var(--color-panel)",
                color:
                  !showCustom && duration === d ? "#fff" : "var(--color-ink)",
              }}
            >
              {d}
            </button>
          ))}
          <button
            onClick={() => setShowCustom(true)}
            className="px-3 py-1.5 text-sm rounded-[var(--radius-btn)] transition-colors"
            style={{
              background: showCustom
                ? "var(--color-accent)"
                : "var(--color-panel)",
              color: showCustom ? "#fff" : "var(--color-ink)",
            }}
          >
            Custom
          </button>
        </div>
        {showCustom && (
          <input
            type="number"
            min={1}
            max={180}
            value={customDuration}
            onChange={(e) => setCustomDuration(e.target.value)}
            placeholder="Minutes"
            className="w-24 px-3 py-2 rounded-[var(--radius-btn)] bg-[var(--color-panel)] text-[var(--color-ink)] text-sm border border-[var(--color-line)] outline-none focus:border-[var(--color-accent)]"
          />
        )}
      </div>

      {/* Interval bell */}
      <div className="w-full max-w-md flex flex-col gap-3">
        <p className="text-sm font-medium text-[var(--color-muted)]">
          Interval Bell (minutes)
        </p>
        <div className="flex flex-wrap gap-2">
          {INTERVAL_OPTIONS.map((i) => (
            <button
              key={i}
              onClick={() => setInterval_(i)}
              className="px-3 py-1.5 text-sm rounded-[var(--radius-btn)] transition-colors"
              style={{
                background:
                  interval === i ? "var(--color-accent)" : "var(--color-panel)",
                color: interval === i ? "#fff" : "var(--color-ink)",
              }}
            >
              {i === 0 ? "Off" : i}
            </button>
          ))}
        </div>
      </div>

      {/* Timer ring preview */}
      <TimerRing progress={0} size={200}>
        <div className="text-3xl font-bold tabular-nums text-[var(--color-ink)]">
          {formatTime(
            (showCustom ? parseInt(customDuration, 10) || 10 : duration) * 60
          )}
        </div>
      </TimerRing>

      {/* Start */}
      <button
        onClick={handleStart}
        className="px-8 py-3 rounded-[var(--radius-btn)] bg-[var(--color-accent)] text-white font-semibold text-sm"
      >
        Begin Meditation
      </button>

      {/* Ambient sounds */}
      <div className="w-full max-w-md mt-2">
        <AmbientPicker />
      </div>
    </div>
  );
}
