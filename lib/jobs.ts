import { getDbConnection } from "./db";

export type JobStatus = "queued" | "processing" | "completed" | "failed";

export interface CreateJobInput {
  userId: string;
  extractedText: string;
  fileName: string;
  fileUrl: string;
  title: string;
}

export interface Job {
  id: string;
  user_id: string;
  pdf_summary_id: string | null;
  extracted_text: string;
  file_name: string;
  file_url: string;
  title: string;
  status: JobStatus;
  retry_count: number;
  max_retries: number;
  error_message: string | null;
  error_stack: string | null;
  created_at: Date;
  started_at: Date | null;
  completed_at: Date | null;
  updated_at: Date;
}

export async function createSummaryJob(input: CreateJobInput): Promise<string> {
  const sql = await getDbConnection();

  const [job] = await sql`
    INSERT INTO summary_jobs (
      user_id, extracted_text, file_name, file_url, title, status
    ) VALUES (
      ${input.userId}, ${input.extractedText}, ${input.fileName}, 
      ${input.fileUrl}, ${input.title}, 'queued'
    )
    RETURNING id
  `;

  return job.id;
}

export async function getJobById(jobId: string): Promise<Job | null> {
  const sql = await getDbConnection();
  const [job] = await sql`
    SELECT * FROM summary_jobs WHERE id = ${jobId}
  `;
  return (job as Job) || null;
}


export async function claimJob(jobId: string): Promise<Job | null> {
  const sql = await getDbConnection();

  const [job] = await sql`
    UPDATE summary_jobs 
    SET status = 'processing', 
        started_at = CURRENT_TIMESTAMP, 
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${jobId} 
      AND status = 'queued'
    RETURNING *
  `;

  return (job as Job) || null;
}

export async function markJobCompleted(jobId: string, pdfSummaryId: string): Promise<void> {
  const sql = await getDbConnection();
  await sql`
    UPDATE summary_jobs 
    SET status = 'completed', 
        pdf_summary_id = ${pdfSummaryId},
        completed_at = CURRENT_TIMESTAMP, 
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${jobId}
  `;
}

export async function markJobFailed(jobId: string, error: Error): Promise<void> {
  const sql = await getDbConnection();
  await sql`
    UPDATE summary_jobs 
    SET status = 'failed',
        error_message = ${error.message},
        error_stack = ${error.stack || null},
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${jobId}
  `;
}


export async function getRetryableJobs(limit: number = 20): Promise<Job[]> {
  const sql = await getDbConnection();
  const jobs = await sql`
    SELECT * FROM summary_jobs
    WHERE status = 'failed' 
      AND retry_count < max_retries
      AND created_at > NOW() - INTERVAL '24 hours'
    ORDER BY created_at ASC
    LIMIT ${limit}
  `;
  return jobs as Job[];
}


export async function getStuckJobs(timeoutMinutes: number = 10, limit: number = 20): Promise<Job[]> {
  const sql = await getDbConnection();
  const jobs = await sql`
    SELECT * FROM summary_jobs
    WHERE status = 'processing'
      AND started_at < NOW() - make_interval(mins => ${timeoutMinutes})
    ORDER BY started_at ASC
    LIMIT ${limit}
  `;
  return jobs as Job[];
}


export async function resetStuckJob(jobId: string): Promise<void> {
  const sql = await getDbConnection();
  await sql`
    UPDATE summary_jobs 
    SET status = 'queued',
        retry_count = retry_count + 1,
        started_at = NULL,
        error_message = NULL,
        error_stack = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${jobId}
      AND status = 'processing'
  `;
}


export async function resetFailedJobForRetry(jobId: string): Promise<void> {
  const sql = await getDbConnection();
  await sql`
    UPDATE summary_jobs 
    SET retry_count = retry_count + 1,
        status = 'queued',
        error_message = NULL,
        error_stack = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${jobId}
      AND status = 'failed'
      AND retry_count < max_retries
  `;
}


export async function updateJobHeartbeat(jobId: string): Promise<void> {
  const sql = await getDbConnection();
  await sql`
    UPDATE summary_jobs 
    SET updated_at = CURRENT_TIMESTAMP
    WHERE id = ${jobId}
      AND status = 'processing'
  `;
}
