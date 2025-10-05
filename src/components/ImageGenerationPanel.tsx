import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, Wand as Wand2, RefreshCw, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Download, Copy, Trash2, Eye, ExternalLink, Sparkles, Star, Zap, Palette, Magic } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useUserContext } from '../contexts/UserContext';
import { generateImages, getSupportedImageFormats, ImageGenerationRequest } from '../utils/imageGeneration';
import { saveGeneratedImages, getGeneratedImages, deleteGeneratedImage, GeneratedImage } from '../utils/supabase';

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

  const supportedFormats = getSupportedImageFormats();

  useEffect(() => {
    if (profileKey) {
      loadGeneratedImages();
    }
  }, [profileKey]);

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
      const request: ImageGenerationRequest = {
        inspirationImage,
        prompt: prompt.trim(),
      };

      // Generate images via webhook
      const response = await generateImages(request, profileKey);
      
      // Save to database
      const savedData = await saveGeneratedImages({
        user_id: user.id,
        profile_key: profileKey,
        inspiration_image_url: previewUrl, // Store the preview URL temporarily
        prompt: prompt.trim(),
        generated_images: response.imageUrls || response.images || [],
      });

      setSuccess(`Successfully generated ${response.imageUrls?.length || response.images?.length || 5} images!`);
      
      // Reset form
      setPrompt('');
      setInspirationImage(null);
      setPreviewUrl(null);
      
      // Reload generated images
      await loadGeneratedImages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate images');
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
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl shadow-2xl border border-purple-500/20">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-blue-600/10 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>
        
        <div className="relative p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-2xl">
                <Wand2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                AI Image Generation
              </h2>
              <p className="text-purple-300 mt-1 font-medium">Transform your vision into stunning visuals</p>
            </div>
            <div className="flex-1"></div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-2 rounded-full border border-purple-400/30">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-purple-200 text-sm font-semibold">Premium AI</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Inspiration Image Upload */}
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-white mb-3">
                <Palette className="inline h-5 w-5 mr-2 text-purple-400" />
                Inspiration Image
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative border-2 border-dashed border-purple-400/50 hover:border-purple-400 rounded-2xl p-8 text-center bg-slate-800/50 backdrop-blur-sm transition-all duration-300 group-hover:bg-slate-800/70">
                  <input
                    type="file"
                    accept={supportedFormats.map(format => `.${format}`).join(',')}
                    onChange={handleImageChange}
                    className="hidden"
                    id="inspiration-upload"
                  />
                  <label htmlFor="inspiration-upload" className="cursor-pointer block">
                    {previewUrl ? (
                      <div className="space-y-6">
                        <div className="relative inline-block">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur-md opacity-50"></div>
                          <img
                            src={previewUrl}
                            alt="Inspiration preview"
                            className="relative max-w-xs max-h-64 mx-auto rounded-xl object-cover shadow-2xl border border-purple-400/30"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-purple-200 font-medium text-lg">
                            {inspirationImage?.name}
                          </p>
                          <p className="text-purple-400 text-sm flex items-center justify-center space-x-2">
                            <Magic className="h-4 w-4" />
                            <span>Click to change image</span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                          <Upload className="relative h-16 w-16 text-purple-300 mx-auto" />
                        </div>
                        <div className="space-y-3">
                          <p className="text-white text-xl font-semibold">
                            Upload Your Inspiration Image
                          </p>
                          <p className="text-purple-300 text-sm leading-relaxed max-w-md mx-auto">
                            Supported formats: {supportedFormats.slice(0, 8).join(', ')}
                            {supportedFormats.length > 8 && ` and ${supportedFormats.length - 8} more`}
                          </p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Prompt Input */}
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-white mb-3">
                <Zap className="inline h-5 w-5 mr-2 text-yellow-400" />
                Creative Prompt
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-25 group-focus-within:opacity-40 transition-opacity duration-300"></div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the style, mood, colors, or artistic modifications you want for your generated images... Be creative and detailed!"
                  className="relative w-full px-6 py-4 bg-slate-800/70 backdrop-blur-sm border border-purple-400/30 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 resize-none text-white placeholder-purple-300 text-lg leading-relaxed"
                  rows={4}
                  required
                />
              </div>
              <div className="flex justify-between items-center">
                <div className="text-purple-400 text-sm">
                  Be descriptive for better results
                </div>
                <div className="text-purple-300 text-sm font-mono">
                  {prompt.length} characters
                </div>
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="relative group">
                <div className="absolute inset-0 bg-red-500/20 rounded-2xl blur-xl"></div>
                <div className="relative flex items-center space-x-3 p-6 bg-red-900/30 backdrop-blur-sm border border-red-500/30 rounded-2xl">
                  <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
                  <p className="text-red-200 font-medium">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="relative group">
                <div className="absolute inset-0 bg-green-500/20 rounded-2xl blur-xl"></div>
                <div className="relative flex items-center space-x-3 p-6 bg-green-900/30 backdrop-blur-sm border border-green-500/30 rounded-2xl">
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                  <p className="text-green-200 font-medium">{success}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <button
                type="submit"
                disabled={generating || !profileKey || !inspirationImage || !prompt.trim()}
                className="relative w-full px-8 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-bold text-xl rounded-2xl hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transition-all duration-300 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span>Generating Magic...</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-6 w-6" />
                    <span>Generate 5 Premium Images</span>
                    <Star className="h-5 w-5 text-yellow-300" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Generated Images Gallery */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-3xl shadow-2xl border border-blue-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <div className="relative p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-2xl">
                  <ImageIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Generated Gallery
                </h2>
                <p className="text-blue-300 mt-1 font-medium">Your AI-created masterpieces</p>
              </div>
            </div>
            <button
              onClick={loadGeneratedImages}
              disabled={loading}
              className="group relative px-6 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 text-blue-200 hover:text-white rounded-xl transition-all duration-300 flex items-center space-x-3 border border-blue-400/30 hover:border-blue-400/50 backdrop-blur-sm"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-300`} />
              <span className="font-semibold">Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <RefreshCw className="relative h-12 w-12 text-blue-300 mx-auto mb-6 animate-spin" />
              </div>
              <p className="text-blue-200 text-xl font-semibold">Loading your creations...</p>
            </div>
          ) : generatedImages.length > 0 ? (
            <div className="space-y-12">
              {generatedImages.map((imageSet) => (
                <div key={imageSet.id} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 group-hover:border-purple-400/30 transition-all duration-300">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                            <Sparkles className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <span className="font-bold text-white text-lg">
                              Generated on {formatDate(imageSet.created_at!)}
                            </span>
                            <div className="flex items-center space-x-2 mt-1">
                              <Star className="h-4 w-4 text-yellow-400" />
                              <span className="text-purple-300 text-sm font-medium">Premium Quality</span>
                            </div>
                          </div>
                        </div>
                        <div className="relative group/prompt">
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl blur-sm opacity-0 group-hover/prompt:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative bg-slate-700/30 backdrop-blur-sm p-4 rounded-xl border border-slate-600/30">
                            <div className="flex items-start space-x-3">
                              <Zap className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-semibold text-purple-300 text-sm uppercase tracking-wide">Prompt:</span>
                                <p className="text-white mt-1 leading-relaxed">{imageSet.prompt}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteImage(imageSet.id!)}
                        className="ml-6 p-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 group/delete"
                      >
                        <Trash2 className="h-5 w-5 group-hover/delete:scale-110 transition-transform duration-200" />
                      </button>
                    </div>

                    {/* Generated Images Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                      {imageSet.generated_images.map((imageUrl, index) => (
                        <div key={index} className="group/image relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-0 group-hover/image:opacity-30 transition-opacity duration-300"></div>
                          <div className="relative bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 group-hover/image:border-purple-400/50 transition-all duration-300 transform group-hover/image:scale-105">
                            <div className="aspect-square relative overflow-hidden">
                              <img
                                src={imageUrl}
                                alt={`Generated image ${index + 1}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-110"
                                loading="lazy"
                              />
                              
                              {/* Overlay Actions */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => window.open(imageUrl, '_blank')}
                                    className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <a
                                    href={imageUrl}
                                    download={`ai-generated-${index + 1}.jpg`}
                                    className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
                                  >
                                    <Download className="h-4 w-4" />
                                  </a>
                                  <button
                                    onClick={() => copyToClipboard(imageUrl)}
                                    className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-200 transform hover:scale-110"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Image Number Badge */}
                              <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm px-3 py-1 rounded-full font-bold shadow-lg">
                                #{index + 1}
                              </div>

                              {/* Premium Badge */}
                              <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg flex items-center space-x-1">
                                <Star className="h-3 w-3" />
                                <span>AI</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8 flex flex-wrap gap-3">
                      <button
                        onClick={() => {
                          const urls = imageSet.generated_images.join('\n');
                          copyToClipboard(urls);
                        }}
                        className="group/action px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 text-purple-200 hover:text-white rounded-xl transition-all duration-300 flex items-center space-x-2 border border-purple-400/30 hover:border-purple-400/50 backdrop-blur-sm"
                      >
                        <Copy className="h-4 w-4 group-hover/action:scale-110 transition-transform duration-200" />
                        <span className="font-semibold">Copy All URLs</span>
                      </button>
                      <div className="px-4 py-2 bg-slate-700/30 text-slate-300 rounded-xl border border-slate-600/30 backdrop-blur-sm flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-purple-400" />
                        <span className="font-semibold">{imageSet.generated_images.length} Premium Images</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <ImageIcon className="relative h-20 w-20 text-slate-400 mx-auto mb-6" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No Generated Images Yet</h3>
              <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
                Upload an inspiration image and creative prompt above to generate stunning AI artwork.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerationPanel;