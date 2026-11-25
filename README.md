# Zimm

**Zimm** is a competitive, open-source Sudoku platform built around pure solving capability. Competitors solve **different Sudoku puzzles** calibrated to verified difficulty profiles, ensuring fair competition based on problem-solving ability rather than simple memorization.

Licensed under the **GNU Affero General Public License version 3 (AGPLv3)**.

---

## Repository and Deployment Status

- **Source Repository:** Public open-source repository.
- **App Deployment Status:** **Not deployed**. In accordance with release safety rules, repository visibility is strictly separate from deployment. No deployment or public launch occurs without the owner's explicit approval.

---

## Key Features

- **Solo Play:** Solve independently across Beginner, Intermediate, Advanced, and Expert tiers. Solo practice does not affect your shared competition rating.
- **Live Head-to-Head:** Compete in real time against an opponent solving a difficulty-matched board.
- **Async Head-to-Head:** Create shareable 6-character challenge codes and solve on your own schedule. Both live and async matches feed into the same competition rating.
- **Pencil Notes:** Full candidate scratchpad in every square. Add, toggle, edit, and clear notes with zero penalty. Notes are strictly isolated from committed moves and ratings.
- **Meaningful Hints:** Up to three staged hints (Nudge $\to$ Technique $\to$ Placement) per match. Each hint carries a noticeable $15\%$ penalty to difficulty-adjusted performance.
- **Bilingual Interface:** First-class English (`en`) and Yorùbá (`yo`) localization with authentic orthography and tone marks.
- **Design System:** Built on the `numb` brand palette (`#4a1815`, `#821917`, `#a61b19`, `#211914`) with compulsory Light and Dark modes and WCAG AA contrast compliance.
- **Zero God Files:** Cohesive, modular architecture with strictly separated responsibilities.

---

## Architecture and Engines (Maintainer Overview)

- **`tiMely` (Puzzle Engine):** MRV recursive backtracking generation, solution counter capped at two for single-solution uniqueness proofs, and staged deduction logging.
- **`Endgame` (Rating Engine):** Difficulty-adjusted performance normalization based on benchmark solve times, conventional Elo updates, asymmetric reserve pool tax, and difficulty spike compensation.
- **Fair Play:** Explainable heuristic rules, minimal telemetry recording, multi-match corroboration, and maintainer review queues (no automated bans).

*Note: `tiMely` and `Endgame` are internal engineering names and never appear in player-facing UI.*

---

## Getting Started

### Prerequisites
- Node.js (v20+) or Bun (v1.1+)
- npm or bun

### Local Installation
```bash
# Clone the repository
git clone https://github.com/<owner>/zimm.git
cd zimm

# Install dependencies
bun install
# or: npm install

# Start development server
bun dev
# or: npm run dev
```

### Running Tests and Production Build
```bash
# Run automated test suite (39 tests across 13 test suites)
npm test
# or: bun test

# Run production build check
npm run build
# or: bun run build
```

---

## Documentation Links

- [System Architecture](docs/ARCHITECTURE.md)
- [tiMely Technical Reference](docs/TIMELY_TECHNICAL_REFERENCE.md)
- [Endgame Technical Reference](docs/ENDGAME_TECHNICAL_REFERENCE.md)
- [Maintainer Reserve Pool Guide](docs/MAINTAINER_RESERVE_POOL.md)
- [Fair Play and Integrity Policy](docs/FAIR_PLAY_AND_INTEGRITY.md)
- [Localization Glossary (English & Yorùbá)](docs/LOCALIZATION_GLOSSARY.md)
- [Theme & Accessibility Guide](docs/THEME_AND_ACCESSIBILITY.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)
- [Security Policy](docs/SECURITY.md)
- [Code of Conduct](docs/CODE_OF_CONDUCT.md)
- [Changelog](docs/CHANGELOG.md)

---

## Contact

Maintainer contact: `thekzbn@proton.me` or via [https://thekzbn.name.ng](https://thekzbn.name.ng).
