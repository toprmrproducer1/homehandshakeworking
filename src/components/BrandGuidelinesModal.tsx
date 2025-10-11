import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Trash2, Star, Palette, Users, MessageSquare, Sparkles } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useUserContext } from '../contexts/UserContext';
import {
  BrandGuideline,
  createBrandGuideline,
  getBrandGuidelines,
  updateBrandGuideline,
  deleteBrandGuideline,
  setDefaultBrandGuideline,
} from '../utils/brandGuidelines';

interface BrandGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGuideline: (guideline: BrandGuideline | null) => void;
}

const BrandGuidelinesModal: React.FC<BrandGuidelinesModalProps> = ({
  isOpen,
  onClose,
  onSelectGuideline,
}) => {
  const { user } = useUser();
  const { profileKey } = useUserContext();
  const [guidelines, setGuidelines] = useState<BrandGuideline[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    guideline_name: '',
    brand_colors: [''],
    brand_tone: '',
    target_audience: '',
    brand_values: '',
    style_preferences: '',
    is_default: false,
  });

  useEffect(() => {
    if (isOpen && profileKey && user?.id) {
      loadGuidelines();
    }
  }, [isOpen, profileKey, user?.id]);

  const loadGuidelines = async () => {
    if (!profileKey || !user?.id) return;

    try {
      setLoading(true);
      const data = await getBrandGuidelines(profileKey, user.id);
      setGuidelines(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load brand guidelines');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      guideline_name: '',
      brand_colors: [''],
      brand_tone: '',
      target_audience: '',
      brand_values: '',
      style_preferences: '',
      is_default: false,
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!profileKey || !user?.id || !formData.guideline_name.trim()) {
      setError('Please provide a name for your brand guideline');
      return;
    }

    try {
      setLoading(true);
      const colors = formData.brand_colors.filter(c => c.trim() !== '');

      if (editingId) {
        await updateBrandGuideline(editingId, {
          ...formData,
          brand_colors: colors,
        });
      } else {
        await createBrandGuideline({
          user_id: user.id,
          profile_key: profileKey,
          ...formData,
          brand_colors: colors,
        });
      }

      await loadGuidelines();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save brand guideline');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (guideline: BrandGuideline) => {
    setFormData({
      guideline_name: guideline.guideline_name,
      brand_colors: guideline.brand_colors?.length ? guideline.brand_colors : [''],
      brand_tone: guideline.brand_tone || '',
      target_audience: guideline.target_audience || '',
      brand_values: guideline.brand_values || '',
      style_preferences: guideline.style_preferences || '',
      is_default: guideline.is_default || false,
    });
    setEditingId(guideline.id!);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand guideline?')) return;

    try {
      setLoading(true);
      await deleteBrandGuideline(id);
      await loadGuidelines();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete brand guideline');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      setLoading(true);
      await setDefaultBrandGuideline(id);
      await loadGuidelines();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default guideline');
    } finally {
      setLoading(false);
    }
  };

  const addColorField = () => {
    setFormData(prev => ({
      ...prev,
      brand_colors: [...prev.brand_colors, ''],
    }));
  };

  const removeColorField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      brand_colors: prev.brand_colors.filter((_, i) => i !== index),
    }));
  };

  const updateColor = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      brand_colors: prev.brand_colors.map((c, i) => i === index ? value : c),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900/95 to-black/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-purple-500/20">
        <div className="p-6 border-b border-purple-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-purple-700 p-2 rounded-xl">
                <Palette className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Brand Guidelines</h2>
            </div>
            <button
              onClick={onClose}
              className="text-purple-400 hover:text-purple-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-300">
              {error}
            </div>
          )}

          {!isCreating && (
            <div className="space-y-4">
              <button
                onClick={() => setIsCreating(true)}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Create New Brand Guideline</span>
              </button>

              {guidelines.length > 0 ? (
                <div className="grid gap-4">
                  {guidelines.map((guideline) => (
                    <div
                      key={guideline.id}
                      className="bg-purple-900/20 rounded-xl p-6 border border-purple-500/20 hover:border-purple-400/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-bold text-white">{guideline.guideline_name}</h3>
                            {guideline.is_default && (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-semibold rounded-full flex items-center space-x-1">
                                <Star className="h-3 w-3" />
                                <span>Default</span>
                              </span>
                            )}
                          </div>
                          {guideline.brand_colors && guideline.brand_colors.length > 0 && (
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-sm text-purple-300">Colors:</span>
                              <div className="flex space-x-1">
                                {guideline.brand_colors.map((color, idx) => (
                                  <div
                                    key={idx}
                                    className="w-6 h-6 rounded border border-purple-400/30"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                          {guideline.brand_tone && (
                            <p className="text-sm text-purple-200 mb-1">
                              <span className="font-medium">Tone:</span> {guideline.brand_tone}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {!guideline.is_default && (
                            <button
                              onClick={() => handleSetDefault(guideline.id!)}
                              disabled={loading}
                              className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-colors"
                              title="Set as default"
                            >
                              <Star className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(guideline)}
                            disabled={loading}
                            className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onSelectGuideline(guideline)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                          >
                            Use This
                          </button>
                          <button
                            onClick={() => handleDelete(guideline.id!)}
                            disabled={loading}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Palette className="h-16 w-16 text-purple-500/50 mx-auto mb-4" />
                  <p className="text-purple-200">No brand guidelines yet. Create one to get started!</p>
                </div>
              )}
            </div>
          )}

          {isCreating && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Guideline Name *
                </label>
                <input
                  type="text"
                  value={formData.guideline_name}
                  onChange={(e) => setFormData({ ...formData, guideline_name: e.target.value })}
                  placeholder="e.g., Main Brand, Campaign 2024"
                  className="w-full px-4 py-3 bg-purple-900/20 border border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Brand Colors
                </label>
                <div className="space-y-2">
                  {formData.brand_colors.map((color, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => updateColor(index, e.target.value)}
                        placeholder="#000000"
                        className="flex-1 px-4 py-2 bg-purple-900/20 border border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-colors"
                      />
                      {color && (
                        <div
                          className="w-10 h-10 rounded border border-purple-400/30"
                          style={{ backgroundColor: color }}
                        />
                      )}
                      {formData.brand_colors.length > 1 && (
                        <button
                          onClick={() => removeColorField(index)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addColorField}
                    className="px-4 py-2 bg-purple-900/20 hover:bg-purple-800/30 text-purple-200 rounded-lg transition-colors flex items-center space-x-2 border border-purple-500/20"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Color</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Brand Tone / Voice
                </label>
                <input
                  type="text"
                  value={formData.brand_tone}
                  onChange={(e) => setFormData({ ...formData, brand_tone: e.target.value })}
                  placeholder="e.g., Professional, Playful, Bold"
                  className="w-full px-4 py-3 bg-purple-900/20 border border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Target Audience
                </label>
                <textarea
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  placeholder="Describe your target audience..."
                  className="w-full px-4 py-3 bg-purple-900/20 border border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-colors resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Brand Values / Messaging
                </label>
                <textarea
                  value={formData.brand_values}
                  onChange={(e) => setFormData({ ...formData, brand_values: e.target.value })}
                  placeholder="Key brand values and messaging..."
                  className="w-full px-4 py-3 bg-purple-900/20 border border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-colors resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Style Preferences
                </label>
                <input
                  type="text"
                  value={formData.style_preferences}
                  onChange={(e) => setFormData({ ...formData, style_preferences: e.target.value })}
                  placeholder="e.g., Modern, Minimalist, Vintage"
                  className="w-full px-4 py-3 bg-purple-900/20 border border-purple-500/30 rounded-xl text-white placeholder-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-colors"
                />
              </div>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="text-purple-200">Set as default guideline</span>
              </label>

              <div className="flex space-x-3 pt-4 border-t border-purple-500/20">
                <button
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 border border-purple-500/30 text-purple-200 rounded-xl hover:bg-purple-900/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || !formData.guideline_name.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{editingId ? 'Update' : 'Save'} Guideline</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandGuidelinesModal;
