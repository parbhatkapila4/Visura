# Summary job queue

Nothing in the live app adds jobs to this queue. `createSummaryJob` in `lib/jobs.ts` is only called by `createSummaryJobAction` in `actions/job-actions.tsx`, which nothing imports, so no upload creates a row in `summary_jobs`. Uploads go through `createVersionedDocumentJob` in `actions/versioned-upload-actions.tsx` instead. `/api/jobs/process` and the daily `/api/cron/retry-jobs` cron in `vercel.json` still exist, but they only act on rows already in the table. `/api/health` still reports the app unhealthy if the `summary_jobs` table is missing.

## What the code does

The queue code in `lib/jobs.ts` and `app/api/jobs/process/route.ts` has:

- Database-based job queue (`summary_jobs` table)
- Job claiming with atomic updates
- Internal API authentication
- Failed jobs marked `failed`, with an alert sent to `ALERT_WEBHOOK_URL` when it is set
