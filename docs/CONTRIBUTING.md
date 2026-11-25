# Contributing to Zimm

Thank you for your interest in contributing to **Zimm**! Zimm is an open-source competitive Sudoku platform licensed under the **GNU Affero General Public License version 3 (AGPLv3)**.

---

## 1. Core Contributor Principles

1. **Mandatory Documentation Rule:**
   > Every change MUST update relevant documentation accordingly. If a change has no relevant documentation impact, state that in the PR and explain why.
2. **Zero God Files:**
   Keep modules cohesive, with each file owning a clear responsibility. Unrelated domains (puzzle generation, rating math, board state, persistence, UI, localization) must never collapse into single oversized files.
3. **Engine Terminology Isolation:**
   The puzzle engine is `tiMely` (exact casing: lowercase `t`, lowercase `i`, uppercase `M`, lowercase `ely`). The rating engine is `Endgame`. These are strictly internal engineering terms. Never expose either name in player-facing UI or user copy.

---

## 2. Local Development Setup

Prerequisites: Node.js (v20+) or Bun (v1.1+).

```bash
# Clone the repository
git clone <repository-url>
cd zimm

# Install dependencies
bun install
# or: npm install

# Start local development server
bun dev
# or: npm run dev

# Run automated tests
bun test
# or: npm test

# Run production build check
bun run build
# or: npm run build
```

---

## 3. Pull Request and Commit Format

All contributions must be delivered through pull requests on a feature branch (`type/scope-summary`). Never commit directly to the default branch.

### Commit Format:
```text
type(scope): concise summary

Why the changes were made:
[Single paragraph explaining motivation and rationale]

Changes made:
- [+] added/path/to/file.ts
- [:] modified/path/to/file.ts
- [-] removed/path/to/file.ts
```

### PR Format:
```text
type(scope): concise summary

Why the changes were made:
[First paragraph explaining problem or feature]

[Second paragraph explaining implementation approach and architecture]

Changes made:
- [+] added/path/to/file.ts
- [:] modified/path/to/file.ts
```

---

## 4. Community and Maintainer Contact

For questions, community discussions, or security inquiries:
- Email: `thekzbn@proton.me`
- Web: [https://thekzbn.name.ng](https://thekzbn.name.ng)
