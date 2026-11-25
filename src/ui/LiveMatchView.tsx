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
import { useTheme } from '../theme/themeContext';
import { HintModal } from './HintModal';
import { Keypad } from './Keypad';
import { MatchResultModal } from './MatchResultModal';
import { MatchTimer } from './MatchTimer';
import { SudokuGrid } from './SudokuGrid';

export const LiveMatchView: React.FC = () => {
  const { tokens } = useTheme();
  const { t } = useI18n();

  const [tier, setTier] = useState<DifficultyTier>('intermediate');
  const [session, setSession] = useState<LiveMatchSession | null>(null);
  const [board, setBoard] = useState<BoardMatrix>([]);
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

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const opponentSimRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startLiveMatch = useCallback((selectedTier: DifficultyTier) => {
    const user = matchStore.getUserProfile();
    const oppId = `opp_${Math.random().toString(36).substring(2, 6)}`;
    const newSession = serverOrchestrator.createLiveMatch(user.id, oppId, selectedTier);

    setSession(newSession);
    setBoard(initializeBoard(newSession.puzzleA.initialGrid));
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

  // Player timer
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

  // Opponent simulated solving pace
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

  const handleDigitInput = useCallback(
    (digit: Digit) => {
      if (!selectedCell || !session || !isMatchActive) return;
      const { row, col } = selectedCell;
      const cell = board[row][col];
      if (cell.isGiven) return;

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
    setBoard((prev) => eraseCellFromBoard(prev, selectedCell.row, selectedCell.col));
    eventRecorder.recordEvent(session.id, session.playerAId, 'digit_erased', { cell: selectedCell });
  }, [selectedCell, session, isMatchActive]);

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

  const handleForfeit = () => {
    if (!session || !isMatchActive) return;
    if (confirm(t.live.forfeitWarning)) {
      eventRecorder.recordEvent(session.id, session.playerAId, 'match_forfeited');
      finalizeMatch(false);
    }
  };

  if (!session) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0.5rem',
          maxWidth: '460px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            backgroundColor: tokens.bgElevated,
            border: `1px solid ${tokens.borderSubtle}`,
            borderRadius: '8px',
            padding: '1.25rem',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: tokens.textPrimary }}>
                {t.modes.liveTitle}
              </h2>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.1rem 0.45rem',
                  borderRadius: '4px',
                  backgroundColor: tokens.brandPrimary,
                  color: '#ffffff',
                }}
              >
                {t.modes.liveBadge}
              </span>
            </div>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.84rem', color: tokens.textMuted, lineHeight: 1.45 }}>
              {t.modes.liveSubtitle}
            </p>
          </div>

          <div
            role="group"
            aria-label={t.common.difficulty}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.35rem',
              backgroundColor: tokens.bgSecondary,
              padding: '0.25rem',
              borderRadius: '6px',
            }}
          >
            {(['beginner', 'intermediate', 'advanced', 'expert'] as DifficultyTier[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setTier(d)}
                aria-pressed={tier === d}
                style={{
                  padding: '0.4rem 0.25rem',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: tier === d ? tokens.bgElevated : 'transparent',
                  color: tier === d ? tokens.brandPrimary : tokens.textPrimary,
                  fontWeight: tier === d ? 700 : 500,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
              >
                {t.difficulties[d]}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => startLiveMatch(tier)}
            style={{
              width: '100%',
              padding: '0.7rem',
              borderRadius: '6px',
              backgroundColor: tokens.brandPrimary,
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
            }}
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
      {/* Left Column: Status Bar & Board */}
      <div className="zimm-board-column">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            marginBottom: '0.55rem',
            gap: '0.5rem',
          }}
        >
          <MatchTimer seconds={elapsedSeconds} label={t.common.time} />

          <div
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: mistakes > 0 ? tokens.statusError : tokens.textMuted,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {t.game.mistakes}: {mistakes}
          </div>

          {isMatchActive ? (
            <button
              type="button"
              onClick={handleForfeit}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                border: `1px solid ${tokens.borderAccent}`,
                backgroundColor: 'transparent',
                color: tokens.statusError,
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t.live.forfeit}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => startLiveMatch(tier)}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: tokens.brandPrimary,
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {t.result.playAgain}
            </button>
          )}
        </div>

        {board.length > 0 && (
          <SudokuGrid
            board={board}
            selectedCell={selectedCell}
            onSelectCell={handleCellSelect}
            onDigitInput={handleDigitInput}
            onErase={handleErase}
            onToggleNotesMode={handleToggleNotesMode}
            onRequestHint={handleRequestHint}
          />
        )}
      </div>

      {/* Right Column: Mode Info, Opponent Progress & Keypad */}
      <div className="zimm-controls-column">
        <div
          style={{
            backgroundColor: tokens.bgElevated,
            border: `1px solid ${tokens.borderSubtle}`,
            borderRadius: '8px',
            padding: '0.85rem 1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: tokens.textPrimary }}>
              {t.modes.liveTitle} ({t.difficulties[tier]})
            </h2>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.1rem 0.45rem',
                borderRadius: '4px',
                backgroundColor: tokens.brandPrimary,
                color: '#ffffff',
              }}
            >
              {t.modes.liveBadge}
            </span>
          </div>
          <p style={{ margin: '0.25rem 0 0.75rem', fontSize: '0.82rem', color: tokens.textMuted, lineHeight: 1.4 }}>
            {t.modes.liveSubtitle}
          </p>

          {/* Opponent Progress */}
          <div
            style={{
              backgroundColor: tokens.bgSecondary,
              padding: '0.65rem 0.75rem',
              borderRadius: '6px',
              border: `1px solid ${tokens.borderSubtle}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                fontWeight: 600,
                marginBottom: '0.35rem',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <span style={{ color: tokens.brandPrimary }}>You: {playerPercent}%</span>
              <span style={{ color: tokens.textSecondary }}>
                Opponent: {opponentPercent}%
              </span>
            </div>
            <div
              style={{
                height: '8px',
                borderRadius: '4px',
                backgroundColor: tokens.borderSubtle,
                overflow: 'hidden',
                display: 'flex',
              }}
            >
              <div
                style={{
                  width: `${playerPercent}%`,
                  backgroundColor: tokens.brandPrimary,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div
              style={{
                marginTop: '0.35rem',
                minHeight: '1.1rem',
                fontSize: '0.74rem',
                color: opponentFinished ? tokens.brandPrimary : tokens.textMuted,
                fontWeight: opponentFinished ? 600 : 400,
              }}
            >
              {opponentFinished ? t.live.opponentFinished : t.live.matchInProgress}
            </div>
          </div>
        </div>

        <Keypad
          inputMode={inputMode}
          onToggleInputMode={handleToggleNotesMode}
          onDigitClick={handleDigitInput}
          onEraseClick={handleErase}
          onHintClick={handleRequestHint}
          hintsRemaining={3 - hintsUsed}
          maxHints={3}
        />
      </div>

      {/* Staged Hint Modal */}
      <HintModal
        hint={currentHint}
        currentStage={hintStage}
        onAdvanceStage={() => setHintStage((s) => (s + 1) as 2 | 3)}
        onClose={() => setCurrentHint(null)}
        hintsRemaining={3 - hintsUsed}
      />

      {/* Result Modal */}
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
