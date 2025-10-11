import React, { useState, useEffect } from 'react';
import {
  Upload,
  Video,
  Link,
  FileVideo,
  Play,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  Send,
  ExternalLink,
  TrendingUp,
  Edit
} from 'lucide-react';
import { useUserContext } from '../contexts/UserContext';
import {
  uploadVideoForClipping,
  fetchClippedVideos,
  getVideoTypeOptions,
  getSupportedVideoExtensions,
  VideoClipRequest,
  ClippedVideoResponse,
  uploadLargeVideoToBigWebhook
} from '../utils/videoClipping';
import { validatePost, publishPost } from '../utils/ayrshare';

const VideoClippingPanel: React.FC = () => {
  const { profileKey } = useUserContext();
  const [videoType, setVideoType] = useState<number>(1);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [ext, setExt] = useState('mp4');
  const [uploading, setUploading] = useState(false);
  const [clippedVideos, setClippedVideos] = useState<ClippedVideoResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedVideoForPost, setSelectedVideoForPost] = useState<ClippedVideoResponse | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postText, setPostText] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [validating, setValidating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [uploadingToWebhook, setUploadingToWebhook] = useState(false);
  const [webhookUrls, setWebhookUrls] = useState<{[key: string]: string}>({});
  const [uploadProgress, setUploadProgress] = useState(0);

  const videoTypeOptions = getVideoTypeOptions();
  const supportedExtensions = getSupportedVideoExtensions();

  useEffect(() => {
    if (profileKey) {
      loadClippedVideos();
    }
  }, [profileKey]);

  const loadClippedVideos = async () => {
    if (!profileKey) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetchClippedVideos(profileKey);
      setClippedVideos(Array.isArray(response) ? response : response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clipped videos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (fileExt && supportedExtensions.includes(fileExt)) {
        setVideoFile(file);
        setExt(fileExt);
        setError(null);
      } else {
        setError(`Unsupported file type. Please use: ${supportedExtensions.join(', ')}`);
        setVideoFile(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileKey) {
      setError('Profile key not available');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const request: VideoClipRequest = {
        videoType,
        videoUrl: videoType !== 1 ? videoUrl : undefined,
        ext: videoType === 1 ? ext : undefined,
        videoFile: videoType === 1 ? videoFile : undefined,
      };

      const result = await uploadVideoForClipping(request, profileKey);

      if (result && result.length > 0) {
        setClippedVideos(prev => [...result, ...prev]);
        setSuccess(`Video processing complete! Generated ${result.length} clip${result.length > 1 ? 's' : ''}.`);
      } else {
        setSuccess('Video uploaded successfully for clipping!');
      }

      setVideoUrl('');
      setVideoFile(null);
      setExt('mp4');

      setTimeout(() => {
        loadClippedVideos();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const uploadToWebhook = async (video: ClippedVideoResponse) => {
    if (!video.videoUrl) return;

    try {
      setUploadingToWebhook(true);
      setError(null);
      setUploadProgress(0);

      const response = await fetch(video.videoUrl);
      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
      }

      setUploadProgress(30);

      const blob = await response.blob();
      const file = new File([blob], `video_${video.videoId || Date.now()}.mp4`, { type: 'video/mp4' });

      setUploadProgress(50);

      const webhookUrl = await uploadLargeVideoToBigWebhook(file, (progress) => {
        setUploadProgress(50 + (progress / 2));
      });

      const videoKey = video.videoId?.toString() || video.videoUrl;
      setWebhookUrls(prev => ({
        ...prev,
        [videoKey]: webhookUrl
      }));

      setSuccess('Video successfully uploaded to big video webhook!');
      setUploadProgress(100);

      setTimeout(() => setUploadProgress(0), 2000);
    } catch (err) {
      console.error('Webhook upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload video to webhook');
      setUploadProgress(0);
    } finally {
      setUploadingToWebhook(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Video URL copied to clipboard!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const openPostModal = (video: ClippedVideoResponse) => {
    setSelectedVideoForPost(video);
    setShowPostModal(true);
    setPostText(video.title ? `${video.title}\n\n#video #content #social` : 'Check out this amazing video! 🎥✨\n\n#video #content #social');
    setSelectedPlatforms([]);
    setValidationResult(null);
  };

  const closePostModal = () => {
    setShowPostModal(false);
    setSelectedVideoForPost(null);
    setPostText('');
    setSelectedPlatforms([]);
    setValidationResult(null);
  };

  const handleValidatePost = async () => {
    if (!profileKey || !postText.trim() || selectedPlatforms.length === 0 || !selectedVideoForPost) return;

    try {
      setValidating(true);
      setError(null);

      const videoKey = selectedVideoForPost.videoId?.toString() || selectedVideoForPost.videoUrl;
      const mediaUrl = webhookUrls[videoKey] || selectedVideoForPost.videoUrl;

      const result = await validatePost(profileKey, postText, selectedPlatforms, [mediaUrl]);
      setValidationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const handlePublishPost = async () => {
    if (!profileKey || !postText.trim() || selectedPlatforms.length === 0 || !selectedVideoForPost) return;

    try {
      setPublishing(true);
      setError(null);

      const videoKey = selectedVideoForPost.videoId?.toString() || selectedVideoForPost.videoUrl;
      const mediaUrl = webhookUrls[videoKey] || selectedVideoForPost.videoUrl;

      const result = await publishPost(profileKey, postText, selectedPlatforms, [mediaUrl]);
      setSuccess('Post published successfully!');
      closePostModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publishing failed');
    } finally {
      setPublishing(false);
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'Unknown';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVideoName = (video: ClippedVideoResponse, index: number) => {
    return video.title || `Clipped Video ${index + 1}`;
  };

  const selectedOption = videoTypeOptions.find(option => option.value === videoType);

  return (
    <>
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 shadow-lg p-8 backdrop-blur-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-2 rounded-xl">
              <Video className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Upload Video for Clipping</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Video Source Type
              </label>
              <select
                value={videoType}
                onChange={(e) => setVideoType(Number(e.target.value))}
                className="w-full px-4 py-3 bg-purple-900/20 border border-purple-500/30 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-colors"
              >
                {videoTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value}. {option.label}
                  </option>
                ))}
              </select>
            </div>

            {videoType === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Video File
                  </label>
                  <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-6 text-center hover:border-purple-400 transition-colors bg-purple-900/10">
                    <input
                      type="file"
                      accept=".mp4,.3gp,.avi,.mov"
                      onChange={handleFileChange}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-purple-200 mb-2">
                        {videoFile ? videoFile.name : 'Click to upload video file'}
                      </p>
                      <p className="text-sm text-purple-300">
                        Supported formats: {supportedExtensions.join(', ')}
                      </p>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {videoType !== 1 && (
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Video URL
                </label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder={`Enter ${selectedOption?.label} URL`}
                    className="w-full pl-10 pr-4 py-3 bg-purple-900/20 border border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center space-x-2 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <p className="text-green-300">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !profileKey || (videoType === 1 && !videoFile) || (videoType !== 1 && !videoUrl)}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FileVideo className="h-5 w-5" />
                  <span>Upload for Clipping</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 shadow-lg p-8 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-2 rounded-xl">
                <Play className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Clipped Videos</h2>
            </div>
            <button
              onClick={loadClippedVideos}
              disabled={loading}
              className="px-4 py-2 bg-purple-900/20 hover:bg-purple-800/30 text-purple-200 rounded-lg transition-colors flex items-center space-x-2 border border-purple-500/20"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 text-purple-400 mx-auto mb-4 animate-spin" />
              <p className="text-purple-200">Loading clipped videos...</p>
            </div>
          ) : clippedVideos.length > 0 ? (
            <div className="grid gap-6">
              {clippedVideos.map((video, index) => (
                <div key={video.videoId || index} className="bg-purple-900/10 rounded-xl p-6 hover:bg-purple-800/20 transition-colors border border-purple-500/20">
                  <div className="space-y-4">
                    <div className="w-full">
                      <div className="relative bg-black rounded-lg overflow-hidden max-w-xs mx-auto" style={{ aspectRatio: '9/16' }}>
                        <video
                          src={video.videoUrl}
                          controls
                          className="w-full h-full object-cover"
                          preload="metadata"
                        >
                          Your browser does not support the video tag.
                        </video>
                        {video.videoMsDuration && (
                          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                            {formatDuration(video.videoMsDuration)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">Ready</span>
                        {video.viralScore && (
                          <div className="flex items-center space-x-1 ml-4">
                            <TrendingUp className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-yellow-600 font-medium">Viral Score: {video.viralScore}/10</span>
                          </div>
                        )}
                      </div>

                      <h3 className="font-semibold text-white text-lg mb-2">
                        {getVideoName(video, index)}
                      </h3>

                      {video.viralReason && (
                        <p className="text-sm text-purple-300 mb-3 italic">
                          {video.viralReason}
                        </p>
                      )}

                      {video.relatedTopic && (
                        <div className="text-sm text-purple-200 mb-2">
                          <span className="font-medium">Topic:</span> {video.relatedTopic}
                        </div>
                      )}

                      {video.transcript && (
                        <details className="text-sm text-purple-200 mb-4 text-left">
                          <summary className="cursor-pointer font-medium mb-2">View Transcript</summary>
                          <p className="pl-4 text-purple-300">{video.transcript}</p>
                        </details>
                      )}

                      <div className="flex flex-col space-y-3">
                        <div className="flex justify-center space-x-3 flex-wrap gap-2">
                          <a
                            href={video.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                          >
                            <Play className="h-4 w-4" />
                            <span>Play</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>

                          <a
                            href={video.videoUrl}
                            download
                            className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </a>

                          {video.clipEditorUrl && (
                            <a
                              href={video.clipEditorUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit Clip</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>

                        <div className="flex justify-center space-x-3 flex-wrap gap-2">
                          <button
                            onClick={() => copyToClipboard(video.videoUrl)}
                            className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                          >
                            <Copy className="h-4 w-4" />
                            <span>Copy Link</span>
                          </button>

                          <button
                            onClick={() => uploadToWebhook(video)}
                            disabled={uploadingToWebhook}
                            className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                          >
                            {uploadingToWebhook ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                            <span>Upload for Large Platforms</span>
                          </button>

                          <button
                            onClick={() => openPostModal(video)}
                            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                          >
                            <Send className="h-4 w-4" />
                            <span>Post to Socials</span>
                          </button>
                        </div>

                        {uploadingToWebhook && uploadProgress > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm text-purple-300">Uploading: {uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-purple-900/20 rounded-full h-2">
                              <div
                                className="bg-purple-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {webhookUrls[video.videoId?.toString() || video.videoUrl] && (
                          <div className="mt-3 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-green-400">Webhook URL:</p>
                                <p className="text-xs text-green-300 break-all">
                                  {webhookUrls[video.videoId?.toString() || video.videoUrl]}
                                </p>
                              </div>
                              <button
                                onClick={() => copyToClipboard(webhookUrls[video.videoId?.toString() || video.videoUrl])}
                                className="ml-2 p-1 text-green-400 hover:text-green-300 transition-colors"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Video className="h-16 w-16 text-purple-500/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-purple-200 mb-2">No Clipped Videos</h3>
              <p className="text-gray-400">Upload a video above to start clipping content for social media.</p>
            </div>
          )}
        </div>
      </div>

      {showPostModal && selectedVideoForPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900/95 to-black/95 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/20">
            <div className="p-6 border-b border-purple-500/20">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Post Video to Social Media</h3>
                <button
                  onClick={closePostModal}
                  className="text-purple-400 hover:text-purple-200 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/20">
                <div className="flex items-center space-x-3 mb-3">
                  <Video className="h-5 w-5 text-purple-400" />
                  <span className="font-medium text-white">{getVideoName(selectedVideoForPost, 0)}</span>
                  {selectedVideoForPost.viralScore && (
                    <div className="flex items-center space-x-1 ml-auto">
                      <TrendingUp className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-yellow-600 font-medium">{selectedVideoForPost.viralScore}/10</span>
                    </div>
                  )}
                </div>
                <div className="bg-black rounded-lg overflow-hidden max-w-xs mx-auto" style={{ aspectRatio: '9/16' }}>
                  <video
                    src={selectedVideoForPost.videoUrl}
                    controls
                    className="w-full h-full object-cover"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Post Caption
                </label>
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="Write your post caption..."
                  className="w-full px-4 py-3 bg-purple-900/20 border border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-colors resize-none"
                  rows={4}
                />
                <div className="text-right text-sm text-purple-300 mt-1">
                  {postText.length} characters
                </div>
              </div>

              <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
                <h4 className="font-medium text-white mb-3">Media URL to Use:</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="original-url"
                      name="media-url"
                      checked={!webhookUrls[selectedVideoForPost.videoId?.toString() || selectedVideoForPost.videoUrl]}
                      readOnly
                      className="text-purple-600"
                    />
                    <label htmlFor="original-url" className="text-sm text-purple-200">
                      Original URL: <span className="font-mono text-xs break-all">{selectedVideoForPost.videoUrl}</span>
                    </label>
                  </div>

                  {webhookUrls[selectedVideoForPost.videoId?.toString() || selectedVideoForPost.videoUrl] && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="webhook-url"
                        name="media-url"
                        checked={true}
                        readOnly
                        className="text-purple-600"
                      />
                      <label htmlFor="webhook-url" className="text-sm text-purple-200">
                        Webhook URL: <span className="font-mono text-xs break-all text-green-400">
                          {webhookUrls[selectedVideoForPost.videoId?.toString() || selectedVideoForPost.videoUrl]}
                        </span>
                      </label>
                    </div>
                  )}

                  {!webhookUrls[selectedVideoForPost.videoId?.toString() || selectedVideoForPost.videoUrl] && (
                    <div className="text-sm text-purple-300 italic">
                      Use "Upload for Large Platforms" first to get an alternative URL for posting to platforms with size restrictions
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-3">
                  Select Platforms
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['facebook', 'instagram', 'twitter', 'youtube', 'tiktok'].map((platform) => (
                    <button
                      key={platform}
                      onClick={() => {
                        setSelectedPlatforms(prev =>
                          prev.includes(platform)
                            ? prev.filter(p => p !== platform)
                            : [...prev, platform]
                        );
                      }}
                      className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        selectedPlatforms.includes(platform)
                          ? 'bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg'
                          : 'bg-purple-900/20 text-purple-200 hover:bg-purple-800/30 border border-purple-500/20'
                      }`}
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {validationResult && (
                <div className={`p-4 rounded-xl ${
                  validationResult.status === 'success'
                    ? 'bg-green-900/20 border border-green-500/30'
                    : 'bg-red-900/20 border border-red-500/30'
                }`}>
                  <div className="flex items-center space-x-2">
                    {validationResult.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    )}
                    <p className={validationResult.status === 'success' ? 'text-green-300' : 'text-red-300'}>
                      {validationResult.message || (validationResult.status === 'success' ? 'Post validation successful!' : 'Validation failed')}
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center space-x-2 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-300">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-2 p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <p className="text-green-300">{success}</p>
                </div>
              )}

              <div className="flex space-x-3 pt-4 border-t border-purple-500/20">
                <button
                  onClick={closePostModal}
                  className="flex-1 px-6 py-3 border border-purple-500/30 text-purple-200 rounded-xl hover:bg-purple-900/20 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleValidatePost}
                  disabled={validating || !postText.trim() || selectedPlatforms.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl hover:from-purple-700 hover:to-purple-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {validating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Validating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Validate</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handlePublishPost}
                  disabled={publishing || !postText.trim() || selectedPlatforms.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {publishing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Publish</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoClippingPanel;
