export async function initSentryClient(allow: boolean) {
  if (!allow) return;
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    // no DSN configured – nothing to initialize
    return;
  }

  try {
    // dynamic import to avoid requiring package when not configured
    const Sentry = await import('@sentry/nextjs');
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      // Add environment tagging so issues are easier to triage
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    });
  } catch (err) {
    // fail safe – don't throw in production if Sentry can't be initialized
    // eslint-disable-next-line no-console
    console.debug('Sentry initialization skipped or failed', err);
  }
}
