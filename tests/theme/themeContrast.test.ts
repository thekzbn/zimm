import { describe, expect, it } from 'vitest';
import { DARK_TOKENS, LIGHT_TOKENS, NUMB_BRAND } from '../../src/theme/tokens';

function getLuminance(hex: string): number {
  const rgb = hex
    .replace('#', '')
    .match(/.{2}/g)!
    .map((x) => parseInt(x, 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (brighter + 0.05) / (darker + 0.05);
}

describe('Theme Tokens and WCAG Contrast Verification', () => {
  it('contains the exact numb brand palette hex codes', () => {
    expect(NUMB_BRAND.brownDerby.toLowerCase()).toBe('#4a1815');
    expect(NUMB_BRAND.faluRed.toLowerCase()).toBe('#821917');
    expect(NUMB_BRAND.tamarillo.toLowerCase()).toBe('#a61b19');
    expect(NUMB_BRAND.zeus.toLowerCase()).toBe('#211914');
  });

  it('guarantees WCAG AA readable contrast for primary text on background in Light mode', () => {
    const contrast = getContrastRatio(LIGHT_TOKENS.textPrimary, LIGHT_TOKENS.bgPrimary);
    expect(contrast).toBeGreaterThan(4.5);
  });

  it('guarantees WCAG AA readable contrast for primary text on background in Dark mode', () => {
    const contrast = getContrastRatio(DARK_TOKENS.textPrimary, DARK_TOKENS.bgPrimary);
    expect(contrast).toBeGreaterThan(4.5);
  });

  it('guarantees WCAG AA readable contrast for muted text on primary and secondary surfaces in both modes', () => {
    expect(getContrastRatio(LIGHT_TOKENS.textMuted, LIGHT_TOKENS.bgPrimary)).toBeGreaterThan(4.5);
    expect(getContrastRatio(LIGHT_TOKENS.textMuted, LIGHT_TOKENS.bgSecondary)).toBeGreaterThan(4.5);
    expect(getContrastRatio(DARK_TOKENS.textMuted, DARK_TOKENS.bgPrimary)).toBeGreaterThan(4.5);
    expect(getContrastRatio(DARK_TOKENS.textMuted, DARK_TOKENS.bgSecondary)).toBeGreaterThan(4.5);
  });

  it('guarantees WCAG AA readable contrast for error alerts in both modes', () => {
    expect(getContrastRatio(LIGHT_TOKENS.statusError, LIGHT_TOKENS.bgError)).toBeGreaterThan(4.5);
    expect(getContrastRatio(DARK_TOKENS.statusError, DARK_TOKENS.bgError)).toBeGreaterThan(4.5);
  });

  it('guarantees WCAG AA contrast for given digits on elevated background in both modes', () => {
    const lightDigitContrast = getContrastRatio(
      LIGHT_TOKENS.digitGiven,
      LIGHT_TOKENS.bgElevated
    );
    expect(lightDigitContrast).toBeGreaterThan(4.5);

    const darkDigitContrast = getContrastRatio(
      DARK_TOKENS.digitGiven,
      DARK_TOKENS.bgElevated
    );
    expect(darkDigitContrast).toBeGreaterThan(4.5);
  });
});
