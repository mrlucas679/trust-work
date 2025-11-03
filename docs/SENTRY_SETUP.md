# Sentry Setup Guide

## Overview

Sentry is configured for error tracking and performance monitoring in the TrustWork application. This guide explains how to set up and use Sentry effectively.

## Installation

Sentry is already installed in the project:

```bash
npm install @sentry/react
```

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# Sentry Configuration
VITE_SENTRY_DSN=your-sentry-dsn-here
VITE_SENTRY_ENABLED=false  # Set to true to enable in development
VITE_APP_VERSION=1.0.0     # Optional: track releases
```

### Getting Your Sentry DSN

1. Sign up at [sentry.io](https://sentry.io)
2. Create a new project (select React)
3. Copy the DSN from the project settings
4. Add it to your `.env` file

## Features

### Error Tracking

Sentry automatically captures:

- Unhandled exceptions
- Promise rejections
- React component errors (via Error Boundary)
- Console errors

### Performance Monitoring

Tracks:

- Page load times
- API request performance
- Custom transactions
- Navigation timing

### User Context

Automatically captures:

- User ID, email, and role
- Browser information
- Device information
- Session data

## Usage Examples

### Basic Error Capture

```typescript
import { captureException } from '@/lib/sentry';

try {
  // Your code
} catch (error) {
  captureException(error as Error, {
    tags: { feature: 'payments' },
    extra: { userId: user.id }
  });
}
```

### Message Logging

```typescript
import { captureMessage } from '@/lib/sentry';

captureMessage('User completed onboarding', 'info', {
  tags: { feature: 'onboarding' },
  extra: { timestamp: Date.now() }
});
```

### Set User Context

```typescript
import { setUserContext } from '@/lib/sentry';

// After user logs in
setUserContext({
  id: user.id,
  email: user.email,
  role: user.role
});

// After user logs out
setUserContext(null);
```

### Performance Tracking

```typescript
import { measureOperation, withSpan } from '@/lib/sentry';

// Measure entire operation
const assignments = await measureOperation('fetch-assignments', async () => {
  return await api.getAssignments();
});

// Measure specific span
await withSpan('database-query', async () => {
  return await db.query('SELECT * FROM users');
});
```

### Add Breadcrumbs

```typescript
import { addBreadcrumb } from '@/lib/sentry';

addBreadcrumb('User clicked submit button', 'user-action', {
  formId: 'payment-form',
  buttonText: 'Submit Payment'
});
```

### Custom Tags and Context

```typescript
import { setTag, setTags, setContext } from '@/lib/sentry';

// Single tag
setTag('feature', 'payments');

// Multiple tags
setTags({
  feature: 'payments',
  userType: 'freelancer'
});

// Additional context
setContext('payment', {
  amount: 100,
  currency: 'USD',
  method: 'card'
});
```

## Integration with Supabase

Update your SupabaseProvider to set user context:

```typescript
import { setUserContext } from '@/lib/sentry';

useEffect(() => {
  if (user) {
    setUserContext({
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role
    });
  } else {
    setUserContext(null);
  }
}, [user]);
```

## Configuration Options

### Sampling Rates

The default configuration uses:

- **Development**: 100% error capture, 100% performance sampling
- **Production**: 100% error capture, 10% performance sampling

Adjust in `src/lib/sentry.ts`:

```typescript
tracesSampleRate: isDevelopment ? 1.0 : 0.1,
sampleRate: 1.0,
```

### Ignored Errors

Common non-critical errors are ignored by default:

- Browser extension errors
- Network errors
- ResizeObserver errors

Add more in `src/lib/sentry.ts`:

```typescript
ignoreErrors: [
  'Your error message here',
  /regex pattern here/,
],
```

### Sensitive Data Filtering

The `beforeSend` hook automatically filters:

- Authorization headers
- Cookie headers
- Token query parameters
- API keys

Add more filters in `src/lib/sentry.ts`:

```typescript
beforeSend(event, hint) {
  // Your custom filtering logic
  return event;
}
```

## Best Practices

### 1. User Privacy

- Never send sensitive user data (passwords, tokens, credit cards)
- Filter PII (Personally Identifiable Information) in `beforeSend`
- Use context sparingly and only for debugging

### 2. Performance

- Use appropriate sampling rates for production
- Don't create too many custom transactions
- Batch related operations into single transactions

### 3. Error Context

Always provide context when capturing errors:

```typescript
captureException(error, {
  tags: { feature: 'payments' },
  extra: {
    userId: user.id,
    action: 'submit-payment',
    paymentAmount: amount
  }
});
```

### 4. Development Mode

- Set `VITE_SENTRY_ENABLED=true` only when testing Sentry
- Errors are logged to console in development
- Review errors locally before they reach production

## Dashboard and Alerts

### Viewing Errors

1. Go to your Sentry dashboard
2. Navigate to Issues
3. Filter by environment, release, or tags
4. Click on an issue for full details

### Setting Up Alerts

1. Go to Alerts in Sentry
2. Create a new alert rule
3. Set conditions (e.g., "more than 10 errors in 5 minutes")
4. Configure notification channels (email, Slack, etc.)

### Releases

Track which version of your app has errors:

```bash
# Set version in .env
VITE_APP_VERSION=1.2.3

# Or use git commit
VITE_APP_VERSION=$(git rev-parse --short HEAD)
```

## Troubleshooting

### Sentry Not Capturing Errors

1. Check `VITE_SENTRY_DSN` is set correctly
2. Verify `VITE_SENTRY_ENABLED=true` in development
3. Check network tab for Sentry API calls
4. Review `beforeSend` hook filters

### Too Many Events

1. Reduce `tracesSampleRate` for performance monitoring
2. Add more entries to `ignoreErrors`
3. Implement custom filtering in `beforeSend`

### Missing User Context

1. Ensure `setUserContext` is called after login
2. Verify user data is available when calling
3. Check Sentry dashboard user tab

## Resources

- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Best Practices](https://docs.sentry.io/product/best-practices/)

## Support

For issues or questions about Sentry integration:

1. Check Sentry documentation
2. Review error logs in Sentry dashboard
3. Check console output in development mode
