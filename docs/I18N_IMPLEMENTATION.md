# i18n Implementation Guide

This document explains how localization is implemented in this repository, including routing,
runtime behavior, SEO/PWA integration, notification localization, and automation.

## Goals

- Support multiple languages with locale-prefixed routes.
- Keep compatibility with static export (`output: 'export'`).
- Ensure metadata and sitemap are locale-aware.
- Enforce translation key parity through CI.

## Supported Locales

- `en` (default)
- `id`
- `ms`
- `th`
- `vi`
- `fil`
- `zh`
- `ja`
- `ko`
- `es`
- `fr`
- `de`
- `pt`
- `ar`
- `hi`
- `ru`

Defined in [i18n/routing.ts](i18n/routing.ts).

## High-Level Architecture

The app uses next-intl with App Router and locale segments:

- Locale route segment: [app/[locale]](app/[locale])
- Locale provider and metadata: [app/[locale]/layout.tsx](app/[locale]/layout.tsx)
- Request config: [i18n/request.ts](i18n/request.ts)
- Locale catalogs: `messages/<locale>.json` for each locale in `i18n/routing.ts`

Root routing behavior:

- Root path [app/page.tsx](app/page.tsx) directly renders the home page component.
- Locale-aware routes remain available under [app/[locale]/page.tsx](app/[locale]/page.tsx).

## Locale Routing and Path Utilities

Core locale configuration lives in [i18n/routing.ts](i18n/routing.ts):

- `routing.locales`
- `routing.defaultLocale`
- `isValidLocale`

Path helpers in [i18n/pathname.ts](i18n/pathname.ts):

- `extractLocaleFromPathname(pathname)`
- `withLocalePath(pathname, locale)`
- `normalizeLocale(input)`

These helpers are used by UI features such as language switching in
[components/settings/appearance-settings.tsx](components/settings/appearance-settings.tsx).

## next-intl Runtime Wiring

The app uses next-intl plugin integration in [next.config.mjs](next.config.mjs):

- `createNextIntlPlugin('./i18n/request.ts')`

Request-time locale/messages resolution is implemented in [i18n/request.ts](i18n/request.ts):

- Reads requested locale from next-intl request context.
- Falls back to default locale when invalid/missing.
- Loads locale catalog dynamically from `messages/<locale>.json`.

The locale layout [app/[locale]/layout.tsx](app/[locale]/layout.tsx):

- Validates locale and returns not-found for unsupported values.
- Calls `setRequestLocale(locale)`.
- Loads messages via `getMessages()`.
- Wraps children with `NextIntlClientProvider`.

## Static Export Compatibility

The project uses static export in [next.config.mjs](next.config.mjs):

- `output: 'export'`
- `trailingSlash: true`

For locale routes, [app/[locale]/layout.tsx](app/[locale]/layout.tsx) sets:

- `dynamicParams = false`
- `generateStaticParams()` returning all supported locales

This ensures locale pages are prerendered for export.

## Translation Catalog Structure

Catalog files:

- [messages/en.json](messages/en.json)
- [messages/id.json](messages/id.json)
- [messages/ms.json](messages/ms.json)
- [messages/th.json](messages/th.json)
- [messages/vi.json](messages/vi.json)
- [messages/fil.json](messages/fil.json)
- [messages/zh.json](messages/zh.json)
- [messages/ja.json](messages/ja.json)
- [messages/ko.json](messages/ko.json)
- [messages/es.json](messages/es.json)
- [messages/fr.json](messages/fr.json)
- [messages/de.json](messages/de.json)
- [messages/pt.json](messages/pt.json)
- [messages/ar.json](messages/ar.json)
- [messages/hi.json](messages/hi.json)
- [messages/ru.json](messages/ru.json)

Keys are organized by namespace (for example `Home`, `AppearanceSettings`,
`NavigationDrawer`, `HistoryDialog`, `PrivacyPolicyPage`, etc.) and consumed via `useTranslations`.

## Legal Pages Strategy

Localized legal pages are served under locale routes:

