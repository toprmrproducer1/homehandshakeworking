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
  Sparkles,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useUserContext } from '../contexts/UserContext';
import {
  submitVideoToVizard,
  getVideoTypeOptions,
  getSupportedVideoExtensions,
  VIZARD_CLIP_RATIOS,
  VIZARD_PREFER_LENGTHS,
  SUPPORTED_LANGUAGES,
  VizardClipConfig,
  getVizardErrorMessage,
} from '../utils/vizardApi';
import {
  getClippedVideos,
  ClippedVideo,
} from '../utils/clippedVideosDb';
import { validatePost, publishPost } from '../utils/ayrshare';
import { uploadVideoForVizard } from '../utils/videoClipping';
import { createClippingJob, getClippingJobs, deleteClippingJob, markJobCompleted, markJobFailed, ClippingJob } from '../utils/clippingJobs';
import { queryTaskById } from '../utils/taskQueryService';
import TaskIdDropdown from './TaskIdDropdown';
import TaskHistoryPanel from './TaskHistoryPanel';
import { queryVizardProject } from '../utils/vizardApi';
import { saveVizardClips } from '../utils/clippedVideosDb';
import { jobPollingService } from '../utils/jobPollingService';
import VideoProcessingLoader from './VideoProcessingLoader';

const VideoClippingPanel: React.FC = () => {
  const { user } = useUser();
  const { profileKey } = useUserContext();
  const [videoType, setVideoType] = useState<number>(1);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [clippedVideos, setClippedVideos] = useState<ClippedVideo[]>([]);
  const [processingJobs, setProcessingJobs] = useState<ClippingJob[]>([]);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [processingPercent, setProcessingPercent] = useState<number>(0);

  const [language, setLanguage] = useState('0');
  const [preferLengths, setPreferLengths] = useState<number[]>([0]);
  const [aspectRatio, setAspectRatio] = useState(VIZARD_CLIP_RATIOS.VERTICAL_9_16);
  const [maxClipNumber, setMaxClipNumber] = useState<number>(100);
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
  const [checkingVizard, setCheckingVizard] = useState(false);
  const [lastManualCheck, setLastManualCheck] = useState<Date | null>(null);
  const [manualTaskId, setManualTaskId] = useState('');
  const [queryingTask, setQueryingTask] = useState(false);
  const [allTasks, setAllTasks] = useState<ClippingJob[]>([]);
  const [showTaskHistory, setShowTaskHistory] = useState(false);
  const [lastSubmittedTaskId, setLastSubmittedTaskId] = useState<string | null>(null);

  const videoTypeOptions = getVideoTypeOptions();
  const supportedExtensions = getSupportedVideoExtensions();

  useEffect(() => {
    if (profileKey && user?.id) {
      loadClippedVideos();
      loadProcessingJobs();
      loadAllTasks();

      jobPollingService.start(profileKey, user.id, () => {
        loadClippedVideos();
        loadProcessingJobs();
        loadAllTasks();
      });
    }

    return () => {
      jobPollingService.stop();
    };
  }, [profileKey, user?.id]);

  const loadClippedVideos = async () => {
    if (!profileKey) return;

    try {
      setError(null);
      const videos = await getClippedVideos(profileKey);
      setClippedVideos(videos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clipped videos');
    }
  };

  const loadProcessingJobs = async () => {
    if (!profileKey) return;

    try {
      const jobs = await getClippingJobs(profileKey);
      setProcessingJobs(jobs.filter(job => job.status === 'processing'));
    } catch (err) {
    }
  };

  const loadAllTasks = async () => {
    if (!profileKey) return;

    try {
      const jobs = await getClippingJobs(profileKey);
      setAllTasks(jobs);
    } catch (err) {
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
      let videoExtension = '';
      let uploadResult: { url: string; extension: string; service: string } | undefined;

      if (videoType === 1 && videoFile) {
        const fileSizeMB = (videoFile.size / (1024 * 1024)).toFixed(1);
        const isLargeFile = videoFile.size > 50 * 1024 * 1024;

        if (isLargeFile) {
          setProcessingStatus(`Uploading ${fileSizeMB}MB video to Mux (this may take several minutes)...`);
        } else {
          setProcessingStatus('Uploading video to cloud storage...');
        }
        setProcessingPercent(5);

        const uploadResult = await uploadVideoForVizard(
          videoFile,
          user.id,
          (progress) => {
            const mappedProgress = 5 + (progress * 0.95);
            setProcessingPercent(mappedProgress);

            if (progress < 40) {
              setProcessingStatus(`Uploading video... ${Math.round(progress)}%`);
            } else if (progress < 90) {
              setProcessingStatus(`Processing video for download... ${Math.round(progress)}%`);
            } else {
              setProcessingStatus(`Finalizing... ${Math.round(progress)}%`);
            }
          }
        );
        uploadedVideoUrl = uploadResult.url;
        videoExtension = uploadResult.extension;
        setProcessingStatus(`Upload complete via ${uploadResult.service.toUpperCase()}!`);
        setProcessingPercent(100);
      } else if (videoType === 1) {
        throw new Error('Video file is required');
      } else {
        const urlExt = uploadedVideoUrl.split('.').pop()?.toLowerCase() || 'mp4';
        videoExtension = urlExt;
      }

      if (!uploadedVideoUrl) {
        throw new Error('Video URL is required');
      }

      const config: VizardClipConfig = {
        lang: language,
        preferLength: preferLengths,
        videoUrl: uploadedVideoUrl,
        videoType: videoType,
        maxClipNumber: maxClipNumber,
        projectName: `Clip - ${new Date().toLocaleString()}`,
        ext: videoExtension,
      };

      if (showAdvanced) {
        config.ratioOfClip = aspectRatio;
        config.removeSilenceSwitch = removeSilence ? 1 : 0;
        config.subtitleSwitch = showSubtitles ? 1 : 0;
        config.headlineSwitch = showHeadline ? 1 : 0;
        config.emojiSwitch = showEmojis ? 1 : 0;
        if (keywords && keywords.trim()) {
          config.keywords = keywords;
        }
      }

      setProcessingStatus('Validating video URL...');

      try {
        new URL(uploadedVideoUrl);
      } catch (urlError) {
        throw new Error('Invalid video URL generated. Please try again.');
      }

      setProcessingStatus('Submitting to Vizard AI...');
      const vizardResult = await submitVideoToVizard(config);

      const job = await createClippingJob(
        user.id,
        profileKey,
        vizardResult.projectId,
        uploadedVideoUrl,
        config,
        vizardResult.shareLink,
        config.projectName
      );

      setLastSubmittedTaskId(vizardResult.projectId);
      setSuccess(`Video submitted for AI clipping! Task ID: ${vizardResult.projectId}`);
      setProcessingJobs(prev => [job, ...prev]);
      await loadAllTasks();

      setVideoUrl('');
      setVideoFile(null);
      setKeywords('');
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
        setVideoPreviewUrl(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process video';

      if (errorMessage.includes('code:') || errorMessage.includes('API error')) {
        const codeMatch = errorMessage.match(/code:\s*(\d+)/);
        if (codeMatch) {
          const errorCode = parseInt(codeMatch[1]);
          setError(getVizardErrorMessage(errorCode, errorMessage));
        } else {
          setError(errorMessage);
        }
      } else {
        setError(errorMessage);
      }
    } finally {
      setUploading(false);
      setProcessingStatus('');
      setProcessingPercent(0);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteClippingJob(jobId);
      setProcessingJobs(prev => prev.filter(job => job.id !== jobId));
      setSuccess('Processing job cancelled');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job');
    }
  };

  const handleManualCheck = async () => {
    if (!profileKey || !user?.id) {
      setError('Authentication error. Please refresh the page.');
      return;
    }


    setCheckingVizard(true);
    setError(null);
    setSuccess(null);

    try {
      const jobs = await getClippingJobs(profileKey);

      const processingJobsList = jobs.filter(job => job.status === 'processing');

      if (processingJobsList.length === 0) {
        setSuccess('No processing jobs to check');
        setLastManualCheck(new Date());
        return;
      }

      let completedCount = 0;
      let stillProcessingCount = 0;
      let errorCount = 0;

      for (const job of processingJobsList) {
        try {
          const result = await queryVizardProject(job.vizard_project_id);

          if (result.code === 2000 && result.videos && result.videos.length > 0) {

            const clips = result.videos.map((video, index) => {
              return {
                clipEditorUrl: video.clipEditorUrl || '',
                relatedTopic: Array.isArray(video.relatedTopic) ? video.relatedTopic.join(', ') : (video.relatedTopic || null),
                title: video.title,
                transcript: video.transcript || null,
                videoId: video.videoId || index,
                videoMsDuration: video.videoMsDuration,
                videoUrl: video.videoUrl,
                viralReason: video.viralReason,
                viralScore: String(video.viralScore),
              };
            });

            try {
              const savedClips = await saveVizardClips(
                user.id,
                profileKey,
                job.vizard_project_id,
                job.original_video_url,
                clips,
                job.config,
                undefined,
                job.vizard_share_link
              );

              await markJobCompleted(job.id, clips.length);
              completedCount++;
            } catch (saveError) {
              setError(`Failed to save clips: ${saveError instanceof Error ? saveError.message : 'Unknown error'}`);
              errorCount++;
            }
          } else if (result.code === 1000) {
            stillProcessingCount++;
          } else if (result.code === 4002) {
            await markJobFailed(job.id, result.msg || 'Video clipping failed');
            errorCount++;
          } else {
          }
        } catch (err) {
          errorCount++;
        }
      }


      if (completedCount > 0) {
        setSuccess(`Found and imported ${completedCount} completed video${completedCount > 1 ? 's' : ''} with clips!`);

        await Promise.all([
          loadClippedVideos(),
          loadProcessingJobs()
        ]);

      } else if (stillProcessingCount > 0) {
        setSuccess(`All ${stillProcessingCount} job${stillProcessingCount > 1 ? 's are' : ' is'} still processing in Vizard. Check back in a few minutes.`);
      } else if (errorCount > 0) {
        setError('Some jobs encountered errors. Check the console for details.');
      } else {
        setSuccess('No new completed videos found');
      }

      setLastManualCheck(new Date());
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to check for completed videos';
      setError(`Check failed: ${errorMsg}`);
    } finally {
      setCheckingVizard(false);
    }
  };

  const uploadToWebhook = async (video: ClippedVideo) => {
    if (!video.clipped_video_url || !user?.id) return;

    try {
      setUploadingToWebhook(true);
      setError(null);
      setUploadProgress(0);

      setUploadProgress(10);

      const response = await fetch(video.clipped_video_url);
      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
      }

      setUploadProgress(30);

      const blob = await response.blob();
      const file = new File([blob], `video_${video.id || Date.now()}.mp4`, { type: 'video/mp4' });

      setUploadProgress(40);

      const uploadResult = await uploadVideoForVizard(file, user.id, (progress) => {
        setUploadProgress(40 + (progress * 0.5));
      });

      const videoKey = video.id || video.clipped_video_url;
      setWebhookUrls(prev => ({
        ...prev,
        [videoKey]: uploadResult.url
      }));

      setSuccess(`Video successfully re-uploaded to ${uploadResult.service} for large platforms!`);
      setUploadProgress(100);

      setTimeout(() => setUploadProgress(0), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to re-upload video');
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

  const handleQueryTaskById = async () => {
    if (!manualTaskId.trim() || !profileKey || !user?.id) {
      setError('Please enter a valid Task ID');
      return;
    }

    setQueryingTask(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await queryTaskById(manualTaskId.trim(), profileKey, user.id);

      if (result.success) {
        setSuccess(result.message);

        if (result.status === 'completed' && result.clips) {
          await loadClippedVideos();
          await loadAllTasks();
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to query task');
    } finally {
      setQueryingTask(false);
    }
  };

  const handleSelectTask = async (task: ClippingJob) => {
    if (!profileKey || !user?.id) return;

    setManualTaskId(task.vizard_project_id);

    if (task.status === 'completed') {
      await loadClippedVideos();
      setSuccess(`Loaded clips for task: ${task.task_name || task.vizard_project_id}`);
    } else if (task.status === 'processing') {
      await handleQueryTaskById();
    }
  };

  const handleViewTaskResults = async (task: ClippingJob) => {
    if (!profileKey || !user?.id) return;

    try {
      setLoading(true);
      const result = await queryTaskById(task.vizard_project_id, profileKey, user.id);

      if (result.success && result.clips) {
        await loadClippedVideos();
        setSuccess(`Loaded ${result.clipsCount} clips for ${task.task_name}`);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task results');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckTaskStatus = async (task: ClippingJob) => {
    if (!profileKey || !user?.id) return;

    try {
      setLoading(true);
      const result = await queryTaskById(task.vizard_project_id, profileKey, user.id);

      if (result.success) {
        setSuccess(result.message);

        if (result.status === 'completed') {
          await loadClippedVideos();
          await loadAllTasks();
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check task status');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteClippingJob(taskId);
      await loadAllTasks();
      await loadProcessingJobs();
      setSuccess('Task deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
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
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-200">
                <strong>Quality Note:</strong> Clips will maintain the same resolution as your source video (up to 4K supported).
                Upload high-quality videos for best results.
              </p>
            </div>

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

        {lastSubmittedTaskId && (
          <div className="bg-gradient-to-br from-green-900/20 to-black rounded-2xl border border-green-500/20 shadow-lg p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-green-300">Task Submitted Successfully!</h3>
              <button
                onClick={() => setLastSubmittedTaskId(null)}
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-300">Your Task ID:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(lastSubmittedTaskId);
                    setSuccess('Task ID copied to clipboard!');
                  }}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 rounded text-sm text-green-300 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy ID</span>
                </button>
              </div>
              <div className="font-mono text-sm text-green-200 break-all bg-black/30 px-3 py-2 rounded">
                {lastSubmittedTaskId}
              </div>
              <p className="text-xs text-green-400/70 mt-3">
                Save this ID to check your video results later!
              </p>
            </div>
          </div>
        )}

        {processingJobs.length > 0 && (
          <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 shadow-lg p-8 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-2 rounded-xl">
                <Sparkles className="h-6 w-6 text-white animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Processing Videos ({processingJobs.length})
              </h2>
            </div>

            <div className="grid gap-6">
              {processingJobs.map((job) => (
                <div key={job.id} className="relative">
                  <VideoProcessingLoader
                    progress={job.progress_percent}
                    projectId={job.vizard_project_id}
                    estimatedTime="5-10 minutes"
                    videoUrl={job.original_video_url}
                    shareLink={job.vizard_share_link}
                  />
                  <button
                    onClick={() => handleDeleteTask(job.id)}
                    className="absolute top-4 right-4 p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors border border-red-500/30"
                    title="Cancel processing"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-emerald-900/20 to-black rounded-2xl border border-emerald-500/20 shadow-lg p-8 backdrop-blur-xl">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 p-2 rounded-xl">
              <Copy className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
              Query Task by ID
            </h2>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-emerald-200/80">
              Enter a Task ID to fetch video outputs. You can use this to check any task from your history or paste an ID you saved earlier.
            </p>

            <TaskIdDropdown
              tasks={allTasks}
              onSelectTask={handleSelectTask}
              className="mb-4"
            />

            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={manualTaskId}
                  onChange={(e) => setManualTaskId(e.target.value)}
                  placeholder="Paste Task ID here... (e.g., 24659016)"
                  className="w-full px-4 py-3 bg-emerald-900/20 border border-emerald-500/30 rounded-xl text-white placeholder-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleQueryTaskById();
                    }
                  }}
                />
              </div>
              <button
                onClick={handleQueryTaskById}
                disabled={queryingTask || !manualTaskId.trim()}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-emerald-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {queryingTask ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Querying...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    <span>Query Task</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {allTasks.length > 0 && (
          <div>
            <button
              onClick={() => setShowTaskHistory(!showTaskHistory)}
              className="w-full mb-4 px-6 py-3 bg-blue-900/20 border border-blue-500/30 rounded-xl text-blue-200 hover:bg-blue-800/30 transition-colors flex items-center justify-between"
            >
              <span className="font-medium">Task History ({allTasks.length})</span>
              <ChevronDown className={`h-5 w-5 transition-transform ${showTaskHistory ? 'rotate-180' : ''}`} />
            </button>

            {showTaskHistory && (
              <TaskHistoryPanel
                tasks={allTasks}
                onViewResults={handleViewTaskResults}
                onCheckStatus={handleCheckTaskStatus}
                onDeleteTask={handleDeleteTask}
                loading={loading}
              />
            )}
          </div>
        )}

        <div className="bg-gradient-to-br from-blue-900/20 to-black rounded-2xl border border-blue-500/20 shadow-lg p-8 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-2 rounded-xl">
                <Play className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Clipped Videos</h2>
            </div>
            <div className="flex items-center space-x-3">
              {lastManualCheck && (
                <div className="text-sm text-blue-300">
                  Last checked: {lastManualCheck.toLocaleTimeString()}
                </div>
              )}
              <button
                onClick={handleManualCheck}
                disabled={checkingVizard || loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                title="Manually check Vizard for completed videos"
              >
                {checkingVizard ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    <span>Check Vizard</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  loadClippedVideos();
                  loadProcessingJobs();
                }}
                disabled={loading}
                className="px-4 py-2 bg-blue-900/20 hover:bg-blue-800/30 text-blue-200 rounded-lg transition-colors flex items-center space-x-2 border border-blue-500/20"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {clippedVideos.length > 0 ? (
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
                            preload="auto"
                            playsInline
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
                              title="Download original quality video"
                            >
                              <Download className="h-4 w-4" />
                              <span>Download HQ</span>
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

                            {video.vizard_share_link && (
                              <a
                                href={video.vizard_share_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors flex items-center space-x-2 shadow-lg"
                              >
                                <Sparkles className="h-4 w-4" />
                                <span>View in Vizard</span>
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
