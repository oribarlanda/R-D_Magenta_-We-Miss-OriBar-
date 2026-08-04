export interface ConnectionGroup {
  title: string;
  difficulty: string;
  hint: string;
  words: string[];
}
export interface ConnectionsData {
  attempts: number;
  groups: ConnectionGroup[];
}
export interface LogicData {
  question: string;
  answers: string[];
  hints: string[];
  explanation: string;
}
export interface ChainLink {
  answer: string;
  hint: string;
}
export interface ChainData {
  start: string;
  end: string;
  links: ChainLink[];
}
export interface SongData {
  prompt: string;
  answers: string[];
  artist: string;
  hints: string[];
}
export interface WhoAmIData {
  answer: string;
  acceptedAnswers: string[];
  clues: string[];
}
export type GameId = "connections" | "logic-easy" | "logic-hard" | "chain" | "which-song" | "who-am-i";
export interface GameScore {
  gameId: GameId;
  score: number;
  solved: boolean;
  hintsUsed: number;
  completedAt?: number;
}
export interface AppState {
  scores: Record<GameId, GameScore | null>;
  startedAt: number | null;
}
export interface GameInfo {
  id: GameId;
  title: string;
  description: string;
  icon: string;
  path: string;
}
