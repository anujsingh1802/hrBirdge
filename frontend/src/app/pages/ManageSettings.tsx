import { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../context/AuthContext";
import { getSettings, updateSettings, uploadBlogMedia } from "../lib/api";
import { Loader2, Save, Upload } from "lucide-react";
import type { SiteConfig } from "../lib/types";

export function ManageSettings() {
  const { token, user } = useAuth();
  const [config, setConfig] = useState<SiteConfig>({
    leftBannerImage: '',
    leftBannerUrl: '',
    rightBannerImage: '',
    rightBannerUrl: '',
    isBannerEnabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    getSettings()
      .then((data) => {
        if (mounted && data) {
          setConfig(data);
        }
      })
      .catch((err) => {
        if (mounted) console.error("Could not fetch settings", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const updated = await updateSettings(token, config);
      setConfig(updated);
      setMessage('Settings updated successfully!');
      window.dispatchEvent(new Event('settingsUpdated'));
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'left' | 'right') => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setSaving(true);
    setError('');

    try {
      const url = await uploadBlogMedia(file, token);
      if (side === 'left') {
        setConfig((prev) => ({ ...prev, leftBannerImage: url }));
      } else {
        setConfig((prev) => ({ ...prev, rightBannerImage: url }));
      }
      setMessage(`Image uploaded. Remember to save settings.`);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image. Make sure it is a valid format and size.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-500)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar variant="authenticated" />

      <div className="flex">
        <Sidebar variant="admin" />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[var(--text-strong)] mb-2">Site Settings</h1>
              <p className="text-[var(--text-default)]">Manage global advertisement banners for your website.</p>
            </div>

            {message && <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 border border-green-200">{message}</div>}
            {error && <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>}

            <form onSubmit={handleSave} className="bg-[var(--bg-surface)] p-6 md:p-8 border border-[var(--border-soft)] space-y-8" style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-sm)' }}>
              
              <div className="flex items-center justify-between pb-6 border-b border-[var(--border-soft)]">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--text-strong)]">Enable Site Banners</h2>
                  <p className="text-sm text-[var(--text-muted)]">Turn global side banners on or off.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={config.isBannerEnabled}
                    onChange={(e) => setConfig({ ...config, isBannerEnabled: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Banner Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Left Banner</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">Upload Image or Paste URL</label>
                    <div className="flex gap-2 text-sm">
                      <Input 
                        placeholder="https://example.com/banner.jpg"
                        value={config.leftBannerImage}
                        onChange={(e) => setConfig({ ...config, leftBannerImage: e.target.value })}
                        className="flex-1"
                      />
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => handleFileUpload(e, 'left')}
                          disabled={saving}
                        />
                        <Button type="button" variant="outline" className="px-3" disabled={saving}>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Destination URL</label>
                    <Input 
                      placeholder="https://sponsor.com"
                      value={config.leftBannerUrl}
                      onChange={(e) => setConfig({ ...config, leftBannerUrl: e.target.value })}
                    />
                  </div>
                </div>

                {/* Right Banner Settings */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Right Banner</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">Upload Image or Paste URL</label>
                    <div className="flex gap-2 text-sm">
                      <Input 
                        placeholder="https://example.com/banner.jpg"
                        value={config.rightBannerImage}
                        onChange={(e) => setConfig({ ...config, rightBannerImage: e.target.value })}
                        className="flex-1"
                      />
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => handleFileUpload(e, 'right')}
                          disabled={saving}
                        />
                        <Button type="button" variant="outline" className="px-3" disabled={saving}>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Destination URL</label>
                    <Input 
                      placeholder="https://sponsor.com"
                      value={config.rightBannerUrl}
                      onChange={(e) => setConfig({ ...config, rightBannerUrl: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[var(--border-soft)] flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                  Save Settings
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>

      <MobileBottomNav variant="admin" />
    </div>
  );
}
