import { useMemo, useState } from "react";

interface Props {
  sessionDates: Record<string, number>;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number): number {
  // 0=Mon, 6=Sun
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function Calendar({ sessionDates }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const monthLabel = useMemo(() => {
    return new Date(year, month).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, [year, month]);

  const days = useMemo(() => {
    const total = daysInMonth(year, month);
    const offset = firstDayOfMonth(year, month);
    const cells: (number | null)[] = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(d);
    return cells;
  }, [year, month]);

  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const prevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-panel)] text-[var(--color-ink)] text-sm"
        >
          &lt;
        </button>
        <span className="font-semibold text-sm">{monthLabel}</span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-panel)] text-[var(--color-ink)] text-sm"
        >
          &gt;
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] text-[var(--color-muted)] font-medium"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (d === null) {
            return <div key={`e-${i}`} />;
          }
          const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
          const count = sessionDates[dateStr] ?? 0;
          const isToday = dateStr === todayStr;

          return (
            <div
              key={dateStr}
              className="relative flex items-center justify-center h-8 text-xs rounded-md"
              style={{
                background: isToday ? "var(--color-panel)" : undefined,
              }}
            >
              <span className={count > 0 ? "font-bold" : ""}>{d}</span>
              {count > 0 && (
                <span
                  className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--color-accent)" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
