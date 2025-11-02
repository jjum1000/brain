/**
 * Sentry Error Tracking Configuration
 *
 * Initializes Sentry for production error monitoring and performance tracking.
 * Can be enabled in production environment.
 */

/**
 * Initialize Sentry with DSN and configuration
 * This is a placeholder for Sentry integration
 * To use: npm install @sentry/react
 */
export function initSentry(): void {
  // Check if we're in production and have a DSN
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

  if (!sentryDsn) {
    console.log('Sentry DSN not configured. Skipping Sentry initialization.');
    return;
  }

  // Sentry initialization disabled for now
  // To enable: npm install @sentry/react
  // Then uncomment the code below
  /*
  if (import.meta.env.MODE === 'production') {
    import('@sentry/react').then(Sentry => {
      Sentry.init({
        dsn: sentryDsn,
        environment: import.meta.env.MODE,
        integrations: [
          new Sentry.Replay({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });
      console.log('Sentry initialized for error tracking');
    }).catch(err => {
      console.error('Failed to initialize Sentry:', err);
    });
  }
  */
}

/**
 * Capture exception to Sentry
 * @param error Error to capture
 * @param _context Additional context
 */
export function captureException(
  error: any,
  _context?: Record<string, any>
): void {
  // Sentry disabled for now - to enable install @sentry/react
  console.error('Error captured:', error);
}

/**
 * Capture message to Sentry
 * @param message Message to capture
 * @param level Log level
 * @param _context Additional context
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  _context?: Record<string, any>
): void {
  // Sentry disabled for now - to enable install @sentry/react
  const logLevel = level === 'error' || level === 'fatal' ? 'error' : 'log';
  console[logLevel as 'error' | 'log'](message);
}

/**
 * Set user context for Sentry
 * @param userId User ID
 * @param email User email
 * @param username Username
 */
export function setUserContext(
  userId: string,
  email?: string,
  username?: string
): void {
  // Sentry disabled for now - to enable install @sentry/react
  console.debug('User context:', { userId, email, username });
}

/**
 * Clear user context from Sentry
 */
export function clearUserContext(): void {
  // Sentry disabled for now - to enable install @sentry/react
  console.debug('User context cleared');
}

/**
 * Add breadcrumb for debugging
 * @param message Breadcrumb message
 * @param data Breadcrumb data
 * @param level Log level
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, any>,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
): void {
  // Sentry disabled for now - to enable install @sentry/react
  console.debug('Breadcrumb:', { message, data, level });
}
