// Simple in-memory background job queue
// Stores job status so frontend can poll for progress

type JobStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

interface Job {
  id: string;
  userId: string;
  status: JobStatus;
  progress: number; // 0-100
  error?: string;
  startedAt: number;
  completedAt?: number;
}

// Store jobs in memory (sufficient for small multi-user app)
const jobs = new Map<string, Job>();

// Clean up completed jobs after 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const JOB_RETENTION = 10 * 60 * 1000; // 10 minutes

// Start cleanup timer
setInterval(() => {
  const now = Date.now();
  for (const [jobId, job] of jobs.entries()) {
    if (job.completedAt && now - job.completedAt > JOB_RETENTION) {
      jobs.delete(jobId);
    }
  }
}, CLEANUP_INTERVAL);

export function createJob(userId: string): string {
  const jobId = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  jobs.set(jobId, {
    id: jobId,
    userId,
    status: 'pending',
    progress: 0,
    startedAt: Date.now(),
  });
  return jobId;
}

export function getJob(jobId: string): Job | undefined {
  return jobs.get(jobId);
}

export function startJob(jobId: string): void {
  const job = jobs.get(jobId);
  if (job) {
    job.status = 'in_progress';
    job.progress = 5; // Start at 5%
  }
}

export function updateJobProgress(jobId: string, progress: number): void {
  const job = jobs.get(jobId);
  if (job && job.status === 'in_progress') {
    job.progress = Math.min(progress, 95); // Cap at 95% until completion
  }
}

export function completeJob(jobId: string): void {
  const job = jobs.get(jobId);
  if (job) {
    job.status = 'completed';
    job.progress = 100;
    job.completedAt = Date.now();
  }
}

export function failJob(jobId: string, error: string): void {
  const job = jobs.get(jobId);
  if (job) {
    job.status = 'failed';
    job.error = error;
    job.completedAt = Date.now();
  }
}
