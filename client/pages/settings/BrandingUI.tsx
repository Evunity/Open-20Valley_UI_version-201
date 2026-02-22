import React, { useState } from 'react';
import { Save, RotateCcw, Palette, Upload } from 'lucide-react';

interface BrandingConfig {
  platformName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl: string;
  faviconUrl: string;
  loginBgColor: string;
  theme: 'light' | 'dark' | 'auto';
  showFooterBranding: boolean;
  customCSS: string;
}

export default function BrandingUI() {
  const [branding, setBranding] = useState<BrandingConfig>({
    platformName: 'OSS Platform',
    tagline: 'Intelligent Network & Automation Management',
    primaryColor: '#2563eb',
    secondaryColor: '#7c3aed',
    accentColor: '#dc2626',
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.ico',
    loginBgColor: '#ffffff',
    theme: 'light',
    showFooterBranding: true,
    customCSS: ''
  });

  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const handleConfigChange = (field: keyof BrandingConfig, value: any) => {
    setBranding(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    setSavedStatus('Branding settings saved successfully');
    setTimeout(() => setSavedStatus(null), 3000);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Palette className="w-6 h-6 text-blue-600" />
          Branding & UI Customization
        </h2>
        <p className="text-gray-500 text-sm mt-1">Customize platform appearance, colors, and branding</p>
      </div>

      {/* Preview Card */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <div
          className="h-40 w-full flex items-center justify-center"
          style={{ backgroundColor: branding.loginBgColor }}
        >
          <div className="text-center">
            <div
              className="w-12 h-12 rounded-lg mx-auto mb-3"
              style={{ backgroundColor: branding.primaryColor }}
            ></div>
            <h3 className="text-xl font-bold text-gray-900">{branding.platformName}</h3>
            <p className="text-sm text-gray-600 mt-1">{branding.tagline}</p>
          </div>
        </div>
      </div>

      {/* Platform Identity */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Platform Identity</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Platform Name</label>
            <input
              type="text"
              value={branding.platformName}
              onChange={(e) => handleConfigChange('platformName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., OSS Platform"
            />
            <p className="text-xs text-gray-500 mt-1">Displayed in browser title, header, and login page</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tagline</label>
            <input
              type="text"
              value={branding.tagline}
              onChange={(e) => handleConfigChange('tagline', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Intelligent Network Management"
            />
            <p className="text-xs text-gray-500 mt-1">Subtitle shown on login and dashboard</p>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Logo</label>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <input
                  type="text"
                  value={branding.logoUrl}
                  onChange={(e) => handleConfigChange('logoUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="/path/to/logo.png"
                />
                <p className="text-xs text-gray-500 mt-1">URL to logo image (recommended: 200x60px)</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold whitespace-nowrap">
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
          </div>

          {/* Favicon */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Favicon</label>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <input
                  type="text"
                  value={branding.faviconUrl}
                  onChange={(e) => handleConfigChange('faviconUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="/path/to/favicon.ico"
                />
                <p className="text-xs text-gray-500 mt-1">URL to favicon (recommended: 32x32px)</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold whitespace-nowrap">
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Color Scheme */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Color Scheme</h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={branding.primaryColor}
                onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={branding.primaryColor}
                onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="#2563eb"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Main brand color (buttons, links, headers)</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Secondary Color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={branding.secondaryColor}
                onChange={(e) => handleConfigChange('secondaryColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={branding.secondaryColor}
                onChange={(e) => handleConfigChange('secondaryColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="#7c3aed"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Secondary accents and hover states</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Accent Color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={branding.accentColor}
                onChange={(e) => handleConfigChange('accentColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={branding.accentColor}
                onChange={(e) => handleConfigChange('accentColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="#dc2626"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Alerts, errors, and critical elements</p>
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          {[branding.primaryColor, branding.secondaryColor, branding.accentColor].map((color, idx) => (
            <div key={idx} className="flex-1 h-16 rounded-lg border-2 border-gray-200" style={{ backgroundColor: color }}></div>
          ))}
        </div>
      </div>

      {/* Theme & Background */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Theme & Background</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Application Theme</label>
            <select
              value={branding.theme}
              onChange={(e) => handleConfigChange('theme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
              <option value="auto">Auto (based on system preference)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Theme used throughout the application</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Login Page Background Color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={branding.loginBgColor}
                onChange={(e) => handleConfigChange('loginBgColor', e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={branding.loginBgColor}
                onChange={(e) => handleConfigChange('loginBgColor', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="#ffffff"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={branding.showFooterBranding}
              onChange={(e) => handleConfigChange('showFooterBranding', e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Show "Powered by Builder.io" footer</span>
          </label>
        </div>
      </div>

      {/* Custom CSS */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Advanced: Custom CSS</h3>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Custom CSS Rules</label>
          <textarea
            value={branding.customCSS}
            onChange={(e) => handleConfigChange('customCSS', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            rows={6}
            placeholder=":root {
  --color-primary: #2563eb;
  --color-secondary: #7c3aed;
}

.custom-button {
  border-radius: 8px;
  font-weight: 600;
}"
          />
          <p className="text-xs text-gray-500 mt-1">Advanced CSS customization. Changes apply globally to the platform.</p>
        </div>
      </div>

      {/* Component Variants */}
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Component Variants</h3>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Primary Button</p>
            <button
              style={{ backgroundColor: branding.primaryColor }}
              className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
            >
              Primary Action
            </button>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Secondary Button</p>
            <button
              style={{ borderColor: branding.secondaryColor, color: branding.secondaryColor }}
              className="px-4 py-2 border-2 rounded-lg hover:bg-opacity-10 transition-colors font-semibold"
            >
              Secondary Action
            </button>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Alert / Error</p>
            <div
              style={{ backgroundColor: branding.accentColor + '20', borderColor: branding.accentColor }}
              className="px-4 py-3 border rounded-lg"
            >
              <p style={{ color: branding.accentColor }} className="text-sm font-semibold">
                Critical Alert Example
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          <Save className="w-4 h-4" />
          Save Branding
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold">
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>
      </div>

      {/* Success Message */}
      {savedStatus && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          {savedStatus}
        </div>
      )}
    </div>
  );
}
