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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
          <span>{t.common.back}</span>
        </button>

        <button
          type="button"
          className="zimm-tool-btn"
          onClick={onEraseClick}
          aria-label={`${t.game.erase} (Delete)`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 20H7L3 16c-.6-.6-.6-1.5 0-2.1L13.1 3.8c.6-.6 1.5-.6 2.1 0l5 5c.6.6.6 1.5 0 2.1L11 20" />
          </svg>
          <span>{t.game.erase}</span>
        </button>

        <button
          type="button"
          className="zimm-tool-btn"
          onClick={onToggleInputMode}
          aria-pressed={isNotes}
          aria-label={`${t.game.notesMode} (N)`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <span>{t.game.notesMode}</span>
        </button>

        {onHintClick && (
          <button
            type="button"
            className="zimm-tool-btn"
            onClick={onHintClick}
            disabled={hintsRemaining <= 0}
            aria-label={`${t.game.hint} (${hintsRemaining}/${maxHints})`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 18h6" />
              <path d="M10 22h4" />
              <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z" />
            </svg>
            <span>
              {t.game.hint} ({hintsRemaining}/{maxHints})
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
