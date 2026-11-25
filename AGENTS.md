# AGENTS.md

This document guides automated agents, AI assistants, and contributors working on **Zimm**.

## Mandatory Documentation Rule

Every change MUST update relevant documentation accordingly. If a change has no relevant documentation impact, state that in the PR and explain why.

Apply this rule to every change in this repository and all future changes. Do not create meaningless documentation edits when there is no relevant documentation impact. Update technical references, source maps, line ranges, test guides, configuration documentation, and user guides whenever implementation details change.

---

## Architectural Principles and Quality Bar

- **Zero God Files:** Keep modules focused, cohesive, and clearly bounded. Unrelated product domains (puzzle generation, rating math, game orchestration, persistence, user interface, localization) must never collapse into single oversized files. Split files before they accumulate multiple responsibilities.
- **Engine Terminology Isolation:** The puzzle engine is named `tiMely` (exact casing: only the `M` is uppercase). The rating engine is named `Endgame`. These are internal engineering names. They must **never** appear in player-facing UI, in-game help, onboarding, notifications, or user copy. Never prompt or link players to GitHub documentation to learn about them.
- **Server Verification & Integrity:** Match states, valid moves, and performance outcomes must be server-verified. Gameplay event recording must be minimal and purposeful (puzzle assignment, timestamps, placements, mistakes, hints).
- **Inter Font Setup:** In HTML documents, preconnect to `https://rsms.me/` and load `https://rsms.me/inter/inter.css`. Set `:root` font to `Inter, sans-serif` with `font-feature-settings: 'liga' 1, 'calt' 1`, and use `InterVariable` when variable fonts are supported.
- **The `numb` Theme Palette:** The palette name is `numb` (all lowercase). Primary brand colors:
  - Brown Derby: `#4a1815`
  - Falu Red: `#821917`
  - Tamarillo: `#a61b19`
  - Zeus: `#211914`
  Both light and dark modes are compulsory with verified contrast ratios. Any additional neutral colors must be documented.
- **Localization:** Launch locales are English (`en`) and Yoruba (`yo`). All interface text, system messages, and help content must be localized with accurate Yoruba orthography and tone marks. Keep glossary terms aligned.
- **Licensing:** The project is licensed under the GNU Affero General Public License version 3 (AGPLv3).

---

## Design and Interface Guidelines (Think Skill)

Before changing or adding to the interface:
- Consider interface, motion, and copy choices in the context of Zimm.
- Avoid defaults, preserve intentional design, and make choices that serve a clear user need.
- No label, badge, or eyebrow above a heading. Put useful context in the heading or supporting text instead.
- Do not add a marquee.
- Do not use generic marketing slogans or AI clichés.
- Ensure full keyboard accessibility (arrow navigation, number keys, note toggle, delete/erase) and screen-reader accessibility.
- Preserve loading, empty, error, and completed states.

---

## Repository and Release Safety

- The repository is public. Do not change repository visibility, attempt to make it private, or create a duplicate.
- Repository visibility is separate from app deployment. Do not deploy the app or announce a launch without the owner's explicit approval.
- Work on feature branches and deliver through pull requests. Never commit directly to the default branch.
