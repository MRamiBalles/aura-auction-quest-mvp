# Sentry Monitoring Setup Guide

This guide details the Sentry configuration for AuraAuction Quest, updated for Sentry SDK v8.
To verify Sentry is working:
1.  Build the app: `npm run build`
2.  Preview locally: `npm run preview`
3.  Open the browser console. You should see Sentry initialization logs (if debug is enabled).
4.  Trigger a test error (e.g., throw an exception in a component) and check your Sentry dashboard.

## Source Maps

The build process is configured to upload source maps to Sentry, allowing you to see original code in stack traces. Ensure the `VITE_SENTRY_AUTH_TOKEN` is valid.
