# CLAUDE.md

This document guides coding assistants and contributors working on **Zimm**.

## Mandatory Documentation Rule

Every change MUST update relevant documentation accordingly. If a change has no relevant documentation impact, state that in the PR and explain why.

Apply this rule to every change in this repository and all future changes. Do not create meaningless documentation edits when there is no relevant documentation impact. Update technical references, source maps, line ranges, test guides, configuration documentation, and user guides whenever implementation details change.

---

## Key Constraints and Conventions

- **Zero God Files:** Keep modules cohesive, with each file owning a clear responsibility. Do not allow oversized catch-all files.
- **Engine Terminology:** `tiMely` is the puzzle engine (note exact casing: only `M` is uppercase). `Endgame` is the rating engine. These are strictly internal engineering names and must never be shown or referenced in any player-facing surface.
- **Licensing:** Licensed under the GNU Affero General Public License version 3 (AGPLv3).
- **Typography:** Inter loaded from `https://rsms.me/inter/inter.css` with ligatures and contextual alternates enabled (`font-feature-settings: 'liga' 1, 'calt' 1`), falling back to `InterVariable`.
- **Palette:** `numb` brand colors: Brown Derby (`#4a1815`), Falu Red (`#821917`), Tamarillo (`#a61b19`), and Zeus (`#211914`). Light and dark modes with high contrast.
- **Localization:** English (`en`) and Yoruba (`yo`) with accurate diacritics and tone marks.
- **Pencil Notes:** Independent scratch candidate digits in every square. Add, toggle, edit, clear. Strictly isolated from moves, mistakes, hints, and ratings.
- **Hints:** Max 3 in head-to-head. Meaningful, perceptible difficulty-adjusted performance penalty applied before Elo calculations.
- **Testing & Verification:** Run test suites before PRs. Maintain code maps with exact file paths and line ranges in technical references.
