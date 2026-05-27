export type BreathingPhase = "inhale" | "hold" | "exhale" | "recovery" | "rapid";

export interface BreathingStep {
  phase: BreathingPhase;
  duration: number; // seconds, 0 = user-controlled (tap to end)
  label: string;
}

export interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  steps: BreathingStep[];
  /** If true, the pattern has a special rapid-breathing phase (Wim Hof) */
  isWimHof?: boolean;
}

export type TabId = "breathe" | "meditate" | "history";

export type AmbientSound = "silence" | "rain" | "ocean" | "wind" | "forest";

export interface Session {
  id: string;
  date: string; // ISO date string
  type: "breathing" | "meditation";
  durationSeconds: number;
  pattern?: string; // breathing pattern id
}
