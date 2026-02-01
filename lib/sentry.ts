export async function initSentryClient(allow: boolean) {
  if (!allow) return;
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    // no DSN configured – nothing to initialize
    return;
  }

  try {
    // dynamic import to avoid requiring package when not configured and to avoid bundler resolving missing optional dep
    const pkg = '@sentry/nextjs';
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const SentryModule = await import(/* webpackIgnore: true */ pkg) as unknown as { init?: (opts: { dsn?: string; tracesSampleRate?: number; environment?: string }) => void };
    if (SentryModule && typeof SentryModule.init === 'function') {
      SentryModule.init({
        dsn,
        tracesSampleRate: 0.1,
        // Add environment tagging so issues are easier to triage
        environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
      });
    }
  } catch (err) {
    // fail safe – don't throw in production if Sentry can't be initialized
    // eslint-disable-next-line no-console
    console.debug('Sentry initialization skipped or failed', err);
  }
}
