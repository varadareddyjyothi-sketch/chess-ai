export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface Move {
  from: string;
  to: string;
  promotion?: PieceType;
  san?: string;
  captured?: PieceType;
  piece?: PieceType;
  color?: PieceColor;
  flags?: string;
}

export type AIDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface AIOpponent {
  id: string;
  name: string;
  rating: number;
  avatar: string;
  difficulty: AIDifficulty;
  description: string;
  depth: number;
  style: string;
}

export type TimeControlPreset = '1+0' | '3+2' | '5+0' | '10+0' | '15+10' | 'unlimited';

export interface GameSettings {
  timeControl: TimeControlPreset;
  playerColor: PieceColor | 'random';
  boardTheme: 'emerald' | 'wood' | 'glass' | 'slate';
  pieceStyle: 'standard' | 'classic' | 'modern';
  soundEnabled: boolean;
  soundVolume: number;
  showLegalMoves: boolean;
  autoQueen: boolean;
  theme: 'dark' | 'light' | 'system';
  reducedMotion: boolean;
}

export type MoveQuality = 'brilliant' | 'great' | 'best' | 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';

export interface AnalyzedMove {
  moveNumber: number;
  color: PieceColor;
  san: string;
  fenBefore: string;
  fenAfter: string;
  evalBefore: number;
  evalAfter: number;
  quality: MoveQuality;
  comment?: string;
  bestAlternative?: string;
}

export interface GameAnalysisResult {
  whiteAccuracy: number;
  blackAccuracy: number;
  whiteBrilliances: number;
  whiteBlunders: number;
  whiteMistakes: number;
  whiteInaccuracies: number;
  blackBrilliances: number;
  blackBlunders: number;
  blackMistakes: number;
  blackInaccuracies: number;
  moves: AnalyzedMove[];
  evalTimeline: number[];
}

export interface LessonStep {
  id: string;
  instruction: string;
  fen: string;
  highlightSquares?: string[];
  arrowFrom?: string;
  arrowTo?: string;
  targetMove?: string;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  category: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  estimatedMinutes: number;
  iconName: string;
  steps: LessonStep[];
}

export interface ChessPuzzle {
  id: string;
  title: string;
  rating: number;
  fen: string;
  solution: string[];
  description: string;
  tacticalMotif: string;
  hint: string;
}

export interface GameHistoryItem {
  id: string;
  date: string;
  opponentName: string;
  opponentRating: number;
  opponentAvatar?: string;
  mode: 'ai' | 'offline_pvp' | 'online_pvp';
  userColor: PieceColor;
  result: 'win' | 'loss' | 'draw';
  reason: string;
  movesCount: number;
  durationSeconds: number;
  pgn: string;
  fenHistory: string[];
  ratingChange: number;
}

export interface UserProfile {
  username: string;
  blitzElo: number;
  rapidElo: number;
  aiElo: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
  puzzlesSolved: number;
  puzzleRating: number;
  lessonsCompleted: string[];
}
