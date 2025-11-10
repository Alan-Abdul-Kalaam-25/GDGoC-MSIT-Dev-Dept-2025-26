import { useState, useEffect } from "react";
import { usePageTitle } from "../hooks/usePageTitle";
import apiRequest from "../utils/api";

export default function SettingsPage() {
  usePageTitle("Settings - Customize Your Experience");

  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    darkMode: true,
    soundEffects: true,
    autoSave: true,
    dailyReminder: true,
    showCompletedTasks: true,
    taskAnimation: true,
  });
  const [loading, setLoading] = useState(true);

  // Fetch settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest("/api/user/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleToggle = async (setting) => {
    const newSettings = {
      ...settings,
      [setting]: !settings[setting],
    };

    setSettings(newSettings);

    // Save to backend
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await apiRequest("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        // Revert on error
        setSettings(settings);
        alert("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      // Revert on error
      setSettings(settings);
      alert("An error occurred while saving settings");
    }
  };

  const handleResetSettings = async () => {
    if (!confirm("Are you sure you want to reset all settings to default?")) {
      return;
    }

    const defaultSettings = {
      notifications: true,
      emailUpdates: false,
      darkMode: true,
      soundEffects: true,
      autoSave: true,
      dailyReminder: true,
      showCompletedTasks: true,
      taskAnimation: true,
    };

    setSettings(defaultSettings);

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await apiRequest("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(defaultSettings),
      });

      if (response.ok) {
        alert("Settings reset to default!");
      } else {
        alert("Failed to reset settings");
      }
    } catch (error) {
      console.error("Error resetting settings:", error);
      alert("An error occurred while resetting settings");
    }
  };

  const ToggleSwitch = ({ label, description, enabled, onToggle, icon }) => (
    <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-cyan-500/30 hover:border-cyan-400/50 transition-all">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-cyan-300 font-black uppercase text-sm">{label}</p>
          <p className="text-cyan-400/60 text-xs mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
          enabled ? "bg-cyan-500" : "bg-gray-600"
        }`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-300 ${
            enabled ? "translate-x-7" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen p-6 animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-slideInDown">
          <h1 className="text-5xl font-black uppercase tracking-wider mb-3 flex items-center gap-4">
            <span className="text-6xl animate-bounceIn">⚙️</span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent block">
              Settings
            </span>
          </h1>
          <p
            className="text-cyan-300/80 text-base font-medium animate-slideInUp"
            style={{ animationDelay: "0.2s" }}
          >
            Customize your TodoQuest experience
          </p>
        </div>

        {/* Notifications Section */}
        <div className="bg-black/60 backdrop-blur-sm rounded-xl border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/30 p-6 mb-6 animate-scaleIn">
          <h2 className="text-xl font-black uppercase text-cyan-400 mb-4 flex items-center gap-2">
            <span>🔔</span> Notifications
          </h2>
          <div className="space-y-3">
            <ToggleSwitch
              label="Push Notifications"
              description="Receive notifications for task reminders"
              icon="📱"
              enabled={settings.notifications}
              onToggle={() => handleToggle("notifications")}
            />
            <ToggleSwitch
              label="Email Updates"
              description="Get weekly progress reports via email"
              icon="📧"
              enabled={settings.emailUpdates}
              onToggle={() => handleToggle("emailUpdates")}
            />
            <ToggleSwitch
              label="Daily Reminder"
              description="Get reminded about pending tasks every day"
              icon="⏰"
              enabled={settings.dailyReminder}
              onToggle={() => handleToggle("dailyReminder")}
            />
          </div>
        </div>

        {/* Appearance Section */}
        <div
          className="bg-black/60 backdrop-blur-sm rounded-xl border-2 border-purple-500/50 shadow-2xl shadow-purple-500/30 p-6 mb-6 animate-scaleIn"
          style={{ animationDelay: "0.1s" }}
        >
          <h2 className="text-xl font-black uppercase text-purple-400 mb-4 flex items-center gap-2">
            <span>🎨</span> Appearance
          </h2>
          <div className="space-y-3">
            <ToggleSwitch
              label="Dark Mode"
              description="Use dark theme (light theme coming soon)"
              icon="🌙"
              enabled={settings.darkMode}
              onToggle={() => handleToggle("darkMode")}
            />
            <ToggleSwitch
              label="Task Animations"
              description="Show animations when tasks are completed"
              icon="✨"
              enabled={settings.taskAnimation}
              onToggle={() => handleToggle("taskAnimation")}
            />
            <ToggleSwitch
              label="Show Completed Tasks"
              description="Display completed tasks in the dashboard"
              icon="✅"
              enabled={settings.showCompletedTasks}
              onToggle={() => handleToggle("showCompletedTasks")}
            />
          </div>
        </div>

        {/* Behavior Section */}
        <div
          className="bg-black/60 backdrop-blur-sm rounded-xl border-2 border-orange-500/50 shadow-2xl shadow-orange-500/30 p-6 mb-6 animate-scaleIn"
          style={{ animationDelay: "0.2s" }}
        >
          <h2 className="text-xl font-black uppercase text-orange-400 mb-4 flex items-center gap-2">
            <span>⚡</span> Behavior
          </h2>
          <div className="space-y-3">
            <ToggleSwitch
              label="Auto Save"
              description="Automatically save changes without confirmation"
              icon="💾"
              enabled={settings.autoSave}
              onToggle={() => handleToggle("autoSave")}
            />
            <ToggleSwitch
              label="Sound Effects"
              description="Play sounds when completing tasks"
              icon="🔊"
              enabled={settings.soundEffects}
              onToggle={() => handleToggle("soundEffects")}
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div
          className="bg-black/60 backdrop-blur-sm rounded-xl border-2 border-red-500/50 shadow-2xl shadow-red-500/30 p-6 animate-scaleIn"
          style={{ animationDelay: "0.3s" }}
        >
          <h2 className="text-xl font-black uppercase text-red-400 mb-4 flex items-center gap-2">
            <span>⚠️</span> Danger Zone
          </h2>
          <div className="space-y-3">
            <button
              onClick={handleResetSettings}
              className="w-full px-6 py-3 bg-red-500/20 text-red-300 rounded-lg font-black uppercase text-sm hover:bg-red-500/30 border-2 border-red-500/50 hover:border-red-400 transition-all duration-300 hover:scale-105"
            >
              🔄 Reset All Settings
            </button>
            <button
              onClick={() => alert("Delete account feature coming soon!")}
              className="w-full px-6 py-3 bg-red-500/20 text-red-300 rounded-lg font-black uppercase text-sm hover:bg-red-500/30 border-2 border-red-500/50 hover:border-red-400 transition-all duration-300 hover:scale-105"
            >
              🗑️ Delete Account (Coming Soon)
            </button>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center text-cyan-400/60 text-sm">
          <p>Settings are automatically saved • Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
