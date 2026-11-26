import React from 'react';
import { InputMode } from '../game/types';
import { useI18n } from '../i18n/i18nContext';
import { Digit } from '../timely/types';

interface KeypadProps {
  inputMode: InputMode;
  onToggleInputMode: () => void;
  onDigitClick: (digit: Digit) => void;
  onEraseClick: () => void;
  onUndoClick?: () => void;
  canUndo?: boolean;
  onHintClick?: () => void;
  hintsRemaining?: number;
  maxHints?: number;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
}

export const Keypad: React.FC<KeypadProps> = ({
  inputMode,
  onToggleInputMode,
  onDigitClick,
  onEraseClick,
  onUndoClick,
  canUndo = false,
  onHintClick,
  hintsRemaining = 3,
  maxHints = 3,
  onPrimaryAction,
  primaryActionLabel,
}) => {
  const { t } = useI18n();
  const isNotes = inputMode === 'notes';

  const toolbarClass = onHintClick ? 'zimm-toolbar' : 'zimm-toolbar zimm-toolbar--no-hint';

  return (
    <div className="zimm-keypad">
      {/* Action toolbar inspired by sudoku.com: Undo, Erase, Notes, Hint */}
      <div className={toolbarClass} role="group" aria-label={t.game.inputModeLabel}>
        <button
          type="button"
          className="zimm-tool-btn"
          onClick={onUndoClick}
          disabled={!onUndoClick || !canUndo}
          aria-label={`${t.common.back} (Ctrl+Z)`}
        >
          <span>{t.common.back}</span>
          <span className="zimm-tool-btn__sub">Z</span>
        </button>

        <button
          type="button"
          className="zimm-tool-btn"
          onClick={onEraseClick}
          aria-label={`${t.game.erase} (Delete)`}
        >
          <span>{t.game.erase}</span>
          <span className="zimm-tool-btn__sub">Del</span>
        </button>

        <button
          type="button"
          className="zimm-tool-btn"
          onClick={onToggleInputMode}
          aria-pressed={isNotes}
          aria-label={`${t.game.notesMode} (N)`}
        >
          <span>{t.game.notesMode}</span>
          <span className="zimm-tool-btn__sub">{isNotes ? 'ON' : 'OFF'}</span>
        </button>

        {onHintClick && (
          <button
            type="button"
            className="zimm-tool-btn"
            onClick={onHintClick}
            disabled={hintsRemaining <= 0}
            aria-label={`${t.game.hint} (${hintsRemaining}/${maxHints})`}
          >
            <span>{t.game.hint}</span>
            <span className="zimm-tool-btn__sub">
              {hintsRemaining}/{maxHints}
            </span>
          </button>
        )}
      </div>

      {/* 3x3 Digit Keypad matching sudoku.com */}
      <div className="zimm-digits" role="group" aria-label="Number keypad">
        {([1, 2, 3, 4, 5, 6, 7, 8, 9] as Digit[]).map((digit) => (
          <button
            key={digit}
            type="button"
            className={`zimm-digit-btn ${isNotes ? 'zimm-digit-btn--notes' : ''}`}
            onClick={() => onDigitClick(digit)}
            aria-label={isNotes ? `${t.game.pencilNotes} ${digit}` : `${digit}`}
          >
            {digit}
          </button>
        ))}
      </div>

      {/* Primary CTA directly below digit pad */}
      {onPrimaryAction && primaryActionLabel && (
        <button
          type="button"
          className="zimm-btn-primary"
          onClick={onPrimaryAction}
        >
          {primaryActionLabel}
        </button>
      )}

      <p className="zimm-help">
        {isNotes ? t.game.notesHelp : onHintClick ? t.game.hintHelp : t.game.shortcutsHelp}
      </p>
    </div>
  );
};
