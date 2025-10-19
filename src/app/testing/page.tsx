"use client";

import { useState, useMemo } from "react";
import { useActivityLog } from "@/hooks/useActivityLog";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Heart,
  User,
} from "lucide-react";

type ActivityCategory = "PRICE_UPDATE" | "PREDICTION" | "API_CALL" | undefined;

const CATEGORY_OPTIONS: { value: ActivityCategory; label: string }[] = [
  { value: undefined, label: "All" },
  { value: "PRICE_UPDATE", label: "Price Update" },
  { value: "PREDICTION", label: "Prediction" },
  { value: "API_CALL", label: "API Call" },
];

const STATUS_COLORS = {
  SUCCESS: "text-green-500 bg-green-500/10 border-green-500/20",
  ERROR: "text-red-500 bg-red-500/10 border-red-500/20",
  IN_PROGRESS: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
};

const STATUS_ICONS = {
  SUCCESS: CheckCircle2,
  ERROR: AlertCircle,
  IN_PROGRESS: Clock,
};

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60)
    return `${diffSeconds} second${diffSeconds !== 1 ? "s" : ""} ago`;
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
}

interface DevlinDiagnostic {
  status: string;
  devlinUser?: {
    id: string;
    name: string;
    setupComplete: boolean;
    totalSetsCompleted: number;
    rehabExercisesCount: number;
    rehabExercisesCompleted: number;
    progressPercentage: number;
  };
  rehabExercises?: {
    total: number;
    completed: number;
    byCategory: Record<string, any[]>;
  };
  allUsers?: {
    name: string;
    workoutsCount: number;
    rehabExercisesCount: number;
  }[];
  message?: string;
  solution?: string;
}

