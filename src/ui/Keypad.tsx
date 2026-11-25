import React from 'react';
import { InputMode } from '../game/types';
import { useI18n } from '../i18n/i18nContext';
import { Digit } from '../timely/types';
import { useTheme } from '../theme/themeContext';

interface KeypadProps {
  inputMode: InputMode;
  onToggleInputMode: () => void;
  onDigitClick: (digit: Digit) => void;
  onEraseClick: () => void;
  onHintClick?: () => void;
  hintsRemaining?: number;
  maxHints?: number;
}

export const Keypad: React.FC<KeypadProps> = ({
  inputMode,
  onToggleInputMode,
  onDigitClick,
  onEraseClick,
  onHintClick,
  hintsRemaining = 3,
  maxHints = 3,
}) => {
  const { tokens } = useTheme();
  const { t } = useI18n();

  const isNotes = inputMode === 'notes';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        width: '100%',
      }}
    >
      {/* Input mode segmented control */}
      <div
        role="group"
        aria-label={t.game.inputModeLabel}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.35rem',
          backgroundColor: tokens.bgSecondary,
          padding: '0.25rem',
          borderRadius: '6px',
          border: `1px solid ${tokens.borderSubtle}`,
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (isNotes) onToggleInputMode();
          }}
          aria-pressed={!isNotes}
          style={{
            padding: '0.5rem 0.5rem',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: !isNotes ? tokens.brandPrimary : 'transparent',
            color: !isNotes ? '#ffffff' : tokens.textPrimary,
            fontWeight: 600,
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          {t.game.normalMode}
        </button>
        <button
          type="button"
          onClick={() => {
            if (!isNotes) onToggleInputMode();
          }}
          aria-pressed={isNotes}
          style={{
            padding: '0.5rem 0.5rem',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: isNotes ? tokens.brandPrimary : 'transparent',
            color: isNotes ? '#ffffff' : tokens.textPrimary,
            fontWeight: 600,
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          {t.game.notesMode} (N)
        </button>
      </div>

      {/* Digit buttons 1-9 */}
      <div className="zimm-digits-grid" role="group" aria-label="Number keypad">
        {([1, 2, 3, 4, 5, 6, 7, 8, 9] as Digit[]).map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => onDigitClick(digit)}
            aria-label={isNotes ? `${t.game.pencilNotes} ${digit}` : `${digit}`}
            style={{
              minHeight: '44px',
              borderRadius: '6px',
              border: `1px solid ${tokens.borderSubtle}`,
              backgroundColor: tokens.bgElevated,
              color: isNotes ? tokens.digitNote : tokens.brandPrimary,
              fontWeight: 700,
              fontSize: '1.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {digit}
          </button>
        ))}
      </div>

      {/* Secondary turn actions: Erase and Hint */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: onHintClick ? '1fr 1fr' : '1fr',
          gap: '0.5rem',
        }}
      >
        <button
          type="button"
          onClick={onEraseClick}
          aria-label={`${t.game.erase} (Delete)`}
          style={{
            padding: '0.55rem 0.6rem',
            borderRadius: '6px',
            border: `1px solid ${tokens.borderSubtle}`,
            backgroundColor: tokens.bgSecondary,
            color: tokens.textPrimary,
            fontWeight: 600,
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          {t.game.erase} (Del)
        </button>

        {onHintClick && (
          <button
            type="button"
            onClick={onHintClick}
            disabled={hintsRemaining <= 0}
            aria-label={`${t.game.hint} (${hintsRemaining}/${maxHints})`}
            style={{
              padding: '0.55rem 0.6rem',
              borderRadius: '6px',
              border: `1px solid ${hintsRemaining > 0 ? tokens.borderAccent : tokens.borderSubtle}`,
              backgroundColor: tokens.bgSecondary,
              color: hintsRemaining > 0 ? tokens.brandPrimary : tokens.textMuted,
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: hintsRemaining > 0 ? 'pointer' : 'not-allowed',
              opacity: hintsRemaining > 0 ? 1 : 0.6,
            }}
          >
            {t.game.hint} ({hintsRemaining}/{maxHints})
          </button>
        )}
      </div>

      <p
        style={{
          margin: 0,
          minHeight: '2.3rem',
          fontSize: '0.76rem',
          color: tokens.textMuted,
          lineHeight: 1.4,
        }}
      >
        {isNotes ? t.game.notesHelp : onHintClick ? t.game.hintHelp : ''}
      </p>
    </div>
  );
};
