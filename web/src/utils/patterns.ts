import type { BreathingPattern } from "../types";

export const PATTERNS: BreathingPattern[] = [
  {
    id: "box",
    name: "Box Breathing",
    description: "4-4-4-4 — calm and focused",
    steps: [
      { phase: "inhale", duration: 4, label: "Inhale" },
      { phase: "hold", duration: 4, label: "Hold" },
      { phase: "exhale", duration: 4, label: "Exhale" },
      { phase: "hold", duration: 4, label: "Hold" },
    ],
  },
  {
    id: "relaxation",
    name: "4-7-8 Relaxation",
    description: "Deep relaxation technique",
    steps: [
      { phase: "inhale", duration: 4, label: "Inhale" },
      { phase: "hold", duration: 7, label: "Hold" },
      { phase: "exhale", duration: 8, label: "Exhale" },
    ],
  },
  {
    id: "wimhof",
    name: "Wim Hof",
    description: "30 rapid breaths, hold, recover",
    isWimHof: true,
    steps: [
      { phase: "rapid", duration: 60, label: "Rapid Breaths" },
      { phase: "hold", duration: 0, label: "Hold (tap when done)" },
      { phase: "recovery", duration: 15, label: "Recovery Breath" },
    ],
  },
  {
    id: "deep",
    name: "Simple Deep Breathing",
    description: "5-5 — gentle and simple",
    steps: [
      { phase: "inhale", duration: 5, label: "Inhale" },
      { phase: "exhale", duration: 5, label: "Exhale" },
    ],
  },
];

export const DURATION_OPTIONS = [1, 3, 5, 10, 15, 20, 30, 45, 60];
