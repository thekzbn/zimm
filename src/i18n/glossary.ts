/**
 * Official Translation Glossary for Zimm
 * English -> Yoruba Terminology
 */

export interface GlossaryEntry {
  en: string;
  yo: string;
  context: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  { en: 'Cell', yo: 'Àkópọ̀', context: 'Individual grid square in 9x9 board' },
  { en: 'Pencil Notes', yo: 'Àkọsílẹ̀ Pẹ́ńsù', context: 'Candidate scratch digits in uncommitted cells' },
  { en: 'Hint', yo: 'Ìmọ̀ràn', context: 'Staged solver recommendation with performance cost' },
  { en: 'Difficulty', yo: 'Ìpele Ìṣòro', context: 'Puzzle difficulty rating' },
  { en: 'Beginner', yo: 'Olùbẹ̀rẹ̀', context: 'Difficulty tier 1' },
  { en: 'Intermediate', yo: 'Aláàárín', context: 'Difficulty tier 2' },
  { en: 'Advanced', yo: 'Onípò Gíga', context: 'Difficulty tier 3' },
  { en: 'Expert', yo: 'Ògbóntarìgì', context: 'Difficulty tier 4' },
  { en: 'Solo Play', yo: 'Ìdánrawò Nìkan', context: 'Unrated practice mode' },
  { en: 'Live Head-to-Head', yo: 'Ìdíje Ojukoroju Lẹ́sẹ̀kẹsẹ̀', context: 'Real-time rated match' },
  { en: 'Async Head-to-Head', yo: 'Ìpèníjà Lọ́tọ̀ọ̀tọ̀', context: 'Asynchronous rated match' },
  { en: 'Victory', yo: 'Ìṣẹ́gun', context: 'Match win outcome' },
  { en: 'Defeat', yo: 'Ìfẹsẹ̀wọnlẹ̀', context: 'Match loss outcome' },
  { en: 'Draw', yo: 'Ìbáradọ́gba', context: 'Tied match outcome' },
  { en: 'Mistakes', yo: 'Àṣìṣe', context: 'Incorrect cell placement attempts' },
  { en: 'Accuracy', yo: 'Ìpéye', context: 'Placement accuracy metric' },
  { en: 'Speed', yo: 'Ìyára', context: 'Solve time duration' },
  { en: 'Rating', yo: 'Ìpele Ìdíje', context: 'Player competition rating score' },
  { en: 'Forfeit', yo: 'Ju Ọwọ́ Sílẹ̀', context: 'Voluntary match resignation' },
  { en: 'Challenge Code', yo: 'Kóòdù Ìpèníjà', context: 'Identifier for async match' },
];
