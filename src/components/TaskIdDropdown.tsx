import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Clock, CheckCircle, XCircle, AlertCircle, Copy, ExternalLink, Video } from 'lucide-react';
import { ClippingJob } from '../utils/clippingJobs';

interface TaskIdDropdownProps {
  tasks: ClippingJob[];
  onSelectTask: (task: ClippingJob) => void;
  onRefresh?: () => void;
  className?: string;
}

type FilterStatus = 'all' | 'processing' | 'completed' | 'failed';

const TaskIdDropdown: React.FC<TaskIdDropdownProps> = ({
  tasks,
  onSelectTask,
  onRefresh,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.vizard_project_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.task_name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || task.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-400 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-900/20 border-blue-500/30 text-blue-300';
      case 'completed':
        return 'bg-green-900/20 border-green-500/30 text-green-300';
      case 'failed':
        return 'bg-red-900/20 border-red-500/30 text-red-300';
      default:
        return 'bg-gray-900/20 border-gray-500/30 text-gray-300';
    }
  };

  const copyTaskId = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(taskId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusCounts = {
    all: tasks.length,
    processing: tasks.filter(t => t.status === 'processing').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length,
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-blue-900/20 border border-blue-500/30 rounded-xl text-white hover:bg-blue-800/30 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center space-x-2">
          <Video className="h-5 w-5 text-blue-400" />
          <span className="font-medium">Browse Task IDs ({tasks.length})</span>
        </div>
        <ChevronDown className={`h-5 w-5 text-blue-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-gradient-to-br from-blue-900/95 to-black/95 backdrop-blur-xl border border-blue-500/30 rounded-xl shadow-2xl max-h-[500px] overflow-hidden flex flex-col">
          <div className="p-4 space-y-3 border-b border-blue-500/20">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Task ID or name..."
                className="w-full pl-10 pr-4 py-2 bg-blue-900/20 border border-blue-500/30 rounded-lg text-white placeholder-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {(['all', 'processing', 'completed', 'failed'] as FilterStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilterStatus(status);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    filterStatus === status
                      ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white'
                      : 'bg-blue-900/20 text-blue-300 hover:bg-blue-800/30 border border-blue-500/20'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {filteredTasks.length > 0 ? (
              <div className="p-2 space-y-2">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      onSelectTask(task);
                      setIsOpen(false);
                    }}
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-blue-800/20 transition-all ${getStatusColor(task.status)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        {getStatusIcon(task.status)}
                        <span className="text-sm font-medium text-white truncate">
                          {task.task_name || 'Unnamed Task'}
                        </span>
                      </div>
                      {task.clips_count > 0 && (
                        <span className="text-xs bg-blue-600/30 px-2 py-1 rounded text-blue-200 ml-2 flex-shrink-0">
                          {task.clips_count} clips
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-400/70">Task ID:</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs font-mono text-blue-300">
                            {task.vizard_project_id.substring(0, 12)}...
                          </span>
                          <button
                            onClick={(e) => copyTaskId(task.vizard_project_id, e)}
                            className="p-1 hover:bg-blue-600/30 rounded transition-colors"
                            title="Copy Task ID"
                          >
                            <Copy className="h-3 w-3 text-blue-400" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-blue-400/70">
                        <span>{formatDate(task.created_at)}</span>
                        <span className="capitalize">{task.status}</span>
                      </div>
                    </div>

                    {task.vizard_share_link && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(task.vizard_share_link, '_blank');
                        }}
                        className="mt-2 w-full px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-300 text-xs rounded flex items-center justify-center space-x-1 transition-colors"
                      >
                        <span>Open in Vizard</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Video className="h-12 w-12 text-blue-500/50 mx-auto mb-3" />
                <p className="text-blue-300">No tasks found</p>
                <p className="text-sm text-blue-400/70 mt-1">
                  {searchTerm ? 'Try a different search term' : 'Submit a video to create a task'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskIdDropdown;
