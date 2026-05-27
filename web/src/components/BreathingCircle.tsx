import type { BreathingPhase } from "../types";

interface Props {
  phase: BreathingPhase;
  progress: number;
  active: boolean;
}

export function BreathingCircle({ phase, progress, active }: Props) {
  // Scale: inhale grows, exhale shrinks, hold stays, rapid pulses
  let scale = 0.5;
  if (active) {
    switch (phase) {
      case "inhale":
        scale = 0.5 + progress * 0.5;
        break;
      case "exhale":
        scale = 1 - progress * 0.5;
        break;
      case "hold":
        scale = 0.85;
        break;
      case "recovery":
        scale = 0.5 + progress * 0.3;
        break;
      case "rapid":
        // Pulse at ~1Hz
        scale = 0.55 + Math.sin(progress * Math.PI * 30) * 0.15;
        break;
    }
  }

  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 95;

  return (
    <div className="flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="drop-shadow-lg"
      >
        <defs>
          <radialGradient id="breathGrad" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.08" />
          </radialGradient>
        </defs>
        <circle
          cx={cx}
          cy={cy}
          r={maxR * scale}
          fill="url(#breathGrad)"
          stroke="var(--color-accent)"
          strokeWidth="2"
          style={{
            transition: active
              ? phase === "rapid"
                ? "r 0.15s ease-in-out"
                : "r 0.8s ease-in-out"
              : "r 0.5s ease-out",
          }}
        />
        <circle
          cx={cx}
          cy={cy}
          r={maxR * scale * 0.5}
          fill="var(--color-accent)"
          opacity="0.18"
          style={{
            transition: active
              ? phase === "rapid"
                ? "r 0.15s ease-in-out"
                : "r 0.8s ease-in-out"
              : "r 0.5s ease-out",
          }}
        />
      </svg>
    </div>
  );
}
