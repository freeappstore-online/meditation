import type { Session } from "../types";

const STORAGE_KEY = "meditation_sessions";

export function loadSessions(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Session[];
  } catch {
    return [];
  }
}

export function saveSession(session: Session): void {
  const sessions = loadSessions();
  sessions.push(session);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function clearSessions(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ---- Stats ----

export interface Stats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function computeStats(sessions: Session[]): Stats {
  const totalSessions = sessions.length;
  const totalMinutes = Math.round(
    sessions.reduce((acc, s) => acc + s.durationSeconds, 0) / 60
  );

  // Unique dates with sessions
  const datesSet = new Set(sessions.map((s) => s.date.slice(0, 10)));
  const dates = [...datesSet].sort();

  let currentStreak = 0;
  let longestStreak = 0;

  if (dates.length > 0) {
    // Walk backwards from today
    const today = new Date();
    let checkDate = toDateStr(today);
    let streak = 0;

    // Allow today or yesterday to start the streak
    if (!datesSet.has(checkDate)) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      checkDate = toDateStr(yesterday);
    }

    const d = new Date(checkDate + "T00:00:00");
    while (datesSet.has(toDateStr(d))) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    currentStreak = streak;

    // Longest streak from sorted dates
    let run = 1;
    longestStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1]! + "T00:00:00");
      const curr = new Date(dates[i]! + "T00:00:00");
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        run++;
        longestStreak = Math.max(longestStreak, run);
      } else if (diff > 1) {
        run = 1;
      }
    }
  }

  return { totalSessions, totalMinutes, currentStreak, longestStreak };
}

/** Returns an array of 7 entries (Mon-Sun) with total minutes for each day of the current week */
export function weeklyMinutes(sessions: Session[]): number[] {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const result = [0, 0, 0, 0, 0, 0, 0];

  for (const s of sessions) {
    const d = new Date(s.date);
    const diff = Math.floor(
      (d.getTime() - monday.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff >= 0 && diff < 7) {
      result[diff] = (result[diff] ?? 0) + Math.round(s.durationSeconds / 60);
    }
  }

  return result;
}

/** Returns a map of "YYYY-MM-DD" -> session count for calendar display */
export function sessionsByDate(
  sessions: Session[]
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const s of sessions) {
    const key = s.date.slice(0, 10);
    map[key] = (map[key] ?? 0) + 1;
  }
  return map;
}