export default function Testing() {
  const [selectedCategory, setSelectedCategory] =
    useState<ActivityCategory>(undefined);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [devlinData, setDevlinData] = useState<DevlinDiagnostic | null>(null);
  const [devlinLoading, setDevlinLoading] = useState(false);
  const [showDevlinDiagnostic, setShowDevlinDiagnostic] = useState(false);

  const {
    data: activities = [],
    isLoading,
    error,
    dataUpdatedAt,
  } = useActivityLog(selectedCategory);

  const checkDevlinRehab = async () => {
    setDevlinLoading(true);
    try {
      const response = await fetch("/api/diagnostic/devlin");
      const data = await response.json();
      setDevlinData(data);
      setShowDevlinDiagnostic(true);
    } catch (error) {
      console.error("Failed to check Devlin rehab:", error);
    } finally {
      setDevlinLoading(false);
    }
  };

  const lastUpdated = useMemo(() => {
    if (!dataUpdatedAt) return "Never";
    return formatRelativeTime(new Date(dataUpdatedAt).toISOString());
  }, [dataUpdatedAt]);

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-400" />
              <h1 className="text-4xl font-bold text-white">
                System Testing Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Auto-refresh: 5s</span>
            </div>
          </div>
          <p className="text-gray-400 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Last updated: {lastUpdated}
          </p>
        </motion.div>

        {/* Devlin Rehab Diagnostic */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <div className="bg-gradient-to-br from-teal-500/10 to-cyan-600/10 backdrop-blur-sm rounded-xl border border-teal-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-teal-400" />
                <h2 className="text-xl font-bold text-white">
                  Devlin Rehab Diagnostic
                </h2>
              </div>
              <button
                onClick={checkDevlinRehab}
                disabled={devlinLoading}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {devlinLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    Check Rehab Status
                  </>
                )}
              </button>
            </div>

            <AnimatePresence>
              {showDevlinDiagnostic && devlinData && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {devlinData.status === "NOT_FOUND" ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <p className="text-red-400 font-medium mb-2">
                        {devlinData.message}
                      </p>
                      <p className="text-gray-400 text-sm">
                        💡 {devlinData.solution}
                      </p>
                    </div>
                  ) : devlinData.status === "SUCCESS" &&
                    devlinData.devlinUser ? (
                    <div className="space-y-4">
                      {/* User Info */}
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                          <User className="w-5 h-5" />
                          User Information
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-400">Name:</span>
                            <span className="text-white ml-2">
                              {devlinData.devlinUser.name}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">
                              Setup Complete:
                            </span>
                            <span className="text-white ml-2">
                              {devlinData.devlinUser.setupComplete
                                ? "✅ Yes"
                                : "❌ No"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">
                              Total Sets:
                            </span>
                            <span className="text-white ml-2">
                              {devlinData.devlinUser.totalSetsCompleted}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">
                              Rehab Progress:
                            </span>
                            <span className="text-white ml-2">
                              {devlinData.devlinUser.rehabExercisesCompleted}/
                              {devlinData.devlinUser.rehabExercisesCount} (
                              {devlinData.devlinUser.progressPercentage}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Rehab Exercises */}
                      {devlinData.rehabExercises &&
                        devlinData.rehabExercises.total > 0 && (
                          <div className="bg-gray-800/50 rounded-lg p-4">
                            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                              <Heart className="w-5 h-5" />
                              Rehab Exercises (
                              {devlinData.rehabExercises.total})
                            </h3>
                            {Object.entries(
                              devlinData.rehabExercises.byCategory,
                            ).map(([category, exercises]) => (
                              <div key={category} className="mb-4 last:mb-0">
                                <h4 className="text-teal-400 font-medium text-sm mb-2">
                                  {category}
                                </h4>
                                <div className="space-y-1 ml-3">
                                  {exercises.map((ex: any) => (
                                    <div
                                      key={ex.id}
                                      className="text-sm text-gray-300 flex items-start gap-2"
                                    >
                                      <span className="text-gray-500">
                                        {ex.completed ? "✓" : "○"}
                                      </span>
                                      <span
                                        className={
                                          ex.completed
                                            ? "line-through opacity-60"
                                            : ""
                                        }
                                      >
                                        {ex.name}
                                        {(ex.setsLeft || ex.setsRight) && (
                                          <span className="text-gray-500 ml-2">
                                            (L: {ex.setsLeft || 0} / R:{" "}
                                            {ex.setsRight || 0})
                                          </span>
                                        )}
                                        {ex.sets && (
                                          <span className="text-gray-500 ml-2">
                                            ({ex.sets} sets)
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      {/* All Users */}
                      {devlinData.allUsers && (
                        <div className="bg-gray-800/50 rounded-lg p-4">
                          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            All Users ({devlinData.allUsers.length})
                          </h3>
                          <div className="space-y-2">
                            {devlinData.allUsers.map((user) => (
                              <div
                                key={user.name}
                                className="text-sm text-gray-300"
                              >
                                <span className="font-medium text-white">
                                  {user.name}
                                </span>
                                <span className="text-gray-500 ml-2">
                                  - {user.workoutsCount} workouts,{" "}
                                  {user.rehabExercisesCount} rehab exercises
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <p className="text-yellow-400">
                        Unexpected response status
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-gray-300 font-medium">
              Filter by Category
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {CATEGORY_OPTIONS.map(({ value, label }) => (
              <button
                key={label}
                onClick={() => setSelectedCategory(value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === value
                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-700 bg-gray-800/80">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Feed
              {activities.length > 0 && (
                <span className="text-sm text-gray-400 ml-2">
                  ({activities.length}{" "}
                  {activities.length === 1 ? "item" : "items"})
                </span>
              )}
            </h2>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading activities...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-12 text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
              <p className="text-red-400">Failed to load activities</p>
              <p className="text-gray-500 text-sm mt-2">
                {(error as Error).message}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && activities.length === 0 && (
            <div className="p-12 text-center">
              <Activity className="w-8 h-8 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No activities found</p>
              <p className="text-gray-500 text-sm mt-2">
                {selectedCategory
                  ? `No activities in category: ${selectedCategory}`
                  : "Start using the system to see activity logs"}
              </p>
            </div>
          )}

          {/* Activity List */}
          {!isLoading && !error && activities.length > 0 && (
            <div className="divide-y divide-gray-700">
              <AnimatePresence mode="popLayout">
                {activities.map((activity, index) => {
                  const StatusIcon = STATUS_ICONS[activity.status];
                  const isExpanded = expandedId === activity.id;

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.02 }}
                      className="p-4 hover:bg-gray-700/30 transition-colors"
                    >
                      <div
                        className="cursor-pointer"
                        onClick={() => toggleExpanded(activity.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            {/* Status Icon */}
                            <div
                              className={`p-2 rounded-lg border ${STATUS_COLORS[activity.status]}`}
                            >
                              <StatusIcon className="w-4 h-4" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`px-2 py-0.5 text-xs font-medium rounded ${STATUS_COLORS[activity.status]}`}
                                >
                                  {activity.status}
                                </span>
                                <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-700 text-gray-300 border border-gray-600">
                                  {activity.category}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatRelativeTime(activity.timestamp)}
                                </span>
                              </div>
                              <h3 className="text-white font-medium mb-1">
                                {activity.operation}
                              </h3>
                              <p className="text-gray-400 text-sm break-words">
                                {activity.message}
                              </p>
                            </div>
                          </div>

                          {/* Expand Icon */}
                          {activity.details && (
                            <button className="text-gray-400 hover:text-white transition-colors">
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5" />
                              ) : (
                                <ChevronDown className="w-5 h-5" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {isExpanded && activity.details && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 ml-11 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                <h4 className="text-gray-300 font-medium mb-2 text-sm">
                                  Details:
                                </h4>
                                <pre className="text-xs text-gray-400 overflow-x-auto">
                                  {JSON.stringify(activity.details, null, 2)}
                                </pre>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Stats Footer */}
        {activities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {Object.entries(STATUS_ICONS).map(([status, Icon]) => {
              const count = activities.filter(
                (a) => a.status === status,
              ).length;
              const percentage =
                activities.length > 0
                  ? Math.round((count / activities.length) * 100)
                  : 0;

              return (
                <div
                  key={status}
                  className={`p-4 rounded-lg border ${STATUS_COLORS[status as keyof typeof STATUS_COLORS]}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{status}</span>
                    </div>
                    <span className="text-2xl font-bold">{count}</span>
                  </div>
                  <div className="text-sm opacity-75">
                    {percentage}% of total
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
