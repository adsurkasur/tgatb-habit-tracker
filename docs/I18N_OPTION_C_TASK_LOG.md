# Option C Integration Task Log

Status: Historical execution log for Option C rollout. It is retained for traceability and may include phase-specific assumptions from implementation time.
Use `docs/I18N_IMPLEMENTATION.md` and `docs/I18N_OPERATIONS.md` for current i18n behavior.

## Task Metadata

| Property | Value |
| --- | --- |
| Task Name | Full Option C i18n integration planning and realization log |
| Date Started | 2026-03-24 20:16 |
| Scope Type | End-to-end implementation blueprint + operational realization log |
| Primary Goal | Define a complete, production-ready Option C (locale-path) strategy |
| Secondary Goal | Include all supporting factors and automation, with EMFILE mitigations |
| Execution Mode | One-shot, sequential, systematic |

## Requirement Review Before Execution

The following requirements were explicitly reviewed before work started:

- Produce the full Option C integration plan.
- Create a new markdown file acting as a task-specific log (similar intent to ai-context).
- Realize the task in one shot but with a sequential, systematic structure.
- Include best practices and all supporting factors (including automation, not limited to automation).
- Consider and mitigate `EMFILE: Too many open files` risks during implementation and automation design.

## Clarified Outcome Of This Task

This task delivers a complete implementation blueprint and realization log for Option C.
It does not execute repository-wide string migration in this single step; instead, it defines
the full production path, controls, and automation needed to execute safely and completely.

## Baseline Context Used

- App stack: Next.js App Router + static export + Capacitor Android.
- Existing locale signal: `language` supports `en` and `id` in settings schema.
- Current runtime: no active i18n framework integrated in app rendering.
- Current risk profile: high blast radius due route restructuring and broad hard-coded text surface.

## Option C Definition (Target State)

Option C means locale-based routing as a first-class architecture:

- Path-based locales: `/en/...`, `/id/...`.
- Locale-specific metadata and SEO assets.
- Unified translation runtime (messages, formatting, fallback).
- CI automation enforcing locale parity and translation integrity.
- Operational process for ongoing localization lifecycle.

## Branch and Change-Control Strategy

### Branch Policy

- Create feature branch before any implementation:
  - `git checkout -b feat/i18n-option-c`
- Never commit i18n rollout directly on `main`.
- Merge only via PR with required checks.

### Protection Rules

- Require code owner review for:
  - locale routing changes
  - message catalog schema changes
  - SEO metadata generation changes
- Block merge if i18n validation checks fail.

## Implementation Blueprint (Sequential)

## Phase 0: Foundation and Guardrails

### Phase 0 Objectives

- Prepare architecture and controls before route/content migration.

### Phase 0 Actions

1. Integrate i18n runtime package and request config pattern for App Router.
2. Define supported locales and default locale in one central module.
3. Add typed helper layer for translation access and locale formatting.
4. Add baseline locale message catalogs (`en`, `id`) with minimal shell keys.
5. Establish fallback behavior (missing key fallback to default locale with diagnostics).

### Phase 0 Completion Criteria

- Runtime can resolve locale and render translated shell text.
- Missing keys are detected in development and surfaced by CI tooling.

## Phase 1: Locale-Path Route Architecture (Option C Core)

### Phase 1 Objectives

- Shift to locale-segmented routing while preserving static export constraints.

### Phase 1 Actions

1. Move route tree under locale segment (`app/[locale]/...`).
2. Ensure locale segment validation and not-found behavior for unsupported locale.
3. Generate static params for all supported locales to satisfy export requirements.
4. Refactor navigation/link helpers to preserve locale across internal navigation.
5. Validate route parity: each route exists for each supported locale.

### Phase 1 Completion Criteria

- Locale-prefixed routes are the canonical path model.
- No non-localized internal links remain in migrated scope.

## Phase 2: UI and Interaction Localization

### Phase 2 Objectives

- Remove hard-coded user-facing text from interactive surfaces.

### Phase 2 Priority Waves

