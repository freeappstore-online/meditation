import { useCallback, useEffect, useRef, useState } from "react";
import type { BreathingPattern, BreathingPhase } from "../types";

export interface BreathingState {
  active: boolean;
  phase: BreathingPhase;
  phaseLabel: string;
  phaseTimeLeft: number;
  phaseDuration: number;
  elapsed: number;
  cycleCount: number;
  /** For Wim Hof: rapid breath count */
  rapidCount: number;
  /** For Wim Hof hold: total hold time (counts up) */
  holdTime: number;
  /** 0-1 progress through current phase (for animation) */
  phaseProgress: number;
}

interface Actions {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  /** Tap to end user-controlled hold (Wim Hof) */
  tapHold: () => void;
}

const INITIAL_STATE: BreathingState = {
  active: false,
  phase: "inhale",
  phaseLabel: "Ready",
  phaseTimeLeft: 0,
  phaseDuration: 0,
  elapsed: 0,
  cycleCount: 0,
  rapidCount: 0,
  holdTime: 0,
  phaseProgress: 0,
};

export function useBreathing(pattern: BreathingPattern): [BreathingState, Actions] {
  const [state, setState] = useState<BreathingState>(INITIAL_STATE);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const patternRef = useRef(pattern);
  patternRef.current = pattern;

  const stepIndexRef = useRef(0);
  const pausedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const advanceStep = useCallback(() => {
    const p = patternRef.current;
    const nextIdx = (stepIndexRef.current + 1) % p.steps.length;
    const isNewCycle = nextIdx === 0;
    stepIndexRef.current = nextIdx;

    const step = p.steps[nextIdx];
    if (!step) return;

    setState((prev) => ({
      ...prev,
      phase: step.phase,
      phaseLabel: step.label,
      phaseTimeLeft: step.duration,
      phaseDuration: step.duration,
      phaseProgress: 0,
      cycleCount: isNewCycle ? prev.cycleCount + 1 : prev.cycleCount,
      rapidCount: step.phase === "rapid" ? 0 : prev.rapidCount,
      holdTime: 0,
    }));
  }, []);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  const start = useCallback(() => {
    clearTimer();
    stepIndexRef.current = 0;
    pausedRef.current = false;

    const step = patternRef.current.steps[0];
    if (!step) return;

    setState({
      active: true,
      phase: step.phase,
      phaseLabel: step.label,
      phaseTimeLeft: step.duration,
      phaseDuration: step.duration,
      elapsed: 0,
      cycleCount: 0,
      rapidCount: 0,
      holdTime: 0,
      phaseProgress: 0,
    });

    timerRef.current = setInterval(() => {
      if (pausedRef.current) return;

      setState((prev) => {
        const step = patternRef.current.steps[stepIndexRef.current];
        if (!step) return prev;

        const elapsed = prev.elapsed + 1;

        // User-controlled hold (Wim Hof): counts up
        if (step.duration === 0) {
          return {
            ...prev,
            elapsed,
            holdTime: prev.holdTime + 1,
            phaseProgress: 0,
          };
        }

        // Rapid breathing: count breaths (one every 2s)
        if (step.phase === "rapid") {
          const newRapid =
            elapsed > 0 && elapsed % 2 === 0
              ? prev.rapidCount + 1
              : prev.rapidCount;
          const timeLeft = Math.max(0, prev.phaseTimeLeft - 1);
          const progress =
            step.duration > 0 ? 1 - timeLeft / step.duration : 0;

          if (timeLeft <= 0) {
            // Auto-advance from rapid phase
            setTimeout(() => advanceStep(), 0);
            return { ...prev, elapsed, rapidCount: newRapid, phaseProgress: 1 };
          }

          return {
            ...prev,
            elapsed,
            phaseTimeLeft: timeLeft,
            rapidCount: newRapid,
            phaseProgress: progress,
          };
        }

        const timeLeft = Math.max(0, prev.phaseTimeLeft - 1);
        const progress =
          step.duration > 0 ? 1 - timeLeft / step.duration : 0;

        if (timeLeft <= 0) {
          setTimeout(() => advanceStep(), 0);
          return { ...prev, elapsed, phaseTimeLeft: 0, phaseProgress: 1 };
        }

        return {
          ...prev,
          elapsed,
          phaseTimeLeft: timeLeft,
          phaseProgress: progress,
        };
      });
    }, 1000);
  }, [clearTimer, advanceStep]);

  const pause = useCallback(() => {
    pausedRef.current = true;
    setState((prev) => ({ ...prev }));
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    pausedRef.current = false;
    setState(INITIAL_STATE);
  }, [clearTimer]);

  const tapHold = useCallback(() => {
    const step = patternRef.current.steps[stepIndexRef.current];
    if (step && step.duration === 0) {
      advanceStep();
    }
  }, [advanceStep]);

  return [state, { start, pause, resume, stop, tapHold }];
}
