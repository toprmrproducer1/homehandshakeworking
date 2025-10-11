import React, { useState, useEffect } from 'react';
import {
  Video,
  Image as ImageIcon,
  Download,
  Trash2,
  Calendar,
  Clock,
  Filter,
  Search,
  Grid3x3,
  List,
  Play,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  X
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useUserContext } from '../contexts/UserContext';
import { supabase } from '../utils/supabase';

interface ClippedVideo {
  id: string;
  user_id: string;
  profile_key: string;
  title: string;
  original_video_url: string;
  clipped_video_url: string;
  thumbnail_url?: string;
  duration?: number;
  start_time?: number;
  end_time?: number;
  status: string;
  viral_score?: string;
  batch_id?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

interface GeneratedImage {
  id: string;
  user_id: string;
  profile_key: string;
  prompt: string;
  generated_images: string[];
  viral_score?: number;
  batch_id?: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  style?: string;
  status: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

const LibraryPanel: React.FC = () => {
  const { user } = useUser();
  const { profileKey } = useUserContext();
  const [activeTab, setActiveTab] = useState<'videos' | 'images'>('videos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [videos, setVideos] = useState<ClippedVideo[]>([]);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'viral_score'>('date');
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadLibrary();
    }
  }, [user?.id, activeTab]);

  const loadLibrary = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'videos') {
        const { data, error: videoError } = await supabase
          .from('clipped_videos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (videoError) throw videoError;
        setVideos(data || []);
      } else {
        const { data, error: imageError } = await supabase
          .from('generated_images')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (imageError) throw imageError;
        setImages(data || []);
      }
    } catch (err) {
      console.error('Error loading library:', err);
      setError(err instanceof Error ? err.message : 'Failed to load library');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, type: 'video' | 'image') => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const table = type === 'video' ? 'clipped_videos' : 'generated_images';
      const { error } = await supabase.from(table).delete().eq('id', id);

      if (error) throw error;

      if (type === 'video') {
        setVideos(videos.filter(v => v.id !== id));
      } else {
        setImages(images.filter(i => i.id !== id));
      }
    } catch (err) {
      console.error('Error deleting item:', err);
      alert('Failed to delete item');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredVideos = videos
    .filter(video => {
      const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || video.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'viral_score') {
        const scoreA = a.viral_score ? parseFloat(a.viral_score) : 0;
        const scoreB = b.viral_score ? parseFloat(b.viral_score) : 0;
        return scoreB - scoreA;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const filteredImages = images
    .filter(image => {
      const matchesSearch = image.prompt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || image.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'viral_score') {
        const scoreA = a.viral_score || 0;
        const scoreB = b.viral_score || 0;
        return scoreB - scoreA;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'processing': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 p-6 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
              Content Library
            </h2>
            <p className="text-gray-400">View and manage all your generated content</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadLibrary}
              disabled={loading}
              className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors"
            >
              <RefreshCw className={`h-5 w-5 text-purple-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-6">
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'videos'
                ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg shadow-purple-500/30'
                : 'bg-purple-900/20 text-gray-400 hover:text-purple-300'
            }`}
          >
            <Video className="h-4 w-4" />
            <span>Video Clips</span>
            <span className="bg-purple-500/20 px-2 py-0.5 rounded-full text-xs">
              {videos.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'images'
                ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg shadow-purple-500/30'
                : 'bg-purple-900/20 text-gray-400 hover:text-purple-300'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Generated Images</span>
            <span className="bg-purple-500/20 px-2 py-0.5 rounded-full text-xs">
              {images.length}
            </span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 p-4 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-purple-900/20 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'viral_score')}
            className="px-4 py-2 bg-purple-900/20 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            <option value="date">Sort by Date</option>
            <option value="viral_score">Sort by Viral Score</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-purple-900/20 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>

          <div className="flex items-center gap-2 bg-purple-900/20 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-purple-300'}`}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-purple-300'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Content Grid/List */}
      {loading ? (
        <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 p-12 backdrop-blur-xl text-center">
          <RefreshCw className="h-8 w-8 text-purple-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Loading your content...</p>
        </div>
      ) : activeTab === 'videos' ? (
        filteredVideos.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="bg-gradient-to-br from-purple-900/20 to-black rounded-xl border border-purple-500/20 overflow-hidden hover:border-purple-400/50 transition-all backdrop-blur-xl group"
              >
                <div className="relative aspect-video bg-purple-900/10">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="h-16 w-16 text-purple-500/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {video.clipped_video_url && (
                      <button
                        onClick={() => setPlayingVideo(playingVideo === video.id ? null : video.id)}
                        className="p-3 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
                      >
                        {playingVideo === video.id ? (
                          <X className="h-6 w-6 text-white" />
                        ) : (
                          <Play className="h-6 w-6 text-white" />
                        )}
                      </button>
                    )}
                  </div>
                  {playingVideo === video.id && video.clipped_video_url && (
                    <div className="absolute inset-0 bg-black z-10">
                      <video
                        src={video.clipped_video_url}
                        controls
                        autoPlay
                        className="w-full h-full"
                        onEnded={() => setPlayingVideo(null)}
                      />
                    </div>
                  )}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white line-clamp-2 flex-1">{video.title}</h3>
                    {video.viral_score && parseFloat(video.viral_score) > 0 && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full ml-2">
                        <TrendingUp className="h-3 w-3" />
                        <span className="text-xs font-semibold">{video.viral_score}/10</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(video.created_at)}</span>
                    </div>
                    <span className={`capitalize ${getStatusColor(video.status)}`}>
                      {video.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {video.clipped_video_url && (
                      <a
                        href={video.clipped_video_url}
                        download
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(video.id, 'video')}
                      className="p-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 p-12 backdrop-blur-xl text-center">
            <Video className="h-16 w-16 text-purple-500/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-purple-200 mb-2">No Video Clips Yet</h3>
            <p className="text-gray-400">Start clipping videos to build your library</p>
          </div>
        )
      ) : (
        filteredImages.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-4'}>
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="bg-gradient-to-br from-purple-900/20 to-black rounded-xl border border-purple-500/20 overflow-hidden hover:border-purple-400/50 transition-all backdrop-blur-xl group"
              >
                <div className="relative aspect-square bg-purple-900/10">
                  <img
                    src={image.thumbnail_url || (image.generated_images && image.generated_images[0])}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a
                      href={image.generated_images && image.generated_images[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-purple-600 rounded-full hover:bg-purple-700 transition-colors"
                    >
                      <ImageIcon className="h-5 w-5 text-white" />
                    </a>
                  </div>
                  {image.generated_images && image.generated_images.length > 1 && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white">
                      +{image.generated_images.length - 1} more
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-300 line-clamp-2 flex-1">{image.prompt}</p>
                    {image.viral_score && image.viral_score > 0 && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-full ml-2">
                        <TrendingUp className="h-3 w-3" />
                        <span className="text-xs font-semibold">{image.viral_score}/10</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(image.created_at)}</span>
                    </div>
                    <span className={`capitalize ${getStatusColor(image.status)}`}>
                      {image.status}
                    </span>
                  </div>
                  {image.width && image.height && (
                    <div className="text-xs text-gray-400 mb-3">
                      {image.width} × {image.height}px
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {image.generated_images && image.generated_images.length > 0 && (
                      <a
                        href={image.generated_images[0]}
                        download
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(image.id, 'image')}
                      className="p-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 p-12 backdrop-blur-xl text-center">
            <ImageIcon className="h-16 w-16 text-purple-500/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-purple-200 mb-2">No Generated Images Yet</h3>
            <p className="text-gray-400">Start generating images to build your library</p>
          </div>
        )
      )}
    </div>
  );
};

export default LibraryPanel;
