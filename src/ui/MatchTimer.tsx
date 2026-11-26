import React from 'react';
import { useI18n } from '../i18n/i18nContext';

interface MatchTimerProps {
  seconds: number;
  label?: string;
}

export const MatchTimer: React.FC<MatchTimerProps> = ({ seconds, label }) => {
  const { t } = useI18n();
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="zimm-stat">
      <span className="zimm-stat__label">{label ?? t.common.time}</span>
      <span className="zimm-stat__value">{formatted}</span>
    </div>
  );
};
