import React, { useState, useEffect, useCallback, useRef } from 'react';
import { eventRecorder } from '../fairplay/eventRecorder';
import {
  commitDigitToBoard,
  eraseCellFromBoard,
  initializeBoard,
  isBoardCompleted,
} from '../game/boardState';
import { toggleCellNote } from '../game/pencilNotes';
import { BoardMatrix, InputMode } from '../game/types';
import { useI18n } from '../i18n/i18nContext';
import { createStagedHint } from '../timely/hintStager';
import { solveLogically } from '../timely/logicalSolver';
import { generatePuzzle } from '../timely/pipeline';
import { CellCoord, DifficultyTier, Digit, GeneratedPuzzle, StagedHint } from '../timely/types';
import { HintModal } from './HintModal';
import { Keypad } from './Keypad';
import { MatchResultModal } from './MatchResultModal';
import { MatchTimer } from './MatchTimer';
import { SudokuGrid } from './SudokuGrid';

function cloneBoard(matrix: BoardMatrix): BoardMatrix {
  return matrix.map((row) =>
    row.map((cell) => ({ ...cell, notes: new Set(cell.notes) }))
  );
}

export const SoloGameView: React.FC = () => {
  const { t } = useI18n();

  const [tier, setTier] = useState<DifficultyTier>('intermediate');
  const [puzzle, setPuzzle] = useState<GeneratedPuzzle | null>(null);
  const [board, setBoard] = useState<BoardMatrix>([]);
  const [history, setHistory] = useState<BoardMatrix[]>([]);
  const [selectedCell, setSelectedCell] = useState<CellCoord | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('value');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [mistakes, setMistakes] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [currentHint, setCurrentHint] = useState<StagedHint | null>(null);
  const [hintStage, setHintStage] = useState<1 | 2 | 3>(1);
  const [showResult, setShowResult] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const matchIdRef = useRef<string>(`solo_${Date.now()}`);

  const startNewGame = useCallback((selectedTier: DifficultyTier) => {
    const newPuzzle = generatePuzzle(selectedTier);
    setPuzzle(newPuzzle);
    setBoard(initializeBoard(newPuzzle.initialGrid));
    setHistory([]);
    setSelectedCell(null);
    setInputMode('value');
    setElapsedSeconds(0);
    setMistakes(0);
    setHintsUsed(0);
    setCurrentHint(null);
    setShowResult(false);
    setIsActive(true);

    matchIdRef.current = `solo_${Date.now()}`;
    eventRecorder.recordEvent(matchIdRef.current, 'solo_player', 'puzzle_assigned');
  }, []);

  useEffect(() => {
    startNewGame(tier);
  }, [tier, startNewGame]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const handleCellSelect = useCallback((r: number, c: number) => {
    setSelectedCell({ row: r, col: c });
  }, []);

  const handleUndo = useCallback(() => {
    if (!isActive || history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setBoard(previous);
  }, [isActive, history]);

  const handleDigitInput = useCallback(
    (digit: Digit) => {
      if (!selectedCell || !puzzle || !isActive) return;
      const { row, col } = selectedCell;
      const cell = board[row][col];
      if (cell.isGiven) return;

      setHistory((prev) => [...prev, cloneBoard(board)]);

      if (inputMode === 'notes') {
        setBoard((prev) => toggleCellNote(prev, row, col, digit));
        eventRecorder.recordEvent(matchIdRef.current, 'solo_player', 'note_toggled', {
          cell: selectedCell,
          digit,
        });
        return;
      }

      const isCorrect = puzzle.solutionGrid[row][col] === digit;
      const updatedBoard = commitDigitToBoard(board, row, col, digit, isCorrect);
      setBoard(updatedBoard);

      if (isCorrect) {
        eventRecorder.recordEvent(matchIdRef.current, 'solo_player', 'digit_placed', {
          cell: selectedCell,
          digit,
        });

        if (isBoardCompleted(updatedBoard, puzzle.solutionGrid)) {
          setIsActive(false);
          setShowResult(true);
          eventRecorder.recordEvent(matchIdRef.current, 'solo_player', 'puzzle_completed');
        }
      } else {
        setMistakes((m) => m + 1);
        eventRecorder.recordEvent(matchIdRef.current, 'solo_player', 'mistake_incurred', {
          cell: selectedCell,
          digit,
        });
      }
    },
    [selectedCell, puzzle, isActive, board, inputMode]
  );

  const handleErase = useCallback(() => {
    if (!selectedCell || !isActive) return;
    const cell = board[selectedCell.row][selectedCell.col];
    if (cell.isGiven || (cell.value === 0 && cell.notes.size === 0)) return;

    setHistory((prev) => [...prev, cloneBoard(board)]);
    setBoard((prev) => eraseCellFromBoard(prev, selectedCell.row, selectedCell.col));
    eventRecorder.recordEvent(matchIdRef.current, 'solo_player', 'digit_erased', {
      cell: selectedCell,
    });
  }, [selectedCell, isActive, board]);

  const handleRequestHint = useCallback(() => {
    if (!puzzle || !isActive || hintsUsed >= 3) return;

    const currentGrid = board.map((r) => r.map((c) => c.value));
    const validation = solveLogically(currentGrid, tier);
    const nextDeduction = validation.deductionLog[0];

    if (nextDeduction) {
      setHintsUsed((h) => h + 1);
      setHintStage(1);
      const staged = createStagedHint(nextDeduction, 1);
      setCurrentHint(staged);
      setSelectedCell(nextDeduction.targetCell);

      eventRecorder.recordEvent(matchIdRef.current, 'solo_player', 'hint_requested', {
        cell: nextDeduction.targetCell,
        hintStage: 1,
      });
    }
  }, [puzzle, isActive, hintsUsed, board, tier]);

  const handleAdvanceHintStage = () => {
    if (!currentHint || hintStage >= 3) return;
    setHintStage((s) => (s + 1) as 2 | 3);
  };

  return (
    <div className="zimm-workspace">
      {/* Left Column: Inline Difficulty Tabs + Stats + 9x9 Grid */}
      <div className="zimm-board-col">
        <div className="zimm-board-meta">
          <div className="zimm-difficulty" role="group" aria-label={t.common.difficulty}>
            {(['beginner', 'intermediate', 'advanced', 'expert'] as DifficultyTier[]).map((d) => (
              <button
                key={d}
                type="button"
                className="zimm-difficulty__btn"
                onClick={() => setTier(d)}
                aria-pressed={tier === d}
              >
                {t.difficulties[d]}
              </button>
            ))}
          </div>

          <div className="zimm-stats">
            <div className="zimm-stat">
              <span className="zimm-stat__label">{t.game.mistakes}</span>
              <span className={`zimm-stat__value ${mistakes > 0 ? 'zimm-stat__value--error' : ''}`}>
                {mistakes}
              </span>
            </div>
            <MatchTimer seconds={elapsedSeconds} />
          </div>
        </div>

        <div className="zimm-grid-wrap">
          {board.length > 0 && (
            <SudokuGrid
              board={board}
              selectedCell={selectedCell}
              onSelectCell={handleCellSelect}
              onDigitInput={handleDigitInput}
              onErase={handleErase}
              onUndo={handleUndo}
              onToggleNotesMode={() => setInputMode((m) => (m === 'value' ? 'notes' : 'value'))}
              onRequestHint={handleRequestHint}
            />
          )}
        </div>
      </div>

      {/* Right Column: Mode Context + 3x3 Keypad + Primary Action */}
      <div className="zimm-controls-col">
        <div className="zimm-mode-header">
          <h2 className="zimm-mode-header__title">{t.modes.soloTitle}</h2>
          <p className="zimm-mode-header__desc">{t.modes.soloSubtitle}</p>
        </div>

        <Keypad
          inputMode={inputMode}
          onToggleInputMode={() => setInputMode((m) => (m === 'value' ? 'notes' : 'value'))}
          onDigitClick={handleDigitInput}
          onEraseClick={handleErase}
          onUndoClick={handleUndo}
          canUndo={history.length > 0 && isActive}
          onHintClick={handleRequestHint}
          hintsRemaining={3 - hintsUsed}
          maxHints={3}
          onPrimaryAction={() => startNewGame(tier)}
          primaryActionLabel={t.game.newPuzzle}
        />
      </div>

      <HintModal
        hint={currentHint}
        currentStage={hintStage}
        onAdvanceStage={handleAdvanceHintStage}
        onClose={() => setCurrentHint(null)}
        hintsRemaining={3 - hintsUsed}
      />

      {showResult && puzzle && (
        <MatchResultModal
          deltaA={{
            playerId: 'solo_player',
            outcome: 'win',
            baseEloDelta: 0,
            taxPaid: 0,
            spikeCompensation: 0,
            netDelta: 0,
            newRating: 1200,
            performance: {
              rawSpeedSeconds: elapsedSeconds,
              expectedBenchmarkSeconds: puzzle.expectedBenchmarkSeconds,
              mistakeMultiplier: 1 + mistakes * 0.05,
              hintMultiplier: 1 + hintsUsed * 0.15,
              effectiveSolveTimeSeconds:
                elapsedSeconds * (1 + mistakes * 0.05) * (1 + hintsUsed * 0.15),
              normalizedPerformance:
                puzzle.expectedBenchmarkSeconds /
                Math.max(1, elapsedSeconds * (1 + mistakes * 0.05) * (1 + hintsUsed * 0.15)),
            },
          }}
          isHeadToHead={false}
          onPlayAgain={() => startNewGame(tier)}
          onClose={() => setShowResult(false)}
        />
      )}
    </div>
  );
};
