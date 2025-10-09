import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import {
  FolderOpen,
  Image as ImageIcon,
  Video,
  Download,
  Eye,
  Copy,
  Trash2,
  RefreshCw,
  Filter,
  Calendar,
  FileImage,
  FileVideo,
  Search
} from 'lucide-react';
import { getAllMediaByUser, deleteGeneratedImage, deleteClippedVideo, GeneratedImage, ClippedVideo } from '../utils/supabase';

type MediaType = 'all' | 'images' | 'videos';
type SortBy = 'date-desc' | 'date-asc';

const MediaLibraryPanel: React.FC = () => {
  const { user } = useUser();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [videos, setVideos] = useState<ClippedVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<MediaType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date-desc');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadAllMedia();
    }
  }, [user?.id]);

  const loadAllMedia = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const media = await getAllMediaByUser(user.id);
      setImages(media.images);
      setVideos(media.videos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image set?')) return;

    try {
      await deleteGeneratedImage(id);
      setSuccess('Image set deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
      await loadAllMedia();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      await deleteClippedVideo(id);
      setSuccess('Video deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
      await loadAllMedia();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete video');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('URL copied to clipboard!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const getFilteredAndSortedMedia = () => {
    let allMedia: Array<{ type: 'image' | 'video'; data: GeneratedImage | ClippedVideo }> = [];

    if (filter === 'all' || filter === 'images') {
      allMedia = [...allMedia, ...images.map(img => ({ type: 'image' as const, data: img }))];
    }

    if (filter === 'all' || filter === 'videos') {
      allMedia = [...allMedia, ...videos.map(vid => ({ type: 'video' as const, data: vid }))];
    }

    if (searchQuery) {
      allMedia = allMedia.filter(item => {
        if (item.type === 'image') {
          const img = item.data as GeneratedImage;
          return img.prompt?.toLowerCase().includes(searchQuery.toLowerCase());
        } else {
          const vid = item.data as ClippedVideo;
          return vid.title?.toLowerCase().includes(searchQuery.toLowerCase());
        }
      });
    }

    allMedia.sort((a, b) => {
      const dateA = new Date(a.data.created_at || 0).getTime();
      const dateB = new Date(b.data.created_at || 0).getTime();
      return sortBy === 'date-desc' ? dateB - dateA : dateA - dateB;
    });

    return allMedia;
  };

  const filteredMedia = getFilteredAndSortedMedia();
  const totalImages = images.reduce((acc, img) => acc + (img.generated_images?.length || 0), 0);
  const totalVideos = videos.length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-xl shadow-lg">
              <FolderOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">Media Library</h2>
              <p className="text-slate-400 mt-1">All your generated content in one place</p>
            </div>
          </div>
          <button
            onClick={loadAllMedia}
            disabled={loading}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Images</p>
                <p className="text-3xl font-bold text-white">{totalImages}</p>
              </div>
              <div className="bg-cyan-500/20 p-3 rounded-lg">
                <FileImage className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Videos</p>
                <p className="text-3xl font-bold text-white">{totalVideos}</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <FileVideo className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Items</p>
                <p className="text-3xl font-bold text-white">{images.length + videos.length}</p>
              </div>
              <div className="bg-teal-500/20 p-3 rounded-lg">
                <FolderOpen className="h-6 w-6 text-teal-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by prompt or title..."
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as MediaType)}
              className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            >
              <option value="all">All Media</option>
              <option value="images">Images Only</option>
              <option value="videos">Videos Only</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 flex items-center space-x-2">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-500/50 rounded-xl text-green-200 flex items-center space-x-2">
            <span>{success}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-slate-900 rounded-2xl border border-slate-700/50 p-12 text-center">
          <RefreshCw className="h-12 w-12 text-cyan-400 mx-auto mb-4 animate-spin" />
          <p className="text-slate-400">Loading your media library...</p>
        </div>
      ) : filteredMedia.length > 0 ? (
        <div className="space-y-6">
          {filteredMedia.map((item, index) => {
            if (item.type === 'image') {
              const imageSet = item.data as GeneratedImage;
              return (
                <div key={`img-${imageSet.id}`} className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 p-6 shadow-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-cyan-500/20 p-2 rounded-lg">
                        <ImageIcon className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Image Set</h3>
                        <div className="flex items-center space-x-2 text-sm text-slate-400">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(imageSet.created_at!)}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteImage(imageSet.id!)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                    <p className="text-slate-300 text-sm"><span className="font-semibold text-cyan-400">Prompt:</span> {imageSet.prompt}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {imageSet.generated_images.map((url, imgIndex) => (
                      <div key={imgIndex} className="group relative bg-slate-800 rounded-xl overflow-hidden aspect-square border border-slate-700 hover:border-cyan-500/50 transition-all">
                        <img
                          src={url}
                          alt={`Generated ${imgIndex + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => window.open(url, '_blank')}
                            className="p-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-white transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <a
                            href={url}
                            download
                            className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => copyToClipboard(url)}
                            className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white transition-colors"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="absolute top-2 right-2 bg-cyan-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          #{imgIndex + 1}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-slate-400">{imageSet.generated_images.length} images</span>
                    <button
                      onClick={() => {
                        const urls = imageSet.generated_images.join('\n');
                        copyToClipboard(urls);
                      }}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors flex items-center space-x-2"
                    >
                      <Copy className="h-3 w-3" />
                      <span>Copy All URLs</span>
                    </button>
                  </div>
                </div>
              );
            } else {
              const video = item.data as ClippedVideo;
              return (
                <div key={`vid-${video.id}`} className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 p-6 shadow-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-500/20 p-2 rounded-lg">
                        <Video className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{video.title || 'Clipped Video'}</h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(video.created_at!)}</span>
                          </div>
                          {video.file_size && (
                            <span>{formatFileSize(video.file_size)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteVideo(video.id!)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-black rounded-xl overflow-hidden aspect-video">
                      {video.clipped_video_url ? (
                        <video
                          src={video.clipped_video_url}
                          controls
                          className="w-full h-full object-contain"
                          preload="metadata"
                        />
                      ) : video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt="Video thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                          <Video className="h-12 w-12 text-slate-600" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {video.clipped_video_url && (
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <p className="text-xs text-slate-400 mb-1">Video URL</p>
                          <p className="text-sm text-slate-300 break-all">{video.clipped_video_url}</p>
                        </div>
                      )}

                      {video.catbox_url && (
                        <div className="bg-green-900/20 rounded-lg p-3 border border-green-500/30">
                          <p className="text-xs text-green-400 mb-1">Catbox URL</p>
                          <p className="text-sm text-green-300 break-all">{video.catbox_url}</p>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {video.clipped_video_url && (
                          <a
                            href={video.clipped_video_url}
                            download
                            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors flex items-center space-x-2"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </a>
                        )}
                        {video.clipped_video_url && (
                          <button
                            onClick={() => copyToClipboard(video.clipped_video_url!)}
                            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors flex items-center space-x-2"
                          >
                            <Copy className="h-4 w-4" />
                            <span>Copy URL</span>
                          </button>
                        )}
                        {video.catbox_url && (
                          <button
                            onClick={() => copyToClipboard(video.catbox_url!)}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors flex items-center space-x-2"
                          >
                            <Copy className="h-4 w-4" />
                            <span>Copy Catbox</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-slate-700/50 p-12 text-center">
          <FolderOpen className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Media Found</h3>
          <p className="text-slate-400">
            {searchQuery
              ? 'No media matches your search query.'
              : filter === 'images'
              ? 'No generated images yet. Start by creating some AI images!'
              : filter === 'videos'
              ? 'No clipped videos yet. Upload a video to start clipping!'
              : 'Your media library is empty. Start creating content!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaLibraryPanel;
