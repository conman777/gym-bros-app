'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface SetupProgressHandlerProps {
  onProgressUpdate: (progress: number) => void;
  onSetupComplete: (complete: boolean) => void;
  onRefreshData: () => void;
}

export function SetupProgressHandler({
  onProgressUpdate,
  onSetupComplete,
  onRefreshData,
}: SetupProgressHandlerProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;
    const setupJobId = searchParams.get('setupJobId');
    if (!setupJobId) return;

    const pollSetupStatus = async () => {
      try {
        const response = await fetch(`/api/setup-status?jobId=${setupJobId}`);
        if (response.ok) {
          const data = await response.json();
          onProgressUpdate(data.progress);

          if (data.status === 'completed') {
            onSetupComplete(true);
            // Refresh data after a short delay to ensure DB is updated
            setTimeout(() => {
              onRefreshData();
              onProgressUpdate(0);
            }, 500);
          } else if (data.status === 'failed') {
            console.error('Setup failed:', data.error);
            onProgressUpdate(0);
          }
        }
      } catch (error) {
        console.error('Failed to poll setup status:', error);
      }
    };

    const interval = setInterval(pollSetupStatus, 500);
    return () => clearInterval(interval);
  }, [searchParams, onProgressUpdate, onSetupComplete, onRefreshData]);

  return null;
}
