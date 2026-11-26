# Changelog

All notable changes to **Zimm** are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Changed
- **Ground-Up UI & UX Redesign (`refactor/ui-redesign`):** Rebuilt the interface with a `chess.com`-inspired persistent left navigation rail on desktop, a dedicated landing page (`LandingView`) prioritising Live Match, a strictly flat 1px-bordered layout, a constrained 4-step prose type scale, inline difficulty tabs and stats above the board, and a `sudoku.com`-style 3x3 digit keypad with Undo/Erase/Notes/Hint actions.
- **Accessibility & Resilience:** Darkened light-mode `textMuted` (`#5e423e`) and `statusError` (`#821917`) to pass WCAG AA 4.5:1 contrast, added modal focus trapping (`useModalFocusTrap`), `ErrorBoundary` recovery around game views, `tabIndex={0}` grid entry, `role="alert"` on inline errors, and `prefers-reduced-motion` support.

---

## [0.1.0] - 2026-11-22

### Added
- **Core Game Modes:** Complete implementation of Solo unrated play, Live Head-to-Head, and Asynchronous Head-to-Head challenge modes.
- **tiMely Puzzle Engine:** MRV recursive backtracking generation, uniqueness proof with capped solution counter (cap = 2), tiered logical solver, difficulty profiles, and 3-stage hint pipeline.
- **Endgame Rating Engine:** Difficulty-adjusted performance normalization, conventional Elo updates, asymmetric hidden reserve pool tax, and independent difficulty spike compensation.
- **Fair Play Telemetry:** Rule-based heuristic anomaly detection, minimal telemetry recording, multi-match corroboration, human maintainer review queue, and 30-day retention purge.
- **Pencil Notes:** Fully isolated candidate scratchpad with add, toggle, clear, and peer auto-pruning.
- **Localization:** 100% key parity between English (`en`) and Yorùbá (`yo`) with authentic diacritics and tone marks.
- **Theme & Design System:** `numb` brand palette (Brown Derby, Falu Red, Tamarillo, Zeus) with light/dark modes, Inter typography, and WCAG AA contrast compliance.
- **Automated Test Suite:** 13 test suites with 39 passing tests covering puzzle generation, uniqueness proofs, Elo math, hint costs, fair play, and localization parity.
- **Comprehensive Documentation:** Full technical references, maintainer reserve pool documentation, and open-source contribution guidelines.
