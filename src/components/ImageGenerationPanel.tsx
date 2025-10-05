import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, Wand as Wand2, RefreshCw, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Download, Copy, Trash2, Eye, ExternalLink, Sparkles } from 'lucide-react';
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
    <div className="space-y-8">
      {/* Generation Form */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
            <Wand2 className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">AI Image Generation</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Inspiration Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inspiration Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleImageChange}
                className="hidden"
                id="inspiration-upload"
              />
              <label htmlFor="inspiration-upload" className="cursor-pointer">
                {previewUrl ? (
                  <div className="space-y-4">
                    <img
                      src={previewUrl}
                      alt="Inspiration preview"
                      className="max-w-xs max-h-48 mx-auto rounded-lg object-cover"
                    />
                    <p className="text-gray-600">
                      {inspirationImage?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Click to change image
                    </p>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Click to upload inspiration image
                    </p>
                    <p className="text-sm text-gray-500">
                      Supported formats: {supportedFormats.join(', ')}
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Generation Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the style, mood, or modifications you want for the generated images..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
              rows={4}
              required
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {prompt.length} characters
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-green-700">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={generating || !profileKey || !inspirationImage || !prompt.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {generating ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Generating Images...</span>
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

      {/* Generated Images Gallery */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-xl">
              <ImageIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Generated Images</h2>
          </div>
          <button
            onClick={loadGeneratedImages}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading generated images...</p>
          </div>
        ) : generatedImages.length > 0 ? (
          <div className="space-y-8">
            {generatedImages.map((imageSet) => (
              <div key={imageSet.id} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold text-gray-900">
                        Generated on {formatDate(imageSet.created_at!)}
                      </span>
                    </div>
                    <p className="text-gray-700 bg-white p-3 rounded-lg border">
                      <span className="font-medium">Prompt:</span> {imageSet.prompt}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteImage(imageSet.id!)}
                    className="ml-4 p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                {/* Generated Images Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {imageSet.generated_images.map((imageUrl, index) => (
                    <div key={index} className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                      <div className="aspect-square">
                        <img
                          src={imageUrl}
                          alt={`Generated image ${index + 1}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Image Actions Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(imageUrl, '_blank')}
                            className="p-2 bg-white bg-opacity-90 text-gray-700 rounded-lg hover:bg-opacity-100 transition-all"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <a
                            href={imageUrl}
                            download={`generated-image-${index + 1}.jpg`}
                            className="p-2 bg-white bg-opacity-90 text-gray-700 rounded-lg hover:bg-opacity-100 transition-all"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => copyToClipboard(imageUrl)}
                            className="p-2 bg-white bg-opacity-90 text-gray-700 rounded-lg hover:bg-opacity-100 transition-all"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Image Number Badge */}
                      <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      const urls = imageSet.generated_images.join('\n');
                      copyToClipboard(urls);
                    }}
                    className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-lg hover:bg-purple-200 transition-colors flex items-center space-x-1"
                  >
                    <Copy className="h-3 w-3" />
                    <span>Copy All URLs</span>
                  </button>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-lg">
                    {imageSet.generated_images.length} images generated
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Generated Images</h3>
            <p className="text-gray-500">Upload an inspiration image and prompt above to generate AI images.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerationPanel;