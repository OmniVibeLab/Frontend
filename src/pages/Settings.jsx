import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, LogOut, Trash2, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import authService from '../services/authService';

function Settings() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: true,
    showEmail: false,
    allowMessages: true,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-700">
        <div className="flex items-center mb-4">
          <SettingsIcon size={24} className="text-blue-400 mr-3" />
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>
        <p className="text-gray-300">Manage your account preferences and privacy settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Settings */}
        <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-700">
          <div className="flex items-center mb-4">
            <User size={20} className="text-blue-400 mr-2" />
            <h2 className="text-lg font-semibold text-white">Account</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={user?.fullName || "Your display name"}
                defaultValue={user?.fullName || ""}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={user?.username || "Your username"}
                defaultValue={user?.username || ""}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={user?.email || "Your email"}
                defaultValue={user?.email || ""}
                disabled
              />
            </div>
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium">
              Update Profile
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-700">
          <div className="flex items-center mb-4">
            <Bell size={20} className="text-yellow-400 mr-2" />
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-gray-300 capitalize">{key} Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-700">
          <div className="flex items-center mb-4">
            <Shield size={20} className="text-green-400 mr-2" />
            <h2 className="text-lg font-semibold text-white">Privacy</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(privacy).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-gray-300">
                  {key === 'profilePublic' && 'Public Profile'}
                  {key === 'showEmail' && 'Show Email'}
                  {key === 'allowMessages' && 'Allow Messages'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setPrivacy(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-700">
          <div className="flex items-center mb-4">
            <Palette size={20} className="text-purple-400 mr-2" />
            <h2 className="text-lg font-semibold text-white">Appearance</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
              <select className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
              <select className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            <div className="flex items-center">
              <Save size={18} className="mr-2" />
              Save Settings
            </div>
          )}
        </button>
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center"
        >
          <LogOut size={18} className="mr-2" />
          Logout
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 rounded-2xl shadow-2xl p-6 border border-red-500/30">
        <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center">
          <Trash2 size={20} className="mr-2" />
          Danger Zone
        </h2>
        <div className="space-y-3">
          <button className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium">
            Delete Account
          </button>
          <p className="text-sm text-gray-400">This action cannot be undone. This will permanently delete your account and remove your data from our servers.</p>
        </div>
      </div>
    </div>
  );
}

export default Settings;