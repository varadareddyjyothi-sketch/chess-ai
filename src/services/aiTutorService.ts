import { Chess } from 'chess.js';
import { PieceColor } from '../types/chess';

export interface TutorExplanation {
  title: string;
  summary: string;
  keyPoints: string[];
  suggestedMove?: string;
  threatLevel: 'low' | 'medium' | 'high' | 'checkmate';
}

export class AITutorService {
  /**
   * Explains why a move was played or what happened on the board.
   */
  public explainMove(fen: string, lastMoveSan?: string): TutorExplanation {
    const game = new Chess(fen);
    const turn = game.turn();
    const isCheck = game.inCheck();
    const isMate = game.isCheckmate();

    if (isMate) {
      return {
        title: 'Checkmate Delivered!',
        summary: 'The game has ended in checkmate. The king is attacked with no legal escape squares.',
        keyPoints: [
          'The attacking pieces coordinated to restrict all flight squares.',
          'Always look for checks, captures, and threats when defending your king.',
        ],
        threatLevel: 'checkmate',
      };
    }

    if (isCheck) {
      return {
        title: 'King Under Attack (Check!)',
        summary: 'The king is directly threatened. You must resolve the check immediately.',
        keyPoints: [
          '1. Move the king to a safe square.',
          '2. Block the attack with another piece.',
          '3. Capture the attacking piece.',
        ],
        threatLevel: 'high',
      };
    }

    if (lastMoveSan) {
      if (lastMoveSan.includes('x')) {
        return {
          title: `Capture Executed (${lastMoveSan})`,
          summary: `A piece was taken off the board. Material balance has shifted.`,
          keyPoints: [
            'Check if the capturing piece is now undefended.',
            'Look for immediate recaptures to maintain material equality.',
          ],
          threatLevel: 'medium',
        };
      }

      if (lastMoveSan === 'O-O' || lastMoveSan === 'O-O-O') {
        return {
          title: 'Castling Completed',
          summary: 'The king has reached safety behind a pawn shield and the rook is mobilized towards the center.',
          keyPoints: [
            'Castling early protects your king from central attacks.',
            'Connects your rooks for back-rank defense and open file control.',
          ],
          threatLevel: 'low',
        };
      }
    }

    return {
      title: 'Positional Development',
      summary: `It is currently ${turn === 'w' ? 'White' : 'Black'}'s turn to move. Focus on piece activity and king safety.`,
      keyPoints: [
        'Control the center squares (e4, d4, e5, d5).',
        'Develop minor pieces (Knights & Bishops) before major pieces.',
        'Keep your king safe by castling early.',
      ],
      threatLevel: 'low',
    };
  }

  /**
   * Gives a friendly hint without spoiling the full solution.
   */
  public getHint(fen: string): TutorExplanation {
    const game = new Chess(fen);
    const moves = game.moves({ verbose: true });

    if (moves.length === 0) {
      return {
        title: 'No Legal Moves',
        summary: 'The position has reached a terminal state.',
        keyPoints: [],
        threatLevel: 'low',
      };
    }

    // Look for checks
    const checkMove = moves.find((m) => m.san.includes('+'));
    if (checkMove) {
      return {
        title: 'Hint: Tactical Check Available',
        summary: `Look closely at piece checks! You can put your opponent in check with a ${checkMove.piece.toUpperCase()} move.`,
        keyPoints: ['Checks force the opponent to react immediately.', 'Look for squares around the enemy king.'],
        suggestedMove: checkMove.from + '-' + checkMove.to,
        threatLevel: 'high',
      };
    }

    // Look for captures
    const captureMove = moves.find((m) => m.captured);
    if (captureMove) {
      return {
        title: 'Hint: Material Opportunity',
        summary: `You have an opportunity to capture an opponent piece starting from square ${captureMove.from.toUpperCase()}.`,
        keyPoints: ['Calculate if the capture is protected by an enemy piece before moving.'],
        suggestedMove: captureMove.from + '-' + captureMove.to,
        threatLevel: 'medium',
      };
    }

    // Default hint: central control
    const centerMove = moves.find((m) => ['e4', 'd4', 'e5', 'd5', 'c4', 'f4', 'c5', 'f5'].includes(m.to));
    if (centerMove) {
      return {
        title: 'Hint: Center Control',
        summary: `Target central squares like ${centerMove.to.toUpperCase()} to increase piece mobility.`,
        keyPoints: ['Pieces in the center command more squares than pieces on the edge.'],
        suggestedMove: centerMove.from + '-' + centerMove.to,
        threatLevel: 'low',
      };
    }

    return {
      title: 'Hint: Piece Activation',
      summary: 'Look for your least active piece and move it toward an open file or active square.',
      keyPoints: ['Improve piece harmony and prepare for tactical opportunities.'],
      threatLevel: 'low',
    };
  }

  /**
   * Explains why a move might be weak or vulnerable.
   */
  public whyIsThisBad(fenBefore: string, moveSan: string): TutorExplanation {
    return {
      title: `Analysis of ${moveSan}`,
      summary: `Playing ${moveSan} might leave key squares undefended or weaken king protection.`,
      keyPoints: [
        'Always check if your moved piece abandons defense of another friendly piece.',
        'Beware of pushing pawns near your king as it creates permanent square weaknesses.',
        'Watch out for opponent tactical replies like forks (attacking 2 pieces at once) or pins.',
      ],
      threatLevel: 'medium',
    };
  }

  /**
   * Teaches key principles of the current board position.
   */
  public teachPosition(fen: string): TutorExplanation {
    const game = new Chess(fen);
    const turnName = game.turn() === 'w' ? 'White' : 'Black';

    return {
      title: `ChessMind AI Strategy Guide`,
      summary: `Position evaluation for ${turnName}: evaluate pawn structure, king safety, and open lines.`,
      keyPoints: [
        '1. King Safety: Castle early to avoid tactical central attacks.',
        '2. Piece Activity: Knights belong on active central squares, Bishops on open diagonals.',
        '3. Rooks: Place rooks on open files where pawns have been traded.',
        '4. Pawn Levers: Break open stubborn positions with coordinated pawn pushes.',
      ],
      threatLevel: 'low',
    };
  }
}

export const aiTutorService = new AITutorService();
