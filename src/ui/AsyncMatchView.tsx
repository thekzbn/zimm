import React, { useState, useEffect, useRef } from 'react';
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
import { useTheme } from '../theme/themeContext';
import { HintModal } from './HintModal';
import { Keypad } from './Keypad';
import { MatchResultModal } from './MatchResultModal';
import { MatchTimer } from './MatchTimer';
import { SudokuGrid } from './SudokuGrid';

export const AsyncMatchView: React.FC = () => {
  const { tokens } = useTheme();
  const { t } = useI18n();
  const user = matchStore.getUserProfile();

  const [tier, setTier] = useState<DifficultyTier>('intermediate');
  const [activeChallenge, setActiveChallenge] = useState<AsyncChallenge | null>(null);
  const [inputCode, setInputCode] = useState<string>('');
  const [board, setBoard] = useState<BoardMatrix>([]);
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

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isSolving) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSolving]);

  const handleCreateChallenge = () => {
    const challenge = serverOrchestrator.createAsyncChallenge(user.id, user.rating, tier);
    setActiveChallenge(challenge);
    setIsOpponentRole(false);

    // Initialize creator's puzzle
    setBoard(initializeBoard(challenge.puzzleA.initialGrid));
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

    // Initialize opponent's puzzle
    setBoard(initializeBoard(challenge.puzzleB.initialGrid));
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
      navigator.clipboard.writeText(activeChallenge.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCellSelect = (r: number, c: number) => {
    setSelectedCell({ row: r, col: c });
  };

  const handleDigitInput = (digit: Digit) => {
    if (!selectedCell || !activeChallenge || !isSolving) return;
    const { row, col } = selectedCell;
    const cell = board[row][col];
    if (cell.isGiven) return;

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
          // Creator finished
          const updated = serverOrchestrator.submitCreatorSolve(
            activeChallenge.code,
            elapsedSeconds,
            mistakes,
            hintsUsed,
            true
          );
          if (updated) setActiveChallenge(updated);
        } else {
          // Opponent finished, resolve match
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
  };

  const handleErase = () => {
    if (!selectedCell || !isSolving) return;
    setBoard((prev) => eraseCellFromBoard(prev, selectedCell.row, selectedCell.col));
  };

  const handleRequestHint = () => {
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
  };

  if (!activeChallenge) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0.5rem',
          maxWidth: '480px',
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
            gap: '1.1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: tokens.textPrimary }}>
                {t.modes.asyncTitle}
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
                {t.modes.asyncBadge}
              </span>
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.84rem', color: tokens.textMuted, lineHeight: 1.4 }}>
              {t.modes.asyncSubtitle}
            </p>
          </div>

          {/* Create section */}
          <div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.98rem', color: tokens.textPrimary }}>
              {t.async.createChallenge}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem', marginBottom: '0.75rem' }}>
              {(['beginner', 'intermediate', 'advanced', 'expert'] as DifficultyTier[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setTier(d)}
                  aria-pressed={tier === d}
                  style={{
                    padding: '0.35rem 0.25rem',
                    borderRadius: '4px',
                    border: `1px solid ${tier === d ? tokens.borderAccent : tokens.borderSubtle}`,
                    backgroundColor: tier === d ? tokens.bgSelected : tokens.bgSecondary,
                    color: tier === d ? tokens.brandPrimary : tokens.textPrimary,
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {t.difficulties[d]}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleCreateChallenge}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: '6px',
                backgroundColor: tokens.brandPrimary,
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              {t.async.createChallenge}
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: tokens.textMuted,
              fontSize: '0.78rem',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: tokens.borderSubtle }} />
            <span>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: tokens.borderSubtle }} />
          </div>

          {/* Join section */}
          <div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.98rem', color: tokens.textPrimary }}>
              {t.async.joinChallenge}
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                aria-label={t.async.enterCode}
                placeholder={t.async.enterCode}
                value={inputCode}
                maxLength={6}
                onChange={(e) => { setInputCode(e.target.value.toUpperCase()); setJoinError(null); }}
                style={{
                  flex: 1,
                  padding: '0.55rem 0.75rem',
                  borderRadius: '4px',
                  border: `1px solid ${tokens.borderSubtle}`,
                  backgroundColor: tokens.bgSecondary,
                  color: tokens.textPrimary,
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              />
              <button
                type="button"
                onClick={handleJoinChallenge}
                disabled={inputCode.trim().length !== 6}
                style={{
                  padding: '0.55rem 1rem',
                  borderRadius: '4px',
                  backgroundColor: tokens.brandPrimary,
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: inputCode.trim().length === 6 ? 'pointer' : 'not-allowed',
                  opacity: inputCode.trim().length === 6 ? 1 : 0.6,
                }}
              >
                {t.async.joinChallenge}
              </button>
            </div>
            {joinError && (
              <p
                role="alert"
                style={{
                  margin: '0.35rem 0 0',
                  fontSize: '0.82rem',
                  color: tokens.statusError,
                  fontWeight: 500,
                }}
              >
                {joinError}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="zimm-workspace">
      {/* Left Column: Status Bar & Board (or Waiting State) */}
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
        </div>

        {!isSolving && !isOpponentRole && (
          <div
            style={{
              width: '100%',
              backgroundColor: tokens.bgElevated,
              padding: '1.5rem',
              borderRadius: '8px',
              border: `1px solid ${tokens.borderSubtle}`,
              textAlign: 'center',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem', color: tokens.statusSuccess }}>
              {t.game.completed}
            </h3>
            <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: tokens.textMuted }}>
              {t.async.waitingOpponentFinish}
            </p>
            <div
              style={{
                backgroundColor: tokens.bgSecondary,
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: tokens.textPrimary,
              }}
            >
              {t.async.shareCodePrompt}{' '}
              <span style={{ color: tokens.brandPrimary }}>{activeChallenge.code}</span>
            </div>
          </div>
        )}

        {isSolving && board.length > 0 && (
          <SudokuGrid
            board={board}
            selectedCell={selectedCell}
            onSelectCell={handleCellSelect}
            onDigitInput={handleDigitInput}
            onErase={handleErase}
            onToggleNotesMode={() => setInputMode((m) => (m === 'value' ? 'notes' : 'value'))}
            onRequestHint={handleRequestHint}
          />
        )}
      </div>

      {/* Right Column: Challenge Info & Keypad */}
      <div className="zimm-controls-column">
        <div
          style={{
            backgroundColor: tokens.bgElevated,
            border: `1px solid ${tokens.borderSubtle}`,
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '0.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: tokens.textPrimary }}>
              {t.modes.asyncTitle}
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
              {t.modes.asyncBadge}
            </span>
          </div>

          <div
            style={{
              backgroundColor: tokens.bgSecondary,
              padding: '0.65rem 0.75rem',
              borderRadius: '6px',
              border: `1px solid ${tokens.borderSubtle}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', color: tokens.textMuted }}>
                {t.async.challengeCode}
              </span>
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: tokens.brandPrimary,
                  letterSpacing: '0.1em',
                  fontFamily: 'monospace',
                }}
              >
                {activeChallenge.code}
              </div>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              style={{
                minWidth: '8.5rem',
                padding: '0.35rem 0.65rem',
                borderRadius: '4px',
                border: `1px solid ${tokens.borderSubtle}`,
                backgroundColor: tokens.bgElevated,
                color: tokens.textPrimary,
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
              }}
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
            onHintClick={handleRequestHint}
            hintsRemaining={3 - hintsUsed}
            maxHints={3}
          />
        )}
      </div>

      {/* Staged Hint Modal */}
      <HintModal
        hint={currentHint}
        currentStage={hintStage}
        onAdvanceStage={() => setHintStage((s) => (s + 1) as 2 | 3)}
        onClose={() => setCurrentHint(null)}
        hintsRemaining={3 - hintsUsed}
      />

      {/* Result Modal when resolved */}
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
