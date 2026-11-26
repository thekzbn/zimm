import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RatingDelta } from '../endgame/types';
import { eventRecorder } from '../fairplay/eventRecorder';
import {
  commitDigitToBoard,
  countFilledCells,
  eraseCellFromBoard,
  initializeBoard,
  isBoardCompleted,
} from '../game/boardState';
import { toggleCellNote } from '../game/pencilNotes';
import { BoardMatrix, InputMode } from '../game/types';
import { useI18n } from '../i18n/i18nContext';
import { matchStore } from '../server/matchStore';
import { serverOrchestrator } from '../server/orchestrator';
import { LiveMatchSession } from '../server/types';
import { createStagedHint } from '../timely/hintStager';
import { solveLogically } from '../timely/logicalSolver';
import { CellCoord, DifficultyTier, Digit, StagedHint } from '../timely/types';
import { HintModal } from './HintModal';
import { Keypad } from './Keypad';
import { MatchResultModal } from './MatchResultModal';
import { MatchTimer } from './MatchTimer';
import { SudokuGrid } from './SudokuGrid';
import { getCompletedUnitCells } from './unitCompletion';
import { useModalFocusTrap } from './useModalFocusTrap';

function cloneBoard(matrix: BoardMatrix): BoardMatrix {
  return matrix.map((row) =>
    row.map((cell) => ({ ...cell, notes: new Set(cell.notes) }))
  );
}

