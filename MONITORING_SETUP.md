# Production Monitoring Setup Guide

This guide explains how to set up comprehensive monitoring for Visura in production.

## 📊 Overview

Production monitoring covers:
- **Error Tracking** (Sentry) - Catch bugs before users report them
- **Performance Monitoring** (Vercel Analytics) - Track Core Web Vitals
- **Product Analytics** (PostHog) - Understand user behavior
- **Custom Metrics** - Track business KPIs

---

## 🔴 1. Sentry (Error Tracking)

### Installation

```bash
npx @sentry/wizard@latest -i nextjs
```

This automatically creates:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

### Environment Variables

Add to `.env.local`:
```bash
NEXT_PUBLIC_SENTRY_DSN=https://examplePublicKey@o0.ingest.sentry.io/0
SENTRY_ORG=your-organization
SENTRY_PROJECT=visura
SENTRY_AUTH_TOKEN=your-auth-token
```

### Usage in Code

```typescript
import * as Sentry from '@sentry/nextjs';

// Capture errors
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'pdf-processing' },
    extra: { fileSize: 1024000 }
  });
  throw error;
}

// Set user context
Sentry.setUser({ id: userId, email: userEmail });

// Capture custom events
Sentry.captureMessage('Large file uploaded', {
  level: 'warning',
  extra: { fileSize: 50000000 }
});
```

### Benefits
- Automatic error grouping
- Stack traces with source maps
- Performance monitoring
- Release tracking
- Slack/Email alerts

---

## 📈 2. Vercel Analytics

### Installation

```bash
npm install @vercel/analytics @vercel/speed-insights
```

### Setup in Layout

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### What It Tracks
- Page views
- Core Web Vitals (LCP, FID, CLS, TTFB)
- Custom events
- Conversion funnels

### Custom Events

```typescript
import { track } from '@vercel/analytics';

track('Document Uploaded', { 
  fileName: 'report.pdf',
  size: 1024000 
});
```

---

## 🎯 3. PostHog (Product Analytics)

### Installation

```bash
npm install posthog-js
```

### Environment Variables

```bash
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Setup Provider

```typescript
// components/analytics/posthog-provider.tsx
'use client';

import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false,
        capture_pageleave: true,
      });
    }
  }, []);

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}

// Track page views
export function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname;
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', { $current_url: url });
    }
  }, [pathname, searchParams]);
  
  return null;
}
```

### Usage

```typescript
import posthog from 'posthog-js';

// Track custom events
posthog.capture('document_uploaded', {
  fileName: 'report.pdf',
  fileSize: 1024000,
  processingTime: 2500
});

// Identify users
posthog.identify(userId, {
  email: userEmail,
  plan: 'pro',
  signupDate: '2025-01-01'
});

// Feature flags
const showNewFeature = posthog.isFeatureEnabled('new-ui-redesign');
```

---

## 📊 4. Custom Metrics Dashboard

### Key Metrics to Track

1. **Product Metrics**
   - Daily/Monthly Active Users (DAU/MAU)
   - Documents processed
   - Chat messages sent
   - Average processing time

2. **Business Metrics**
   - Conversion rate (free → pro)
   - Monthly Recurring Revenue (MRR)
   - Churn rate
   - Customer Acquisition Cost (CAC)

3. **Technical Metrics**
   - API error rate
   - P95/P99 latency
   - Database query performance
   - Storage usage

4. **User Engagement**
   - Time to first upload
   - Documents per user
   - Chat sessions per document
   - Feature adoption rates

### Implementation

```typescript
// lib/metrics.ts
export async function recordMetric(
  metric: string,
  value: number,
  tags?: Record<string, string>
) {
  // Store in database for dashboard
  await db.insert({
    table: 'metrics',
    data: {
      metric_name: metric,
      value,
      tags: JSON.stringify(tags),
      recorded_at: new Date()
    }
  });
  
  // Also send to external services
  trackEvent(metric, { value, ...tags });
}

// Usage
await recordMetric('pdf_processing_time', 2500, {
  pages: '50',
  fileSize: '5MB'
});
```

---

## 🚨 5. Alerting Setup

### Sentry Alerts

Configure in Sentry dashboard:
1. **Error Spike Alert**: > 10 errors in 5 minutes
2. **Performance Alert**: P95 latency > 1 second
3. **New Issue Alert**: First occurrence of new error

### Custom Alerts

```typescript
// lib/alerts.ts
export async function sendAlert(
  severity: 'critical' | 'warning' | 'info',
  message: string,
  context?: Record<string, any>
) {
  // Log to Sentry
  const error = new Error(message);
  Sentry.captureException(error, {
    level: severity,
    extra: context
  });
  
  // Send to Slack if critical
  if (severity === 'critical') {
    await fetch(process.env.SLACK_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 CRITICAL: ${message}`,
        attachments: [{ text: JSON.stringify(context, null, 2) }]
      })
    });
  }
}

// Usage
if (errorRate > 0.05) {
  await sendAlert('critical', 'API error rate above 5%', {
    currentRate: errorRate,
    endpoint: '/api/chatbot/messages'
  });
}
```

---

## 📱 6. Real User Monitoring (RUM)

Track actual user experience:

```typescript
// lib/rum.ts
export function measureUserAction<T>(
  actionName: string,
  action: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  
  return action()
    .then(result => {
      const duration = performance.now() - startTime;
      trackEvent(`user_action_${actionName}`, {
        duration,
        success: true
      });
      return result;
    })
    .catch(error => {
      const duration = performance.now() - startTime;
      trackEvent(`user_action_${actionName}`, {
        duration,
        success: false,
        error: error.message
      });
      throw error;
    });
}

// Usage
const summary = await measureUserAction('generate_summary', async () => {
  return await generateSummary(pdfText);
});
```

---

## 🎯 7. Dashboard Setup

Create `app/(logged-in)/admin/metrics/page.tsx` for internal metrics:

```typescript
// Shows:
// - Error rates by endpoint
// - Average processing times
// - User growth chart
// - Revenue metrics
// - Top errors
// - Slow queries
```

---

## ✅ Setup Checklist

- [ ] Install Sentry CLI and run wizard
- [ ] Add Sentry DSN to environment variables
- [ ] Install Vercel Analytics packages
- [ ] Add Analytics components to layout
- [ ] Install PostHog (optional)
- [ ] Set up custom metrics tracking
- [ ] Configure Slack webhooks for alerts
- [ ] Create admin metrics dashboard
- [ ] Test error tracking in development
- [ ] Verify analytics in Vercel dashboard

---

## 📚 Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [PostHog Docs](https://posthog.com/docs)
- [Web Vitals](https://web.dev/vitals/)

---

**Note**: Monitoring is essential for production. Start with Sentry (free tier) and Vercel Analytics (included). Add PostHog when you need detailed product analytics.