1. App shell: header, navigation drawer, core dialogs.
2. Core workflows: habit tracking, history, settings, toasts.
3. Notifications and motivator text catalogs.
4. Empty states, error states, offline states, and not-found.

### Phase 2 Completion Criteria

- User-facing strings in migrated components come from locale catalogs.
- Locale switching updates copy without stale literals.

## Phase 3: Long-Form Content and Policy Surfaces

### Phase 3 Objectives

- Localize legal and policy surfaces with governance.

### Phase 3 Actions

1. Localize Privacy Policy and Terms pages per locale.
2. Add locale-specific metadata titles/descriptions.
3. Define legal review workflow for translated legal text updates.

### Phase 3 Completion Criteria

- Policy/legal pages available and discoverable per locale.

## Phase 4: SEO, PWA, and Platform Completeness

### Phase 4 Objectives

- Ensure locale architecture is complete across SEO and app shell metadata.

### Phase 4 Actions

1. Generate locale-aware canonical + hreflang tags.
2. Add locale-aware sitemap generation.
3. Align manifest strategy for localized names/descriptions where feasible.
4. Ensure locale-safe start URL and install/open behavior in PWA and Capacitor webview.
5. Localize notification title/body sourcing.

### Phase 4 Completion Criteria

- Locale SEO signals valid.
- PWA/native experience does not regress with locale paths.

## Phase 5: Operationalization and Release Hardening

### Phase 5 Objectives

- Make localization maintainable after initial rollout.

### Phase 5 Actions

1. Introduce translation lifecycle ownership (engineering/content/QA).
2. Add release checklist for locale coverage and quality.
3. Add rollback switches for locale routing and catalog versions.
4. Publish contributor guidelines for adding new keys/locales.

### Phase 5 Completion Criteria

- Team can ship ongoing localized features without architectural drift.

## Automation Matrix

## CI Validation Automation

1. Key parity check across all required locales.
2. Missing key failure gate.
3. Unused key warning/failure threshold.
4. Message syntax validation (ICU/plurals/select).
5. Locale route parity check (generated route inventory per locale).
6. Static export artifact verification for locale paths.

## Test Automation

1. Unit tests for locale resolver/fallback.
2. Unit tests for formatting wrappers (date/number/list).
3. Integration tests for locale switch persistence.
4. E2E smoke suite per locale for core user journeys.
5. Visual regression checks to catch overflow/truncation.

## Developer Workflow Automation

1. Pre-commit: translation schema and key checks.
2. Pre-push: fast locale smoke tests.
3. Optional extraction report script for newly introduced hard-coded literals.
4. Pseudo-localization mode for UI stress testing.

## Release Automation

1. Coverage gate requiring locale completeness threshold.
2. Automated i18n changelog section extraction.
3. Locale artifact versioning for safe rollback.

## EMFILE Risk Management Plan

`EMFILE: Too many open files` can appear during broad glob scans, parallel test/build jobs,
or intensive watchers. The following controls are planned:

## Implementation-Time Controls

1. Prefer targeted file scopes over repository-wide watchers in local commands.
2. Run large verification steps sequentially, not concurrently.
3. Avoid opening multiple long-running watch processes in parallel.
4. Batch migration per module to reduce simultaneous file handles.

## CI Controls

1. Limit matrix parallelism for heavy jobs (`max-parallel` control).
2. Split large checks into staged jobs with explicit dependencies.
3. Cache and reuse artifacts to avoid repeated broad scans.
4. Use deterministic script ordering (lint -> typecheck -> tests -> build).

## Tooling Controls

1. Use focused ripgrep patterns instead of broad recursive scans where possible.
2. Keep extraction scripts streaming and chunked instead of opening many files at once.
3. Add retry/backoff only for transient file-system operations where appropriate.

## Quality Gates (Definition Of Done)

- Locale-path routing is canonical and consistent.
- All migrated user-facing text is catalog-driven.
- Missing key CI gate is enforced.
- Locale-specific SEO metadata is validated.
- E2E smoke passes for each supported locale.
- Static export outputs are generated and validated per locale.
- Documented rollback process exists and is tested.

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Route migration regression | Broken navigation/deep links | Route parity automation + locale-aware nav helpers |
| Missing translations | Runtime UX defects | CI missing-key gate + fallback policy |
| UI clipping with longer strings | Visual defects | Pseudo-localization + visual regression |
| Static export incompatibility | Build/deploy failures | Static params and per-locale artifact checks |
| EMFILE during heavy checks | Pipeline/dev instability | Sequential execution and parallelism limits |

## Realization Log For This Task

### 2026-03-24 20:16

- Reviewed final user instructions and prior discussion constraints.
- Confirmed this task requires full Option C planning with explicit automation and EMFILE treatment.

### 2026-03-24 20:17

- Established sequential one-shot execution structure.
- Defined branch-first and no-direct-main governance as first-class control.

### 2026-03-24 20:18

- Produced complete Option C phase blueprint (foundation to operationalization).
- Added CI/test/developer/release automation matrix.

### 2026-03-24 20:19

- Added EMFILE-specific prevention and operational controls.
- Added quality gates, risks/mitigations, and definition of done.

### 2026-03-24 20:20 - 20:31

- Created and switched to feature branch `feat/i18n-option-c` (no direct work on `main`).
- Implemented Option C foundation in code:
  - Added `next-intl` dependency.
  - Added locale routing/config modules (`i18n/routing.ts`, `i18n/request.ts`, `i18n/pathname.ts`).
  - Added baseline message catalogs (`messages/en.json`, `messages/id.json`).
  - Integrated `next-intl` plugin in Next config.
  - Added locale route segment architecture (`app/[locale]/layout.tsx`, `app/[locale]/page.tsx`).
  - Added locale-prefixed wrappers for standalone routes (`offline`, `privacy-policy`, `terms-of-service`).
  - Converted root page to locale redirect and preserved existing home implementation in `app/home-page.tsx`.
  - Added locale-aware language switching in settings and locale-safe policy navigation updates.
- Applied EMFILE-aware execution pattern:
  - Sequential command execution only.
  - No concurrent watchers.
  - No parallel heavy validation steps.

### 2026-03-24 20:32 - 20:36

- Implemented i18n automation gate:
  - Added `scripts/i18n-check.mjs` (locale key parity + drift detection).
  - Added npm script `i18n:check`.
  - Integrated `i18n:check` into CI workflow (`.github/workflows/ci.yml`).
- Re-ran full validation sequence after automation integration:
  - `npm run i18n:check` pass.
  - `npm run check` pass.
  - `npm run lint` pass.
  - `npm run build` pass.

### 2026-03-24 20:37 - 20:40

- Executed Phase 2 localization wave for high-traffic interactive surfaces:
  - `app/home-page.tsx`: localized header, navigation aria labels, counters, helper text, demo badge, and back/delete toasts.
  - `components/settings/appearance-settings.tsx`: localized section labels, descriptions, and language/fullscreen toasts.
  - `components/about-dialog.tsx`: localized dialog title, descriptions, features, links, and footer copy.
- Expanded message catalogs:
  - `messages/en.json`: added `Home`, `AppearanceSettings`, `AboutDialog` namespaces.
  - `messages/id.json`: added equivalent localized namespaces and keys.
- Performed sequential EMFILE-safe validation:
  - `npm run i18n:check` pass.
  - `npm run check` pass.
  - `npm run lint` pass.
  - `npm run build` pass.

### 2026-03-24 20:50 - 20:54

- Executed next Phase 2 localization wave for additional high-impact surfaces:
  - `components/navigation-drawer.tsx`: localized drawer title/subtitle, search labels, habit section labels, empty states, action buttons, and streak-day label.
  - `components/settings/account-data-settings.tsx`: localized account/data heading, auth/login labels, cloud actions, auto-sync/analytics labels and descriptions, export/import actions, and conflict action label.
  - `components/history-dialog.tsx`: localized dialog title, tabs, stats cards, breakdown content, calendar action labels, and timeline status summaries.
- Expanded message catalogs:
  - `messages/en.json`: added `NavigationDrawer`, `AccountDataSettings`, and `HistoryDialog` namespaces.
  - `messages/id.json`: added equivalent localized namespaces and keys.
- Performed sequential EMFILE-safe validation:
  - `npm run i18n:check` pass.
  - `npm run check` pass.
  - `npm run lint` pass.
  - `npm run build` pass.

### 2026-03-24 20:56 - 20:57

- Resolved residual lint suggestions in `components/history-dialog.tsx`:
  - `min-h-[12rem]` -> `min-h-48`
  - `sm:min-h-[12rem]` -> `sm:min-h-48`
- Re-ran sequential validation:
  - `npm run check` pass.
  - `npm run lint` pass.
  - `npm run build` pass.

### 2026-03-24 21:03 - 21:11

- Attempted server-side next-intl localization for `app/terms-of-service/page.tsx` and added matching `TermsOfServicePage` keys in locale catalogs.
- Hit static export blocker during build:
  - Next.js prerender error on `/en/terms-of-service` due dynamic `headers()` usage from translation helper path.
- Applied static-safe resolution:
  - Restored root `app/terms-of-service/page.tsx` to static-safe baseline (non-dynamic).
  - Implemented locale-specific localized terms content in `app/[locale]/terms-of-service/page.tsx` using static in-file locale dictionaries (`en`, `id`) and locale `params`.
- Re-ran sequential validation:
  - `npm run i18n:check` pass.
  - `npm run check` pass.
  - `npm run lint` pass.
  - `npm run build` pass.

### 2026-03-24 21:15 - 21:22

- Executed Phase 3 Wave 2: Privacy Policy localization.
- Created `PrivacyPolicyPage` namespace in both `messages/en.json` and `messages/id.json` with full privacy policy content (11 sections, 50+ keys per locale).
- Implemented locale-specific localized privacy content in `app/[locale]/privacy-policy/page.tsx` using static in-file locale dictionaries pattern (matching Terms of Service proven pattern).
- Re-ran sequential validation:
  - `npm run i18n:check` pass (key parity maintained).
  - `npm run check` pass (TypeScript clean).
  - `npm run lint` pass (no linting issues).
  - `npm run build` pass (routes prerendered: `/en/privacy-policy`, `/id/privacy-policy`).
- Phase 3 COMPLETE: Both legal pages (Terms of Service and Privacy Policy) fully localized for all supported locales.

### Validation Results (Executed)

- `npm run check`: pass.
- `npm run lint`: pass.
- `npm run build`: pass.
- Build output confirms generated locale routes:
  - `/en`, `/id`
  - `/en/offline`, `/id/offline`
  - `/en/privacy-policy`, `/id/privacy-policy`
  - `/en/terms-of-service`, `/id/terms-of-service`

## Implementation Progress By Phase

- [x] Phase 0 foundation implemented.
- [x] Phase 1 locale-path architecture implemented.
- [x] Phase 2 UI text localization advanced (6 major interactive surfaces fully localized: home, appearance, about, navigation, account/data, history).
- [x] Phase 3 long-form content started (both Terms of Service and Privacy Policy fully localized for /en and /id routes).
- [ ] Phase 4 SEO/PWA locale metadata hardening pending.
- [~] Phase 5 operational automation hardening started (i18n key parity CI gate implemented).

## Next Execution Package (When Coding Begins)

1. Create feature branch: `feat/i18n-option-c`.
2. Implement Phase 0 and Phase 1 in small PR slices.
3. Activate CI i18n gates before broad text migration.
4. Migrate text surfaces by priority waves.
5. Complete SEO + PWA + release hardening before launch.

## Status

- Task plan deliverable: Complete.
- Task-specific log deliverable: Complete with full execution history through Phase 3.
- Implementation coding rollout: In progress on feature branch (`feat/i18n-option-c`) — Phase 3 (long-form content) complete.
- Next target: Phase 4 (SEO/PWA metadata localization) and Phase 5 (operational hardening).

