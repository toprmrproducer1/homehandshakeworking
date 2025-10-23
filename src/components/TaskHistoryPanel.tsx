import React, { useState } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  Play,
  RefreshCw,
  Trash2,
  Video,
  Calendar,
} from 'lucide-react';
import { ClippingJob } from '../utils/clippingJobs';
import { formatDistanceToNow } from '../utils/dateUtils';

interface TaskHistoryPanelProps {
  tasks: ClippingJob[];
  onViewResults: (task: ClippingJob) => void;
  onCheckStatus: (task: ClippingJob) => void;
  onDeleteTask: (taskId: string) => void;
  loading?: boolean;
}

const TaskHistoryPanel: React.FC<TaskHistoryPanelProps> = ({
  tasks,
  onViewResults,
  onCheckStatus,
  onDeleteTask,
  loading = false,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyTaskId = async (taskId: string) => {
    try {
      await navigator.clipboard.writeText(taskId);
      setCopiedId(taskId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processing':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-900/30 border border-blue-500/30 rounded-full text-blue-300 text-xs font-medium">
            <Clock className="h-3 w-3 animate-pulse" />
            <span>Processing</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-900/30 border border-green-500/30 rounded-full text-green-300 text-xs font-medium">
            <CheckCircle className="h-3 w-3" />
            <span>Completed</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-900/30 border border-red-500/30 rounded-full text-red-300 text-xs font-medium">
            <XCircle className="h-3 w-3" />
            <span>Failed</span>
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-900/20 to-black rounded-2xl border border-blue-500/20 shadow-lg p-8 backdrop-blur-xl">
        <div className="text-center py-8">
          <Video className="h-16 w-16 text-blue-500/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-blue-200 mb-2">No Task History</h3>
          <p className="text-gray-400">Your video clipping tasks will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-900/20 to-black rounded-2xl border border-blue-500/20 shadow-lg p-8 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-2 rounded-xl">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Task History
          </h2>
        </div>
        <span className="text-sm text-blue-300">{tasks.length} tasks</span>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-blue-900/10 rounded-xl p-5 border border-blue-500/20 hover:bg-blue-800/20 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white mb-1 truncate">
                  {task.task_name || 'Unnamed Task'}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-blue-300">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(task.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                {getStatusBadge(task.status)}
              </div>
            </div>

            <div className="bg-blue-900/20 rounded-lg p-3 mb-4 border border-blue-500/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-blue-400">Task ID:</span>
                <button
                  onClick={() => copyTaskId(task.vizard_project_id)}
                  className="flex items-center space-x-1 px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 rounded text-xs text-blue-300 transition-colors"
                  title="Copy Task ID"
                >
                  {copiedId === task.vizard_project_id ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>
              <div className="font-mono text-xs text-blue-200 break-all bg-black/20 px-2 py-1 rounded">
                {task.vizard_project_id}
              </div>
            </div>

            {task.clips_count > 0 && (
              <div className="flex items-center space-x-2 mb-4 p-3 bg-green-900/10 rounded-lg border border-green-500/20">
                <Video className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-300 font-medium">
                  {task.clips_count} clip{task.clips_count !== 1 ? 's' : ''} generated
                </span>
              </div>
            )}

            {task.error_message && (
              <div className="flex items-start space-x-2 mb-4 p-3 bg-red-900/10 rounded-lg border border-red-500/20">
                <XCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-300">{task.error_message}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {task.status === 'completed' && (
                <button
                  onClick={() => onViewResults(task)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm rounded-lg hover:from-blue-700 hover:to-blue-900 transition-colors flex items-center space-x-2 font-medium"
                >
                  <Play className="h-4 w-4" />
                  <span>View Results</span>
                </button>
              )}

              {task.status === 'processing' && (
                <button
                  onClick={() => onCheckStatus(task)}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Check Status</span>
                </button>
              )}

              {task.vizard_share_link && (
                <a
                  href={task.vizard_share_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors flex items-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open in Vizard</span>
                </a>
              )}

              <button
                onClick={() => onDeleteTask(task.id)}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm rounded-lg transition-colors flex items-center space-x-2 border border-red-500/30"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskHistoryPanel;
