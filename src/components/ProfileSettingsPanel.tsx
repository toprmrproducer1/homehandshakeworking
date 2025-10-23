import React, { useState } from 'react';
import { User, Building, Image as ImageIcon, Save, Upload, Mail, Phone, Globe, MapPin } from 'lucide-react';

const ProfileSettingsPanel: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [brandColors, setBrandColors] = useState(['#8B5CF6', '#7C3AED', '#6D28D9']);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent flex items-center gap-3">
            <User className="h-8 w-8 text-purple-400" />
            Profile Settings
          </h1>
          <p className="text-gray-400 mt-2">Manage your company details and brand assets</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-200 shadow-lg shadow-purple-500/50"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 p-6 backdrop-blur-xl">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-2">
                <Building className="h-5 w-5 text-purple-400" />
                Company Information
              </h3>
              <p className="text-sm text-gray-400">Update your company details and contact information</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter your company name"
                  className="w-full px-4 py-3 bg-purple-900/10 border border-purple-500/20 rounded-lg focus:outline-none focus:border-purple-500/50 text-white placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="company@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-purple-900/10 border border-purple-500/20 rounded-lg focus:outline-none focus:border-purple-500/50 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-11 pr-4 py-3 bg-purple-900/10 border border-purple-500/20 rounded-lg focus:outline-none focus:border-purple-500/50 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full pl-11 pr-4 py-3 bg-purple-900/10 border border-purple-500/20 rounded-lg focus:outline-none focus:border-purple-500/50 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="w-full pl-11 pr-4 py-3 bg-purple-900/10 border border-purple-500/20 rounded-lg focus:outline-none focus:border-purple-500/50 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Company Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about your company..."
                  rows={4}
                  className="w-full px-4 py-3 bg-purple-900/10 border border-purple-500/20 rounded-lg focus:outline-none focus:border-purple-500/50 text-white placeholder:text-gray-500 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 p-6 backdrop-blur-xl">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-2">
                <ImageIcon className="h-5 w-5 text-purple-400" />
                Brand Colors
              </h3>
              <p className="text-sm text-gray-400">Define your brand color palette</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {brandColors.map((color, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Color {index + 1}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newColors = [...brandColors];
                        newColors[index] = e.target.value;
                        setBrandColors(newColors);
                      }}
                      className="w-16 h-12 rounded-lg cursor-pointer border border-purple-500/20"
                    />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => {
                        const newColors = [...brandColors];
                        newColors[index] = e.target.value;
                        setBrandColors(newColors);
                      }}
                      className="flex-1 px-3 py-2 bg-purple-900/10 border border-purple-500/20 rounded-lg focus:outline-none focus:border-purple-500/50 text-white text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 p-6 backdrop-blur-xl">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-2">
                <ImageIcon className="h-5 w-5 text-purple-400" />
                Company Logo
              </h3>
              <p className="text-sm text-gray-400">Upload your company logo</p>
            </div>
            <div className="space-y-4">
              <div className="aspect-square bg-purple-900/10 border-2 border-dashed border-purple-500/20 rounded-lg flex items-center justify-center overflow-hidden">
                {logo ? (
                  <img src={logo} alt="Company Logo" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center p-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No logo uploaded</p>
                  </div>
                )}
              </div>
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <div className="cursor-pointer px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-center font-medium transition-colors text-white">
                  <Upload className="h-4 w-4 inline mr-2" />
                  Upload Logo
                </div>
              </label>
              <p className="text-xs text-gray-400">
                Recommended: Square image, at least 512x512px, PNG or JPG format
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-2xl border border-purple-500/20 p-6 backdrop-blur-xl">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-2">
                <ImageIcon className="h-5 w-5 text-purple-400" />
                Brand Assets
              </h3>
              <p className="text-sm text-gray-400">Additional brand images</p>
            </div>
            <div className="space-y-3">
              <label className="block">
                <input type="file" accept="image/*" multiple className="hidden" />
                <div className="cursor-pointer px-4 py-3 bg-purple-900/10 border border-purple-500/20 hover:border-purple-500/50 rounded-lg text-center text-sm text-gray-300 transition-colors">
                  <Upload className="h-4 w-4 inline mr-2" />
                  Upload Brand Images
                </div>
              </label>
              <p className="text-xs text-gray-400">
                Upload product images, team photos, or other brand materials
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPanel;