## Phase 4 Execution Log (2026-03-24 SEO and PWA Completeness)
- Added hreflang alternate links to app/[locale]/layout.tsx
- Enhanced Terms of Service with canonical URLs and OpenGraph metadata
- All locale routes prerender successfully with proper metadata
- Replaced app/[locale]/privacy-policy/page.tsx re-export with full locale-specific implementation
- Added canonical URLs, hreflang alternates, and OpenGraph metadata for locale privacy routes
- Validation completed: npm run check, npm run lint, npm run build (14/14 routes generated)
- Added new locale-aware sitemap route at app/sitemap.ts for canonical locale URLs
- Resolved static-export constraint for sitemap by setting export const dynamic = "force-static"
- Validation completed: npm run check, npm run lint, npm run build (15/15 routes generated including /sitemap.xml)
- Localized app reminder notification title/body defaults in lib/notifications.ts using persisted language setting (en/id)
- Localized service-worker push fallback title/body/action labels in worker/index.js using payload locale/lang with en fallback
- Validation completed: npm run check, npm run lint, npm run build (15/15 routes generated, no regressions)
- Updated public/manifest.json for locale-path strategy: start_url now /en/ and shortcuts now include EN and ID localized variants
- Validation completed: npm run check, npm run lint, npm run build (15/15 routes generated, no regressions)

## Phase 4 Status

### 2026-03-24 23:53 - 23:58 (Language UX Finalization Wave)

- Added centralized reusable language modal component in `components/language-selection-modal.tsx`.
- Standardized modal experience on unified responsive modal stack (`ResponsiveDialog`) for desktop/mobile parity.
- Refactored `components/settings/appearance-settings.tsx` to use staged language selection with explicit Apply action.
- Added apply-before-switch persistence behavior (save settings first, then reload localized route).
- Added platform-aware restart warning copy in locale catalogs:
  - `messages/en.json`
  - `messages/id.json`
- Added modal action keys (`apply`, `applying`, `cancel`) and warning keys (`restartWarningWeb`, `restartWarningApp`).
- Validation sequence executed and passed:
  - `npm run i18n:check`
  - `npm run i18n:literals` (total=201, baseline=202)
  - `npm run check`
  - `npm run lint`
  - `npm run build`

### 2026-03-25 00:00 - 00:41 (Repository-Wide Literal Sweep)

- Executed multi-wave i18n migration for remaining high-impact component copy:
  - Settings surfaces (`feedback`, `help/support`, `habit management`, `settings screen`)
  - Dialogs/modals (`add/edit habit`, `add/edit entry`, `delete all`, `sync conflict`, `donation`)
  - User guidance/notifications (`welcome overlay`, `analytics notice`, `offline indicator`, `offline toast`)
  - Card/CTA surfaces (`habit card`, `add habit CTA`)
  - Informational labels (`about dialog tech badges`, `status bar example`)
- Added corresponding EN/ID catalog keys in `messages/en.json` and `messages/id.json`.
- Replaced remaining visible policy-page hardcoded literals (contact/repo labels) with variable-driven rendering.
- Build stability incident encountered:
  - `PWAInstallPrompt` localized with `useTranslations` triggered missing provider context on non-locale root route.
  - Resolved by reverting `PWAInstallPrompt` to context-free copy while preserving localization gains elsewhere.
- Final validation sequence passed:
  - `npm run i18n:check`
  - `npm run check`
  - `npm run lint`
  - `npm run build`
  - `npm run i18n:literals` -> `total=85` (baseline `202`)

### 2026-03-25 00:44 - 01:02 (Finalization and Master Loading Integration)

- Added safe app-wide i18n context in `app/providers.tsx` using pathname-derived locale (`en`/`id`) and static message catalogs.
- Re-enabled localized `PWAInstallPrompt` copy now that non-locale surfaces have provider context.
- Implemented master-first boot loading screen:
  - Added `components/master-loading-screen.tsx`
  - Mounted in `app/layout.tsx` before app shell content
  - Updated `app/globals.css` boot visibility rules to keep app shell hidden until initialization (`body.app-loaded`) and fade out master loader.
- Upgraded runtime loading UX:
  - Enhanced `components/ui/loading-overlay.tsx` visual treatment
  - Added localized loading copy in `messages/en.json` and `messages/id.json`.
