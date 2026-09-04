import { Chess, Square } from 'chess.js';
import { AIDifficulty, PieceColor } from '../types/chess';

// Piece Values
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece Square Tables (From White's perspective, row 0 = rank 8, row 7 = rank 1)
const PAWN_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [ 5,  5, 10, 27, 27, 10,  5,  5],
  [ 0,  0,  0, 25, 25,  0,  0,  0],
  [ 5, -5,-10,  0,  0,-10, -5,  5],
  [ 5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_TABLE = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_TABLE = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [ -5,  0,  5,  5,  5,  5,  0, -5],
  [  0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_MIDGAME_TABLE = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [ 20, 20,  0,  0,  0,  0, 20, 20],
  [ 20, 30, 10,  0,  0, 10, 30, 20]
];

function evaluatePosition(game: Chess): number {
  let totalEval = 0;
  const board = game.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      let pieceVal = PIECE_VALUES[piece.type] || 0;
      let pstVal = 0;

      // Flip rank for black
      const rankIdx = piece.color === 'w' ? r : 7 - r;
      const colIdx = c;

      switch (piece.type) {
        case 'p': pstVal = PAWN_TABLE[rankIdx][colIdx]; break;
        case 'n': pstVal = KNIGHT_TABLE[rankIdx][colIdx]; break;
        case 'b': pstVal = BISHOP_TABLE[rankIdx][colIdx]; break;
        case 'r': pstVal = ROOK_TABLE[rankIdx][colIdx]; break;
        case 'q': pstVal = QUEEN_TABLE[rankIdx][colIdx]; break;
        case 'k': pstVal = KING_MIDGAME_TABLE[rankIdx][colIdx]; break;
      }

      const score = pieceVal + pstVal;
      if (piece.color === 'w') {
        totalEval += score;
      } else {
        totalEval -= score;
      }
    }
  }

  return totalEval;
}

// Order moves: Captures first, then checks, then normal
function orderMoves(game: Chess, moves: ReturnType<typeof game.moves>): ReturnType<typeof game.moves> {
  return moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (typeof a !== 'string') {
      if (a.captured) scoreA += 1000 + (PIECE_VALUES[a.captured] || 0) - (PIECE_VALUES[a.piece] || 0);
      if (a.san.includes('+')) scoreA += 500;
      if (a.promotion) scoreA += 800;
    }
    if (typeof b !== 'string') {
      if (b.captured) scoreB += 1000 + (PIECE_VALUES[b.captured] || 0) - (PIECE_VALUES[b.piece] || 0);
      if (b.san.includes('+')) scoreB += 500;
      if (b.promotion) scoreB += 800;
    }

    return scoreB - scoreA;
  });
}

function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  nodesCount: { count: number }
): number {
  nodesCount.count++;

  if (depth === 0 || game.isGameOver()) {
    if (game.isCheckmate()) {
      return isMaximizing ? -99999 + (5 - depth) : 99999 - (5 - depth);
    }
    if (game.isDraw()) return 0;
    return evaluatePosition(game);
  }

  const moves = orderMoves(game, game.moves({ verbose: true }));

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evalVal = minimax(game, depth - 1, alpha, beta, false, nodesCount);
      game.undo();
      maxEval = Math.max(maxEval, evalVal);
      alpha = Math.max(alpha, evalVal);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evalVal = minimax(game, depth - 1, alpha, beta, true, nodesCount);
      game.undo();
      minEval = Math.min(minEval, evalVal);
      beta = Math.min(beta, evalVal);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function computeBestMove(fen: string, difficulty: AIDifficulty): { from: string; to: string; promotion?: string; eval: number; nodes: number } {
  const game = new Chess(fen);
  const moves = game.moves({ verbose: true });

  if (moves.length === 0) {
    return { from: '', to: '', eval: 0, nodes: 0 };
  }

  let searchDepth = 3;
  let noiseLevel = 0;

  switch (difficulty) {
    case 'beginner':
      searchDepth = 1;
      noiseLevel = 150; // add randomness
      break;
    case 'intermediate':
      searchDepth = 3;
      noiseLevel = 30;
      break;
    case 'advanced':
      searchDepth = 4;
      noiseLevel = 0;
      break;
    case 'expert':
      searchDepth = 5;
      noiseLevel = 0;
      break;
  }

  const isMaximizing = game.turn() === 'w';
  let bestMove = moves[Math.floor(Math.random() * moves.length)];
  let bestValue = isMaximizing ? -Infinity : Infinity;
  const nodesCount = { count: 0 };

  const ordered = orderMoves(game, moves);

  for (const move of ordered) {
    game.move(move);
    let evalVal = minimax(game, searchDepth - 1, -Infinity, Infinity, !isMaximizing, nodesCount);
    game.undo();

    // Add noise for beginner/intermediate
    if (noiseLevel > 0) {
      evalVal += (Math.random() * 2 - 1) * noiseLevel;
    }

    if (isMaximizing) {
      if (evalVal > bestValue) {
        bestValue = evalVal;
        bestMove = move;
      }
    } else {
      if (evalVal < bestValue) {
        bestValue = evalVal;
        bestMove = move;
      }
    }
  }

  return {
    from: bestMove.from,
    to: bestMove.to,
    promotion: bestMove.promotion || 'q',
    eval: bestValue / 100, // convert to pawn units (+1.5, etc)
    nodes: nodesCount.count,
  };
}

// Support Web Worker messaging environment
if (typeof self !== 'undefined' && 'addEventListener' in self) {
  self.addEventListener('message', (e: MessageEvent) => {
    const { fen, difficulty } = e.data;
    if (fen && difficulty) {
      const result = computeBestMove(fen, difficulty);
      self.postMessage(result);
    }
  });
}
