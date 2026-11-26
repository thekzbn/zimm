import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RatingDelta } from '../endgame/types';
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
import { matchStore } from '../server/matchStore';
import { serverOrchestrator } from '../server/orchestrator';
import { AsyncChallenge } from '../server/types';
import { createStagedHint } from '../timely/hintStager';
import { solveLogically } from '../timely/logicalSolver';
import { CellCoord, DifficultyTier, Digit, StagedHint } from '../timely/types';
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

export const AsyncMatchView: React.FC = () => {
  const { t } = useI18n();
  const user = matchStore.getUserProfile();

  const [tier, setTier] = useState<DifficultyTier>('intermediate');
  const [activeChallenge, setActiveChallenge] = useState<AsyncChallenge | null>(null);
  const [inputCode, setInputCode] = useState<string>('');
  const [board, setBoard] = useState<BoardMatrix>([]);
  const [history, setHistory] = useState<BoardMatrix[]>([]);
  const [selectedCell, setSelectedCell] = useState<CellCoord | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('value');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [currentHint, setCurrentHint] = useState<StagedHint | null>(null);
  const [hintStage, setHintStage] = useState<1 | 2 | 3>(1);
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [isOpponentRole, setIsOpponentRole] = useState<boolean>(false);
  const [resultModalDelta, setResultModalDelta] = useState<RatingDelta | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isSolving) {
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
  }, [isSolving]);

  const handleCreateChallenge = () => {
    const challenge = serverOrchestrator.createAsyncChallenge(user.id, user.rating, tier);
    setActiveChallenge(challenge);
    setIsOpponentRole(false);
    setBoard(initializeBoard(challenge.puzzleA.initialGrid));
    setHistory([]);
    setSelectedCell(null);
    setInputMode('value');
    setElapsedSeconds(0);
    setMistakes(0);
    setHintsUsed(0);
    setIsSolving(true);
    eventRecorder.recordEvent(challenge.code, user.id, 'puzzle_assigned');
  };

  const handleJoinChallenge = () => {
    const trimmed = inputCode.trim().toUpperCase();
    const challenge = matchStore.getAsyncChallenge(trimmed);

    if (!challenge) {
      setJoinError(t.async.codeNotFound);
      return;
    }
    setJoinError(null);
    setActiveChallenge(challenge);
    setIsOpponentRole(true);
    setBoard(initializeBoard(challenge.puzzleB.initialGrid));
    setHistory([]);
    setSelectedCell(null);
    setInputMode('value');
    setElapsedSeconds(0);
    setMistakes(0);
    setHintsUsed(0);
    setIsSolving(true);
    eventRecorder.recordEvent(challenge.code, user.id, 'puzzle_assigned');
  };

  const handleCopyCode = () => {
    if (activeChallenge) {
      navigator.clipboard?.writeText(activeChallenge.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCellSelect = useCallback((r: number, c: number) => {
    setSelectedCell({ row: r, col: c });
  }, []);

  const handleUndo = useCallback(() => {
    if (!isSolving || history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setBoard(previous);
  }, [isSolving, history]);

  const handleDigitInput = useCallback(
    (digit: Digit) => {
      if (!selectedCell || !activeChallenge || !isSolving) return;
      const { row, col } = selectedCell;
      const cell = board[row][col];
      if (cell.isGiven) return;

      setHistory((prev) => [...prev, cloneBoard(board)]);

      if (inputMode === 'notes') {
        setBoard((prev) => toggleCellNote(prev, row, col, digit));
        eventRecorder.recordEvent(activeChallenge.code, user.id, 'note_toggled', {
          cell: selectedCell,
          digit,
        });
        return;
      }

      const targetPuzzle = isOpponentRole ? activeChallenge.puzzleB : activeChallenge.puzzleA;
      const isCorrect = targetPuzzle.solutionGrid[row][col] === digit;
      const updatedBoard = commitDigitToBoard(board, row, col, digit, isCorrect);
      setBoard(updatedBoard);

      if (isCorrect) {
        eventRecorder.recordEvent(activeChallenge.code, user.id, 'digit_placed', {
          cell: selectedCell,
          digit,
        });

        if (isBoardCompleted(updatedBoard, targetPuzzle.solutionGrid)) {
          setIsSolving(false);
          eventRecorder.recordEvent(activeChallenge.code, user.id, 'puzzle_completed');

          if (!isOpponentRole) {
            const updated = serverOrchestrator.submitCreatorSolve(
              activeChallenge.code,
              elapsedSeconds,
              mistakes,
              hintsUsed,
              true
            );
            if (updated) setActiveChallenge(updated);
          } else {
            const updated = serverOrchestrator.submitOpponentSolve(
              activeChallenge.code,
              user.id,
              user.rating,
              elapsedSeconds,
              mistakes,
              hintsUsed,
              true
            );
            if (updated && updated.result) {
              setActiveChallenge(updated);
              setResultModalDelta(updated.result.opponentDelta);
            }
          }
        }
      } else {
        setMistakes((m) => m + 1);
        eventRecorder.recordEvent(activeChallenge.code, user.id, 'mistake_incurred', {
          cell: selectedCell,
          digit,
        });
      }
    },
    [
      selectedCell,
      activeChallenge,
      isSolving,
      board,
      inputMode,
      isOpponentRole,
      user.id,
      user.rating,
      elapsedSeconds,
      mistakes,
      hintsUsed,
    ]
  );

  const handleErase = useCallback(() => {
    if (!selectedCell || !isSolving) return;
    const cell = board[selectedCell.row][selectedCell.col];
    if (cell.isGiven || (cell.value === 0 && cell.notes.size === 0)) return;

    setHistory((prev) => [...prev, cloneBoard(board)]);
    setBoard((prev) => eraseCellFromBoard(prev, selectedCell.row, selectedCell.col));
  }, [selectedCell, isSolving, board]);

  const handleRequestHint = useCallback(() => {
    if (!activeChallenge || hintsUsed >= 3 || !isSolving) return;
    const currentGrid = board.map((r) => r.map((c) => c.value));
    const targetPuzzle = isOpponentRole ? activeChallenge.puzzleB : activeChallenge.puzzleA;
    const validation = solveLogically(currentGrid, targetPuzzle.tier);
    const nextDeduction = validation.deductionLog[0];

    if (nextDeduction) {
      setHintsUsed((h) => h + 1);
      setHintStage(1);
      const staged = createStagedHint(nextDeduction, 1);
      setCurrentHint(staged);
      setSelectedCell(nextDeduction.targetCell);
    }
  }, [activeChallenge, hintsUsed, isSolving, board, isOpponentRole]);

  if (!activeChallenge) {
    return (
      <div className="zimm-lobby">
        <div className="zimm-mode-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <h2 className="zimm-mode-header__title">{t.modes.asyncTitle}</h2>
          <p className="zimm-mode-header__desc">{t.modes.asyncSubtitle}</p>
        </div>

        <div className="zimm-lobby__section">
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

          <button
            type="button"
            className="zimm-btn-primary"
            onClick={handleCreateChallenge}
          >
            {t.async.createChallenge}
          </button>
        </div>

        <div className="zimm-lobby__section">
          <label
            htmlFor="async-code-input"
            style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-textMuted)' }}
          >
            {t.async.joinChallenge}
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <input
              id="async-code-input"
              type="text"
              className="zimm-input"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value);
                if (joinError) setJoinError(null);
              }}
              placeholder={t.async.enterCode}
              style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '0.08em' }}
            />
            <button
              type="button"
              className="zimm-btn-secondary"
              onClick={handleJoinChallenge}
            >
              {t.async.joinChallenge}
            </button>
          </div>
          {joinError && (
            <div className="zimm-alert" role="alert">
              {joinError}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="zimm-workspace">
      {/* Left Column: Stats + Back + Grid or Waiting State */}
      <div className="zimm-board-col">
        <div className="zimm-board-meta">
          <div className="zimm-stats">
            <div className="zimm-stat">
              <span className="zimm-stat__label">{t.game.mistakes}</span>
              <span className={`zimm-stat__value ${mistakes > 0 ? 'zimm-stat__value--error' : ''}`}>
                {mistakes}
              </span>
            </div>
            <MatchTimer seconds={elapsedSeconds} />
          </div>

          <button
            type="button"
            className="zimm-btn-util"
            onClick={() => {
              setIsSolving(false);
              setActiveChallenge(null);
            }}
          >
            {t.common.back}
          </button>
        </div>

        {!isSolving && activeChallenge.status === 'pending' ? (
          <div
            style={{
              padding: 'var(--space-6) var(--space-4)',
              borderTop: '1px solid var(--color-borderSubtle)',
              borderBottom: '1px solid var(--color-borderSubtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            <h3 className="zimm-mode-header__title" style={{ color: 'var(--color-statusSuccess)' }}>
              {t.game.completed}
            </h3>
            <p className="zimm-mode-header__desc">{t.async.waitingOpponentFinish}</p>
            <p className="zimm-mode-header__desc">
              {t.async.shareCodePrompt}{' '}
              <span className="zimm-code">{activeChallenge.code}</span>
            </p>
          </div>
        ) : (
          <div className="zimm-grid-wrap">
            {isSolving && board.length > 0 && (
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
        )}
      </div>

      {/* Right Column: Challenge Info + Code + Keypad */}
      <div className="zimm-controls-col">
        <div className="zimm-mode-header">
          <h2 className="zimm-mode-header__title">{t.modes.asyncTitle}</h2>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-2)',
              marginTop: 'var(--space-2)',
            }}
          >
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-textMuted)' }}>
                {t.async.challengeCode}
              </div>
              <div className="zimm-code">{activeChallenge.code}</div>
            </div>
            <button
              type="button"
              className="zimm-btn-util"
              style={{ minWidth: '8.5rem', textAlign: 'center' }}
              onClick={handleCopyCode}
            >
              {copied ? t.common.copied : t.common.copy}
            </button>
          </div>
        </div>

        {isSolving && board.length > 0 && (
          <Keypad
            inputMode={inputMode}
            onToggleInputMode={() => setInputMode((m) => (m === 'value' ? 'notes' : 'value'))}
            onDigitClick={handleDigitInput}
            onEraseClick={handleErase}
            onUndoClick={handleUndo}
            canUndo={history.length > 0 && isSolving}
            onHintClick={handleRequestHint}
            hintsRemaining={3 - hintsUsed}
            maxHints={3}
          />
        )}
      </div>

      <HintModal
        hint={currentHint}
        currentStage={hintStage}
        onAdvanceStage={() => setHintStage((s) => (s + 1) as 2 | 3)}
        onClose={() => setCurrentHint(null)}
        hintsRemaining={3 - hintsUsed}
      />

      {resultModalDelta && (
        <MatchResultModal
          deltaA={resultModalDelta}
          isHeadToHead={true}
          onPlayAgain={() => setActiveChallenge(null)}
          onClose={() => setResultModalDelta(null)}
        />
      )}
    </div>
  );
};
