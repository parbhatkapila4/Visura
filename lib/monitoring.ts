// Monitoring and error tracking utilities

export function logError(error: Error, context?: Record<string, any>) {
  console.error('Error:', error, context);
  
  // Sentry integration can be added here
}

export function logEvent(eventName: string, properties?: Record<string, any>) {
  console.log('Event:', eventName, properties);
}

// Analytics tracking

export function trackPageView(page: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).va) {
    (window as any).va('event', 'pageview', { page, ...properties });
  }
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).va) {
    (window as any).va('event', eventName, properties);
  }
}

// Custom metrics tracking

export interface CustomMetrics {
  // Document processing
  documentUploadStarted: (fileName: string, fileSize: number) => void;
  documentUploadCompleted: (fileName: string, duration: number) => void;
  documentUploadFailed: (fileName: string, error: string) => void;
  
  // PDF processing
  pdfProcessingStarted: (summaryId: string, pages: number) => void;
  pdfProcessingCompleted: (summaryId: string, duration: number) => void;
  
  // Chatbot usage
  chatMessageSent: (sessionId: string, messageLength: number) => void;
  chatResponseReceived: (sessionId: string, responseTime: number) => void;
  
  // User actions
  summaryViewed: (summaryId: string) => void;
  summaryDownloaded: (summaryId: string, format: string) => void;
  summaryShared: (summaryId: string) => void;
  
  userSignedUp: (userId: string, source?: string) => void;
  userUpgraded: (userId: string, plan: string) => void;
  paymentCompleted: (userId: string, amount: number) => void;
}

export const metrics: CustomMetrics = {
  documentUploadStarted: (fileName, fileSize) => {
    trackEvent('document_upload_started', { fileName, fileSize });
    logEvent('document_upload_started', { fileName, fileSizeKB: Math.round(fileSize / 1024) });
  },
  
  documentUploadCompleted: (fileName, duration) => {
    trackEvent('document_upload_completed', { fileName, duration });
    logEvent('document_upload_completed', { fileName, durationMs: duration });
  },
  
  documentUploadFailed: (fileName, error) => {
    trackEvent('document_upload_failed', { fileName, error });
    logError(new Error(`Upload failed: ${error}`), { fileName });
  },
  
  pdfProcessingStarted: (summaryId, pages) => {
    trackEvent('pdf_processing_started', { summaryId, pages });
  },
  
  pdfProcessingCompleted: (summaryId, duration) => {
    trackEvent('pdf_processing_completed', { summaryId, duration });
  },
  
  chatMessageSent: (sessionId, messageLength) => {
    trackEvent('chat_message_sent', { sessionId, messageLength });
  },
  
  chatResponseReceived: (sessionId, responseTime) => {
    trackEvent('chat_response_received', { sessionId, responseTime });
  },
  
  summaryViewed: (summaryId) => {
    trackEvent('summary_viewed', { summaryId });
  },
  
  summaryDownloaded: (summaryId, format) => {
    trackEvent('summary_downloaded', { summaryId, format });
  },
  
  summaryShared: (summaryId) => {
    trackEvent('summary_shared', { summaryId });
  },
  
  userSignedUp: (userId, source) => {
    trackEvent('user_signed_up', { userId, source });
  },
  
  userUpgraded: (userId, plan) => {
    trackEvent('user_upgraded', { userId, plan });
  },
  
  paymentCompleted: (userId, amount) => {
    trackEvent('payment_completed', { userId, amount });
  },
};

// Performance monitoring

export class PerformanceMonitor {
  private startTime: number;
  
  constructor(private operationName: string) {
    this.startTime = Date.now();
  }
  
  end(metadata?: Record<string, any>) {
    const duration = Date.now() - this.startTime;
    
    trackEvent(`performance_${this.operationName}`, {
      duration,
      ...metadata
    });
    
    if (duration > 5000) {
      console.warn(`Slow operation: ${this.operationName} took ${duration}ms`, metadata);
    }
    
    return duration;
  }
}

// Error rate monitoring

let errorCount = 0;
let totalRequests = 0;

export function trackAPIRequest(success: boolean, endpoint: string) {
  totalRequests++;
  if (!success) errorCount++;
  
  if (totalRequests > 100 && (errorCount / totalRequests) > 0.05) {
    console.error(`High error rate detected: ${((errorCount / totalRequests) * 100).toFixed(2)}%`);
    logError(new Error('High API error rate'), {
      errorRate: (errorCount / totalRequests),
      totalRequests,
      errorCount,
      endpoint
    });
  }
}