- [app/[locale]/privacy-policy/page.tsx](app/[locale]/privacy-policy/page.tsx)
- [app/[locale]/terms-of-service/page.tsx](app/[locale]/terms-of-service/page.tsx)

Notes:

- Privacy policy locale page reads from locale catalogs.
- Terms locale page uses static in-file locale dictionaries.
- Both are implemented in a static-safe way and avoid dynamic server-only APIs that break export.

## SEO Localization

Locale SEO metadata is generated in [app/[locale]/layout.tsx](app/[locale]/layout.tsx):

- Locale-aware canonical URL
- Hreflang alternates for each supported locale
- Locale-specific OpenGraph fields

Route-specific SEO is also applied in localized legal pages.

Base URL behavior:

- Uses `NEXT_PUBLIC_BASE_URL` when provided.
- Falls back to `https://www.tgatb.click` when missing.

## Locale-Aware Sitemap

Sitemap implementation is in [app/sitemap.ts](app/sitemap.ts):

- Generates localized URLs for all supported locales and localized policy/offline pages.
- Marked static with `export const dynamic = 'force-static'` for export compatibility.

## PWA Locale Strategy

Manifest file: [public/manifest.json](public/manifest.json)

- Locale-safe `start_url` is set to `/en/`.
- Manifest remains export-safe while app runtime handles locale selection.

Service worker source: [worker/index.js](worker/index.js)

- Push fallback notification copy is localized using payload `locale` or `lang`.
- Falls back to EN when locale cannot be resolved.

## Reminder Notification Localization

App-side reminder notifications are implemented in [lib/notifications.ts](lib/notifications.ts):

- Detects current user language from persisted settings.
- Localizes reminder title and fallback body for EN/ID.
- Keeps motivator personality message rotation intact.
- Works for both Android local notifications and web Notification API.

## Automation and CI Enforcement

### Key Parity Automation

Script: [scripts/i18n-check.mjs](scripts/i18n-check.mjs)

What it checks:

- Flattens all nested keys in message catalogs.
- Uses `en` as baseline.
- Fails if non-default locale is missing keys.
- Fails if non-default locale has extra keys not present in baseline.

NPM script:

- `npm run i18n:check` in [package.json](package.json)

### Hard-Coded Literal Guard

Scripts:

- [scripts/i18n-literal-guard.mjs](scripts/i18n-literal-guard.mjs)
- Baseline data: [scripts/i18n-literal-baseline.json](scripts/i18n-literal-baseline.json)

NPM scripts:

- `npm run i18n:literals` checks current literal counts against baseline.
- `npm run i18n:literals:baseline` updates the baseline intentionally.

Behavior:

- Scans `.tsx` files in `app/` and `components/` (with focused exclusions).
- Detects plain JSX text candidates.
- Fails when total literals increase or file-level literal counts increase versus baseline.
- Encourages incremental reduction of hard-coded strings while preventing regressions.

### CI Integration

Workflow: [.github/workflows/ci.yml](.github/workflows/ci.yml)

Build job includes:

1. `npm run lint`
2. `npm run check`
3. `npm run i18n:check`
4. tests
5. `npm run build`

This prevents merge when translation catalogs drift.

## Operational Docs

For ownership model, release checklist, rollback strategy, and EMFILE-safe execution guidance,
see [docs/I18N_OPERATIONS.md](docs/I18N_OPERATIONS.md).

## Local Validation Commands

Run this sequence for localization-related changes:

1. `npm run i18n:check`
2. `npm run check`
3. `npm run lint`
4. `npm run build`

Recommended sustainability validation sequence:

1. `npm run i18n:check`
2. `npm run i18n:literals`
3. `npm run check`
4. `npm run lint`
5. `npm run build`

## Known Improvement Opportunities

- Consolidate legal-page localization strategy so both Terms and Privacy use the same catalog-driven pattern.
- Add optional tooling to detect new hard-coded user-facing strings early.
- Keep expanding locale quality through translation review while maintaining key parity checks.
