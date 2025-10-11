import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Search,
  RefreshCw,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  ExternalLink,
  Play,
  AlertCircle,
  Download,
  TrendingUp,
  Video,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useUserContext } from '../contexts/UserContext';
import { queryVizardProject, VizardQueryResponse, getVizardErrorMessage } from '../utils/vizardApi';
import { getClippingJobByProjectId } from '../utils/clippingJobs';
import { getClippedVideos } from '../utils/clippedVideosDb';

interface QueryResult {
  taskId: string;
  timestamp: string;
  apiResponse: VizardQueryResponse;
  rawResponse: string;
  localJobStatus?: any;
  localClips?: any[];
  error?: string;
}

const VizardDebugPanel: React.FC = () => {
  const { user } = useUser();
  const { profileKey } = useUserContext();
  const [taskId, setTaskId] = useState('');
  const [querying, setQuerying] = useState(false);
  const [currentResult, setCurrentResult] = useState<QueryResult | null>(null);
  const [queryHistory, setQueryHistory] = useState<QueryResult[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(10);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    api: true,
    local: false,
    clips: false,
    raw: false,
  });

  useEffect(() => {
    const savedHistory = localStorage.getItem('vizard-debug-history');
    if (savedHistory) {
      try {
        setQueryHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load query history:', e);
      }
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh && currentResult && currentResult.apiResponse.code === 1000) {
      interval = setInterval(() => {
        queryTask(currentResult.taskId);
      }, refreshInterval * 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, currentResult]);

  const queryTask = async (queryTaskId?: string) => {
    const targetTaskId = queryTaskId || taskId.trim();
    if (!targetTaskId) return;

    setQuerying(true);
    try {
      const apiResponse = await queryVizardProject(targetTaskId);

      let localJobStatus = null;
      let localClips = null;

      if (profileKey) {
        try {
          localJobStatus = await getClippingJobByProjectId(profileKey, targetTaskId);
          if (localJobStatus) {
            localClips = await getClippedVideos(profileKey, targetTaskId);
          }
        } catch (e) {
          console.error('Failed to fetch local data:', e);
        }
      }

      const result: QueryResult = {
        taskId: targetTaskId,
        timestamp: new Date().toISOString(),
        apiResponse,
        rawResponse: JSON.stringify(apiResponse, null, 2),
        localJobStatus,
        localClips,
      };

      setCurrentResult(result);

      const newHistory = [result, ...queryHistory.filter(h => h.taskId !== targetTaskId)].slice(0, 10);
      setQueryHistory(newHistory);
      localStorage.setItem('vizard-debug-history', JSON.stringify(newHistory));

    } catch (error) {
      const errorResult: QueryResult = {
        taskId: targetTaskId,
        timestamp: new Date().toISOString(),
        apiResponse: { code: -1 },
        rawResponse: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      setCurrentResult(errorResult);
    } finally {
      setQuerying(false);
    }
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getStatusBadge = (code: number) => {
    if (code === 2000) {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 bg-green-900/30 border border-green-500/30 rounded-full text-green-300 text-xs font-medium">
          <CheckCircle className="h-3 w-3" />
          <span>Completed</span>
        </span>
      );
    } else if (code === 1000) {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-900/30 border border-blue-500/30 rounded-full text-blue-300 text-xs font-medium">
          <Clock className="h-3 w-3 animate-pulse" />
          <span>Processing</span>
        </span>
      );
    } else if (code >= 4000) {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 bg-red-900/30 border border-red-500/30 rounded-full text-red-300 text-xs font-medium">
          <XCircle className="h-3 w-3" />
          <span>Failed</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-900/30 border border-gray-500/30 rounded-full text-gray-300 text-xs font-medium">
          <AlertCircle className="h-3 w-3" />
          <span>Unknown</span>
        </span>
      );
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const exportResults = () => {
    if (!currentResult) return;
    const dataStr = JSON.stringify(currentResult, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `vizard-debug-${currentResult.taskId}-${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-cyan-900/20 to-black rounded-2xl border border-cyan-500/20 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-cyan-500 to-cyan-700 p-2 rounded-xl">
              <Terminal className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                Vizard API Debug Panel
              </h2>
              <p className="text-gray-400 text-sm">Query and inspect Vizard task status</p>
            </div>
          </div>
          {currentResult && (
            <button
              onClick={exportResults}
              className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 rounded-lg transition-colors flex items-center space-x-2 border border-cyan-500/30"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && queryTask()}
                placeholder="Enter Vizard Project ID / Task ID"
                className="w-full px-4 py-3 bg-cyan-900/20 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono text-sm"
              />
            </div>
            <button
              onClick={() => queryTask()}
              disabled={querying || !taskId.trim()}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-800 text-white rounded-lg hover:from-cyan-700 hover:to-cyan-900 transition-all flex items-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {querying ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Querying...</span>
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  <span>Query Task</span>
                </>
              )}
            </button>
          </div>

          {queryHistory.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">Recent Queries</label>
              <div className="flex flex-wrap gap-2">
                {queryHistory.slice(0, 5).map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTaskId(result.taskId);
                      queryTask(result.taskId);
                    }}
                    className="px-3 py-1 bg-cyan-900/30 border border-cyan-500/30 rounded-full text-cyan-300 text-xs hover:bg-cyan-800/40 transition-colors font-mono"
                  >
                    {result.taskId.substring(0, 12)}...
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentResult && currentResult.apiResponse.code === 1000 && (
            <div className="flex items-center gap-4 p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 rounded border-blue-500/30 bg-blue-900/20 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-sm text-blue-300 font-medium">Auto-refresh</label>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-blue-300">Every</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(parseInt(e.target.value) || 10)}
                  className="w-16 px-2 py-1 bg-blue-900/20 border border-blue-500/30 rounded text-white text-sm"
                />
                <label className="text-sm text-blue-300">seconds</label>
              </div>
              <button
                onClick={() => queryTask(currentResult.taskId)}
                disabled={querying}
                className="ml-auto px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors flex items-center space-x-1 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${querying ? 'animate-spin' : ''}`} />
                <span>Refresh Now</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {currentResult && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-cyan-900/20 to-black rounded-2xl border border-cyan-500/20 p-6 backdrop-blur-xl">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('api')}
            >
              <div className="flex items-center space-x-3">
                <Zap className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-cyan-200">API Response</h3>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(currentResult.apiResponse.code)}
                {expandedSections.api ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
              </div>
            </div>

            {expandedSections.api && (
              <div className="mt-4 space-y-4">
                {currentResult.error ? (
                  <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-red-300 font-medium">Query Failed</div>
                        <div className="text-red-400 text-sm mt-1">{currentResult.error}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-cyan-900/10 rounded-lg border border-cyan-500/10">
                        <div className="text-xs text-cyan-400 mb-1">Status Code</div>
                        <div className="text-2xl font-bold text-white">{currentResult.apiResponse.code}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {getVizardErrorMessage(currentResult.apiResponse.code)}
                        </div>
                      </div>
                      <div className="p-4 bg-cyan-900/10 rounded-lg border border-cyan-500/10">
                        <div className="text-xs text-cyan-400 mb-1">Query Time</div>
                        <div className="text-lg font-semibold text-white">{formatTimestamp(currentResult.timestamp)}</div>
                        <div className="text-xs text-gray-400 mt-1">Task ID: {currentResult.taskId.substring(0, 16)}...</div>
                      </div>
                    </div>

                    {currentResult.apiResponse.videos && currentResult.apiResponse.videos.length > 0 && (
                      <div className="p-4 bg-green-900/10 rounded-lg border border-green-500/20">
                        <div className="flex items-center space-x-2 mb-2">
                          <Video className="h-5 w-5 text-green-400" />
                          <span className="text-green-300 font-medium">
                            {currentResult.apiResponse.videos.length} clip{currentResult.apiResponse.videos.length !== 1 ? 's' : ''} available
                          </span>
                        </div>
                        {currentResult.apiResponse.msg && (
                          <div className="text-sm text-gray-400">{currentResult.apiResponse.msg}</div>
                        )}
                      </div>
                    )}

                    {currentResult.apiResponse.msg && !currentResult.apiResponse.videos && (
                      <div className="p-4 bg-blue-900/10 rounded-lg border border-blue-500/20">
                        <div className="text-sm text-blue-300">{currentResult.apiResponse.msg}</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {currentResult.apiResponse.videos && currentResult.apiResponse.videos.length > 0 && (
            <div className="bg-gradient-to-br from-cyan-900/20 to-black rounded-2xl border border-cyan-500/20 p-6 backdrop-blur-xl">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('clips')}
              >
                <div className="flex items-center space-x-3">
                  <Play className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-cyan-200">Generated Clips</h3>
                </div>
                {expandedSections.clips ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
              </div>

              {expandedSections.clips && (
                <div className="mt-4 space-y-3">
                  {currentResult.apiResponse.videos.map((video, idx) => (
                    <div key={idx} className="p-4 bg-cyan-900/10 rounded-lg border border-cyan-500/10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-1">{video.title}</h4>
                          <div className="flex items-center space-x-3 text-xs text-gray-400">
                            <span>Duration: {(video.videoMsDuration / 1000).toFixed(1)}s</span>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              <TrendingUp className="h-3 w-3" />
                              <span>Score: {video.viralScore}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {video.viralReason && (
                        <div className="mb-3 p-2 bg-purple-900/20 rounded border border-purple-500/20">
                          <div className="text-xs text-purple-300 mb-1">Why this clip works:</div>
                          <div className="text-sm text-gray-300">{video.viralReason}</div>
                        </div>
                      )}

                      {video.transcript && (
                        <div className="mb-3 p-2 bg-black/20 rounded">
                          <div className="text-xs text-cyan-400 mb-1">Transcript:</div>
                          <div className="text-sm text-gray-300 line-clamp-2">{video.transcript}</div>
                        </div>
                      )}

                      {video.relatedTopic && video.relatedTopic.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs text-cyan-400 mb-1">Topics:</div>
                          <div className="flex flex-wrap gap-1">
                            {video.relatedTopic.map((topic, topicIdx) => (
                              <span key={topicIdx} className="px-2 py-1 bg-cyan-900/30 border border-cyan-500/30 rounded text-xs text-cyan-300">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {video.videoUrl && (
                          <a
                            href={video.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded transition-colors flex items-center space-x-1"
                          >
                            <Download className="h-3 w-3" />
                            <span>Download</span>
                          </a>
                        )}
                        {video.clipEditorUrl && (
                          <a
                            href={video.clipEditorUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors flex items-center space-x-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Edit in Vizard</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {profileKey && currentResult.localJobStatus && (
            <div className="bg-gradient-to-br from-cyan-900/20 to-black rounded-2xl border border-cyan-500/20 p-6 backdrop-blur-xl">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('local')}
              >
                <div className="flex items-center space-x-3">
                  <Database className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold text-cyan-200">Local Database Status</h3>
                </div>
                {expandedSections.local ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
              </div>

              {expandedSections.local && (
                <div className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-cyan-900/10 rounded-lg border border-cyan-500/10">
                      <div className="text-xs text-cyan-400 mb-1">Local Status</div>
                      <div className="text-lg font-semibold text-white capitalize">{currentResult.localJobStatus.status}</div>
                    </div>
                    <div className="p-3 bg-cyan-900/10 rounded-lg border border-cyan-500/10">
                      <div className="text-xs text-cyan-400 mb-1">Clips Saved</div>
                      <div className="text-lg font-semibold text-white">{currentResult.localClips?.length || 0}</div>
                    </div>
                  </div>

                  {currentResult.localJobStatus.task_name && (
                    <div className="p-3 bg-cyan-900/10 rounded-lg border border-cyan-500/10">
                      <div className="text-xs text-cyan-400 mb-1">Task Name</div>
                      <div className="text-sm text-white">{currentResult.localJobStatus.task_name}</div>
                    </div>
                  )}

                  {currentResult.localJobStatus.error_message && (
                    <div className="p-3 bg-red-900/20 rounded-lg border border-red-500/20">
                      <div className="text-xs text-red-400 mb-1">Error Message</div>
                      <div className="text-sm text-red-300">{currentResult.localJobStatus.error_message}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="bg-gradient-to-br from-cyan-900/20 to-black rounded-2xl border border-cyan-500/20 p-6 backdrop-blur-xl">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('raw')}
            >
              <div className="flex items-center space-x-3">
                <Terminal className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-cyan-200">Raw JSON Response</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(currentResult.rawResponse, 'raw');
                  }}
                  className="px-3 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-sm rounded transition-colors flex items-center space-x-1"
                >
                  {copiedSection === 'raw' ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                {expandedSections.raw ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
              </div>
            </div>

            {expandedSections.raw && (
              <div className="mt-4">
                <pre className="p-4 bg-black/40 rounded-lg border border-cyan-500/20 text-cyan-100 text-xs overflow-x-auto font-mono max-h-96 overflow-y-auto">
                  {currentResult.rawResponse}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {!currentResult && (
        <div className="bg-gradient-to-br from-cyan-900/20 to-black rounded-2xl border border-cyan-500/20 p-12 backdrop-blur-xl">
          <div className="text-center">
            <Terminal className="h-16 w-16 text-cyan-500/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-cyan-200 mb-2">No Query Results</h3>
            <p className="text-gray-400">Enter a Vizard project ID above to query its status</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VizardDebugPanel;
