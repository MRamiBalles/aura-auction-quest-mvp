# Sentry Monitoring Setup Guide

This guide details the Sentry configuration for AuraAuction Quest, updated for Sentry SDK v8.

## Configuration

The Sentry initialization is located in `src/utils/sentry.ts`.

### Key Features Enabled
1.  **Performance Monitoring (`browserTracingIntegration`)**:
    *   Automatically traces all React Router v6 navigation.
    *   Captures page load performance and API latency.
2.  **Session Replay (`replayIntegration`)**:
    *   Records user sessions for debugging.
    *   **Privacy**: `maskAllText: true` and `blockAllMedia: true` are enabled to protect user data.
3.  **Sensitive Data Scrubbing**:
    *   `beforeSend` hook automatically removes private keys and signatures from error reports.

## Environment Variables

Ensure these variables are set in your `.env` file (or Vercel/Netlify dashboard):

```env
VITE_SENTRY_DSN=https://your-sentry-dsn@o123.ingest.sentry.io/456
VITE_SENTRY_AUTH_TOKEN=your-auth-token # For source map uploads during build
```

## Verification

To verify Sentry is working:
1.  Build the app: `npm run build`
2.  Preview locally: `npm run preview`
3.  Open the browser console. You should see Sentry initialization logs (if debug is enabled).
4.  Trigger a test error (e.g., throw an exception in a component) and check your Sentry dashboard.

## Source Maps

The build process is configured to upload source maps to Sentry, allowing you to see original code in stack traces. Ensure the `VITE_SENTRY_AUTH_TOKEN` is valid.
