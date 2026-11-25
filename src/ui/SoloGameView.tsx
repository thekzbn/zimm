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
import { useTheme } from '../theme/themeContext';
import { HintModal } from './HintModal';
import { Keypad } from './Keypad';
import { MatchResultModal } from './MatchResultModal';
import { MatchTimer } from './MatchTimer';
import { SudokuGrid } from './SudokuGrid';

export const SoloGameView: React.FC = () => {
  const { tokens } = useTheme();
  const { t } = useI18n();

  const [tier, setTier] = useState<DifficultyTier>('intermediate');
  const [puzzle, setPuzzle] = useState<GeneratedPuzzle | null>(null);
  const [board, setBoard] = useState<BoardMatrix>([]);
  const [selectedCell, setSelectedCell] = useState<CellCoord | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('value');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [mistakes, setMistakes] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [currentHint, setCurrentHint] = useState<StagedHint | null>(null);
  const [hintStage, setHintStage] = useState<1 | 2 | 3>(1);
  const [showResult, setShowResult] = useState<boolean>(false);

  const timerRef = useRef<any>(null);
  const matchIdRef = useRef<string>(`solo_${Date.now()}`);

  const startNewGame = useCallback((selectedTier: DifficultyTier) => {
    const newPuzzle = generatePuzzle(selectedTier);
    setPuzzle(newPuzzle);
    setBoard(initializeBoard(newPuzzle.initialGrid));
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

  // Timer interval
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const handleCellSelect = (r: number, c: number) => {
    setSelectedCell({ row: r, col: c });
  };

  const handleDigitInput = (digit: Digit) => {
    if (!selectedCell || !puzzle || !isActive) return;
    const { row, col } = selectedCell;
    const cell = board[row][col];
    if (cell.isGiven) return;

    if (inputMode === 'notes') {
      // Toggle scratch note
      setBoard((prev) => toggleCellNote(prev, row, col, digit));
      eventRecorder.recordEvent(matchIdRef.current, 'solo_player', 'note_toggled', {
        cell: selectedCell,
        digit,
      });
      return;
    }

    // Place value
    const isCorrect = puzzle.solutionGrid[row][col] === digit;
    const updatedBoard = commitDigitToBoard(board, row, col, digit, isCorrect);
    setBoard(updatedBoard);

    if (isCorrect) {
      eventRecorder.recordEvent(matchIdRef.current, 'solo_player', 'digit_placed', {
        cell: selectedCell,
        digit,
      });

      // Check win
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
  };

  const handleErase = () => {
    if (!selectedCell || !isActive) return;
    setBoard((prev) => eraseCellFromBoard(prev, selectedCell.row, selectedCell.col));
    eventRecorder.recordEvent(matchIdRef.current, 'solo_player', 'digit_erased', {
      cell: selectedCell,
    });
  };

  const handleRequestHint = () => {
    if (!puzzle || !isActive || hintsUsed >= 3) return;

    // Current grid representation
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
  };

  const handleAdvanceHintStage = () => {
    if (!currentHint) return;
    const nextStage = (hintStage + 1) as 2 | 3;
    setHintStage(nextStage);
    const updated = {
      ...currentHint,
      stage: nextStage,
      message:
        nextStage === 2
          ? {
              en: `Look for an applicable logical deduction around this cell.`,
              yo: `Wá ìgbésẹ̀ ìṣirò tó bá a mu ní àkópọ̀ yìí.`,
            }
          : {
              en: `Focus cell solution is deduced. Place value carefully.`,
              yo: `A ti rí nọ́ḿbà tó tọ́. Kọ ọ́ síbẹ̀ pẹ̀lú ìṣọ́ra.`,
            },
    };
    setCurrentHint(updated);
  };

  return (
    <div className="zimm-workspace">
      {/* Left Column: Board & Match Status */}
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
          <button
            type="button"
            onClick={() => startNewGame(tier)}
            style={{
              padding: '0.35rem 0.7rem',
              borderRadius: '6px',
              border: `1px solid ${tokens.borderSubtle}`,
              backgroundColor: tokens.bgSecondary,
              color: tokens.textPrimary,
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t.game.newPuzzle}
          </button>
        </div>

        {board.length > 0 && (
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

      {/* Right Column: Mode Info, Difficulty & Keypad */}
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
              {t.modes.soloTitle}
            </h2>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: tokens.textMuted }}>
              {t.modes.soloBadge}
            </span>
          </div>
          <p style={{ margin: '0.25rem 0 0.75rem', fontSize: '0.82rem', color: tokens.textMuted, lineHeight: 1.4 }}>
            {t.modes.soloSubtitle}
          </p>

          {/* Difficulty selector */}
          <div
            role="group"
            aria-label={t.common.difficulty}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.25rem',
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
                  padding: '0.35rem 0.25rem',
                  borderRadius: '4px',
                  border: tier === d ? `1px solid ${tokens.borderAccent}` : 'none',
                  backgroundColor: tier === d ? tokens.bgElevated : 'transparent',
                  color: tier === d ? tokens.brandPrimary : tokens.textPrimary,
                  fontWeight: tier === d ? 700 : 500,
                  fontSize: '0.76rem',
                  cursor: 'pointer',
                }}
              >
                {t.difficulties[d]}
              </button>
            ))}
          </div>
        </div>

        <Keypad
          inputMode={inputMode}
          onToggleInputMode={() => setInputMode((m) => (m === 'value' ? 'notes' : 'value'))}
          onDigitClick={handleDigitInput}
          onEraseClick={handleErase}
          onHintClick={handleRequestHint}
          hintsRemaining={3 - hintsUsed}
          maxHints={3}
        />
      </div>

      {/* Hint Modal */}
      <HintModal
        hint={currentHint}
        currentStage={hintStage}
        onAdvanceStage={handleAdvanceHintStage}
        onClose={() => setCurrentHint(null)}
        hintsRemaining={3 - hintsUsed}
      />

      {/* Solo Match Result Modal */}
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
              effectiveSolveTimeSeconds: elapsedSeconds * (1 + mistakes * 0.05) * (1 + hintsUsed * 0.15),
              normalizedPerformance:
                puzzle.expectedBenchmarkSeconds /
                (elapsedSeconds * (1 + mistakes * 0.05) * (1 + hintsUsed * 0.15)),
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
