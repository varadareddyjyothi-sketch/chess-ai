import React, { useEffect, useState, useRef } from 'react';
import { Square } from 'chess.js';
import { ChessEngineService } from '../../services/chessEngine';
import { computeBestMove } from '../../workers/aiWorker';
import { soundService } from '../../services/soundService';
import { aiTutorService, TutorExplanation } from '../../services/aiTutorService';
import { ChessBoard } from '../board/ChessBoard';
import { ChessClock } from '../board/ChessClock';
import { AIDifficulty, PieceColor, PieceType, GameSettings } from '../../types/chess';
import { Bot, RotateCcw, Flag, Sparkles, Cpu, Award, Play, ChevronRight, HelpCircle, Lightbulb } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PlayVsAIScreenProps {
  settings: GameSettings;
  onGameComplete?: (pgn: string, result: 'win' | 'loss' | 'draw') => void;
}

export const PlayVsAIScreen: React.FC<PlayVsAIScreenProps> = ({ settings, onGameComplete }) => {
  const [engine] = useState(() => new ChessEngineService());
  const [difficulty, setDifficulty] = useState<AIDifficulty>('intermediate');
  const [userColor, setUserColor] = useState<PieceColor>('w');
  const [gameStarted, setGameStarted] = useState(false);

  const [boardState, setBoardState] = useState(() => engine.getBoard());
  const [turn, setTurn] = useState<PieceColor>('w');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiNodeStats, setAiNodeStats] = useState<{ depth: number; nodes: number } | null>(null);

  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [kingInCheck, setKingInCheck] = useState<Square | null>(null);
  const [gameOver, setGameOver] = useState<{ ended: boolean; winner?: PieceColor | 'draw'; reason?: string }>({ ended: false });

  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [fenHistory, setFenHistory] = useState<string[]>([engine.getFen()]);

  // AI Tutor Panel State
  const [tutorOutput, setTutorOutput] = useState<TutorExplanation | null>(null);

  const isAiTurn = turn !== userColor && !gameOver.ended;

  // Handle AI move trigger
  useEffect(() => {
    if (gameStarted && isAiTurn && !gameOver.ended) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const result = computeBestMove(engine.getFen(), difficulty);
        if (result.from && result.to) {
          const moveRes = engine.makeMove({ from: result.from, to: result.to, promotion: result.promotion });
          if (moveRes.success) {
            if (moveRes.captured) soundService.playCapture();
            else soundService.playMove();

            if (moveRes.isCheck) soundService.playCheck();

            setLastMove({ from: result.from as Square, to: result.to as Square });
            setBoardState(engine.getBoard());
            setTurn(engine.getTurn());
            setMoveHistory(engine.getHistorySAN());
            setFenHistory((prev) => [...prev, engine.getFen()]);
            setAiNodeStats({ depth: difficulty === 'expert' ? 5 : 3, nodes: result.nodes });

            checkGameOverState();
          }
        }
        setIsAiThinking(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [gameStarted, turn, isAiTurn, gameOver.ended, difficulty]);

  const checkGameOverState = () => {
    const isCheck = engine.inCheck();
    if (isCheck) {
      setKingInCheck(engine.getKingSquare(engine.getTurn()));
    } else {
      setKingInCheck(null);
    }

    if (engine.isCheckmate()) {
      const winnerColor = engine.getTurn() === 'w' ? 'b' : 'w';
      setGameOver({ ended: true, winner: winnerColor, reason: 'Checkmate' });
      if (winnerColor === userColor) {
        soundService.playWin();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        onGameComplete?.(engine.getPgn(), 'win');
      } else {
        soundService.playLoss();
        onGameComplete?.(engine.getPgn(), 'loss');
      }
    } else if (engine.isDraw()) {
      setGameOver({ ended: true, winner: 'draw', reason: 'Draw' });
      onGameComplete?.(engine.getPgn(), 'draw');
    }
  };

  const handleUserMove = (from: Square, to: Square, promotion?: PieceType) => {
    if (gameOver.ended || isAiThinking || turn !== userColor) return;

    const moveRes = engine.makeMove({ from, to, promotion });
    if (moveRes.success) {
      if (moveRes.captured) soundService.playCapture();
      else soundService.playMove();

      if (moveRes.isCheck) soundService.playCheck();

      setLastMove({ from, to });
      setBoardState(engine.getBoard());
      setTurn(engine.getTurn());
      setMoveHistory(engine.getHistorySAN());
      setFenHistory((prev) => [...prev, engine.getFen()]);

      checkGameOverState();
    }
  };

  const handleStartGame = () => {
    engine.reset();
    setBoardState(engine.getBoard());
    setTurn('w');
    setLastMove(null);
    setKingInCheck(null);
    setGameOver({ ended: false });
    setMoveHistory([]);
    setFenHistory([engine.getFen()]);
    setGameStarted(true);
    setTutorOutput(null);
  };

  const handleAskTutor = (type: 'explain' | 'hint' | 'why_bad' | 'teach') => {
    const fen = engine.getFen();
    const lastSan = moveHistory[moveHistory.length - 1];

    if (type === 'explain') {
      setTutorOutput(aiTutorService.explainMove(fen, lastSan));
    } else if (type === 'hint') {
      setTutorOutput(aiTutorService.getHint(fen));
    } else if (type === 'why_bad') {
      setTutorOutput(aiTutorService.whyIsThisBad(fen, lastSan || 'last move'));
    } else if (type === 'teach') {
      setTutorOutput(aiTutorService.teachPosition(fen));
    }
  };

  if (!gameStarted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 animate-fade-in">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto">
            <Bot className="w-8 h-8 text-indigo-400" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white">Match Setup: Play vs AI</h2>
            <p className="text-slate-400 text-sm mt-1">Configure your opponent difficulty and color.</p>
          </div>

          {/* Difficulty Tier Buttons */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI Difficulty</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'beginner', name: 'Beginner', elo: '800 Elo', desc: 'Simple moves & mistakes' },
                { id: 'intermediate', name: 'Intermediate', elo: '1300 Elo', desc: 'Tactical positional awareness' },
                { id: 'advanced', name: 'Advanced', elo: '1700 Elo', desc: 'Deep search & move ordering' },
                { id: 'expert', name: 'Expert', elo: '2200 Elo', desc: 'Max depth + quiescence search' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setDifficulty(item.id as AIDifficulty)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    difficulty === item.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="font-bold text-sm text-white">{item.name}</div>
                  <div className="text-xs text-indigo-400 font-mono mt-0.5">{item.elo}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2 text-left">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Your Pieces</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setUserColor('w')}
                className={`py-3 rounded-xl border font-semibold text-sm flex items-center justify-center gap-2 ${
                  userColor === 'w' ? 'bg-white text-slate-950 border-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                ♔ White (Moves First)
              </button>
              <button
                onClick={() => setUserColor('b')}
                className={`py-3 rounded-xl border font-semibold text-sm flex items-center justify-center gap-2 ${
                  userColor === 'b' ? 'bg-slate-900 text-white border-indigo-500' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                ♚ Black
              </button>
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition-transform"
          >
            Start Game vs AI
          </button>
        </div>
      </div>
    );
  }

  const { whiteCaptured, blackCaptured } = engine.getCapturedPieces();
  const materialBal = engine.getMaterialBalance();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
      {/* Left / Center Column: Chess Board & Clock */}
      <div className="lg:col-span-7 space-y-4">
        {/* Opponent Info Header */}
        <div className="flex items-center justify-between glass-card p-3 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white capitalize">ChessMind Bot ({difficulty})</div>
              <div className="text-xs text-slate-400 font-mono">
                {isAiThinking ? (
                  <span className="text-amber-400 animate-pulse flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5" /> Engine Thinking...
                  </span>
                ) : (
                  'Ready'
                )}
              </div>
            </div>
          </div>

          {/* Captured Pieces Display */}
          <div className="flex items-center gap-1 text-lg">
            {userColor === 'w' ? blackCaptured.map((p, i) => <span key={i}>♟</span>) : whiteCaptured.map((p, i) => <span key={i}>♙</span>)}
            {materialBal.delta !== 0 && (
              <span className="text-xs font-bold text-amber-400 font-mono ml-1">
                {materialBal.delta > 0 ? `+${materialBal.delta}` : materialBal.delta}
              </span>
            )}
          </div>
        </div>

        {/* Digital Clocks */}
        <ChessClock
          whiteTimeSeconds={600}
          blackTimeSeconds={600}
          activeColor={turn}
          isGameRunning={!gameOver.ended}
        />

        {/* The 8x8 Chess Board */}
        <ChessBoard
          board={boardState}
          turn={turn}
          orientation={userColor}
          onMove={handleUserMove}
          legalMoves={engine.getLegalMoves()}
          lastMove={lastMove}
          kingInCheckSquare={kingInCheck}
          boardTheme={settings.boardTheme}
          showCoordinates={true}
          disabled={isAiThinking || gameOver.ended}
        />

        {/* Game Termination Overlay */}
        {gameOver.ended && (
          <div className="glass-panel p-6 rounded-2xl border border-indigo-500/40 text-center space-y-3 animate-bounce-in">
            <Award className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="text-2xl font-extrabold text-white">
              {gameOver.winner === userColor ? '🎉 Victory!' : gameOver.winner === 'draw' ? '🤝 Draw Game' : 'Defeat'}
            </h3>
            <p className="text-slate-300 text-sm">Reason: {gameOver.reason}</p>
            <button
              onClick={handleStartGame}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-lg hover:bg-indigo-500 transition-colors"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Right Column: Move History & ChessMind AI Tutor */}
      <div className="lg:col-span-5 space-y-6">
        {/* AI Tutor Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">ChessMind AI Coach</h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAskTutor('explain')}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 border border-slate-800"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" /> Explain Move
            </button>
            <button
              onClick={() => handleAskTutor('hint')}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 border border-slate-800"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Give Hint
            </button>
            <button
              onClick={() => handleAskTutor('why_bad')}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 border border-slate-800"
            >
              Why Is This Bad?
            </button>
            <button
              onClick={() => handleAskTutor('teach')}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 border border-slate-800"
            >
              Teach Position
            </button>
          </div>

          {tutorOutput && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-xs space-y-2 animate-fade-in">
              <div className="font-bold text-indigo-400 text-sm">{tutorOutput.title}</div>
              <p className="text-slate-300 leading-relaxed">{tutorOutput.summary}</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                {tutorOutput.keyPoints.map((pt, idx) => (
                  <li key={idx}>{pt}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Move History Table */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Move Notation</h3>
          <div className="max-h-48 overflow-y-auto font-mono text-xs text-slate-300 divide-y divide-slate-800">
            {moveHistory.reduce<{ white?: string; black?: string }[]>((acc, move, idx) => {
              if (idx % 2 === 0) {
                acc.push({ white: move });
              } else {
                acc[acc.length - 1].black = move;
              }
              return acc;
            }, []).map((pair, idx) => (
              <div key={idx} className="py-1.5 flex justify-between px-2 hover:bg-slate-800/40">
                <span className="text-slate-500 w-8">{idx + 1}.</span>
                <span className="text-white font-bold w-20">{pair.white}</span>
                <span className="text-slate-400 w-20">{pair.black || ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
