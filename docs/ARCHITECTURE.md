# Zimm Architecture and System Design

## 1. System Overview

Zimm is a competitive Sudoku platform where players solve different puzzles calibrated to verified difficulty levels. The architecture is engineered around the principle of **Zero God Files**: each domain owns clear, cohesive boundaries without monolithic catch-all files.

```
                          ┌─────────────────────────┐
                          │   UI Layer (React 19)   │
                          │ Header, SudokuGrid,     │
                          │ Keypad, Modals, Views   │
                          └────────────┬────────────┘
                                       │
                  ┌────────────────────┼────────────────────┐
                  ▼                    ▼                    ▼
        ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
        │  Game Domain     │  │  i18n & Theme    │  │  Fair Play       │
        │  Board State,    │  │  En/Yo Locales,  │  │  Telemetry,      │
        │  Pencil Notes,   │  │  Tokens (numb),  │  │  Heuristic Rules,│
        │  Lifecycle       │  │  Inter font      │  │  Review Queue    │
        └─────────┬────────┘  └──────────────────┘  └────────┬─────────┘
                  │                                          │
                  └────────────────────┬─────────────────────┘
                                       │
                                       ▼
                       ┌───────────────────────────────┐
                       │   Server & Orchestrator       │
                       │   Move Validation, MatchStore │
                       └───────┬───────────────┬───────┘
                               │               │
                               ▼               ▼
                     ┌────────────────┐ ┌────────────────┐
                     │ tiMely Engine  │ │ Endgame Engine │
                     │ Puzzle Gen,    │ │ Elo Rating,    │
                     │ Solver, Hints  │ │ Performance    │
                     └────────────────┘ └────────────────┘
```

---

## 2. Directory Structure and Module Boundaries

```
zimm/
├── docs/                      # Comprehensive technical and community documentation
│   ├── ARCHITECTURE.md
│   ├── TIMELY_TECHNICAL_REFERENCE.md
│   ├── ENDGAME_TECHNICAL_REFERENCE.md
│   ├── MAINTAINER_RESERVE_POOL.md
│   ├── FAIR_PLAY_AND_INTEGRITY.md
│   ├── LOCALIZATION_GLOSSARY.md
│   ├── THEME_AND_ACCESSIBILITY.md
│   ├── CONTRIBUTING.md
│   ├── SECURITY.md
│   ├── CODE_OF_CONDUCT.md
│   └── CHANGELOG.md
├── src/
│   ├── timely/                # Puzzle Engine (internal engineering name)
│   │   ├── types.ts           # Grid, deduction, profile contracts
│   │   ├── grid.ts            # Grid utilities, coordinate helpers, peers
│   │   ├── mrvBacktracker.ts  # MRV recursive backtracker with randomized ties
│   │   ├── solutionCounter.ts # Capped solution counter (cap = 2) for uniqueness
│   │   ├── clueRemover.ts     # Shuffled clue removal loop
│   │   ├── techniques/        # Single, locked candidates, pairs
│   │   ├── logicalSolver.ts   # Tiered solver with deduction logging
│   │   ├── profiles.ts        # Beginner, intermediate, advanced, expert profiles
│   │   ├── hintStager.ts      # 3-stage hint creator (nudge -> tech -> deduction)
│   │   ├── precomputedFallbacks.ts # Verified emergency fallback puzzles
│   │   └── pipeline.ts        # End-to-end generator and retry controller
│   ├── endgame/               # Rating Engine (internal engineering name)
│   │   ├── types.ts           # Rating contracts, deltas, performance metrics
│   │   ├── config.ts          # Centralized tunable knobs and constants
│   │   ├── expectedScore.ts   # Elo logistic probability formula
│   │   ├── performance.ts     # Difficulty-adjusted effective time & score
│   │   ├── outcome.ts         # Match outcome determination (finisher vs non-finisher)
│   │   ├── spikeDetector.ts   # Difficulty spike detector
│   │   ├── reservePool.ts     # Asymmetric tax and pool ledger
│   │   ├── ratingUpdate.ts    # Full match rating calculation pipeline
│   │   └── simulator.ts       # Monte-Carlo cohort simulation harness
│   ├── fairplay/              # Anti-cheat and telemetry
│   │   ├── types.ts           # Event, anomaly, and review queue contracts
│   │   ├── eventRecorder.ts   # Minimal telemetry collector
│   │   ├── rules.ts           # Explainable heuristic rules
│   │   ├── reviewQueue.ts     # Maintainer review queue manager
│   │   └── retention.ts       # Data retention and purge policy
│   ├── game/                  # Core game state & mechanics
│   │   ├── types.ts           # Cell, board, lifecycle types
│   │   ├── pencilNotes.ts     # Isolated candidate scratchpad manager
│   │   ├── boardState.ts      # Grid matrix mutator and completion check
│   │   ├── moveValidator.ts   # Placement validation
│   │   └── lifecycle.ts       # Match state machine transitions
│   ├── server/                # Orchestration and persistence
│   │   ├── types.ts           # Session and async challenge types
│   │   ├── matchStore.ts      # LocalStorage & memory ledger
│   │   └── orchestrator.ts    # Live & async match coordinator
│   ├── i18n/                  # Localization (English & Yoruba)
│   │   ├── types.ts           # Translation dictionary types
│   │   ├── locales/en.ts      # English translation dictionary
│   │   ├── locales/yo.ts      # Yoruba translation dictionary with tone marks
│   │   ├── glossary.ts        # Official translation glossary
│   │   └── i18nContext.tsx    # Context provider & switcher
│   ├── theme/                 # Numb design system
│   │   ├── tokens.ts          # Brand colors & light/dark tokens
│   │   └── themeContext.tsx   # Context provider & DOM token injector
│   ├── ui/                    # Cohesive UI components (Zero god files)
│   │   ├── Header.tsx
│   │   ├── SudokuCell.tsx
│   │   ├── SudokuGrid.tsx
│   │   ├── PencilNotesDisplay.tsx
│   │   ├── Keypad.tsx
│   │   ├── HintModal.tsx
│   │   ├── MatchTimer.tsx
│   │   ├── SoloGameView.tsx
│   │   ├── LiveMatchView.tsx
│   │   ├── AsyncMatchView.tsx
│   │   ├── MatchResultModal.tsx
│   │   ├── ReviewQueueView.tsx
│   │   ├── SimulationModal.tsx
│   │   ├── HowToPlayModal.tsx # Overlay guide modal (preserves active game state)
│   │   ├── AboutModal.tsx     # Licence, repository link, and maintainer route link
│   │   └── App.tsx            # Root router (game modes + #maintainer route)
│   ├── index.css              # Inter typography, responsive workspace, and focus styles
│   └── main.tsx               # Application bootstrap
└── tests/                     # Automated Vitest test suite
```