export const LiveMatchView: React.FC = () => {
  const { t } = useI18n();

  const [tier, setTier] = useState<DifficultyTier>('intermediate');
  const [session, setSession] = useState<LiveMatchSession | null>(null);
  const [board, setBoard] = useState<BoardMatrix>([]);
  const [history, setHistory] = useState<BoardMatrix[]>([]);
  const [completedUnitCells, setCompletedUnitCells] = useState<Set<string>>(new Set());
  const [selectedCell, setSelectedCell] = useState<CellCoord | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('value');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isMatchActive, setIsMatchActive] = useState<boolean>(false);
  const [mistakes, setMistakes] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [currentHint, setCurrentHint] = useState<StagedHint | null>(null);
  const [hintStage, setHintStage] = useState<1 | 2 | 3>(1);

  const [opponentFilledCount, setOpponentFilledCount] = useState<number>(30);
  const [opponentFinished, setOpponentFinished] = useState<boolean>(false);
  const [opponentDuration, setOpponentDuration] = useState<number>(0);

  const [matchResult, setMatchResult] = useState<{
    playerADelta: RatingDelta;
    playerBDelta: RatingDelta;
  } | null>(null);
  const [showForfeitConfirm, setShowForfeitConfirm] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const opponentSimRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const forfeitDialogRef = useModalFocusTrap(showForfeitConfirm, () => setShowForfeitConfirm(false));

  const startLiveMatch = useCallback((selectedTier: DifficultyTier) => {
    const user = matchStore.getUserProfile();
    const oppId = `opp_${Math.random().toString(36).substring(2, 6)}`;
    const newSession = serverOrchestrator.createLiveMatch(user.id, oppId, selectedTier);

    setSession(newSession);
    setBoard(initializeBoard(newSession.puzzleA.initialGrid));
    setHistory([]);
    setSelectedCell(null);
    setInputMode('value');
    setElapsedSeconds(0);
    setMistakes(0);
    setHintsUsed(0);
    setCurrentHint(null);
    setMatchResult(null);
    setOpponentFinished(false);
    setOpponentDuration(0);
    setOpponentFilledCount(newSession.puzzleB.clueCount);
    setIsMatchActive(true);

    eventRecorder.recordEvent(newSession.id, user.id, 'puzzle_assigned');
  }, []);

  useEffect(() => {
    if (!session || !isMatchActive) return;

    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [session, isMatchActive]);

  useEffect(() => {
    if (!session || !isMatchActive || opponentFinished) return;

    const benchmark = session.puzzleB.expectedBenchmarkSeconds;
    const targetSolveTime = benchmark * (0.85 + Math.random() * 0.3);
    const cellsToFill = Math.max(1, 81 - session.puzzleB.clueCount);
    const stepInterval = Math.max(500, (targetSolveTime / cellsToFill) * 1000);

    opponentSimRef.current = setInterval(() => {
      setOpponentFilledCount((prev) => {
        if (prev >= 80) {
          if (opponentSimRef.current) {
            clearInterval(opponentSimRef.current);
            opponentSimRef.current = null;
          }
          setOpponentFinished(true);
          setOpponentDuration(Math.round(targetSolveTime));
          return 81;
        }
        return prev + 1;
      });
    }, stepInterval);

    return () => {
      if (opponentSimRef.current) {
        clearInterval(opponentSimRef.current);
        opponentSimRef.current = null;
      }
    };
  }, [session, isMatchActive, opponentFinished]);

  const handleCellSelect = useCallback((r: number, c: number) => {
    setSelectedCell({ row: r, col: c });
  }, []);

  const finalizeMatch = useCallback(
    (playerAFinished: boolean) => {
      if (!session) return;
      setIsMatchActive(false);

      const user = matchStore.getUserProfile();
      const recordA = {
        playerId: user.id,
        rating: user.rating,
        finished: playerAFinished,
        solveDurationSeconds: elapsedSeconds,
        expectedBenchmarkSeconds: session.puzzleA.expectedBenchmarkSeconds,
        mistakesCount: mistakes,
        hintsUsedCount: hintsUsed,
        hasDifficultySpike: session.puzzleA.hasSpike,
        isAsync: false,
      };

      const oppRating = user.rating + Math.floor((Math.random() - 0.5) * 80);
      const oppElapsed = opponentFinished
        ? opponentDuration
        : Math.round(session.puzzleB.expectedBenchmarkSeconds * (0.9 + Math.random() * 0.2));

      const recordB = {
        playerId: session.playerBId,
        rating: oppRating,
        finished: true,
        solveDurationSeconds: oppElapsed,
        expectedBenchmarkSeconds: session.puzzleB.expectedBenchmarkSeconds,
        mistakesCount: Math.random() < 0.25 ? 1 : 0,
        hintsUsedCount: Math.random() < 0.2 ? 1 : 0,
        hasDifficultySpike: session.puzzleB.hasSpike,
        isAsync: false,
      };

      const calcResult = serverOrchestrator.resolveMatch(recordA, recordB);
      setMatchResult({
        playerADelta: calcResult.playerA,
        playerBDelta: calcResult.playerB,
      });
    },
    [session, elapsedSeconds, mistakes, hintsUsed, opponentFinished, opponentDuration]
  );

  const handleUndo = useCallback(() => {
    if (!isMatchActive || history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setBoard(previous);
  }, [isMatchActive, history]);

  const handleDigitInput = useCallback(
    (digit: Digit) => {
      if (!selectedCell || !session || !isMatchActive) return;
      const { row, col } = selectedCell;
      const cell = board[row][col];
      if (cell.isGiven) return;

      setHistory((prev) => [...prev, cloneBoard(board)]);

      const userId = session.playerAId;
      if (inputMode === 'notes') {
        setBoard((prev) => toggleCellNote(prev, row, col, digit));
        eventRecorder.recordEvent(session.id, userId, 'note_toggled', { cell: selectedCell, digit });
        return;
      }

      const isCorrect = session.puzzleA.solutionGrid[row][col] === digit;
      const updatedBoard = commitDigitToBoard(board, row, col, digit, isCorrect);
      setBoard(updatedBoard);

      if (isCorrect) {
        eventRecorder.recordEvent(session.id, userId, 'digit_placed', { cell: selectedCell, digit });
        const completed = getCompletedUnitCells(updatedBoard, row, col);
        if (completed.size > 0) {
          setCompletedUnitCells(completed);
          setTimeout(() => setCompletedUnitCells(new Set()), 650);
        }
        if (isBoardCompleted(updatedBoard, session.puzzleA.solutionGrid)) {
          eventRecorder.recordEvent(session.id, userId, 'puzzle_completed');
          finalizeMatch(true);
        }
      } else {
        setMistakes((m) => m + 1);
        eventRecorder.recordEvent(session.id, userId, 'mistake_incurred', {
          cell: selectedCell,
          digit,
        });
      }
    },
    [selectedCell, session, isMatchActive, board, inputMode, finalizeMatch]
  );

  const handleErase = useCallback(() => {
    if (!selectedCell || !session || !isMatchActive) return;
    const cell = board[selectedCell.row][selectedCell.col];
    if (cell.isGiven || (cell.value === 0 && cell.notes.size === 0)) return;

    setHistory((prev) => [...prev, cloneBoard(board)]);
    setBoard((prev) => eraseCellFromBoard(prev, selectedCell.row, selectedCell.col));
    eventRecorder.recordEvent(session.id, session.playerAId, 'digit_erased', { cell: selectedCell });
  }, [selectedCell, session, isMatchActive, board]);

  const handleRequestHint = useCallback(() => {
    if (!session || !isMatchActive || hintsUsed >= 3) return;
    const currentGrid = board.map((r) => r.map((c) => c.value));
    const validation = solveLogically(currentGrid, tier);
    const nextDeduction = validation.deductionLog[0];

    if (nextDeduction) {
      setHintsUsed((h) => h + 1);
      setHintStage(1);
      const staged = createStagedHint(nextDeduction, 1);
      setCurrentHint(staged);
      setSelectedCell(nextDeduction.targetCell);

      eventRecorder.recordEvent(session.id, session.playerAId, 'hint_requested', {
        cell: nextDeduction.targetCell,
        hintStage: 1,
      });
    }
  }, [session, isMatchActive, hintsUsed, board, tier]);

  const handleToggleNotesMode = useCallback(() => {
    setInputMode((m) => (m === 'value' ? 'notes' : 'value'));
  }, []);

  const confirmForfeit = () => {
    if (!session) return;
    setShowForfeitConfirm(false);
    eventRecorder.recordEvent(session.id, session.playerAId, 'match_forfeited');
    finalizeMatch(false);
  };

  if (!session) {
    return (
      <div className="zimm-lobby">
        <div className="zimm-mode-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <h2 className="zimm-mode-header__title">{t.modes.liveTitle}</h2>
          <p className="zimm-mode-header__desc">{t.modes.liveSubtitle}</p>
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
            onClick={() => startLiveMatch(tier)}
          >
            {t.live.startMatch}
          </button>
        </div>
      </div>
    );
  }

  const playerFilledCount = countFilledCells(board);
  const playerPercent = Math.round((playerFilledCount / 81) * 100);
  const opponentPercent = Math.round((opponentFilledCount / 81) * 100);

  return (
    <div className="zimm-workspace">
      {/* Left Column: Stats + Forfeit + Grid */}
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
            onClick={() => isMatchActive && setShowForfeitConfirm(true)}
            disabled={!isMatchActive}
          >
            {t.live.forfeit}
          </button>
        </div>

        <div className="zimm-grid-wrap">
          {board.length > 0 && (
            <SudokuGrid
              board={board}
              selectedCell={selectedCell}
              completedUnitCells={completedUnitCells}
              onSelectCell={handleCellSelect}
              onDigitInput={handleDigitInput}
              onErase={handleErase}
              onUndo={handleUndo}
              onToggleNotesMode={handleToggleNotesMode}
              onRequestHint={handleRequestHint}
            />
          )}
        </div>
      </div>

      {/* Right Column: Match Progress + Keypad */}
      <div className="zimm-controls-col">
        <div className="zimm-mode-header">
          <h2 className="zimm-mode-header__title">{t.modes.liveTitle}</h2>
          <p className="zimm-mode-header__desc">
            {opponentFinished ? t.live.opponentFinished : t.live.matchInProgress}
          </p>

          <div style={{ marginTop: 'var(--space-3)' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                marginBottom: 'var(--space-1)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <span style={{ color: 'var(--color-brandPrimary)' }}>You: {playerPercent}%</span>
              <span style={{ color: 'var(--color-textMuted)' }}>
                {t.live.opponentProgress}: {opponentPercent}%
              </span>
            </div>
            <div className="zimm-progress-track">
              <div className="zimm-progress-fill" style={{ width: `${playerPercent}%` }} />
            </div>
          </div>
        </div>

        <Keypad
          inputMode={inputMode}
          onToggleInputMode={handleToggleNotesMode}
          onDigitClick={handleDigitInput}
          onEraseClick={handleErase}
          onUndoClick={handleUndo}
          canUndo={history.length > 0 && isMatchActive}
          onHintClick={handleRequestHint}
          hintsRemaining={3 - hintsUsed}
          maxHints={3}
        />
      </div>

      <HintModal
        hint={currentHint}
        currentStage={hintStage}
        onAdvanceStage={() => setHintStage((s) => (s + 1) as 2 | 3)}
        onClose={() => setCurrentHint(null)}
        hintsRemaining={3 - hintsUsed}
      />

      {showForfeitConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="forfeit-dialog-title"
          className="zimm-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForfeitConfirm(false);
          }}
        >
          <div ref={forfeitDialogRef} className="zimm-modal zimm-modal--sm" tabIndex={-1}>
            <h2 id="forfeit-dialog-title" className="zimm-modal__title">
              {t.live.forfeitWarning}
            </h2>
            <div className="zimm-modal__footer">
              <button
                type="button"
                className="zimm-btn-secondary"
                onClick={() => setShowForfeitConfirm(false)}
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                className="zimm-btn-primary"
                style={{ width: 'auto' }}
                onClick={confirmForfeit}
              >
                {t.live.forfeit}
              </button>
            </div>
          </div>
        </div>
      )}

      {matchResult && (
        <MatchResultModal
          deltaA={matchResult.playerADelta}
          deltaB={matchResult.playerBDelta}
          isHeadToHead={true}
          onPlayAgain={() => startLiveMatch(tier)}
          onClose={() => setMatchResult(null)}
        />
      )}
    </div>
  );
};
