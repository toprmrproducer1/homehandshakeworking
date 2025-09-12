import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Image, 
  Video, 
  Link, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  Clock,
  Globe,
  Users,
  Eye,
  Target
} from 'lucide-react';
import { useUserContext } from '../contexts/UserContext';
import { validatePost, publishPost } from '../utils/socialApi';

const PostingPanel: React.FC = () => {
  const { profileKey, userProfile } = useUserContext();
  const [postText, setPostText] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>(['']);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [validating, setValidating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);

  const availablePlatforms = [
    { id: 'facebook', name: 'Facebook', color: 'from-blue-500 to-blue-600', maxChars: 63206 },
    { id: 'instagram', name: 'Instagram', color: 'from-pink-500 to-purple-600', maxChars: 2200 },
    { id: 'twitter', name: 'X/Twitter', color: 'from-sky-500 to-sky-600', maxChars: 280 },
    { id: 'youtube', name: 'YouTube', color: 'from-red-500 to-red-600', maxChars: 5000 },
    { id: 'tiktok', name: 'TikTok', color: 'from-gray-800 to-black', maxChars: 2200 },
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

  const addMediaUrl = () => {
    setMediaUrls([...mediaUrls, '']);
  };

  const removeMediaUrl = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  const updateMediaUrl = (index: number, value: string) => {
    const updated = [...mediaUrls];
    updated[index] = value;
    setMediaUrls(updated);
  };

  const getValidMediaUrls = () => {
    return mediaUrls.filter(url => url.trim() !== '');
  };

  const handleValidatePost = async () => {
    if (!profileKey || !postText.trim() || selectedPlatforms.length === 0) return;

    try {
      setValidating(true);
      setError(null);
      const validMediaUrls = getValidMediaUrls();
      const result = await validatePost(
        profileKey, 
        postText, 
        selectedPlatforms, 
        validMediaUrls.length > 0 ? validMediaUrls : undefined
      );
      setValidationResult(result);
      setSuccess('Post validation completed!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
      setValidationResult(null);
    } finally {
      setValidating(false);
    }
  };

  const handlePublishPost = async () => {
    if (!profileKey || !postText.trim() || selectedPlatforms.length === 0) return;

    try {
      setPublishing(true);
      setError(null);
      
      const validMediaUrls = getValidMediaUrls();
      const additionalOptions: any = {};

      // Add scheduling if date and time are provided
      if (scheduleDate && scheduleTime) {
        const scheduleDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
        additionalOptions.scheduleDate = scheduleDateTime.toISOString();
      }

      const result = await publishPost(
        profileKey, 
        postText, 
        selectedPlatforms, 
        validMediaUrls.length > 0 ? validMediaUrls : undefined,
        Object.keys(additionalOptions).length > 0 ? additionalOptions : undefined
      );
      
      setSuccess('Post published successfully across selected platforms!');
      
      // Reset form after successful publish
      setPostText('');
      setMediaUrls(['']);
      setSelectedPlatforms([]);
      setScheduleDate('');
      setScheduleTime('');
      setValidationResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publishing failed');
    } finally {
      setPublishing(false);
    }
  };

  const getCharacterCount = () => {
    const selectedPlatform = availablePlatforms.find(p => selectedPlatforms.includes(p.id));
    if (!selectedPlatform) return null;
    
    const minLimit = Math.min(...selectedPlatforms.map(id => 
      availablePlatforms.find(p => p.id === id)?.maxChars || 280
    ));
    
    return {
      current: postText.length,
      max: minLimit,
      isOverLimit: postText.length > minLimit
    };
  };

  const connectedPlatforms = getConnectedPlatforms();
  const characterCount = getCharacterCount();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-xl">
            <Send className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create & Publish Post</h2>
        </div>

        <div className="space-y-6">
          {/* Post Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Content
            </label>
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="What's on your mind? Share your thoughts with your audience..."
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors resize-none ${
                characterCount?.isOverLimit 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-300 focus:border-indigo-500'
              }`}
              rows={6}
            />
            {characterCount && (
              <div className={`text-right text-sm mt-1 ${
                characterCount.isOverLimit ? 'text-red-600' : 'text-gray-500'
              }`}>
                {characterCount.current} / {characterCount.max} characters
                {characterCount.isOverLimit && (
                  <span className="ml-2 font-medium">Character limit exceeded!</span>
                )}
              </div>
            )}
          </div>

          {/* Media URLs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Media URLs (Optional)
              </label>
              <button
                onClick={addMediaUrl}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                + Add Media
              </button>
            </div>
            <div className="space-y-3">
              {mediaUrls.map((url, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      {url.includes('video') || url.includes('.mp4') || url.includes('.mov') ? (
                        <Video className="h-4 w-4 text-gray-400" />
                      ) : url.includes('image') || url.includes('.jpg') || url.includes('.png') ? (
                        <Image className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Link className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => updateMediaUrl(index, e.target.value)}
                      placeholder="https://example.com/media.jpg"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  {mediaUrls.length > 1 && (
                    <button
                      onClick={() => removeMediaUrl(index)}
                      className="p-2 text-red-600 hover:text-red-700 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Platforms
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {availablePlatforms.map((platform) => {
                const isConnected = connectedPlatforms.includes(platform.id);
                const isSelected = selectedPlatforms.includes(platform.id);
                
                return (
                  <button
                    key={platform.id}
                    onClick={() => {
                      if (!isConnected) return;
                      setSelectedPlatforms(prev => 
                        prev.includes(platform.id) 
                          ? prev.filter(id => id !== platform.id)
                          : [...prev, platform.id]
                      );
                    }}
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
                    {isConnected && (
                      <div className="text-xs mt-1">{platform.maxChars} chars</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scheduling */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Date (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Time (Optional)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Validation Results */}
          {validationResult && (
            <div className={`p-4 rounded-xl ${
              validationResult.status === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {validationResult.status === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <p className={`font-medium ${
                  validationResult.status === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {validationResult.status === 'success' ? 'Validation Successful!' : 'Validation Issues Found'}
                </p>
              </div>
              
              {validationResult.platforms && (
                <div className="space-y-2">
                  {Object.entries(validationResult.platforms).map(([platform, result]: [string, any]) => (
                    <div key={platform} className="flex items-center justify-between text-sm">
                      <span className="capitalize font-medium">{platform}:</span>
                      <span className={result.valid ? 'text-green-600' : 'text-red-600'}>
                        {result.valid ? '✓ Valid' : `✗ ${result.error || 'Invalid'}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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

          {/* Action Buttons */}
          <div className="flex space-x-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleValidatePost}
              disabled={validating || !postText.trim() || selectedPlatforms.length === 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {validating ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <Target className="h-5 w-5" />
                  <span>Validate Post</span>
                </>
              )}
            </button>
            
            <button
              onClick={handlePublishPost}
              disabled={publishing || !postText.trim() || selectedPlatforms.length === 0 || characterCount?.isOverLimit}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {publishing ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>{scheduleDate ? 'Schedule Post' : 'Publish Now'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Publishing Tips</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <Globe className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <p>Each platform has different character limits - we'll optimize your post for each one</p>
          </div>
          <div className="flex items-start space-x-2">
            <Users className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <p>Use hashtags strategically to increase discoverability across platforms</p>
          </div>
          <div className="flex items-start space-x-2">
            <Eye className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <p>Add engaging media to increase engagement rates by up to 650%</p>
          </div>
          <div className="flex items-start space-x-2">
            <Calendar className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <p>Schedule posts for optimal times when your audience is most active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostingPanel;