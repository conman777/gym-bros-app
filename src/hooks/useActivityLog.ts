import { useQuery } from "@tanstack/react-query";

type Activity = {
  id: string;
  timestamp: string;
  category: string;
  operation: string;
  message: string;
  status: "SUCCESS" | "ERROR" | "IN_PROGRESS";
  details?: Record<string, unknown>;
};

type ActivityLogResponse = {
  activities: Activity[];
};

export const useActivityLog = (category?: string, limit = 50) => {
  return useQuery<Activity[]>({
    queryKey: ["activity-log", category, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      params.append("limit", String(limit));

      const response = await fetch(`/api/get-activity-log?${params}`);
      if (!response.ok) throw new Error("Failed to fetch activity log");
      const data: ActivityLogResponse = await response.json();
      return data.activities;
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });
};
