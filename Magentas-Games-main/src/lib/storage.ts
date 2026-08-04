import type { AppState, GameId, GameScore } from "@/types";

const KEY = "game-day-state";

function defaultState(): AppState {
  return {
    scores: {
      connections: null,
      "logic-easy": null,
      "logic-hard": null,
      chain: null,
      "which-song": null,
      "who-am-i": null,
    },
    startedAt: null,
  };
}

export function getState(): AppState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AppState) : defaultState();
  } catch {
    return defaultState();
  }
}

export function saveScore(score: GameScore): void {
  if (typeof window === "undefined") return;
  const state = getState();
  if (!state.startedAt) state.startedAt = Date.now();
  state.scores[score.gameId] = score;
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getTotalScore(state: AppState): number {
  return Object.values(state.scores)
    .filter(Boolean)
    .reduce((sum, s) => sum + (s?.score ?? 0), 0);
}

export function allSolved(state: AppState): boolean {
  const games: GameId[] = ["connections", "logic-easy", "logic-hard", "chain", "which-song", "who-am-i"];
  return games.every((g) => state.scores[g]?.solved);
}

export function resetState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export function calcScore(max: number, hintsUsed: number, totalHints: number): number {
  if (totalHints === 0) return max;
  return Math.round(max * (1 - (hintsUsed / totalHints) * 0.75));
}
