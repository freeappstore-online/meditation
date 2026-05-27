import { useState } from "react";
import type { TabId } from "./types";
import { BreathingView } from "./components/BreathingView";
import { MeditationView } from "./components/MeditationView";
import { HistoryView } from "./components/HistoryView";

const TABS: { id: TabId; label: string }[] = [
  { id: "breathe", label: "Breathe" },
  { id: "meditate", label: "Meditate" },
  { id: "history", label: "History" },
];

export function App() {
  const [tab, setTab] = useState<TabId>("breathe");

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-center justify-center pt-6 pb-2 px-4">
        <h1 className="font-display text-xl font-bold tracking-tight">
          Meditation
        </h1>
      </header>

      {/* Tab bar */}
      <nav className="flex px-4 gap-1 mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-2 text-sm font-semibold rounded-[var(--radius-btn)] transition-colors"
            style={{
              background:
                tab === t.id ? "var(--color-accent)" : "var(--color-panel)",
              color: tab === t.id ? "#fff" : "var(--color-muted)",
            }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        {tab === "breathe" && <BreathingView />}
        {tab === "meditate" && <MeditationView />}
        {tab === "history" && <HistoryView />}
      </main>
    </div>
  );
}
