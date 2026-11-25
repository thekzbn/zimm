# Fair Play and Integrity Policy

## 1. Principles of Match Integrity

Zimm is founded on authentic human problem-solving. To safeguard fair competition without invading player privacy or relying on unexplainable machine learning models, Zimm adheres to three core rules:
1. **Server-Verified State:** All move validations, board states, and match outcomes are determined and verified by server logic.
2. **Explainable Heuristics:** Integrity analysis is driven by transparent, deterministic rules based on human solve kinetics and cognitive pacing.
3. **Multi-Match Corroboration:** A single fast solve or lucky inspection is **never** treated as proof of abuse. Escalation requires multiple independent anomalies across separate matches.

---

## 2. Telemetry Collection and Data Minimization

Zimm collects only the minimal data strictly necessary to verify match results:
- **Puzzle Assignment:** Puzzle ID, difficulty tier, and initial timestamp.
- **Move Events:** Timestamp, cell coordinate, and entered digit.
- **Pencil Notes:** Timestamp and candidate toggled (for cadence modeling only; never treated as moves or errors).
- **Mistakes:** Timestamp and incorrect placement count.
- **Hints:** Timestamp, hint stage requested, and target cell.

> Zimm contains **no invasive third-party analytics**, trackers, canvas fingerprinting, or biometric logging by default.

---

## 3. Anomaly Signals and Detection Rules

Implemented in [`src/fairplay/rules.ts`](../src/fairplay/rules.ts#L1-L85):
- **Inhuman Speed Anomaly:** An average placement pace under 250ms per cell across an entire solve, or solving an Expert board in under 20 seconds.
- **Uniform Cadence Anomaly:** Placement intervals exhibiting robotic uniformity (standard deviation $< 35\text{ms}$ with average interval $< 800\text{ms}$), indicative of scripted input injection.

---

## 4. Human Review Queue (No Automated Bans)

Flagged matches are enqueued into the **Maintainer Review Queue** (`src/fairplay/reviewQueue.ts`).
- **No Automated Bans:** Players are never automatically banned or publicly accused based on an algorithmic anomaly score.
- **Human Review Actions:** Maintainers review the gameplay event sequence and either verify the match as clean, dismiss the flag, or confirm abuse.

---

## 5. Retention and Purge Lifecycle

Implemented in [`src/fairplay/retention.ts`](../src/fairplay/retention.ts#L1-L26):
- **Raw Gameplay Events:** Purged automatically after **30 days**.
- **Review Queue Records:** Retained for **90 days** following resolution, then permanently expunged.
