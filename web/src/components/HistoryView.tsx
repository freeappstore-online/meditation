import { useMemo } from "react";
import {
  loadSessions,
  computeStats,
  weeklyMinutes,
  sessionsByDate,
} from "../utils/storage";
import { Calendar } from "./Calendar";
import { WeeklyChart } from "./WeeklyChart";

export function HistoryView() {
  const sessions = useMemo(() => loadSessions(), []);
  const stats = useMemo(() => computeStats(sessions), [sessions]);
  const weekly = useMemo(() => weeklyMinutes(sessions), [sessions]);
  const dateMap = useMemo(() => sessionsByDate(sessions), [sessions]);

  return (
    <div className="flex flex-col items-center gap-6 px-4 pb-8">
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        <StatCard label="Sessions" value={stats.totalSessions} />
        <StatCard label="Minutes" value={stats.totalMinutes} />
        <StatCard label="Current Streak" value={`${stats.currentStreak}d`} />
        <StatCard label="Longest Streak" value={`${stats.longestStreak}d`} />
      </div>

      {/* Weekly chart */}
      <div className="w-full max-w-md">
        <p className="text-sm font-medium text-[var(--color-muted)] mb-2">
          This Week
        </p>
        <div className="bg-[var(--color-panel)] rounded-[var(--radius-card)] p-4">
          <WeeklyChart data={weekly} />
        </div>
      </div>

      {/* Calendar */}
      <div className="w-full max-w-md">
        <p className="text-sm font-medium text-[var(--color-muted)] mb-2">
          Calendar
        </p>
        <div className="bg-[var(--color-panel)] rounded-[var(--radius-card)] p-4 flex justify-center">
          <Calendar sessionDates={dateMap} />
        </div>
      </div>

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <div className="w-full max-w-md">
          <p className="text-sm font-medium text-[var(--color-muted)] mb-2">
            Recent Sessions
          </p>
          <div className="flex flex-col gap-2">
            {sessions
              .slice()
              .reverse()
              .slice(0, 20)
              .map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between bg-[var(--color-panel)] rounded-[var(--radius-btn)] px-3 py-2"
                >
                  <div>
                    <div className="text-sm font-medium capitalize">
                      {s.type}
                      {s.pattern ? ` - ${s.pattern}` : ""}
                    </div>
                    <div className="text-xs text-[var(--color-muted)]">
                      {new Date(s.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="text-sm font-semibold tabular-nums">
                    {Math.floor(s.durationSeconds / 60)}m{" "}
                    {s.durationSeconds % 60}s
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && (
        <p className="text-[var(--color-muted)] text-sm text-center mt-4">
          No sessions yet. Start breathing or meditating to build your history.
        </p>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-[var(--color-panel)] rounded-[var(--radius-card)] p-4 flex flex-col items-center">
      <div className="text-2xl font-bold text-[var(--color-accent)] tabular-nums">
        {value}
      </div>
      <div className="text-xs text-[var(--color-muted)] mt-1">{label}</div>
    </div>
  );
}
