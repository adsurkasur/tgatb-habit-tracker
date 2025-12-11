# Prepared GitHub Issues (create these using `gh issue create` or via web UI)

Below are ready-to-use issue bodies copied from `docs/ISSUES_PROPOSED.md`. You can create them manually or with the `gh` CLI.

## 1) Implement per-item merge strategy for Drive cloud sync
**Title:** Implement per-item merge strategy for Drive cloud sync

**Description:**
Current cloud sync pushes and pulls a full export bundle which may overwrite local changes and cause data loss when multiple devices modify data concurrently. Implement a conflict-aware merge strategy (per-item last-modified timestamps or version vectors, or an operation-log/CRDT approach) so sync can merge changes without destructive overwrites.

**Suggested labels:** enhancement, sync, backend

**Acceptance criteria:**
- Per-item metadata includes last-modified timestamp or version vector.
- `hooks/use-cloud-sync.ts` performs a three-way merge or per-item merge during pull.
- Conflicts surfaced to the user with a small UI to resolve when automatic merge isn't possible.

---

## 2) Add versioned data migrations
**Title:** Add migration runner and migration scripts for stored data

**Description:**
There is no migration runner. Add `lib/migrations/` and a startup runner to apply migrations before importing or using persisted data. Ensure `lib/habit-storage.ts` can load pre-migration exports safely.

**Suggested labels:** enhancement, infra

**Acceptance criteria:**
- A migration runner exists and runs at startup before data use.
- At least one migration example is present (e.g., bumping export schema version).
- Unit tests validate migrations and export/import compatibility.

---

## 3) Gate Firebase analytics/tracking on user consent
**Title:** Gate Firebase analytics/tracking on user consent

**Description:**
`components/firebase-initializer.tsx` initializes Firebase analytics when online. Add an explicit consent model and prevent initialization/tracking until the user opts in. Persist consent and expose a settings toggle to revoke consent (and stop future tracking).

**Suggested labels:** enhancement, privacy

**Acceptance criteria:**
- Analytics initialization checks consent state before activating.
- Settings UI allows enabling/disabling analytics consent.
- Documentation updated to describe data collection and consent flow.

---

## 4) Remove stale interactive prompts from docs and track todos
**Title:** Remove stale interactive prompts from docs and track todos

**Description:**
Several docs contained interactive prompts (e.g., "If you want, I can run a grep...") that are now stale. Update docs to reflect completed scans and add actionable tasks as GitHub Issues. See `docs/TODOs.md` for the consolidated list.

**Suggested labels:** docs

**Acceptance criteria:**
- Stale prompt lines removed/updated in `docs/REVIEW_AND_ISSUES.md` and `INTEGRATION_GUIDE.md`.
- GitHub Issues created for any remaining actionable items.

---

## 5) Finalize `sendemail-validate` hook or mark as sample
**Title:** Finalize `sendemail-validate` hook or mark as sample

**Description:**
`.git/hooks/sendemail-validate.sample` contains placeholders for checks. Decide whether to enable this hook and implement real checks (spellcheck, lint, quick build) or mark it clearly as a sample and document recommended checks in `docs/`.

**Suggested labels:** infra, docs

**Acceptance criteria:**
- Hook either implemented with real checks or marked as sample with documentation.
