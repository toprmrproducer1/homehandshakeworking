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
  Copy,
  Send,
  ExternalLink,
  TrendingUp,
  Edit,
  Settings,
  Sparkles
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useUserContext } from '../contexts/UserContext';
import {
  uploadVideoToVizardAndWait,
  getVideoTypeOptions,
  getSupportedVideoExtensions,
  VIZARD_CLIP_RATIOS,
  VIZARD_PREFER_LENGTHS,
  SUPPORTED_LANGUAGES,
  VizardClipConfig,
} from '../utils/vizardApi';
import {
  getClippedVideos,
  saveVizardClips,
  ClippedVideo,
} from '../utils/clippedVideosDb';
import { validatePost, publishPost } from '../utils/ayrshare';
import { uploadLargeVideoToBigWebhook } from '../utils/videoClipping';

const VideoClippingPanel: React.FC = () => {
  const { user } = useUser();
  const { profileKey } = useUserContext();
  const [videoType, setVideoType] = useState<number>(1);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [clippedVideos, setClippedVideos] = useState<ClippedVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [processingPercent, setProcessingPercent] = useState<number>(0);

  const [language, setLanguage] = useState('en');
  const [preferLengths, setPreferLengths] = useState<number[]>([0]);
  const [aspectRatio, setAspectRatio] = useState(VIZARD_CLIP_RATIOS.VERTICAL_9_16);
  const [maxClipNumber, setMaxClipNumber] = useState<number>(10);
  const [keywords, setKeywords] = useState('');
  const [removeSilence, setRemoveSilence] = useState(true);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [showHeadline, setShowHeadline] = useState(true);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [selectedVideoForPost, setSelectedVideoForPost] = useState<ClippedVideo | null>(null);
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
      const videos = await getClippedVideos(profileKey);
      setClippedVideos(videos);
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
        setError(null);

        if (videoPreviewUrl) {
          URL.revokeObjectURL(videoPreviewUrl);
        }
        const previewUrl = URL.createObjectURL(file);
        setVideoPreviewUrl(previewUrl);
      } else {
        setError(`Unsupported file type. Please use: ${supportedExtensions.join(', ')}`);
        setVideoFile(null);
        if (videoPreviewUrl) {
          URL.revokeObjectURL(videoPreviewUrl);
          setVideoPreviewUrl(null);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileKey || !user?.id) {
      setError('User not authenticated');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);
    setProcessingStatus('');
    setProcessingPercent(0);

    try {
      let uploadedVideoUrl = videoUrl;

      if (videoType === 1 && videoFile) {
        setProcessingStatus('Uploading video to cloud storage...');

        // Upload large videos via webhook (bypasses Supabase 50MB limit)
        const webhookUrl = await uploadLargeVideoToBigWebhook(
          videoFile,
          (progress) => {
            setProcessingPercent(progress * 0.2);
          }
        );
        uploadedVideoUrl = webhookUrl;
        setProcessingStatus('Video uploaded successfully!');
      }

      if (!uploadedVideoUrl) {
        throw new Error('Video URL is required');
      }

      const config: VizardClipConfig = {
        lang: language,
        preferLength: preferLengths,
        videoUrl: uploadedVideoUrl,
        videoType: videoType,
        ratioOfClip: aspectRatio,
        removeSilenceSwitch: removeSilence ? 1 : 0,
        maxClipNumber: maxClipNumber,
        keywords: keywords || undefined,
        subtitleSwitch: showSubtitles ? 1 : 0,
        headlineSwitch: showHeadline ? 1 : 0,
        emojiSwitch: showEmojis ? 1 : 0,
        projectName: `Clip - ${new Date().toLocaleString()}`,
      };

      const clips = await uploadVideoToVizardAndWait(
        config,
        (status, percent) => {
          setProcessingStatus(status);
          if (percent !== undefined) {
            setProcessingPercent(percent);
          }
        }
      );

      const savedClips = await saveVizardClips(
        user.id,
        profileKey,
        'vizard-project-' + Date.now(),
        uploadedVideoUrl,
        clips,
        config
      );

      setSuccess(`Successfully created ${clips.length} clip${clips.length > 1 ? 's' : ''}!`);
      setClippedVideos(prev => [...savedClips, ...prev]);

      setVideoUrl('');
      setVideoFile(null);
      setKeywords('');
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
        setVideoPreviewUrl(null);
      }

      setTimeout(() => {
        loadClippedVideos();
      }, 1000);
    } catch (err) {
      console.error('Video clipping error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process video');
    } finally {
      setUploading(false);
      setProcessingStatus('');
      setProcessingPercent(0);
    }
  };

  const uploadToWebhook = async (video: ClippedVideo) => {
    if (!video.clipped_video_url) return;

    try {
      setUploadingToWebhook(true);
      setError(null);
      setUploadProgress(0);

      const response = await fetch(video.clipped_video_url);
      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
      }

      setUploadProgress(30);

      const blob = await response.blob();
      const file = new File([blob], `video_${video.id || Date.now()}.mp4`, { type: 'video/mp4' });

      setUploadProgress(50);

      const webhookUrl = await uploadLargeVideoToBigWebhook(file, (progress) => {
        setUploadProgress(50 + (progress / 2));
      });

      const videoKey = video.id || video.clipped_video_url;
      setWebhookUrls(prev => ({
        ...prev,
        [videoKey]: webhookUrl
      }));

      setSuccess('Video successfully uploaded for large platforms!');
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
      setSuccess('Copied to clipboard!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const openPostModal = (video: ClippedVideo) => {
    setSelectedVideoForPost(video);
    setShowPostModal(true);
    setPostText(video.title ? `${video.title}\n\n#video #content` : 'Check out this clip! 🎥\n\n#video #content');
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

      const videoKey = selectedVideoForPost.id || selectedVideoForPost.clipped_video_url;
      const mediaUrl = webhookUrls[videoKey || ''] || selectedVideoForPost.clipped_video_url;

      const result = await validatePost(profileKey, postText, selectedPlatforms, [mediaUrl || '']);
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

      const videoKey = selectedVideoForPost.id || selectedVideoForPost.clipped_video_url;
      const mediaUrl = webhookUrls[videoKey || ''] || selectedVideoForPost.clipped_video_url;

      await publishPost(profileKey, postText, selectedPlatforms, [mediaUrl || '']);
      setSuccess('Post published successfully!');
      closePostModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publishing failed');
    } finally {
      setPublishing(false);
    }
  };

  const togglePreferLength = (length: number) => {
    setPreferLengths(prev => {
      if (length === 0) return [0];

      const filtered = prev.filter(l => l !== 0);
      if (filtered.includes(length)) {
        const newLengths = filtered.filter(l => l !== length);
        return newLengths.length === 0 ? [0] : newLengths;
      } else {
        return [...filtered, length];
      }
    });
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'Unknown';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const selectedOption = videoTypeOptions.find(option => option.value === videoType);

  return (
    <>
      <div className="space-y-8">
        <div className="bg-gradient-to-br from-blue-900/20 to-black rounded-2xl border border-blue-500/20 shadow-lg p-8 backdrop-blur-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-2 rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              AI Video Clipping
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Video Source Type
                </label>
                <select
                  value={videoType}
                  onChange={(e) => setVideoType(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-blue-900/20 border border-blue-500/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                >
                  {videoTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 bg-blue-900/20 border border-blue-500/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {videoType === 1 && (
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Video File
                </label>
                <div className="border-2 border-dashed border-blue-500/30 rounded-xl p-6 text-center hover:border-blue-400 transition-colors bg-blue-900/10">
                  <input
                    type="file"
                    accept=".mp4,.3gp,.avi,.mov"
                    onChange={handleFileChange}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <p className="text-blue-200 mb-2">
                      {videoFile ? videoFile.name : 'Click to upload video file'}
                    </p>
                    <p className="text-sm text-blue-300">
                      Supported formats: {supportedExtensions.join(', ')}
                    </p>
                  </label>
                </div>

                {videoPreviewUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-blue-200 mb-2">Preview:</p>
                    <div className="relative bg-black rounded-lg overflow-hidden max-w-md mx-auto">
                      <video
                        src={videoPreviewUrl}
                        controls
                        className="w-full h-auto"
                        preload="metadata"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                )}
              </div>
            )}

            {videoType !== 1 && (
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Video URL
                </label>
                <div className="relative">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder={`Enter ${selectedOption?.label} URL`}
                    className="w-full pl-10 pr-4 py-3 bg-blue-900/20 border border-blue-500/30 rounded-xl text-white placeholder-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-blue-300 hover:text-blue-200 transition-colors mb-4"
              >
                <Settings className="h-5 w-5" />
                <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
              </button>

              {showAdvanced && (
                <div className="space-y-6 p-6 bg-blue-900/10 border border-blue-500/20 rounded-xl">
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-3">
                      Clip Lengths (select multiple)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { value: VIZARD_PREFER_LENGTHS.AUTO, label: 'Auto' },
                        { value: VIZARD_PREFER_LENGTHS.UNDER_30S, label: '< 30s' },
                        { value: VIZARD_PREFER_LENGTHS.THIRTY_TO_60S, label: '30-60s' },
                        { value: VIZARD_PREFER_LENGTHS.SIXTY_TO_90S, label: '60-90s' },
                        { value: VIZARD_PREFER_LENGTHS.NINETY_TO_180S, label: '90-180s' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => togglePreferLength(option.value)}
                          className={`p-3 rounded-xl text-sm font-medium transition-all ${
                            preferLengths.includes(option.value)
                              ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg'
                              : 'bg-blue-900/20 text-blue-200 hover:bg-blue-800/30 border border-blue-500/20'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-3">
                      Aspect Ratio
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: VIZARD_CLIP_RATIOS.VERTICAL_9_16, label: '9:16 Vertical' },
                        { value: VIZARD_CLIP_RATIOS.SQUARE_1_1, label: '1:1 Square' },
                        { value: VIZARD_CLIP_RATIOS.PORTRAIT_4_5, label: '4:5 Portrait' },
                        { value: VIZARD_CLIP_RATIOS.HORIZONTAL_16_9, label: '16:9 Horizontal' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setAspectRatio(option.value)}
                          className={`p-3 rounded-xl text-sm font-medium transition-all ${
                            aspectRatio === option.value
                              ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg'
                              : 'bg-blue-900/20 text-blue-200 hover:bg-blue-800/30 border border-blue-500/20'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">
                      Max Clips to Generate
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={maxClipNumber}
                      onChange={(e) => setMaxClipNumber(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-blue-900/20 border border-blue-500/30 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">
                      Keywords (optional)
                    </label>
                    <input
                      type="text"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="Enter keywords to focus clipping on specific topics"
                      className="w-full px-4 py-3 bg-blue-900/20 border border-blue-500/30 rounded-xl text-white placeholder-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={removeSilence}
                        onChange={(e) => setRemoveSilence(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-blue-200">Remove Silence</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showSubtitles}
                        onChange={(e) => setShowSubtitles(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-blue-200">Show Subtitles</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showHeadline}
                        onChange={(e) => setShowHeadline(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-blue-200">Add Headline</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showEmojis}
                        onChange={(e) => setShowEmojis(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-blue-200">Auto Emojis</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

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

            {uploading && processingStatus && (
              <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <RefreshCw className="h-5 w-5 text-blue-400 animate-spin" />
                  <p className="text-blue-200">{processingStatus}</p>
                </div>
                {processingPercent > 0 && (
                  <div className="w-full bg-blue-900/20 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-700 h-full rounded-full transition-all duration-300"
                      style={{ width: `${processingPercent}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={uploading || !profileKey || (videoType === 1 && !videoFile) || (videoType !== 1 && !videoUrl)}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Generate Clips</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-gradient-to-br from-blue-900/20 to-black rounded-2xl border border-blue-500/20 shadow-lg p-8 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-2 rounded-xl">
                <Play className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Clipped Videos</h2>
            </div>
            <button
              onClick={loadClippedVideos}
              disabled={loading}
              className="px-4 py-2 bg-blue-900/20 hover:bg-blue-800/30 text-blue-200 rounded-lg transition-colors flex items-center space-x-2 border border-blue-500/20"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 text-blue-400 mx-auto mb-4 animate-spin" />
              <p className="text-blue-200">Loading clipped videos...</p>
            </div>
          ) : clippedVideos.length > 0 ? (
            <div className="grid gap-6">
              {clippedVideos.map((video, index) => (
                <div key={video.id || index} className="bg-blue-900/10 rounded-xl p-6 hover:bg-blue-800/20 transition-colors border border-blue-500/20">
                  <div className="space-y-4">
                    <div className="w-full">
                      <div className="relative bg-black rounded-lg overflow-hidden max-w-xs mx-auto" style={{ aspectRatio: '9/16' }}>
                        {video.clipped_video_url ? (
                          <video
                            src={video.clipped_video_url}
                            controls
                            className="w-full h-full object-cover"
                            preload="metadata"
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-blue-400">
                            <RefreshCw className="h-8 w-8 animate-spin" />
                          </div>
                        )}
                        {video.video_ms_duration && (
                          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                            {formatDuration(video.video_ms_duration)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-3">
                        {video.status === 'completed' && (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-sm text-green-600 font-medium">Ready</span>
                          </>
                        )}
                        {video.viral_score && (
                          <div className="flex items-center space-x-1 ml-4">
                            <TrendingUp className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-yellow-600 font-medium">Viral Score: {video.viral_score}/10</span>
                          </div>
                        )}
                      </div>

                      <h3 className="font-semibold text-white text-lg mb-2">
                        {video.title}
                      </h3>

                      {video.viral_reason && (
                        <p className="text-sm text-blue-300 mb-3 italic">
                          {video.viral_reason}
                        </p>
                      )}

                      {video.related_topic && (
                        <div className="text-sm text-blue-200 mb-2">
                          <span className="font-medium">Topic:</span> {video.related_topic}
                        </div>
                      )}

                      {video.transcript && (
                        <details className="text-sm text-blue-200 mb-4 text-left">
                          <summary className="cursor-pointer font-medium mb-2">View Transcript</summary>
                          <p className="pl-4 text-blue-300">{video.transcript}</p>
                        </details>
                      )}

                      {video.clipped_video_url && (
                        <div className="flex flex-col space-y-3">
                          <div className="flex justify-center space-x-3 flex-wrap gap-2">
                            <a
                              href={video.clipped_video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                            >
                              <Play className="h-4 w-4" />
                              <span>Play</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>

                            <a
                              href={video.clipped_video_url}
                              download
                              className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                            >
                              <Download className="h-4 w-4" />
                              <span>Download</span>
                            </a>

                            {video.clip_editor_url && (
                              <a
                                href={video.clip_editor_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                              >
                                <Edit className="h-4 w-4" />
                                <span>Edit</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>

                          <div className="flex justify-center space-x-3 flex-wrap gap-2">
                            <button
                              onClick={() => copyToClipboard(video.clipped_video_url || '')}
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
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                            >
                              <Send className="h-4 w-4" />
                              <span>Post to Socials</span>
                            </button>
                          </div>

                          {uploadingToWebhook && uploadProgress > 0 && (
                            <div className="mt-3">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm text-blue-300">Uploading: {uploadProgress}%</span>
                              </div>
                              <div className="w-full bg-blue-900/20 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {webhookUrls[video.id || ''] && (
                            <div className="mt-3 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-green-400">Webhook URL:</p>
                                  <p className="text-xs text-green-300 break-all">
                                    {webhookUrls[video.id || '']}
                                  </p>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(webhookUrls[video.id || ''])}
                                  className="ml-2 p-1 text-green-400 hover:text-green-300 transition-colors"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Video className="h-16 w-16 text-blue-500/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-blue-200 mb-2">No Clipped Videos</h3>
              <p className="text-gray-400">Upload a video above to start clipping content for social media.</p>
            </div>
          )}
        </div>
      </div>

      {showPostModal && selectedVideoForPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-blue-900/95 to-black/95 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-blue-500/20">
            <div className="p-6 border-b border-blue-500/20">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Post Video to Social Media</h3>
                <button
                  onClick={closePostModal}
                  className="text-blue-400 hover:text-blue-200 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/20">
                <div className="flex items-center space-x-3 mb-3">
                  <Video className="h-5 w-5 text-blue-400" />
                  <span className="font-medium text-white">{selectedVideoForPost.title}</span>
                  {selectedVideoForPost.viral_score && (
                    <div className="flex items-center space-x-1 ml-auto">
                      <TrendingUp className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-yellow-600 font-medium">{selectedVideoForPost.viral_score}/10</span>
                    </div>
                  )}
                </div>
                {selectedVideoForPost.clipped_video_url && (
                  <div className="bg-black rounded-lg overflow-hidden max-w-xs mx-auto" style={{ aspectRatio: '9/16' }}>
                    <video
                      src={selectedVideoForPost.clipped_video_url}
                      controls
                      className="w-full h-full object-cover"
                      preload="metadata"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Post Caption
                </label>
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="Write your post caption..."
                  className="w-full px-4 py-3 bg-blue-900/20 border border-blue-500/30 rounded-xl text-white placeholder-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-colors resize-none"
                  rows={4}
                />
                <div className="text-right text-sm text-blue-300 mt-1">
                  {postText.length} characters
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-3">
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
                          ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg'
                          : 'bg-blue-900/20 text-blue-200 hover:bg-blue-800/30 border border-blue-500/20'
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

              <div className="flex space-x-3 pt-4 border-t border-blue-500/20">
                <button
                  onClick={closePostModal}
                  className="flex-1 px-6 py-3 border border-blue-500/30 text-blue-200 rounded-xl hover:bg-blue-900/20 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleValidatePost}
                  disabled={validating || !postText.trim() || selectedPlatforms.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl hover:from-blue-700 hover:to-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl hover:from-blue-700 hover:to-blue-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
