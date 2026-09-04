import React, { useState } from 'react';
import { Lesson, LessonStep } from '../../types/chess';
import { ChessEngineService } from '../../services/chessEngine';
import { ChessBoard } from '../board/ChessBoard';
import { soundService } from '../../services/soundService';
import { ArrowLeft, ChevronRight, CheckCircle2, Award, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface InteractiveLessonViewProps {
  lesson: Lesson;
  onBack: () => void;
  onCompleteLesson: (lessonId: string) => void;
}

export const InteractiveLessonView: React.FC<InteractiveLessonViewProps> = ({
  lesson,
  onBack,
  onCompleteLesson,
}) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const currentStep: LessonStep = lesson.steps[currentStepIdx] || lesson.steps[0];

  const [engine] = useState(() => new ChessEngineService(currentStep.fen));
  const [boardState, setBoardState] = useState(() => engine.getBoard());
  const [stepCompleted, setStepCompleted] = useState(false);

  const handleStepMove = (from: string, to: string) => {
    const moveStr = `${from}-${to}`;
    const moveRes = engine.makeMove({ from, to });

    if (moveRes.success) {
      soundService.playMove();
      setBoardState(engine.getBoard());

      if (currentStep.targetMove && moveStr === currentStep.targetMove) {
        setStepCompleted(true);
        soundService.playWin();
      } else if (!currentStep.targetMove) {
        setStepCompleted(true);
      }
    }
  };

  const handleNextStep = () => {
    if (currentStepIdx < lesson.steps.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      engine.loadFen(lesson.steps[nextIdx].fen);
      setBoardState(engine.getBoard());
      setStepCompleted(false);
    } else {
      // Lesson complete!
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      onCompleteLesson(lesson.id);
      onBack();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Lessons
      </button>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">
            Step {currentStepIdx + 1} of {lesson.steps.length}
          </span>
          <h2 className="text-2xl font-bold text-white mt-1">{lesson.title}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 space-y-4">
          <ChessBoard
            board={boardState}
            turn={engine.getTurn()}
            onMove={handleStepMove}
            legalMoves={engine.getLegalMoves()}
          />
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" /> Instructions
            </h3>

            <p className="text-slate-300 text-sm leading-relaxed">{currentStep.instruction}</p>

            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300 space-y-1">
              <div className="font-bold">Key Concept:</div>
              <div>{currentStep.explanation}</div>
            </div>

            {stepCompleted ? (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between text-emerald-400 animate-fade-in">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <CheckCircle2 className="w-5 h-5" /> Step Completed!
                </div>
                <button
                  onClick={handleNextStep}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-lg"
                >
                  Next Step <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-3 text-center text-slate-500 text-xs italic">
                Perform the move on the board to complete this step.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
