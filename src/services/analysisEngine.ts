import { Chess } from 'chess.js';
import { AnalyzedMove, GameAnalysisResult, MoveQuality, PieceColor } from '../types/chess';
import { computeBestMove } from '../workers/aiWorker';

export class AnalysisEngineService {
  /**
   * Analyzes an array of FENs or SAN moves and evaluates accuracy & blunders.
   */
  public analyzeGame(fenHistory: string[], movesSan: string[]): GameAnalysisResult {
    const analyzedMoves: AnalyzedMove[] = [];
    const evalTimeline: number[] = [];

    let whiteAccuracySum = 0;
    let whiteMoveCount = 0;
    let blackAccuracySum = 0;
    let blackMoveCount = 0;

    let whiteBrilliances = 0;
    let whiteBlunders = 0;
    let whiteMistakes = 0;
    let whiteInaccuracies = 0;

    let blackBrilliances = 0;
    let blackBlunders = 0;
    let blackMistakes = 0;
    let blackInaccuracies = 0;

    let currentEval = 0;
    evalTimeline.push(0);

    for (let i = 0; i < movesSan.length; i++) {
      const fenBefore = fenHistory[i] || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const fenAfter = fenHistory[i + 1] || fenBefore;
      const san = movesSan[i];

      const gameBefore = new Chess(fenBefore);
      const color = gameBefore.turn() as PieceColor;

      // Compute evaluation before & after move using local search
      const evalBeforeRes = computeBestMove(fenBefore, 'intermediate');
      const evalAfterRes = computeBestMove(fenAfter, 'intermediate');

      const evalBefore = evalBeforeRes.eval;
      const evalAfter = evalAfterRes.eval;

      const evalDelta = color === 'w' ? evalAfter - evalBefore : evalBefore - evalAfter;

      let quality: MoveQuality = 'good';
      let accuracyScore = 90;

      if (evalDelta >= 0.8) {
        quality = 'brilliant';
        accuracyScore = 100;
        if (color === 'w') whiteBrilliances++;
        else blackBrilliances++;
      } else if (evalDelta >= 0.2) {
        quality = 'best';
        accuracyScore = 98;
      } else if (evalDelta >= -0.3) {
        quality = 'good';
        accuracyScore = 85;
      } else if (evalDelta >= -0.9) {
        quality = 'inaccuracy';
        accuracyScore = 65;
        if (color === 'w') whiteInaccuracies++;
        else blackInaccuracies++;
      } else if (evalDelta >= -2.0) {
        quality = 'mistake';
        accuracyScore = 40;
        if (color === 'w') whiteMistakes++;
        else blackMistakes++;
      } else {
        quality = 'blunder';
        accuracyScore = 15;
        if (color === 'w') whiteBlunders++;
        else blackBlunders++;
      }

      if (color === 'w') {
        whiteAccuracySum += accuracyScore;
        whiteMoveCount++;
      } else {
        blackAccuracySum += accuracyScore;
        blackMoveCount++;
      }

      currentEval = evalAfter;
      evalTimeline.push(currentEval);

      analyzedMoves.push({
        moveNumber: Math.floor(i / 2) + 1,
        color,
        san,
        fenBefore,
        fenAfter,
        evalBefore,
        evalAfter,
        quality,
        bestAlternative: evalBeforeRes.from ? `${evalBeforeRes.from}-${evalBeforeRes.to}` : undefined,
      });
    }

    const whiteAccuracy = whiteMoveCount > 0 ? Math.round(whiteAccuracySum / whiteMoveCount) : 100;
    const blackAccuracy = blackMoveCount > 0 ? Math.round(blackAccuracySum / blackMoveCount) : 100;

    return {
      whiteAccuracy,
      blackAccuracy,
      whiteBrilliances,
      whiteBlunders,
      whiteMistakes,
      whiteInaccuracies,
      blackBrilliances,
      blackBlunders,
      blackMistakes,
      blackInaccuracies,
      moves: analyzedMoves,
      evalTimeline,
    };
  }
}

export const analysisEngineService = new AnalysisEngineService();
