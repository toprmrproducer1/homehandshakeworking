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
  ExternalLink
} from 'lucide-react';
import { useUserContext } from '../contexts/UserContext';
import { 
  uploadVideoForClipping, 
  fetchClippedVideos, 
  getVideoTypeOptions, 
  getSupportedVideoExtensions,
  VideoClipRequest 
} from '../utils/videoClipping';
import { validatePost, publishPost } from '../utils/ayrshare';

const VideoClippingPanel: React.FC = () => {
  const { profileKey } = useUserContext();
  const [videoType, setVideoType] = useState<number>(1);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [ext, setExt] = useState('mp4');
  const [uploading, setUploading] = useState(false);
  const [clippedVideos, setClippedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedVideoForPost, setSelectedVideoForPost] = useState<any>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [postText, setPostText] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [validating, setValidating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [uploadingToCatbox, setUploadingToCatbox] = useState(false);
  const [catboxUrls, setCatboxUrls] = useState<{[key: string]: string}>({});

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
      // Handle the array response from webhook
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

      await uploadVideoForClipping(request, profileKey);
      setSuccess('Video uploaded successfully for clipping!');
      
      // Reset form
      setVideoUrl('');
      setVideoFile(null);
      setExt('mp4');
      
      // Reload clipped videos after a short delay
      setTimeout(() => {
        loadClippedVideos();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const uploadToCatbox = async (video: any) => {
    if (!video.mediaLink) return;

    try {
      setUploadingToCatbox(true);
      setError(null);
      
      // Download the video file as binary
      const response = await fetch(video.mediaLink);
      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Send binary file directly to catbox webhook
      const formData = new FormData();
      formData.append('file', blob, `video_${video.id || Date.now()}.mp4`);
      
      const catboxResponse = await fetch('https://primary-production-99d7.up.railway.app/webhook/4c77217c-5bef-47e7-9db2-c7277456dc34', {
        method: 'POST',
        body: formData,
      });
      
      if (!catboxResponse.ok) {
        throw new Error(`Catbox upload failed: ${catboxResponse.statusText}`);
      }
      
      // Get the catbox URL from webhook response
      const result = await catboxResponse.json();
      const catboxUrl = result.data;
      
      if (!catboxUrl || !catboxUrl.startsWith('http')) {
        throw new Error('Invalid catbox URL received from webhook');
      }
      
      // Store the catbox URL for this video
      setCatboxUrls(prev => ({
        ...prev,
        [video.id || video.mediaLink]: catboxUrl
      }));
      
      setSuccess(`Video successfully uploaded to catbox.moe!`);
    } catch (err) {
      console.error('Catbox upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload video to catbox.moe');
    } finally {
      setUploadingToCatbox(false);
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

  const openPostModal = (video: any) => {
    setSelectedVideoForPost(video);
    setShowPostModal(true);
    setPostText(`Check out this amazing video! 🎥✨\n\n#video #content #social`);
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
    if (!profileKey || !postText.trim() || selectedPlatforms.length === 0) return;

    try {
      setValidating(true);
      setError(null);
      const result = await validatePost(profileKey, postText, selectedPlatforms, [selectedVideoForPost.mediaLink]);
      setValidationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const handlePublishPost = async () => {
    if (!profileKey || !postText.trim() || selectedPlatforms.length === 0) return;

    try {
      setPublishing(true);
      setError(null);
      
      // Use catbox URL if available, otherwise use original media link
      const videoId = selectedVideoForPost.id || selectedVideoForPost.mediaLink;
      const mediaUrl = catboxUrls[videoId] || selectedVideoForPost.mediaLink;
      
      const result = await publishPost(profileKey, postText, selectedPlatforms, [mediaUrl]);
      setSuccess('Post published successfully!');
      closePostModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publishing failed');
    } finally {
      setPublishing(false);
    }
  };

  const formatFileSize = (bytes: string | number) => {
    const size = typeof bytes === 'string' ? parseInt(bytes) : bytes;
    if (size >= 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(size / 1024).toFixed(1)} KB`;
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

  const getVideoName = (video: any, index: number) => {
    return video.name || `Clipped Video ${index + 1}`;
  };

  const selectedOption = videoTypeOptions.find(option => option.value === videoType);

  return (
    <>
      <div className="space-y-8">
        {/* Upload Form */}
        <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 shadow-lg p-8 backdrop-blur-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-2 rounded-xl">
              <Video className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Upload Video for Clipping</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Video Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Source Type
              </label>
              <select
                value={videoType}
                onChange={(e) => setVideoType(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              >
                {videoTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value}. {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload for videoType 1 */}
            {videoType === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
                    <input
                      type="file"
                      accept=".mp4,.3gp,.avi,.mov"
                      onChange={handleFileChange}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">
                        {videoFile ? videoFile.name : 'Click to upload video file'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Supported formats: {supportedExtensions.join(', ')}
                      </p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Extension
                  </label>
                  <select
                    value={ext}
                    onChange={(e) => setExt(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    {supportedExtensions.map((extension) => (
                      <option key={extension} value={extension}>
                        {extension}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* URL Input for other types */}
            {videoType !== 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL
                </label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder={`Enter ${selectedOption?.label} URL`}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="flex items-center space-x-2 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center space-x-2 p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-green-700">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || !profileKey || (videoType === 1 && !videoFile) || (videoType !== 1 && !videoUrl)}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Uploading...</span>
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

        {/* Clipped Videos */}
        <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 shadow-lg p-8 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-2 rounded-xl">
                <Play className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Clipped Videos</h2>
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
              <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading clipped videos...</p>
            </div>
          ) : clippedVideos.length > 0 ? (
            <div className="grid gap-6">
              {clippedVideos.map((video, index) => (
                <div key={video.id || index} className="bg-purple-900/10 rounded-xl p-6 hover:bg-purple-800/20 transition-colors border border-purple-500/20">
                  {/* Vertical Layout */}
                  <div className="space-y-4">
                    {/* Video Preview */}
                    <div className="w-full">
                      <div className="relative bg-black rounded-lg overflow-hidden max-w-xs mx-auto" style={{ aspectRatio: '9/16' }}>
                        <video
                          src={video.mediaLink}
                          controls
                          className="w-full h-full object-cover"
                          preload="metadata"
                        >
                          Your browser does not support the video tag.
                        </video>
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                          {video.contentType}
                        </div>
                      </div>
                    </div>

                    {/* Video Details */}
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">Ready</span>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 text-lg mb-2">
                        {getVideoName(video, index)}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">Created:</span>
                          <br />
                          {formatDate(video.timeCreated)}
                        </div>
                        <div>
                          <span className="font-medium">Size:</span>
                          <br />
                          {formatFileSize(video.size)}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span>
                          <br />
                          {video.contentType}
                        </div>
                        <div>
                          <span className="font-medium">Storage:</span>
                          <br />
                          {video.storageClass}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-3">
                        <div className="flex justify-center space-x-3">
                          <a
                            href={video.mediaLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                          >
                            <Play className="h-4 w-4" />
                            <span>Play</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          
                          <a
                            href={video.mediaLink}
                            download
                            className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </a>
                        </div>
                        
                        <div className="flex justify-center space-x-3">
                          <button
                            onClick={() => copyToClipboard(video.mediaLink)}
                            className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                          >
                            <Copy className="h-4 w-4" />
                            <span>Copy Link</span>
                          </button>
                          
                          <button
                            onClick={() => uploadToCatbox(video)}
                            disabled={uploadingToCatbox}
                            className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                          >
                            {uploadingToCatbox ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                            <span>Upload to Catbox</span>
                          </button>
                          
                          <button
                            onClick={() => openPostModal(video)}
                            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                          >
                            <Send className="h-4 w-4" />
                            <span>Post to Socials</span>
                          </button>
                        </div>
                        
                        {/* Show Catbox URL if available */}
                        {catboxUrls[video.id || video.mediaLink] && (
                          <div className="mt-3 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-green-800">Catbox.moe URL:</p>
                                <p className="text-xs text-green-600 break-all">
                                  {catboxUrls[video.id || video.mediaLink]}
                                </p>
                              </div>
                              <button
                                onClick={() => copyToClipboard(catboxUrls[video.id || video.mediaLink])}
                                className="ml-2 p-1 text-green-600 hover:text-green-800 transition-colors"
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
              <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Clipped Videos</h3>
              <p className="text-gray-500">Upload a video above to start clipping content for social media.</p>
            </div>
          )}
        </div>
      </div>

      {/* Post Modal */}
      {showPostModal && selectedVideoForPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900/95 to-black/95 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/20">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Post Video to Social Media</h3>
                <button
                  onClick={closePostModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Video Preview */}
              <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-500/20">
                <div className="flex items-center space-x-3 mb-3">
                  <Video className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">{getVideoName(selectedVideoForPost, 0)}</span>
                </div>
                <div className="bg-black rounded-lg overflow-hidden max-w-xs mx-auto" style={{ aspectRatio: '9/16' }}>
                  <video
                    src={selectedVideoForPost.mediaLink}
                    controls
                    className="w-full h-full object-cover"
                    preload="metadata"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>

              {/* Post Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Caption
                </label>
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="Write your post caption..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                  rows={4}
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {postText.length} characters
                </div>
              </div>

              {/* Media URL Selection */}
              <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20">
                <h4 className="font-medium text-gray-900 mb-3">Media URL to Use:</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="original-url"
                      name="media-url"
                      checked={!catboxUrls[selectedVideoForPost.id || selectedVideoForPost.mediaLink]}
                      readOnly
                      className="text-indigo-600"
                    />
                    <label htmlFor="original-url" className="text-sm text-gray-700">
                      Original URL: <span className="font-mono text-xs break-all">{selectedVideoForPost.mediaLink}</span>
                    </label>
                  </div>
                  
                  {catboxUrls[selectedVideoForPost.id || selectedVideoForPost.mediaLink] && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="catbox-url"
                        name="media-url"
                        checked={true}
                        readOnly
                        className="text-indigo-600"
                      />
                      <label htmlFor="catbox-url" className="text-sm text-gray-700">
                        Catbox.moe URL: <span className="font-mono text-xs break-all text-green-600">
                          {catboxUrls[selectedVideoForPost.id || selectedVideoForPost.mediaLink]}
                        </span>
                      </label>
                    </div>
                  )}
                  
                  {!catboxUrls[selectedVideoForPost.id || selectedVideoForPost.mediaLink] && (
                    <div className="text-sm text-gray-500 italic">
                      Upload to Catbox.moe first to get an alternative URL for posting
                    </div>
                  )}
                </div>
              </div>

              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
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
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Validation Results */}
              {validationResult && (
                <div className={`p-4 rounded-xl ${
                  validationResult.status === 'success' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    {validationResult.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <p className={validationResult.status === 'success' ? 'text-green-700' : 'text-red-700'}>
                      {validationResult.message || (validationResult.status === 'success' ? 'Post validation successful!' : 'Validation failed')}
                    </p>
                  </div>
                </div>
              )}

              {/* Error/Success Messages */}
              {error && (
                <div className="flex items-center space-x-2 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-2 p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <p className="text-green-700">{success}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={closePostModal}
                  className="flex-1 px-6 py-3 border border-purple-500/30 text-purple-200 rounded-xl hover:bg-purple-900/20 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleValidatePost}
                  disabled={validating || !postText.trim() || selectedPlatforms.length === 0}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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