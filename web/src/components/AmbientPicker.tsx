import { useCallback, useState } from "react";
import type { AmbientSound } from "../types";
import {
  startAmbient,
  stopAmbient,
  setAmbientVolume,
} from "../utils/audio";

const SOUNDS: { id: AmbientSound; label: string; icon: string }[] = [
  { id: "silence", label: "Silence", icon: "—" },
  { id: "rain", label: "Rain", icon: "\u{1F327}" },
  { id: "ocean", label: "Ocean", icon: "\u{1F30A}" },
  { id: "wind", label: "Wind", icon: "\u{1F32C}" },
  { id: "forest", label: "Forest", icon: "\u{1F332}" },
];

export function AmbientPicker() {
  const [selected, setSelected] = useState<AmbientSound>("silence");
  const [volume, setVolume] = useState(0.5);

  const handleSelect = useCallback(
    (sound: AmbientSound) => {
      setSelected(sound);
      if (sound === "silence") {
        stopAmbient();
      } else {
        startAmbient(sound, volume);
      }
    },
    [volume]
  );

  const handleVolume = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseFloat(e.target.value);
      setVolume(v);
      setAmbientVolume(v);
    },
    []
  );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-[var(--color-muted)]">
        Ambient Sound
      </p>
      <div className="flex gap-2 flex-wrap">
        {SOUNDS.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSelect(s.id)}
            className="px-3 py-1.5 text-sm rounded-[var(--radius-btn)] transition-colors"
            style={{
              background:
                selected === s.id
                  ? "var(--color-accent)"
                  : "var(--color-panel)",
              color:
                selected === s.id ? "#fff" : "var(--color-ink)",
            }}
          >
            <span className="mr-1">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>
      {selected !== "silence" && (
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--color-muted)]">Vol</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={handleVolume}
            className="w-full accent-[var(--color-accent)]"
          />
        </div>
      )}
    </div>
  );
}
