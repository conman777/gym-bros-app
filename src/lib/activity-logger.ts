import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type ActivityStatus = "SUCCESS" | "ERROR" | "IN_PROGRESS";
type ActivityCategory = "PRICE_UPDATE" | "PREDICTION" | "API_CALL" | "SYSTEM";

interface LogActivityParams {
  category: ActivityCategory;
  operation: string;
  message: string;
  status: ActivityStatus;
  details?: Prisma.InputJsonValue;
}

/**
 * Log an activity to the database for system monitoring and debugging
 */
export async function logActivity({
  category,
  operation,
  message,
  status,
  details,
}: LogActivityParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        category,
        operation,
        message,
        status,
        details,
      },
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw - logging failures shouldn't break the app
  }
}
