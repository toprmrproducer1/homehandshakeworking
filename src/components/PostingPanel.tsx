import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Image, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  X,
  Link,
  Trash2,
  Video,
  Music,
  Eye,
  Users,
  Globe,
  Clock,
  FileText,
  Tag,
  Settings,
  Plus,
  Minus
} from 'lucide-react';
import { useUserContext } from '../contexts/UserContext';
import { validatePost, publishPost } from '../utils/ayrshare';

interface PlatformOptions {
  [key: string]: any;
}

const PostingPanel: React.FC = () => {
  const { profileKey, userProfile } = useUserContext();
  const [postContent, setPostContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>(['']);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [platformOptions, setPlatformOptions] = useState<PlatformOptions>({});
  const [validating, setValidating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [publishResult, setPublishResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const availablePlatforms = [
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'from-blue-500 to-blue-600' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-600' },
    { id: 'twitter', name: 'X/Twitter', icon: Twitter, color: 'from-sky-500 to-sky-600' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'from-red-500 to-red-600' },
    { id: 'tiktok', name: 'TikTok', icon: X, color: 'from-gray-800 to-black' },
  ];

  const getConnectedPlatforms = () => {
    if (!userProfile?.displayNames) return [];
    
    const connectedPlatformIds = userProfile.displayNames
      .map((account: any) => {
        const platform = account.platform.toLowerCase();
        // Map x/twitter variations to twitter
        if (platform === 'x/twitter' || platform === 'x') return 'twitter';
        return platform;
      })
      .filter((platform: string) => availablePlatforms.some(p => p.id === platform));
    
    return availablePlatforms.filter(platform => 
      connectedPlatformIds.includes(platform.id)
    );
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => {
      const newPlatforms = prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId];
      
      // Initialize platform options for newly selected platforms
      if (!prev.includes(platformId)) {
        setPlatformOptions(prevOptions => ({
          ...prevOptions,
          [platformId]: getDefaultOptionsForPlatform(platformId)
        }));
      }
      
      return newPlatforms;
    });
    
    // Reset validation when platforms change
    setValidationResult(null);
    setPublishResult(null);
  };

  const getDefaultOptionsForPlatform = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return {
          title: '',
          visibility: 'private',
          shorts: false,
          thumbNail: '',
          tags: [],
          madeForKids: false,
          notifySubscribers: true
        };
      case 'tiktok':
        return {
          disableComments: false,
          disableDuet: false,
          disableStitch: false,
          draft: false,
          visibility: 'public',
          autoAddMusic: false,
          isAIGenerated: false,
          isBrandedContent: false,
          isBrandOrganic: false
        };
      case 'twitter':
        return {
          altText: [],
          longPost: false,
          thread: false,
          threadNumber: false,
          replySettings: '',
          subscribersOnly: false
        };
      case 'facebook':
        return {
          reels: false,
          stories: false,
          title: '',
          thumbNail: '',
          altText: [],
          targeting: {
            ageMin: '',
            countries: []
          }
        };
      case 'instagram':
        return {
          reels: false,
          stories: false,
          altText: []
        };
      default:
        return {};
    }
  };

  const updatePlatformOption = (platform: string, key: string, value: any) => {
    setPlatformOptions(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [key]: value
      }
    }));
    // Reset validation when options change
    setValidationResult(null);
    setPublishResult(null);
  };

  const addMediaUrl = () => {
    setMediaUrls([...mediaUrls, '']);
  };

  const updateMediaUrl = (index: number, url: string) => {
    const newUrls = [...mediaUrls];
    newUrls[index] = url;
    setMediaUrls(newUrls);
    setValidationResult(null);
    setPublishResult(null);
  };

  const removeMediaUrl = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
    setValidationResult(null);
    setPublishResult(null);
  };

  const addTag = (platform: string) => {
    const currentTags = platformOptions[platform]?.tags || [];
    updatePlatformOption(platform, 'tags', [...currentTags, '']);
  };

  const updateTag = (platform: string, index: number, value: string) => {
    const currentTags = [...(platformOptions[platform]?.tags || [])];
    currentTags[index] = value;
    updatePlatformOption(platform, 'tags', currentTags);
  };

  const removeTag = (platform: string, index: number) => {
    const currentTags = platformOptions[platform]?.tags || [];
    updatePlatformOption(platform, 'tags', currentTags.filter((_: any, i: number) => i !== index));
  };

  const addAltText = (platform: string) => {
    const currentAltText = platformOptions[platform]?.altText || [];
    updatePlatformOption(platform, 'altText', [...currentAltText, '']);
  };

  const updateAltText = (platform: string, index: number, value: string) => {
    const currentAltText = [...(platformOptions[platform]?.altText || [])];
    currentAltText[index] = value;
    updatePlatformOption(platform, 'altText', currentAltText);
  };

  const removeAltText = (platform: string, index: number) => {
    const currentAltText = platformOptions[platform]?.altText || [];
    updatePlatformOption(platform, 'altText', currentAltText.filter((_: any, i: number) => i !== index));
  };

  const handleValidate = async () => {
    if (!profileKey || !postContent.trim() || selectedPlatforms.length === 0) {
      setError('Please enter post content and select at least one platform');
      return;
    }

    // Validate YouTube requirements
    if (selectedPlatforms.includes('youtube') && !platformOptions.youtube?.title?.trim()) {
      setError('YouTube posts require a title');
      return;
    }

    setValidating(true);
    setError(null);
    setValidationResult(null);
    setPublishResult(null);

    try {
      const filteredMediaUrls = mediaUrls.filter(url => url.trim() !== '');
      const result = await validatePost(
        profileKey, 
        postContent, 
        selectedPlatforms,
        filteredMediaUrls.length > 0 ? filteredMediaUrls : undefined
      );
      setValidationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate post');
    } finally {
      setValidating(false);
    }
  };

  const buildPostPayload = () => {
    const filteredMediaUrls = mediaUrls.filter(url => url.trim() !== '');
    const payload: any = {
      post: postContent,
      platforms: selectedPlatforms,
      ...(filteredMediaUrls.length > 0 && { mediaUrls: filteredMediaUrls })
    };

    // Add platform-specific options
    selectedPlatforms.forEach(platform => {
      const options = platformOptions[platform];
      if (!options) return;

      switch (platform) {
        case 'youtube':
          if (options.title) {
            payload.youTubeOptions = {
              title: options.title,
              visibility: options.visibility || 'private',
              shorts: options.shorts || false,
              madeForKids: options.madeForKids || false,
              notifySubscribers: options.notifySubscribers !== false,
              ...(options.thumbNail && { thumbNail: options.thumbNail }),
              ...(options.tags && options.tags.length > 0 && { 
                tags: options.tags.filter((tag: string) => tag.trim() !== '') 
              })
            };
          }
          break;

        case 'tiktok':
          payload.tikTokOptions = {
            disableComments: options.disableComments || false,
            disableDuet: options.disableDuet || false,
            disableStitch: options.disableStitch || false,
            draft: options.draft || false,
            visibility: options.visibility || 'public',
            autoAddMusic: options.autoAddMusic || false,
            isAIGenerated: options.isAIGenerated || false,
            isBrandedContent: options.isBrandedContent || false,
            isBrandOrganic: options.isBrandOrganic || false
          };
          break;

        case 'twitter':
          const twitterOptions: any = {};
          if (options.altText && options.altText.length > 0) {
            twitterOptions.altText = options.altText.filter((text: string) => text.trim() !== '');
          }
          if (options.longPost) twitterOptions.longPost = true;
          if (options.thread) {
            twitterOptions.thread = true;
            if (options.threadNumber) twitterOptions.threadNumber = true;
          }
          if (options.replySettings) twitterOptions.replySettings = options.replySettings;
          if (options.subscribersOnly) twitterOptions.subscribersOnly = true;
          
          if (Object.keys(twitterOptions).length > 0) {
            payload.twitterOptions = twitterOptions;
          }
          break;

        case 'facebook':
          const facebookOptions: any = {};
          if (options.reels) facebookOptions.reels = true;
          if (options.stories) facebookOptions.stories = true;
          if (options.title) facebookOptions.title = options.title;
          if (options.thumbNail) facebookOptions.thumbNail = options.thumbNail;
          if (options.altText && options.altText.length > 0) {
            facebookOptions.altText = options.altText.filter((text: string) => text.trim() !== '');
          }
          if (options.targeting && (options.targeting.ageMin || options.targeting.countries.length > 0)) {
            facebookOptions.targeting = {};
            if (options.targeting.ageMin) facebookOptions.targeting.ageMin = parseInt(options.targeting.ageMin);
            if (options.targeting.countries.length > 0) facebookOptions.targeting.countries = options.targeting.countries;
          }
          
          if (Object.keys(facebookOptions).length > 0) {
            payload.faceBookOptions = facebookOptions;
          }
          break;

        case 'instagram':
          const instagramOptions: any = {};
          if (options.reels) instagramOptions.reels = true;
          if (options.stories) instagramOptions.stories = true;
          if (options.altText && options.altText.length > 0) {
            instagramOptions.altText = options.altText.filter((text: string) => text.trim() !== '');
          }
          
          if (Object.keys(instagramOptions).length > 0) {
            payload.instagramOptions = instagramOptions;
          }
          break;
      }
    });

    return payload;
  };

  const handlePublish = async () => {
    if (!profileKey || !postContent.trim() || selectedPlatforms.length === 0) {
      setError('Please enter post content and select at least one platform');
      return;
    }

    if (!validationResult || validationResult.status !== 'success') {
      setError('Please validate the post first');
      return;
    }

    setPublishing(true);
    setError(null);
    setPublishResult(null);

    try {
      const payload = buildPostPayload();
      const result = await publishPost(
        profileKey, 
        payload.post, 
        payload.platforms,
        payload.mediaUrls,
        payload
      );
      setPublishResult(result);
      
      if (result.status === 'success') {
        // Reset form on successful publish
        setPostContent('');
        setMediaUrls(['']);
        setSelectedPlatforms([]);
        setPlatformOptions({});
        setValidationResult(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish post');
    } finally {
      setPublishing(false);
    }
  };

  // Reset validation when content changes
  useEffect(() => {
    setValidationResult(null);
    setPublishResult(null);
  }, [postContent]);

  const connectedPlatforms = getConnectedPlatforms();
  const isValidated = validationResult?.status === 'success';
  const canPublish = isValidated && !validating && !publishing;

  const renderPlatformOptions = (platform: string) => {
    const options = platformOptions[platform] || {};

    switch (platform) {
      case 'youtube':
        return (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl space-y-4">
            <h4 className="font-semibold text-red-900 flex items-center space-x-2">
              <Youtube className="h-5 w-5" />
              <span>YouTube Options</span>
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video Title (Required) *
              </label>
              <input
                type="text"
                value={options.title || ''}
                onChange={(e) => updatePlatformOption(platform, 'title', e.target.value)}
                placeholder="Enter video title (max 100 characters)"
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <div className="text-xs text-gray-500 mt-1">{(options.title || '').length}/100 characters</div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                <select
                  value={options.visibility || 'private'}
                  onChange={(e) => updatePlatformOption(platform, 'visibility', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  value={options.thumbNail || ''}
                  onChange={(e) => updatePlatformOption(platform, 'thumbNail', e.target.value)}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.shorts || false}
                  onChange={(e) => updatePlatformOption(platform, 'shorts', e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">YouTube Shorts</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.madeForKids || false}
                  onChange={(e) => updatePlatformOption(platform, 'madeForKids', e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">Made for Kids</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.notifySubscribers !== false}
                  onChange={(e) => updatePlatformOption(platform, 'notifySubscribers', e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">Notify Subscribers</span>
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Tags</label>
                <button
                  type="button"
                  onClick={() => addTag(platform)}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Tag</span>
                </button>
              </div>
              <div className="space-y-2">
                {(options.tags || []).map((tag: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => updateTag(platform, index, e.target.value)}
                      placeholder="Enter tag"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeTag(platform, index)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'tiktok':
        return (
          <div className="mt-4 p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
              <X className="h-5 w-5" />
              <span>TikTok Options</span>
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                <select
                  value={options.visibility || 'public'}
                  onChange={(e) => updatePlatformOption(platform, 'visibility', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="followers">Followers Only</option>
                  <option value="friends">Friends Only</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options.disableComments || false}
                    onChange={(e) => updatePlatformOption(platform, 'disableComments', e.target.checked)}
                    className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <span className="text-sm text-gray-700">Disable Comments</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options.disableDuet || false}
                    onChange={(e) => updatePlatformOption(platform, 'disableDuet', e.target.checked)}
                    className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <span className="text-sm text-gray-700">Disable Duet</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options.disableStitch || false}
                    onChange={(e) => updatePlatformOption(platform, 'disableStitch', e.target.checked)}
                    className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <span className="text-sm text-gray-700">Disable Stitch</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options.draft || false}
                    onChange={(e) => updatePlatformOption(platform, 'draft', e.target.checked)}
                    className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <span className="text-sm text-gray-700">Save as Draft</span>
                </label>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options.autoAddMusic || false}
                    onChange={(e) => updatePlatformOption(platform, 'autoAddMusic', e.target.checked)}
                    className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <span className="text-sm text-gray-700">Auto Add Music</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options.isAIGenerated || false}
                    onChange={(e) => updatePlatformOption(platform, 'isAIGenerated', e.target.checked)}
                    className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <span className="text-sm text-gray-700">AI Generated Content</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options.isBrandedContent || false}
                    onChange={(e) => updatePlatformOption(platform, 'isBrandedContent', e.target.checked)}
                    className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <span className="text-sm text-gray-700">Branded Content</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options.isBrandOrganic || false}
                    onChange={(e) => updatePlatformOption(platform, 'isBrandOrganic', e.target.checked)}
                    className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  />
                  <span className="text-sm text-gray-700">Brand Organic Content</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'twitter':
        return (
          <div className="mt-4 p-4 bg-sky-50 border border-sky-200 rounded-xl space-y-4">
            <h4 className="font-semibold text-sky-900 flex items-center space-x-2">
              <Twitter className="h-5 w-5" />
              <span>X/Twitter Options</span>
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reply Settings</label>
                <select
                  value={options.replySettings || ''}
                  onChange={(e) => updatePlatformOption(platform, 'replySettings', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="">Everyone can reply</option>
                  <option value="following">Following only</option>
                  <option value="mentioned">Mentioned users only</option>
                  <option value="subscribers">Subscribers only</option>
                  <option value="verified">Verified users only</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.longPost || false}
                  onChange={(e) => updatePlatformOption(platform, 'longPost', e.target.checked)}
                  className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-sm text-gray-700">Long Post (Premium)</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.thread || false}
                  onChange={(e) => updatePlatformOption(platform, 'thread', e.target.checked)}
                  className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-sm text-gray-700">Create Thread</span>
              </label>

              {options.thread && (
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={options.threadNumber || false}
                    onChange={(e) => updatePlatformOption(platform, 'threadNumber', e.target.checked)}
                    className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-sm text-gray-700">Number Threads</span>
                </label>
              )}

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.subscribersOnly || false}
                  onChange={(e) => updatePlatformOption(platform, 'subscribersOnly', e.target.checked)}
                  className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-sm text-gray-700">Subscribers Only</span>
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Alt Text for Images</label>
                <button
                  type="button"
                  onClick={() => addAltText(platform)}
                  className="text-sm text-sky-600 hover:text-sky-700 flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Alt Text</span>
                </button>
              </div>
              <div className="space-y-2">
                {(options.altText || []).map((text: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => updateAltText(platform, index, e.target.value)}
                      placeholder="Alt text for accessibility (max 1000 chars)"
                      maxLength={1000}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeAltText(platform, index)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'facebook':
        return (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-4">
            <h4 className="font-semibold text-blue-900 flex items-center space-x-2">
              <Facebook className="h-5 w-5" />
              <span>Facebook Options</span>
            </h4>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
                <input
                  type="text"
                  value={options.title || ''}
                  onChange={(e) => updatePlatformOption(platform, 'title', e.target.value)}
                  placeholder="Enter video title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video Thumbnail</label>
                <input
                  type="url"
                  value={options.thumbNail || ''}
                  onChange={(e) => updatePlatformOption(platform, 'thumbNail', e.target.value)}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.reels || false}
                  onChange={(e) => updatePlatformOption(platform, 'reels', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Post as Reels</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.stories || false}
                  onChange={(e) => updatePlatformOption(platform, 'stories', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Post as Stories</span>
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Alt Text for Images</label>
                <button
                  type="button"
                  onClick={() => addAltText(platform)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Alt Text</span>
                </button>
              </div>
              <div className="space-y-2">
                {(options.altText || []).map((text: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => updateAltText(platform, index, e.target.value)}
                      placeholder="Alt text for accessibility"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeAltText(platform, index)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">Audience Targeting</h5>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Minimum Age</label>
                  <select
                    value={options.targeting?.ageMin || ''}
                    onChange={(e) => updatePlatformOption(platform, 'targeting', {
                      ...options.targeting,
                      ageMin: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">No restriction</option>
                    <option value="13">13+</option>
                    <option value="15">15+</option>
                    <option value="18">18+</option>
                    <option value="21">21+</option>
                    <option value="25">25+</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'instagram':
        return (
          <div className="mt-4 p-4 bg-pink-50 border border-pink-200 rounded-xl space-y-4">
            <h4 className="font-semibold text-pink-900 flex items-center space-x-2">
              <Instagram className="h-5 w-5" />
              <span>Instagram Options</span>
            </h4>
            
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.reels || false}
                  onChange={(e) => updatePlatformOption(platform, 'reels', e.target.checked)}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">Post as Reels</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.stories || false}
                  onChange={(e) => updatePlatformOption(platform, 'stories', e.target.checked)}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">Post as Stories</span>
              </label>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Alt Text for Images</label>
                <button
                  type="button"
                  onClick={() => addAltText(platform)}
                  className="text-sm text-pink-600 hover:text-pink-700 flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Alt Text</span>
                </button>
              </div>
              <div className="space-y-2">
                {(options.altText || []).map((text: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => updateAltText(platform, index, e.target.value)}
                      placeholder="Alt text for accessibility"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeAltText(platform, index)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getCharacterLimit = (platform: string) => {
    switch (platform) {
      case 'twitter': return 280;
      case 'tiktok': return 2200;
      case 'facebook': return 63206;
      case 'instagram': return 2200;
      case 'youtube': return 5000;
      default: return null;
    }
  };

  const getCharacterLimitWarning = () => {
    if (!selectedPlatforms.length) return null;
    
    const limits = selectedPlatforms.map(platform => ({
      platform,
      limit: getCharacterLimit(platform),
      name: availablePlatforms.find(p => p.id === platform)?.name
    })).filter(p => p.limit);

    const minLimit = Math.min(...limits.map(p => p.limit!));
    const exceedsLimit = postContent.length > minLimit;

    if (exceedsLimit) {
      const problematicPlatforms = limits.filter(p => postContent.length > p.limit!);
      return (
        <div className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 inline mr-2" />
          Content exceeds character limit for: {problematicPlatforms.map(p => p.name).join(', ')}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 shadow-lg p-8 backdrop-blur-xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-2 rounded-xl">
            <Send className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Create & Publish Post</h2>
        </div>

        <div className="space-y-6">
          {/* Post Content */}
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">
              Post Content
            </label>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              className="w-full px-4 py-3 bg-purple-900/20 border border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-colors resize-none"
            />
            <div className="flex justify-between items-center mt-1">
              <div className="text-sm text-purple-300">
                {postContent.length} characters
              </div>
              {getCharacterLimitWarning()}
            </div>
          </div>

          {/* Media URLs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-purple-200">
                Media URLs (Optional)
              </label>
              <button
                type="button"
                onClick={addMediaUrl}
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center space-x-1"
              >
                <Image className="h-4 w-4" />
                <span>Add Media</span>
              </button>
            </div>
            <div className="space-y-3">
              {mediaUrls.map((url, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => updateMediaUrl(index, e.target.value)}
                      placeholder="https://example.com/image.jpg or video.mp4"
                      className="w-full pl-10 pr-4 py-2 bg-purple-900/20 border border-purple-500/30 rounded-lg text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-colors"
                    />
                  </div>
                  {mediaUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMediaUrl(index)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-3">
              Select Platforms
            </label>
            {connectedPlatforms.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {connectedPlatforms.map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = selectedPlatforms.includes(platform.id);
                    
                    return (
                      <div key={platform.id} className="space-y-2">
                        <button
                          type="button"
                          onClick={() => handlePlatformToggle(platform.id)}
                          className={`w-full p-4 rounded-xl text-sm font-medium transition-all duration-200 flex flex-col items-center space-y-2 ${
                            isSelected
                              ? `bg-gradient-to-r ${platform.color} text-white shadow-lg transform scale-105`
                              : 'bg-purple-900/20 text-purple-200 hover:bg-purple-800/30 border border-purple-500/20'
                          }`}
                        >
                          <Icon className="h-6 w-6" />
                          <span>{platform.name}</span>
                        </button>
                        
                        {/* Platform-specific options */}
                        {isSelected && renderPlatformOptions(platform.id)}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-purple-900/10 rounded-xl border-2 border-dashed border-purple-500/30">
                <Send className="h-12 w-12 text-purple-500/50 mx-auto mb-4" />
                <p className="text-gray-400">No connected platforms found. Please connect your social accounts first.</p>
              </div>
            )}
          </div>

          {/* Validation & Publishing */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={handleValidate}
              disabled={validating || !postContent.trim() || selectedPlatforms.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {validating ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Validate Post</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePublish}
              disabled={!canPublish}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {publishing ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Publish Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {(error || validationResult || publishResult) && (
        <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 shadow-lg p-8 backdrop-blur-xl">
          <h3 className="text-xl font-semibold text-white mb-6">Results</h3>
          
          {/* Error */}
          {error && (
            <div className="flex items-center space-x-3 p-4 bg-red-900/20 border border-red-500/30 rounded-xl mb-4">
              <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-300">Error</h4>
                <p className="text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Validation Result */}
          {validationResult && (
            <div className={`flex items-center space-x-3 p-4 rounded-xl mb-4 ${
              validationResult.status === 'success'
                ? 'bg-green-900/20 border border-green-500/30'
                : 'bg-red-900/20 border border-red-500/30'
            }`}>
              {validationResult.status === 'success' ? (
                <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
              )}
              <div>
                <h4 className={`font-semibold ${
                  validationResult.status === 'success' ? 'text-green-300' : 'text-red-300'
                }`}>
                  Validation {validationResult.status === 'success' ? 'Passed' : 'Failed'}
                </h4>
                <p className={validationResult.status === 'success' ? 'text-green-300' : 'text-red-300'}>
                  {validationResult.message}
                </p>
              </div>
            </div>
          )}

          {/* Publish Result */}
          {publishResult && (
            <div className={`p-4 rounded-xl ${
              publishResult.status === 'success'
                ? 'bg-green-900/20 border border-green-500/30'
                : 'bg-red-900/20 border border-red-500/30'
            }`}>
              <div className="flex items-center space-x-3 mb-4">
                {publishResult.status === 'success' ? (
                  <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
                )}
                <div>
                  <h4 className={`font-semibold ${
                    publishResult.status === 'success' ? 'text-green-300' : 'text-red-300'
                  }`}>
                    Post {publishResult.status === 'success' ? 'Published Successfully' : 'Failed to Publish'}
                  </h4>
                  {publishResult.id && (
                    <p className={publishResult.status === 'success' ? 'text-green-300' : 'text-red-300'}>
                      Post ID: {publishResult.id}
                    </p>
                  )}
                </div>
              </div>

              {/* Platform Results */}
              {publishResult.postIds && publishResult.postIds.length > 0 && (
                <div className="space-y-3">
                  <h5 className="font-medium text-white">Platform Results:</h5>
                  <div className="grid gap-3">
                    {publishResult.postIds.map((result: any, index: number) => (
                      <div key={index} className={`p-3 rounded-lg border ${
                        result.status === 'success'
                          ? 'bg-green-900/20 border-green-500/30'
                          : 'bg-red-900/20 border-red-500/30'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {result.status === 'success' ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-400" />
                            )}
                            <span className="font-medium capitalize text-white">{result.platform}</span>
                            {result.id && result.id !== 'pending' && (
                              <span className="text-xs text-purple-300">ID: {result.id}</span>
                            )}
                            {result.id === 'pending' && (
                              <span className="text-xs text-yellow-600 flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>Processing</span>
                              </span>
                            )}
                          </div>
                          {result.postUrl && (
                            <a
                              href={result.postUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                            >
                              <span>View Post</span>
                              <Link className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        {result.message && (
                          <p className="text-sm text-purple-200 mt-1">{result.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {publishResult.errors && publishResult.errors.length > 0 && (
                <div className="space-y-3 mt-4">
                  <h5 className="font-medium text-red-300">Errors:</h5>
                  <div className="space-y-2">
                    {publishResult.errors.map((error: any, index: number) => (
                      <div key={index} className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <AlertCircle className="h-4 w-4 text-red-400" />
                          <span className="font-medium text-red-300 capitalize">{error.platform}</span>
                        </div>
                        <p className="text-sm text-red-300">{error.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostingPanel;