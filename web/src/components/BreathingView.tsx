import { useCallback, useRef, useState } from "react";
import { PATTERNS } from "../utils/patterns";
import { useBreathing } from "../hooks/useBreathing";
import { BreathingCircle } from "./BreathingCircle";
import { AmbientPicker } from "./AmbientPicker";
import { saveSession } from "../utils/storage";
import { stopAmbient } from "../utils/audio";
import type { BreathingPattern } from "../types";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function BreathingView() {
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(
    PATTERNS[0]!
  );
  const [state, actions] = useBreathing(selectedPattern);
  const pausedRef = useRef(false);

  const handlePatternChange = useCallback(
    (id: string) => {
      const p = PATTERNS.find((pat) => pat.id === id);
      if (p) {
        if (state.active) actions.stop();
        setSelectedPattern(p);
      }
    },
    [state.active, actions]
  );

  const handleToggle = useCallback(() => {
    if (!state.active) {
      actions.start();
      pausedRef.current = false;
    } else if (pausedRef.current) {
      actions.resume();
      pausedRef.current = false;
    } else {
      actions.pause();
      pausedRef.current = true;
    }
  }, [state.active, actions]);

  const handleStop = useCallback(() => {
    if (state.elapsed > 5) {
      saveSession({
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        type: "breathing",
        durationSeconds: state.elapsed,
        pattern: selectedPattern.id,
      });
    }
    actions.stop();
    stopAmbient();
    pausedRef.current = false;
  }, [state.elapsed, actions, selectedPattern.id]);

  return (
    <div className="flex flex-col items-center gap-6 px-4 pb-8">
      {/* Pattern selector */}
      {!state.active && (
        <div className="w-full max-w-md flex flex-col gap-3">
          <p className="text-sm font-medium text-[var(--color-muted)]">
            Choose a Pattern
          </p>
          <div className="grid grid-cols-2 gap-2">
            {PATTERNS.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePatternChange(p.id)}
                className="text-left p-3 rounded-[var(--radius-card)] transition-colors"
                style={{
                  background:
                    selectedPattern.id === p.id
                      ? "var(--color-accent)"
                      : "var(--color-panel)",
                  color:
                    selectedPattern.id === p.id ? "#fff" : "var(--color-ink)",
                }}
              >
                <div className="font-semibold text-sm">{p.name}</div>
                <div
                  className="text-xs mt-0.5"
                  style={{
                    color:
                      selectedPattern.id === p.id
                        ? "rgba(255,255,255,0.75)"
                        : "var(--color-muted)",
                  }}
                >
                  {p.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Breathing circle */}
      <div className="mt-2">
        <BreathingCircle
          phase={state.phase}
          progress={state.phaseProgress}
          active={state.active}
        />
      </div>

      {/* Phase info */}
      <div className="text-center">
        <div className="font-display text-2xl font-bold">
          {state.active ? state.phaseLabel : selectedPattern.name}
        </div>
        {state.active && state.phaseDuration > 0 && (
          <div className="text-4xl font-bold tabular-nums mt-1 text-[var(--color-accent)]">
            {state.phaseTimeLeft}
          </div>
        )}
        {state.active && state.phaseDuration === 0 && (
          <div className="text-4xl font-bold tabular-nums mt-1 text-[var(--color-accent)]">
            {formatTime(state.holdTime)}
          </div>
        )}
        {state.active && selectedPattern.isWimHof && state.phase === "rapid" && (
          <div className="text-sm text-[var(--color-muted)] mt-1">
            Breath {state.rapidCount} / 30
          </div>
        )}
      </div>

      {/* Elapsed / cycles */}
      {state.active && (
        <div className="flex gap-6 text-sm text-[var(--color-muted)]">
          <div>
            <span className="font-medium text-[var(--color-ink)]">
              {formatTime(state.elapsed)}
            </span>{" "}
            elapsed
          </div>
          <div>
            <span className="font-medium text-[var(--color-ink)]">
              {state.cycleCount}
            </span>{" "}
            {state.cycleCount === 1 ? "cycle" : "cycles"}
          </div>
        </div>
      )}

      {/* Wim Hof tap to end hold */}
      {state.active && state.phaseDuration === 0 && (
        <button
          onClick={actions.tapHold}
          className="px-6 py-3 rounded-[var(--radius-btn)] bg-[var(--color-accent)] text-white font-semibold text-sm"
        >
          Tap to End Hold
        </button>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={handleToggle}
          className="px-6 py-3 rounded-[var(--radius-btn)] font-semibold text-sm transition-colors"
          style={{
            background: "var(--color-accent)",
            color: "#fff",
          }}
        >
          {!state.active ? "Start" : pausedRef.current ? "Resume" : "Pause"}
        </button>
        {state.active && (
          <button
            onClick={handleStop}
            className="px-6 py-3 rounded-[var(--radius-btn)] font-semibold text-sm bg-[var(--color-panel)] text-[var(--color-ink)]"
          >
            Stop
          </button>
        )}
      </div>

      {/* Ambient sounds */}
      <div className="w-full max-w-md mt-4">
        <AmbientPicker />
      </div>
    </div>
  );
}
