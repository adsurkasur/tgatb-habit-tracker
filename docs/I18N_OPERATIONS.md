# i18n Operations Guide

This guide defines ownership, release quality gates, and rollback procedures for localization.

## Scope

- Locales currently supported: `en`, `id`
- Routing model: locale path prefixes (`/en`, `/id`) with static export
- Message catalogs: `messages/en.json`, `messages/id.json`

## Ownership Model

| Area | Primary Owner | Backup Owner | Responsibilities |
| --- | --- | --- | --- |
| Routing and metadata | Engineering | Release manager | Locale route parity, canonical/hreflang, sitemap integrity |
| Message catalogs | Engineering | Product/content reviewer | Key parity, naming consistency, removal of stale keys |
| UX copy quality | Product/content reviewer | Engineering | Translation quality and tone consistency |
| Legal content translations | Legal/content reviewer | Engineering | Terms and Privacy content correctness |
| QA verification | QA | Engineering | Locale smoke tests for `en` and `id` |

## Development Workflow

1. Add new keys to `messages/en.json` first.
2. Add matching keys to `messages/id.json` in the same change.
3. Use structured namespaces (for example: `FeatureName.section.label`).
4. Avoid hard-coded user-facing strings in components and pages.
5. Run the full validation sequence before opening a PR:
   - `npm run i18n:check`
   - `npm run check`
   - `npm run lint`
   - `npm run build`

## PR Review Checklist (Localization)

- [ ] New keys are present in both locale catalogs.
- [ ] Key names are stable and semantically grouped.
- [ ] No untranslated hard-coded strings were introduced.
- [ ] Locale-aware routes and metadata remain correct.
- [ ] Notifications and reminders remain language-safe.
- [ ] Build output still includes locale routes and `sitemap.xml`.

## Release Checklist (Localization)

Run before every release that includes copy, route, SEO, or PWA changes:

1. Validate message parity:
   - `npm run i18n:check`
2. Validate code quality and static build:
   - `npm run check`
   - `npm run lint`
   - `npm run build`
3. Verify generated locale routes include:
   - `/en`, `/id`
   - `/en/privacy-policy`, `/id/privacy-policy`
   - `/en/terms-of-service`, `/id/terms-of-service`
   - `/sitemap.xml`
4. Verify metadata behavior:
   - Canonical URLs resolve to locale-specific route URLs
   - Hreflang alternates include all supported locales
5. Verify PWA manifest strategy:
   - `start_url` remains locale-safe
   - Locale shortcuts are valid and open localized paths

## Rollback Strategy

If localization changes introduce regressions, use the following rollback levels.

### Level 1: Catalog-only rollback

Use when copy is incorrect but routing and rendering are stable.

- Revert message catalog changes (`messages/en.json`, `messages/id.json`).
- Re-run `npm run i18n:check` and `npm run build`.

### Level 2: Route metadata rollback

Use when SEO metadata or sitemap behavior is incorrect.

- Revert affected route metadata generation and sitemap changes.
- Validate canonical/hreflang behavior after revert.

### Level 3: Locale-routing rollback

Use only for high-severity routing failures.

- Revert locale route architecture changes as a coordinated hotfix.
- Restore last known good release artifact.
- Open follow-up issue with root cause and prevention plan.

## Emergency Guardrails

- Do not push i18n hotfixes directly to `main`.
- Keep changes scoped by surface area (catalog only, metadata only, or routing).
- Prefer reversible commits and small PRs.

## Notes for EMFILE Stability

- Keep checks sequential (`i18n:check` then `check` then `lint` then `build`).
- Avoid multiple parallel watchers during large localization updates.
- Prefer targeted file edits and scoped searches when updating catalogs.