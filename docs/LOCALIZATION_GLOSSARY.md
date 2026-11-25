# Localization Guide and Terminology Glossary

Zimm launches with complete first-class support for **English (`en`)** and **Yorùbá (`yo`)**.

---

## 1. Yorùbá Orthography and Tone Marks

Yorùbá is a tonal language with three distinct pitch levels:
- **High tone (Mí):** Acute accent (`´`), e.g. *á, é, ẹ́, í, ó, ọ́, ú*.
- **Mid tone (Re):** Unmarked, e.g. *a, e, ẹ, i, o, ọ, u*.
- **Low tone (Dọ̀):** Grave accent (`` ` ``), e.g. *à, è, ẹ̀, ì, ò, ọ̀, ù*.

Subdots under letters (`ẹ`, `ọ`, `ṣ`) denote open vowels and the postalveolar fricative /ʃ/. All interface strings and system messages in Zimm must rigorously apply proper tone marks and subdots.

---

## 2. Official Terminology Glossary

| English Term | Yorùbá Term | Context & Usage |
| :--- | :--- | :--- |
| **Zimm** | Zimm | Product name (unchanged in all locales) |
| **Sudoku** | Sudoku | Game type |
| **Cell** | Àkópọ̀ | Individual square within the 9x9 grid |
| **Row** | Ìlà | Horizontal line of 9 cells |
| **Column** | Ọ̀wọ́ | Vertical line of 9 cells |
| **Box / Block** | Àpótí | $3 \times 3$ subgrid |
| **Pencil Notes** | Àkọsílẹ̀ Pẹ́ńsù | Candidate scratch marks in uncommitted cells |
| **Notes Mode** | Ipò Pẹ́ńsù | Keypad state for entering candidate scratch marks |
| **Number Mode** | Ipò Nọ́ḿbà | Keypad state for committing permanent digits |
| **Erase** | Pa rẹ́ | Clearing a cell or candidate note |
| **Hint** | Ìmọ̀ràn | Staged deduction advice with performance penalty |
| **Difficulty** | Ìpele Ìṣòro | Puzzle complexity tier |
| **Beginner** | Olùbẹ̀rẹ̀ | Tier 1 difficulty |
| **Intermediate** | Aláàárín | Tier 2 difficulty |
| **Advanced** | Onípò Gíga | Tier 3 difficulty |
| **Expert** | Ògbóntarìgì | Tier 4 difficulty |
| **Solo Play** | Ìdánrawò Nìkan | Practice mode (does not affect shared rating) |
| **Live Head-to-Head** | Ìdíje Ojukoroju Lẹ́sẹ̀kẹsẹ̀ | Real-time rated match |
| **Async Head-to-Head** | Ìpèníjà Lọ́tọ̀ọ̀tọ̀ | Asynchronous challenge mode |
| **Victory** | Ìṣẹ́gun | Match win outcome |
| **Defeat** | Ìfẹsẹ̀wọnlẹ̀ | Match loss outcome |
| **Draw** | Ìbáradọ́gba | Tied match outcome |
| **Mistakes** | Àṣìṣe | Incorrect cell placement count |
| **Accuracy** | Ìpéye | Accuracy metric |
| **Speed** | Ìyára | Elapsed solve duration |
| **Rating** | Ìpele Ìdíje | Player competition rating |
| **Forfeit** | Ju Ọwọ́ Sílẹ̀ | Conceding an in-progress match |
| **Challenge Code** | Kóòdù Ìpèníjà | 6-character asynchronous match identifier |
| **Maintainer Console**| Ojú Ìtọ́jú Ètò | Administrative and simulation dashboard |

---

## 3. Translation Parity Verification

Zimm enforces **100% key parity** between English and Yorùbá via automated tests in [`tests/i18n/languageCompleteness.test.ts`](../tests/i18n/languageCompleteness.test.ts#L1-L60).