- Hardened i18n sustainability metric:
  - Reworked `scripts/i18n-literal-guard.mjs` to TypeScript AST-based JSX text-node scanning (reduced regex false positives).
- Validation results:
  - `npm run i18n:check` pass
  - `npm run check` pass
  - `npm run lint` pass
  - `npm run build` pass (non-fatal `ENVIRONMENT_FALLBACK` log observed)
  - `npm run i18n:literals` pass (`total=9`, baseline `202`)

### Finalization Outcome

- Global i18n context is now available to app-wide client components rendered outside locale-route layout.
- Master-first loading UX is implemented (boot splash blocks app shell until initialization completes).
- Runtime loading overlay is modernized and localized.
- Literal guard now uses AST-based JSX text detection, reducing false positives and providing a more accurate residual metric.

- Complete: canonical/hreflang metadata, locale sitemap, notification localization, and manifest locale strategy are implemented and validated.

## Phase 5 Execution Log (2026-03-24 Operationalization and Hardening)

- Added operational runbook at `docs/I18N_OPERATIONS.md` including:
  - Ownership model (engineering/content/legal/QA)
  - Localization PR checklist
  - Release checklist
  - Rollback strategy levels (catalog, metadata, routing)
  - EMFILE-safe execution notes
- Updated `CONTRIBUTING.md`:
  - Added mandatory `npm run i18n:check` in local PR checks
  - Added localization workflow guardrails and link to operations guide
- Updated `README.md`:
  - Added `i18n:check` in available scripts
  - Added localization operations guide under resources

## Phase 5 Status

- Complete: translation lifecycle ownership, release checklist, rollback strategy, and contributor guidance are documented and integrated.

## Post-Phase Documentation Update (2026-03-24)

- Added full implementation reference at `docs/I18N_IMPLEMENTATION.md` covering:
  - i18n architecture and routing model
  - next-intl runtime wiring
  - static export compatibility rules
  - SEO/sitemap/PWA localization behavior
  - reminder/push notification localization
  - CI automation (`i18n:check`) and validation workflow

## Sustainability Package Update (2026-03-24)

- Refactored `app/[locale]/terms-of-service/page.tsx` to use `messages/<locale>.json` (`TermsOfServicePage`) for consistency with catalog-driven localization.
- Added hard-coded string regression guard:
  - Script: `scripts/i18n-literal-guard.mjs`
  - Baseline: `scripts/i18n-literal-baseline.json`
  - NPM scripts: `i18n:literals`, `i18n:literals:baseline`
  - CI gate added in `.github/workflows/ci.yml`
- Updated localization docs (`I18N_IMPLEMENTATION.md`, `I18N_OPERATIONS.md`) to include literal guard workflow.

## Frontend Hardening Finalization (2026-03-24)

- Root redirect hardening:
  - `app/page.tsx` now resolves locale from persisted user settings before redirecting.
- Runtime locale consistency hardening:
  - Added `components/locale-runtime-sync.tsx`.
  - Mounted in `app/[locale]/layout.tsx` to sync `html lang` and persisted `settings.language` with active locale route.
- Language-selection UX hardening:
  - Localized settings dialog title via `SettingsDialog` namespace in `messages/en.json` and `messages/id.json`.
- Validation:
  - `npm run i18n:check` pass.
  - `npm run check` pass.
  - `npm run lint` pass.
  - `npm run build` pass.

## Finalization Pass - Language UX Sustainability (2026-03-24)

- Replaced direct language toggle with a modal-based selector in `components/settings/appearance-settings.tsx`.
- Added locale prefetch on modal open for smoother route transitions.
- Added explicit save of selected language before route switch to harden persistence.
- Added `AppearanceSettings.language.modalTitle` and `modalDescription` in `messages/en.json` and `messages/id.json`.
- Verified old "coming soon/upcoming feature" language copy is absent from source scan.
- Validation:
  - `npm run i18n:check` pass.
  - `npm run i18n:literals` pass (`total=201`, baseline=202).
  - `npm run check` pass.
  - `npm run lint` pass.
  - `npm run build` pass.
