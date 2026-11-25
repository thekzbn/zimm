/**
 * Zimm Design System Tokens
 * Brand Palette: "numb" (all lowercase)
 * Supplied colors:
 *  - Brown Derby: #4a1815
 *  - Falu Red:    #821917
 *  - Tamarillo:   #a61b19
 *  - Zeus:        #211914
 *
 * Neutrals and functional accents are documented below.
 */

export const NUMB_BRAND = {
  brownDerby: '#4a1815',
  faluRed: '#821917',
  tamarillo: '#a61b19',
  zeus: '#211914',
} as const;

export interface ColorTokens {
  bgPrimary: string;
  bgSecondary: string;
  bgElevated: string;
  bgSelected: string;
  bgHighlight: string;
  bgPeer: string;
  bgError: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  textAccent: string;

  borderSubtle: string;
  borderStrong: string;
  borderAccent: string;
  borderFocus: string;

  brandPrimary: string;
  brandHover: string;
  brandActive: string;
  brandDark: string;

  digitGiven: string;
  digitPlayer: string;
  digitError: string;
  digitNote: string;

  statusSuccess: string;
  statusWarning: string;
  statusError: string;
}

export const LIGHT_TOKENS: ColorTokens = {
  // Documented light neutrals
  bgPrimary: '#fbf8f7',
  bgSecondary: '#f3ece8',
  bgElevated: '#ffffff',
  bgSelected: '#fadcdb',
  bgHighlight: '#fdeeed',
  bgPeer: '#faecea',
  bgError: '#ffebee',

  textPrimary: '#211914', // Zeus
  textSecondary: '#4a1815', // Brown Derby
  textMuted: '#6d4c47',
  textInverse: '#ffffff',
  textAccent: '#821917', // Falu Red

  borderSubtle: '#dfd2cd',
  borderStrong: '#4a1815', // Brown Derby
  borderAccent: '#821917', // Falu Red
  borderFocus: '#a61b19', // Tamarillo

  brandPrimary: '#821917', // Falu Red
  brandHover: '#a61b19', // Tamarillo
  brandActive: '#4a1815', // Brown Derby
  brandDark: '#211914', // Zeus

  digitGiven: '#211914', // Zeus
  digitPlayer: '#821917', // Falu Red
  digitError: '#b71c1c',
  digitNote: '#5f4640',

  statusSuccess: '#2e7d32',
  statusWarning: '#e65100',
  statusError: '#a61b19',
};

export const DARK_TOKENS: ColorTokens = {
  // Documented dark neutrals
  bgPrimary: '#140f0d',
  bgSecondary: '#211914', // Zeus
  bgElevated: '#2a201b',
  bgSelected: '#4a1815', // Brown Derby
  bgHighlight: '#35221e',
  bgPeer: '#281c19',
  bgError: '#4d1c1c',

  textPrimary: '#fbf8f7',
  textSecondary: '#e4d3cf',
  textMuted: '#af9994',
  textInverse: '#211914',
  textAccent: '#ea7e7b',

  borderSubtle: '#3d2e29',
  borderStrong: '#821917', // Falu Red
  borderAccent: '#a61b19', // Tamarillo
  borderFocus: '#ea7e7b',

  brandPrimary: '#821917', // Falu Red
  brandHover: '#a61b19', // Tamarillo
  brandActive: '#4a1815', // Brown Derby
  brandDark: '#211914', // Zeus

  digitGiven: '#fbf8f7',
  digitPlayer: '#ff8a80',
  digitError: '#ff5252',
  digitNote: '#c7b2ad',

  statusSuccess: '#66bb6a',
  statusWarning: '#ffa726',
  statusError: '#ff5252',
};
