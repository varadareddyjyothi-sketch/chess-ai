import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import { PieceColor, PieceType } from '../types/chess';

export interface BoardSquare {
  square: Square;
  type: PieceType | null;
  color: PieceColor | null;
}

export class ChessEngineService {
  private game: Chess;

  constructor(fen?: string) {
    this.game = new Chess(fen);
  }

  public reset(fen?: string): void {
    if (fen) {
      this.game.load(fen);
    } else {
      this.game.reset();
    }
  }

  public loadFen(fen: string): boolean {
    try {
      this.game.load(fen);
      return true;
    } catch {
      return false;
    }
  }

  public getFen(): string {
    return this.game.fen();
  }

  public getPgn(): string {
    return this.game.pgn();
  }

  public getTurn(): PieceColor {
    return this.game.turn() as PieceColor;
  }

  public getBoard(): (BoardSquare | null)[][] {
    const board = this.game.board();
    return board.map((row) =>
      row.map((piece) => {
        if (!piece) return null;
        return {
          square: piece.square,
          type: piece.type as PieceType,
          color: piece.color as PieceColor,
        };
      })
    );
  }

  public getLegalMoves(square?: Square): { from: Square; to: Square; promotion?: string; flags: string; captured?: string }[] {
    const verboseMoves = this.game.moves({ verbose: true, square });
    return verboseMoves.map((m) => ({
      from: m.from as Square,
      to: m.to as Square,
      promotion: m.promotion,
      flags: m.flags,
      captured: m.captured,
    }));
  }

  public makeMove(move: { from: string; to: string; promotion?: string }): { success: boolean; captured?: PieceType; isCheck?: boolean; isCheckmate?: boolean; isDraw?: boolean; san?: string } {
    try {
      const result = this.game.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion || 'q',
      });

      if (!result) return { success: false };

      return {
        success: true,
        captured: result.captured as PieceType | undefined,
        isCheck: this.game.inCheck(),
        isCheckmate: this.game.isCheckmate(),
        isDraw: this.game.isDraw(),
        san: result.san,
      };
    } catch {
      return { success: false };
    }
  }

  public undoMove(): boolean {
    const move = this.game.undo();
    return move !== null;
  }

  public inCheck(): boolean {
    return this.game.inCheck();
  }

  public isCheckmate(): boolean {
    return this.game.isCheckmate();
  }

  public isStalemate(): boolean {
    return this.game.isStalemate();
  }

  public isDraw(): boolean {
    return this.game.isDraw();
  }

  public isThreefoldRepetition(): boolean {
    return this.game.isThreefoldRepetition();
  }

  public isInsufficientMaterial(): boolean {
    return this.game.isInsufficientMaterial();
  }

  public isGameOver(): boolean {
    return this.game.isGameOver();
  }

  public getHistoryVerbose() {
    return this.game.history({ verbose: true });
  }

  public getHistorySAN() {
    return this.game.history();
  }

  public getCapturedPieces(): { whiteCaptured: PieceType[]; blackCaptured: PieceType[] } {
    const history = this.game.history({ verbose: true });
    const whiteCaptured: PieceType[] = []; // black pieces captured by white
    const blackCaptured: PieceType[] = []; // white pieces captured by black

    history.forEach((m) => {
      if (m.captured) {
        if (m.color === 'w') {
          whiteCaptured.push(m.captured as PieceType);
        } else {
          blackCaptured.push(m.captured as PieceType);
        }
      }
    });

    return { whiteCaptured, blackCaptured };
  }

  public getMaterialBalance(): { whiteValue: number; blackValue: number; delta: number } {
    const pieceValues: Record<PieceType, number> = {
      p: 1,
      n: 3,
      b: 3,
      r: 5,
      q: 9,
      k: 0,
    };

    let whiteValue = 0;
    let blackValue = 0;

    const board = this.game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          const val = pieceValues[piece.type as PieceType];
          if (piece.color === 'w') whiteValue += val;
          else blackValue += val;
        }
      }
    }

    return {
      whiteValue,
      blackValue,
      delta: whiteValue - blackValue,
    };
  }

  public getKingSquare(color: PieceColor): Square | null {
    const board = this.game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === color) {
          return p.square;
        }
      }
    }
    return null;
  }
}
