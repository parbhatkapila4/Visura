interface AlertContext {
  jobId?: string;
  versionId?: string;
  documentId?: string;
  userId?: string;
  retryCount?: number;
  errorMessage?: string;
  [key: string]: any;
}

interface AlertPayload {
  alert_type: string;
  severity: "critical" | "warning";
  message: string;
  timestamp: string;
  context: AlertContext;
}

interface DedupEntry {
  timestamp: number;
  count: number;
}

const dedupMap = new Map<string, DedupEntry>();
const DEDUP_WINDOW_MS = 10 * 60 * 1000; 

function shouldSuppressAlert(key: string): boolean {
  const entry = dedupMap.get(key);
  if (!entry) {
    return false;
  }

  const age = Date.now() - entry.timestamp;
  if (age > DEDUP_WINDOW_MS) {
    dedupMap.delete(key);
    return false;
  }

  return true;
}

function recordAlert(key: string): void {
  const entry = dedupMap.get(key);
  if (entry) {
    entry.count++;
  } else {
    dedupMap.set(key, { timestamp: Date.now(), count: 1 });
  }

  setTimeout(() => {
    dedupMap.delete(key);
  }, DEDUP_WINDOW_MS);
}

function getDedupKey(alertType: string, context: AlertContext): string {
  const entityId =
    context.jobId || context.versionId || context.documentId || context.userId || "unknown";
  return `${alertType}:${entityId}`;
}

export async function sendAlert({
  severity,
  type,
  message,
  context = {},
}: {
  severity: "critical" | "warning";
  type: string;
  message: string;
  context?: AlertContext;
}): Promise<void> {
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (!webhookUrl) {
    return;
  }

  const dedupKey = getDedupKey(type, context);
  if (shouldSuppressAlert(dedupKey)) {
    return;
  }

  recordAlert(dedupKey);

  const payload: AlertPayload = {
    alert_type: type,
    severity,
    message,
    timestamp: new Date().toISOString(),
    context,
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Alert webhook failed: ${response.status} ${response.statusText}`, payload);
    }
  } catch (error) {
    console.error("Alert webhook error:", error, payload);
  }
}
