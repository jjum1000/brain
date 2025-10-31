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

  // Import Sentry dynamically to avoid bundling in development
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
        // Performance monitoring
        tracesSampleRate: 0.1, // 10% of transactions in production
        // Session replay
        replaysSessionSampleRate: 0.1, // 10% of sessions
        replaysOnErrorSampleRate: 1.0, // Capture all sessions with errors
      });

      console.log('Sentry initialized for error tracking');
    }).catch(err => {
      console.error('Failed to initialize Sentry:', err);
    });
  }
}

/**
 * Capture exception to Sentry
 * @param error Error to capture
 * @param context Additional context
 */
export function captureException(
  error: any,
  context?: Record<string, any>
): void {
  if (import.meta.env.MODE === 'production') {
    import('@sentry/react').then(Sentry => {
      if (context) {
        Sentry.captureException(error, { contexts: { app: context } });
      } else {
        Sentry.captureException(error);
      }
    }).catch(err => {
      console.error('Failed to capture exception:', err);
    });
  }
}

/**
 * Capture message to Sentry
 * @param message Message to capture
 * @param level Log level
 * @param context Additional context
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  context?: Record<string, any>
): void {
  if (import.meta.env.MODE === 'production') {
    import('@sentry/react').then(Sentry => {
      if (context) {
        Sentry.captureMessage(message, {
          level,
          contexts: { app: context },
        });
      } else {
        Sentry.captureMessage(message, level);
      }
    }).catch(err => {
      console.error('Failed to capture message:', err);
    });
  }
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
  if (import.meta.env.MODE === 'production') {
    import('@sentry/react').then(Sentry => {
      Sentry.setUser({
        id: userId,
        email: email,
        username: username,
      });
    }).catch(err => {
      console.error('Failed to set user context:', err);
    });
  }
}

/**
 * Clear user context from Sentry
 */
export function clearUserContext(): void {
  if (import.meta.env.MODE === 'production') {
    import('@sentry/react').then(Sentry => {
      Sentry.setUser(null);
    }).catch(err => {
      console.error('Failed to clear user context:', err);
    });
  }
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
  if (import.meta.env.MODE === 'production') {
    import('@sentry/react').then(Sentry => {
      Sentry.addBreadcrumb({
        message,
        data,
        level,
        timestamp: Date.now() / 1000,
      });
    }).catch(err => {
      console.error('Failed to add breadcrumb:', err);
    });
  }
}
