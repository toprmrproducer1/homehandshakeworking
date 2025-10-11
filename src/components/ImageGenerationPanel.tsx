import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Upload, Wand as Wand2, RefreshCw, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Download, Copy, Trash2, Eye, ExternalLink, Sparkles, Star, Zap, Palette, Magnet as Magic, Clock, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useUserContext } from '../contexts/UserContext';
import { generateImages, generateImagesBackground, getSupportedImageFormats, ImageGenerationRequest } from '../utils/imageGeneration';
import { saveGeneratedImages, getGeneratedImages, deleteGeneratedImage, GeneratedImage } from '../utils/supabase';
import { createImageGenerationJob, getActiveJobs, pollJobStatus, deleteImageGenerationJob, ImageGenerationJob } from '../utils/imageGenerationJobs';

const ImageGenerationPanel: React.FC = () => {
  const { user } = useUser();
  const { profileKey } = useUserContext();
  const [inspirationImage, setInspirationImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [activeJobs, setActiveJobs] = useState<ImageGenerationJob[]>([]);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const supportedFormats = getSupportedImageFormats();

  useEffect(() => {
    if (profileKey) {
      loadGeneratedImages();
      loadActiveJobs();
    }
  }, [profileKey]);

  useEffect(() => {
    if (profileKey && activeJobs.length > 0) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [profileKey, activeJobs.length]);

  const startPolling = () => {
    if (pollingIntervalRef.current) return;

    pollingIntervalRef.current = setInterval(async () => {
      await checkJobStatuses();
    }, 5000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const checkJobStatuses = async () => {
    if (!profileKey) return;

    try {
      const jobs = await getActiveJobs(profileKey);

      const updatedJobs = await Promise.all(
        jobs.map(job => pollJobStatus(job.id!))
      );

      const completedJobs = updatedJobs.filter(job => job.status === 'completed');
      const failedJobs = updatedJobs.filter(job => job.status === 'failed');

      if (completedJobs.length > 0) {
        setSuccess(`${completedJobs.length} image generation${completedJobs.length > 1 ? 's' : ''} completed!`);
        await loadGeneratedImages();
        setTimeout(() => setSuccess(null), 5000);
      }

      if (failedJobs.length > 0) {
        setError(`${failedJobs.length} image generation${failedJobs.length > 1 ? 's' : ''} failed.`);
        setTimeout(() => setError(null), 5000);
      }

      setActiveJobs(updatedJobs.filter(job => job.status === 'pending' || job.status === 'processing'));
    } catch (err) {
      console.error('Error checking job statuses:', err);
    }
  };

  const loadActiveJobs = async () => {
    if (!profileKey) return;

    try {
      const jobs = await getActiveJobs(profileKey);
      setActiveJobs(jobs);
    } catch (err) {
      console.error('Error loading active jobs:', err);
    }
  };

  const loadGeneratedImages = async () => {
    if (!profileKey) return;
    
    try {
      setLoading(true);
      setError(null);
      const images = await getGeneratedImages(profileKey);
      setGeneratedImages(images);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load generated images');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (fileExt && supportedFormats.includes(fileExt)) {
        setInspirationImage(file);
        setError(null);
        
        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setError(`Unsupported image format. Please use: ${supportedFormats.join(', ')}`);
        setInspirationImage(null);
        setPreviewUrl(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileKey || !user?.id || !inspirationImage || !prompt.trim()) {
      setError('Please provide both an inspiration image and a prompt');
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const job = await createImageGenerationJob({
        user_id: user.id,
        profile_key: profileKey,
        inspiration_image_url: previewUrl || undefined,
        prompt: prompt.trim(),
      });

      setActiveJobs(prev => [...prev, job]);

      setSuccess('Image generation started! You can navigate away and it will complete in the background.');

      const request: ImageGenerationRequest = {
        inspirationImage,
        prompt: prompt.trim(),
      };

      generateImagesBackground(request, profileKey, user.id, job.id!).catch(err => {
        console.error('Background generation error:', err);
      });

      setPrompt('');
      setInspirationImage(null);
      setPreviewUrl(null);

      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start image generation');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Image URL copied to clipboard!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this generated image set?')) return;

    try {
      await deleteGeneratedImage(id);
      setSuccess('Generated image set deleted successfully!');
      await loadGeneratedImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete generated image set');
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

  return (
    <div className="space-y-8 font-inter">
      {/* Generation Form */}
      <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 shadow-lg p-8 backdrop-blur-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-2 rounded-xl">
            <Wand2 className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">AI Image Generation</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Inspiration Image Upload */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Inspiration Image
              </label>
              <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-6 text-center hover:border-purple-400 transition-colors bg-purple-900/10">
                  <input
                    type="file"
                    accept={supportedFormats.map(format => `.${format}`).join(',')}
                    onChange={handleImageChange}
                    className="hidden"
                    id="inspiration-upload"
                  />
                  <label htmlFor="inspiration-upload" className="cursor-pointer block">
                    {previewUrl ? (
                      <div className="space-y-4">
                        <img
                          src={previewUrl}
                          alt="Inspiration preview"
                          className="max-w-xs max-h-64 mx-auto rounded-xl object-cover border border-purple-400/30"
                        />
                        <div className="space-y-2">
                          <p className="text-purple-200 font-medium">
                            {inspirationImage?.name}
                          </p>
                          <p className="text-purple-300 text-sm">
                            Click to change image
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 text-purple-400 mx-auto" />
                        <div className="space-y-2">
                          <p className="text-purple-200 font-semibold">
                            Upload Your Inspiration Image
                          </p>
                          <p className="text-purple-300 text-sm">
                            Supported formats: {supportedFormats.slice(0, 8).join(', ')}
                            {supportedFormats.length > 8 && ` and ${supportedFormats.length - 8} more`}
                          </p>
                        </div>
                      </div>
                    )}
                  </label>
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Creative Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the style, mood, colors, or artistic modifications you want for your generated images..."
                className="w-full px-4 py-3 bg-purple-900/20 border border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-colors resize-none"
                rows={4}
                required
              />
              <div className="text-right text-sm text-purple-300 mt-1">
                {prompt.length} characters
              </div>
            </div>

            {/* Error/Success Messages */}
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={generating || !profileKey || !inspirationImage || !prompt.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Generate 5 Images</span>
                </>
              )}
            </button>
          </form>
      </div>

      {/* Active Jobs Section */}
      {activeJobs.length > 0 && (
        <div className="bg-gradient-to-br from-blue-900/20 to-black rounded-2xl border border-blue-500/20 shadow-lg p-6 backdrop-blur-xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-2 rounded-xl">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Active Generations</h3>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full">
              {activeJobs.length} in progress
            </span>
          </div>

          <div className="space-y-3">
            {activeJobs.map((job) => (
              <div key={job.id} className="bg-blue-900/10 rounded-xl p-4 border border-blue-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                      <span className="text-white font-medium capitalize">{job.status}</span>
                      <span className="text-blue-300 text-sm">
                        {new Date(job.created_at!).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-blue-200 text-sm line-clamp-2">{job.prompt}</p>
                  </div>
                  <button
                    onClick={async () => {
                      await deleteImageGenerationJob(job.id!);
                      setActiveJobs(prev => prev.filter(j => j.id !== job.id));
                    }}
                    className="ml-4 p-2 text-blue-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 bg-blue-900/20 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-500 h-full w-full animate-pulse" style={{
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                  }}></div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-blue-300 text-sm mt-4 flex items-center space-x-2">
            <Sparkles className="h-4 w-4" />
            <span>Generations will complete in the background. You can navigate away freely!</span>
          </p>
        </div>
      )}

      {/* Generated Images Gallery */}
      <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 shadow-lg p-8 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-2 rounded-xl">
              <ImageIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Generated Gallery</h2>
          </div>
          <button
            onClick={loadGeneratedImages}
            disabled={loading}
            className="px-4 py-2 bg-purple-900/20 hover:bg-purple-800/30 text-purple-200 rounded-lg transition-colors flex items-center space-x-2 border border-purple-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 text-purple-400 mx-auto mb-4 animate-spin" />
            <p className="text-purple-200">Loading your creations...</p>
          </div>
        ) : generatedImages.length > 0 ? (
          <div className="space-y-8">
            {generatedImages.map((imageSet) => (
              <div key={imageSet.id} className="bg-purple-900/10 rounded-xl p-6 border border-purple-500/20 hover:border-purple-400/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">
                        Generated on {formatDate(imageSet.created_at!)}
                      </span>
                    </div>
                    <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/20">
                      <p className="text-purple-200 text-sm">
                        <span className="font-medium">Prompt:</span> {imageSet.prompt}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteImage(imageSet.id!)}
                    className="ml-4 p-2 text-purple-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {imageSet.generated_images.map((imageUrl, index) => (
                    <div key={index} className="group/image relative">
                      <div className="bg-purple-900/20 rounded-xl overflow-hidden border border-purple-500/20 hover:border-purple-400/50 transition-all transform hover:scale-105">
                        <div className="aspect-square relative overflow-hidden">
                          <img
                            src={imageUrl}
                            alt={`Generated image ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-110"
                                loading="lazy"
                                onError={(e) => {
                                  console.error('Failed to load image:', imageUrl);
                                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                                }}
                              />

                          {/* Overlay Actions */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => window.open(imageUrl, '_blank')}
                                className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <a
                                href={imageUrl}
                                download={`ai-generated-${index + 1}.jpg`}
                                className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                              <button
                                onClick={() => copyToClipboard(imageUrl)}
                                className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Image Number Badge */}
                          <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            #{index + 1}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                    </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      const urls = imageSet.generated_images.join('\n');
                      copyToClipboard(urls);
                    }}
                    className="px-4 py-2 bg-purple-900/20 hover:bg-purple-800/30 text-purple-200 rounded-lg transition-colors flex items-center space-x-2 border border-purple-500/20"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy All URLs</span>
                  </button>
                  <div className="px-4 py-2 bg-purple-900/20 text-purple-200 rounded-lg border border-purple-500/20 flex items-center space-x-2">
                    <Sparkles className="h-4 w-4" />
                    <span>{imageSet.generated_images.length} Images</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 text-purple-500/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-purple-200 mb-2">No Generated Images Yet</h3>
            <p className="text-gray-400">
              Upload an inspiration image and creative prompt above to generate AI artwork.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerationPanel;