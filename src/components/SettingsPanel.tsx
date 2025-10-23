import React, { useState } from 'react';
import {
  Settings,
  User,
  Bell,
  Lock,
  CreditCard,
  Globe,
  Moon,
  Sun,
  Mail,
  Shield,
  Key,
  Trash2,
  Save,
  RefreshCw
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useTheme } from '../contexts/ThemeContext';

const SettingsPanel: React.FC = () => {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    posts: true,
    analytics: true
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-black rounded-2xl border border-purple-200 dark:border-purple-500/20 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-purple-700 dark:from-white dark:to-purple-200 bg-clip-text text-transparent">
              Settings
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and settings</p>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-black rounded-2xl border border-purple-200 dark:border-purple-500/20 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200">Account Information</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Email Address</label>
            <div className="flex items-center gap-3">
              <input
                type="email"
                value={user?.primaryEmailAddress?.emailAddress || ''}
                disabled
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-purple-900/20 border border-gray-300 dark:border-purple-500/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-400"
              />
              <button className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Verify</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Full Name</label>
            <input
              type="text"
              value={user?.fullName || ''}
              disabled
              className="w-full px-4 py-3 bg-gray-100 dark:bg-purple-900/20 border border-gray-300 dark:border-purple-500/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Username</label>
            <input
              type="text"
              value={user?.username || 'Not set'}
              disabled
              className="w-full px-4 py-3 bg-gray-100 dark:bg-purple-900/20 border border-gray-300 dark:border-purple-500/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-black rounded-2xl border border-purple-200 dark:border-purple-500/20 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200">Notifications</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-500/20">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Email Notifications</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Receive updates via email</div>
            </div>
            <button
              onClick={() => setNotifications({...notifications, email: !notifications.email})}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications.email ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notifications.email ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-500/20">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Push Notifications</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Receive browser notifications</div>
            </div>
            <button
              onClick={() => setNotifications({...notifications, push: !notifications.push})}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications.push ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notifications.push ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-500/20">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Post Updates</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Get notified about post performance</div>
            </div>
            <button
              onClick={() => setNotifications({...notifications, posts: !notifications.posts})}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications.posts ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notifications.posts ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-500/20">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Analytics Reports</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Weekly analytics summary</div>
            </div>
            <button
              onClick={() => setNotifications({...notifications, analytics: !notifications.analytics})}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications.analytics ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notifications.analytics ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-black rounded-2xl border border-purple-200 dark:border-purple-500/20 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <Sun className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200">Appearance</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`p-4 rounded-lg border transition-all ${
                  theme === 'light'
                    ? 'border-purple-500 bg-purple-600/20'
                    : 'border-purple-300 dark:border-purple-500/20 bg-purple-100/50 dark:bg-purple-900/10 hover:bg-purple-200/50 dark:hover:bg-purple-800/20'
                }`}
              >
                <Sun className="h-6 w-6 text-gray-900 dark:text-white mx-auto mb-2" />
                <div className="text-sm text-gray-900 dark:text-white">Light</div>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-lg border transition-all ${
                  theme === 'dark'
                    ? 'border-purple-500 bg-purple-600/20'
                    : 'border-purple-300 dark:border-purple-500/20 bg-purple-100/50 dark:bg-purple-900/10 hover:bg-purple-200/50 dark:hover:bg-purple-800/20'
                }`}
              >
                <Moon className="h-6 w-6 text-gray-900 dark:text-white mx-auto mb-2" />
                <div className="text-sm text-gray-900 dark:text-white">Dark</div>
              </button>
              <button
                onClick={() => setTheme('auto')}
                className={`p-4 rounded-lg border transition-all ${
                  theme === 'auto'
                    ? 'border-purple-500 bg-purple-600/20'
                    : 'border-purple-300 dark:border-purple-500/20 bg-purple-100/50 dark:bg-purple-900/10 hover:bg-purple-200/50 dark:hover:bg-purple-800/20'
                }`}
              >
                <Globe className="h-6 w-6 text-gray-900 dark:text-white mx-auto mb-2" />
                <div className="text-sm text-gray-900 dark:text-white">Auto</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-black rounded-2xl border border-purple-200 dark:border-purple-500/20 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-200">Security</h3>
        </div>

        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-500/20 hover:bg-purple-100 dark:hover:bg-purple-800/20 transition-colors">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-white">Change Password</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Update your password</div>
              </div>
            </div>
            <RefreshCw className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-500/20 hover:bg-purple-100 dark:hover:bg-purple-800/20 transition-colors">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</div>
              </div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-500">Not enabled</span>
          </button>

          <button className="w-full flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-500/20 hover:bg-purple-100 dark:hover:bg-purple-800/20 transition-colors">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-white">Connected Sessions</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Manage active sessions</div>
              </div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">1 active</span>
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-gradient-to-br from-red-900/20 to-black rounded-2xl border border-red-500/20 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <Trash2 className="h-5 w-5 text-red-400" />
          <h3 className="text-lg font-semibold text-red-200">Danger Zone</h3>
        </div>

        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 bg-red-900/10 rounded-lg border border-red-500/20 hover:bg-red-800/20 transition-colors">
            <div className="text-left">
              <div className="font-medium text-red-300">Delete Account</div>
              <div className="text-sm text-gray-400">Permanently delete your account and all data</div>
            </div>
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3">
        <button className="px-6 py-3 border border-purple-300 dark:border-purple-500/30 text-purple-700 dark:text-purple-200 rounded-lg hover:bg-purple-100/50 dark:hover:bg-purple-900/20 transition-colors">
          Cancel
        </button>
        <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all flex items-center gap-2">
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
