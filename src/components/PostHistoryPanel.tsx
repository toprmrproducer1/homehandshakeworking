import React, { useState, useEffect } from 'react';
import { 
  History, 
  RefreshCw, 
  AlertCircle, 
  ExternalLink,
  Heart,
  MessageCircle,
  Share,
  Eye,
  Calendar,
  User,
  Video,
  Image,
  Link as LinkIcon
} from 'lucide-react';
import { useUserContext } from '../contexts/UserContext';
import { fetchPostHistory } from '../utils/socialApi';

const PostHistoryPanel: React.FC = () => {
  const { profileKey, userProfile } = useUserContext();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [postHistory, setPostHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availablePlatforms = [
    { id: 'facebook', name: 'Facebook', color: 'from-blue-500 to-blue-600' },
    { id: 'instagram', name: 'Instagram', color: 'from-pink-500 to-purple-600' },
    { id: 'twitter', name: 'X/Twitter', color: 'from-sky-500 to-sky-600' },
    { id: 'youtube', name: 'YouTube', color: 'from-red-500 to-red-600' },
    { id: 'tiktok', name: 'TikTok', color: 'from-gray-800 to-black' },
  ];

  const getConnectedPlatforms = () => {
    if (!userProfile?.displayNames) return [];
    
    return userProfile.displayNames
      .map((account: any) => {
        const platform = account.platform.toLowerCase();
        if (platform === 'x/twitter' || platform === 'x') return 'twitter';
        return platform;
      })
      .filter((platform: string) => availablePlatforms.some(p => p.id === platform));
  };

  const loadPostHistory = async (platform: string) => {
    if (!profileKey || !platform) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchPostHistory(profileKey, platform);
      setPostHistory(data.posts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load post history');
      setPostHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPlatform) {
      loadPostHistory(selectedPlatform);
    }
  }, [selectedPlatform, profileKey]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num: number | string) => {
    const n = typeof num === 'string' ? parseInt(num) : num;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  const getPostMetrics = (post: any, platform: string) => {
    const metrics = [];

    // Common metrics
    if (post.likeCount !== undefined) {
      metrics.push({ icon: Heart, label: 'Likes', value: formatNumber(post.likeCount) });
    }
    if (post.commentsCount !== undefined) {
      metrics.push({ icon: MessageCircle, label: 'Comments', value: formatNumber(post.commentsCount) });
    }
    if (post.shareCount !== undefined) {
      metrics.push({ icon: Share, label: 'Shares', value: formatNumber(post.shareCount) });
    }

    // Platform-specific metrics
    if (platform === 'facebook') {
      if (post.impressionsUnique !== undefined) {
        metrics.push({ icon: Eye, label: 'Impressions', value: formatNumber(post.impressionsUnique) });
      }
      if (post.engagedUsers !== undefined) {
        metrics.push({ icon: User, label: 'Engaged Users', value: formatNumber(post.engagedUsers) });
      }
    }

    if (platform === 'instagram') {
      if (post.mediaProductType) {
        metrics.push({ icon: Video, label: 'Type', value: post.mediaProductType });
      }
    }

    if (platform === 'twitter') {
      if (post.publicMetrics?.impressionCount !== undefined) {
        metrics.push({ icon: Eye, label: 'Impressions', value: formatNumber(post.publicMetrics.impressionCount) });
      }
      if (post.publicMetrics?.retweetCount !== undefined) {
        metrics.push({ icon: Share, label: 'Retweets', value: formatNumber(post.publicMetrics.retweetCount) });
      }
    }

    if (platform === 'youtube') {
      if (post.privacyStatus) {
        metrics.push({ icon: Eye, label: 'Visibility', value: post.privacyStatus });
      }
    }

    if (platform === 'tiktok') {
      if (post.videoViews !== undefined) {
        metrics.push({ icon: Eye, label: 'Views', value: formatNumber(post.videoViews) });
      }
      if (post.reach !== undefined) {
        metrics.push({ icon: User, label: 'Reach', value: formatNumber(post.reach) });
      }
    }

    return metrics.slice(0, 4); // Limit to 4 metrics
  };

  const getMediaPreview = (post: any, platform: string) => {
    // Handle different media structures per platform
    if (platform === 'facebook' && post.fullPicture) {
      return post.fullPicture;
    }
    if (platform === 'instagram' && post.mediaUrl) {
      return post.mediaUrl;
    }
    if (platform === 'twitter' && post.media?.[0]?.previewImageUrl) {
      return post.media[0].previewImageUrl;
    }
    if (platform === 'youtube' && post.thumbnailUrl) {
      return post.thumbnailUrl;
    }
    if (platform === 'tiktok' && post.thumbnailUrl) {
      return post.thumbnailUrl;
    }
    return null;
  };

  const connectedPlatforms = getConnectedPlatforms();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
              <History className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Post History</h2>
          </div>
          <button
            onClick={() => selectedPlatform && loadPostHistory(selectedPlatform)}
            disabled={loading || !selectedPlatform}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Platform Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Platform</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {availablePlatforms.map((platform) => {
              const isConnected = connectedPlatforms.includes(platform.id);
              const isSelected = selectedPlatform === platform.id;
              
              return (
                <button
                  key={platform.id}
                  onClick={() => isConnected && setSelectedPlatform(platform.id)}
                  disabled={!isConnected}
                  className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isSelected && isConnected
                      ? `bg-gradient-to-r ${platform.color} text-white shadow-lg`
                      : isConnected
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {platform.name}
                  {!isConnected && (
                    <div className="text-xs mt-1">Not connected</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Post History</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Post History */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading post history...</p>
          </div>
        </div>
      ) : selectedPlatform && postHistory.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {availablePlatforms.find(p => p.id === selectedPlatform)?.name} Posts
          </h3>
          
          <div className="space-y-6">
            {postHistory.map((post, index) => {
              const metrics = getPostMetrics(post, selectedPlatform);
              const mediaPreview = getMediaPreview(post, selectedPlatform);
              
              return (
                <div key={post.id || index} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex gap-6">
                    {/* Media Preview */}
                    {mediaPreview && (
                      <div className="w-24 flex-shrink-0">
                        <div className="relative bg-gray-100 rounded-lg overflow-hidden w-full" style={{ aspectRatio: '9/16' }}>
                          {post.mediaType === 'video' || post.contentType?.includes('video') ? (
                            <div className="relative w-full h-full">
                              <img
                                src={mediaPreview}
                                alt="Video thumbnail"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                <Play className="h-6 w-6 text-white" />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={mediaPreview}
                              alt="Post media"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Post Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-gray-900 mb-2 line-clamp-3">
                            {post.post || post.description || 'No caption'}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(post.created || post.timeCreated)}</span>
                            </div>
                            {post.username && (
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>@{post.username}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {post.postUrl && (
                          <a
                            href={post.postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-4 p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </a>
                        )}
                      </div>

                      {/* Metrics */}
                      {metrics.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {metrics.map((metric, metricIndex) => {
                            const Icon = metric.icon;
                            return (
                              <div key={metricIndex} className="flex items-center space-x-2">
                                <Icon className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                  <span className="font-medium">{metric.value}</span> {metric.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Additional Platform-Specific Info */}
                      {selectedPlatform === 'youtube' && post.title && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Title:</span> {post.title}
                          </p>
                        </div>
                      )}

                      {selectedPlatform === 'tiktok' && (post.musicTitle || post.averageTimeWatched) && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-1">
                          {post.musicTitle && (
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Music:</span> {post.musicTitle}
                            </p>
                          )}
                          {post.averageTimeWatched && (
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Avg Watch Time:</span> {post.averageTimeWatched}s
                            </p>
                          )}
                        </div>
                      )}

                      {selectedPlatform === 'facebook' && post.reactions && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Reactions:</span> {post.reactions.total || 0} total
                            {post.reactions.like > 0 && ` (${post.reactions.like} likes)`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : selectedPlatform && !loading ? (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center py-12">
            <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Posts Found</h3>
            <p className="text-gray-500">
              No post history available for {availablePlatforms.find(p => p.id === selectedPlatform)?.name}.
            </p>
          </div>
        </div>
      ) : !selectedPlatform ? (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center py-12">
            <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a Platform</h3>
            <p className="text-gray-500">Choose a connected platform above to view post history.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PostHistoryPanel;