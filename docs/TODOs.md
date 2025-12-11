# Consolidated TODOs (auto-collected)

This file consolidates actionable `TODO` / `FIXME` occurrences found in the repository (filtered to exclude build artifacts).

## Summary

- Scanned with `rg "TODO|FIXME"` excluding `android/**/build/**` and `node_modules`.
- Results are short and mainly documentation/sample placeholders.

## Actionable items

- [docs/REVIEW_AND_ISSUES.md](docs/REVIEW_AND_ISSUES.md#L157): contains an instruction prompt about running a grep for `TODO|FIXME` — consider removing or updating now that the search was performed.
  - Suggested action: edit or remove the sentence to avoid stale guidance.

- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md#L52): contains a similar user-prompt line offering next steps (grep / scaffold migrations / draft merge strategy).
  - Suggested action: keep as-is or convert into concrete checklist items; if you prefer, link to this `docs/TODOs.md` and mark completed.

- [.git/hooks/sendemail-validate.sample](.git/hooks/sendemail-validate.sample#L22-L41): contains sample `TODO` placeholders for hook checks.
  - Suggested action: either remove/replace TODOs if you enable this hook, or leave as a sample but document that it's not active.

## Notes about ignored matches

- Many `TODO`/`FIXME` matches appeared inside generated Android build artifacts under `android/app/build/...`. Those are build outputs and can be ignored.

## Quick commands

Run the same filtered search locally (requires `rg` on PATH):

```powershell
rg -n --hidden --glob '!android/**/build/**' --glob '!**/node_modules/**' "TODO|FIXME"
```

Or with PowerShell fallback (no external tools):

```powershell
# Recursively search excluding build and node_modules
Get-ChildItem -Recurse -File | Where-Object { $_.FullName -notmatch '\\android\\app\\build\\' -and $_.FullName -notmatch '\\node_modules\\' } | Select-String -Pattern 'TODO|FIXME'
```

## Recommended next steps

1. Decide whether to convert these doc prompts into tracked GitHub Issues (I can create them for you).
2. Remove or update the stale guidance lines in docs to avoid confusion.
3. If you enable hook scripts, replace the TODOs in `.git/hooks/sendemail-validate.sample` with the checks you want, or document them in `docs/`.

### Status update (2025-12-12)

- Repo scan completed and `docs/TODOs.md` created to centralize prompts and samples.
- Unit tests and migration/merge tests added and executed locally; all passing.
- Suggested doc prompts in `docs/REVIEW_AND_ISSUES.md` and `INTEGRATION_GUIDE.md` were updated to reflect work done.

If you want, I can (A) open and edit the remaining docs to remove obsolete prompts, (B) create GitHub Issues for each actionable item, or (C) open a PR with the current changes — tell me which.
