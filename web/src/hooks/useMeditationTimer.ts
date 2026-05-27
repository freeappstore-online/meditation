import { useCallback, useEffect, useRef, useState } from "react";
import { playBell, playIntervalBell } from "../utils/audio";

export interface MeditationTimerState {
  active: boolean;
  paused: boolean;
  durationSeconds: number;
  elapsedSeconds: number;
  /** 0-1 progress */
  progress: number;
  completed: boolean;
}

interface Actions {
  start: (durationMinutes: number, intervalMinutes: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

const INITIAL: MeditationTimerState = {
  active: false,
  paused: false,
  durationSeconds: 0,
  elapsedSeconds: 0,
  progress: 0,
  completed: false,
};

export function useMeditationTimer(): [MeditationTimerState, Actions] {
  const [state, setState] = useState<MeditationTimerState>(INITIAL);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const intervalSecsRef = useRef(0);
  const lastBellRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  const start = useCallback(
    (durationMinutes: number, intervalMinutes: number) => {
      clearTimer();
      const durSecs = durationMinutes * 60;
      intervalSecsRef.current =
        intervalMinutes > 0 ? intervalMinutes * 60 : 0;
      lastBellRef.current = 0;

      setState({
        active: true,
        paused: false,
        durationSeconds: durSecs,
        elapsedSeconds: 0,
        progress: 0,
        completed: false,
      });

      timerRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.paused) return prev;

          const elapsed = prev.elapsedSeconds + 1;
          const progress = prev.durationSeconds > 0
            ? elapsed / prev.durationSeconds
            : 0;

          // Interval bell
          if (
            intervalSecsRef.current > 0 &&
            elapsed - lastBellRef.current >= intervalSecsRef.current &&
            elapsed < prev.durationSeconds
          ) {
            lastBellRef.current = elapsed;
            playIntervalBell();
          }

          // Completed
          if (elapsed >= prev.durationSeconds) {
            clearTimer();
            playBell();
            return {
              ...prev,
              elapsedSeconds: prev.durationSeconds,
              progress: 1,
              completed: true,
            };
          }

          return {
            ...prev,
            elapsedSeconds: elapsed,
            progress,
          };
        });
      }, 1000);
    },
    [clearTimer]
  );

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, paused: true }));
  }, []);

  const resume = useCallback(() => {
    setState((prev) => ({ ...prev, paused: false }));
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    setState(INITIAL);
  }, [clearTimer]);

  return [state, { start, pause, resume, stop }];
}
