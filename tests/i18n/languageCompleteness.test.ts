import { describe, expect, it } from 'vitest';
import { en } from '../../src/i18n/locales/en';
import { yo } from '../../src/i18n/locales/yo';

function getDeepKeys(obj: Record<string, any>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      keys = keys.concat(getDeepKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe('Internationalization (i18n) Completeness and Parity', () => {
  it('verifies exact key parity between English and Yoruba locales', () => {
    const enKeys = getDeepKeys(en).sort();
    const yoKeys = getDeepKeys(yo).sort();

    expect(enKeys).toEqual(yoKeys);
  });

  it('ensures no empty translation values in English or Yoruba', () => {
    const checkNoEmpty = (obj: Record<string, any>) => {
      for (const val of Object.values(obj)) {
        if (typeof val === 'string') {
          expect(val.trim().length).toBeGreaterThan(0);
        } else if (typeof val === 'object' && val !== null) {
          checkNoEmpty(val);
        }
      }
    };

    checkNoEmpty(en);
    checkNoEmpty(yo);
  });

  it('verifies that Yoruba locale uses authentic tone marks and subdots', () => {
    // Yoruba vowels with diacritics (ẹ, ọ, àmì ohùn: á, à, é, è, etc.)
    const yorubaDiacriticsRegex = /[áàéèẹ́ẹ̀íìóòọ́ọ̀úùṣ]/i;
    const sampleYorubaTexts = [
      yo.common.difficulty,
      yo.nav.solo,
      yo.game.pencilNotes,
      yo.result.victory,
    ];

    for (const text of sampleYorubaTexts) {
      expect(yorubaDiacriticsRegex.test(text)).toBe(true);
    }
  });

  it('guarantees that internal engine names tiMely and Endgame NEVER appear in player-facing translations', () => {
    const checkForForbiddenEngineNames = (obj: Record<string, any>) => {
      for (const [key, val] of Object.entries(obj)) {
        // Skip maintainer section since maintainer console is not a player-facing game surface
        if (key === 'maintainer') continue;

        if (typeof val === 'string') {
          expect(val).not.toMatch(/tiMely/i);
          expect(val).not.toMatch(/Endgame/i);
        } else if (typeof val === 'object' && val !== null) {
          checkForForbiddenEngineNames(val);
        }
      }
    };

    checkForForbiddenEngineNames(en);
    checkForForbiddenEngineNames(yo);
  });
});
