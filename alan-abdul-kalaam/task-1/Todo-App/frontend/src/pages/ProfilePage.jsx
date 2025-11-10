import { useState, useEffect } from "react";
import { usePageTitle } from "../hooks/usePageTitle";
import apiRequest from "../utils/api";

export default function ProfilePage({ user, onUpdateUser }) {
  usePageTitle("My Profile - Account Settings");

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    middleName: user?.middleName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  // Fetch user stats
  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await apiRequest("/api/user/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login");
      setLoading(false);
      return;
    }

    try {
      const response = await apiRequest("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Update token in localStorage
        localStorage.setItem("token", data.token);

        // Update user state in App component
        if (onUpdateUser) {
          onUpdateUser(data.user);
        }

        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        const error = await response.json();
        alert(error.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating profile");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 pb-24 md:pb-6 animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-slideInDown">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-3 sm:gap-4 flex-wrap">
            <span className="text-4xl sm:text-5xl md:text-6xl animate-bounceIn">
              👤
            </span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent block">
              My Profile
            </span>
          </h1>
          <p
            className="text-cyan-300/80 text-sm sm:text-base font-medium animate-slideInUp"
            style={{ animationDelay: "0.2s" }}
          >
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-black/60 backdrop-blur-sm rounded-xl border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/30 p-4 sm:p-6 md:p-8 animate-scaleIn">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-cyan-500/30">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border-4 border-cyan-400 shadow-lg shadow-cyan-500/50 flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 sm:h-12 sm:w-12 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-black text-cyan-400 uppercase">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${
                      user.middleName ? user.middleName + " " : ""
                    }${user.lastName}`
                  : "User"}
              </h2>
              <p className="text-cyan-300/70 text-xs sm:text-sm mt-1 break-all">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {/* First Name */}
              <div>
                <label className="block text-[10px] sm:text-xs font-black uppercase text-cyan-400 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/50 border-2 border-cyan-500/50 rounded-lg text-cyan-100 text-sm sm:text-base font-medium focus:outline-none focus:border-cyan-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Enter first name"
                />
              </div>

              {/* Middle Name */}
              <div>
                <label className="block text-[10px] sm:text-xs font-black uppercase text-cyan-400 mb-2">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/50 border-2 border-cyan-500/50 rounded-lg text-cyan-100 text-sm sm:text-base font-medium focus:outline-none focus:border-cyan-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Optional"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-[10px] sm:text-xs font-black uppercase text-cyan-400 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/50 border-2 border-cyan-500/50 rounded-lg text-cyan-100 text-sm sm:text-base font-medium focus:outline-none focus:border-cyan-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] sm:text-xs font-black uppercase text-cyan-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/50 border-2 border-cyan-500/50 rounded-lg text-cyan-100 text-sm sm:text-base font-medium focus:outline-none opacity-60 cursor-not-allowed"
              />
              <p className="text-[10px] sm:text-xs text-cyan-300/50 mt-2">
                Email cannot be changed
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-black uppercase text-xs sm:text-sm hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/50 border-2 border-cyan-400/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                >
                  ✏️ Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-black uppercase text-xs sm:text-sm hover:from-green-400 hover:to-emerald-500 shadow-lg shadow-green-500/50 border-2 border-green-400/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "⏳ Saving..." : "✓ Save Changes"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        firstName: user?.firstName || "",
                        middleName: user?.middleName || "",
                        lastName: user?.lastName || "",
                        email: user?.email || "",
                      });
                    }}
                    disabled={loading}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg font-black uppercase text-xs sm:text-sm hover:from-red-400 hover:to-rose-500 shadow-lg shadow-red-500/50 border-2 border-red-400/50 transition-all duration-300 hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ✕ Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-6 sm:mt-8">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl border-2 border-cyan-500/50 shadow-xl shadow-cyan-500/20 p-4 sm:p-5 hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-scaleIn">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl mb-2">📅</div>
              <p className="text-[10px] sm:text-xs font-black uppercase text-cyan-400 mb-1">
                Member Since
              </p>
              <p className="text-base sm:text-lg font-black text-white">
                {stats ? formatDate(stats.memberSince) : "Loading..."}
              </p>
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-sm rounded-xl border-2 border-purple-500/50 shadow-xl shadow-purple-500/20 p-4 sm:p-5 hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-scaleIn">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl mb-2">✅</div>
              <p className="text-[10px] sm:text-xs font-black uppercase text-purple-400 mb-1">
                Tasks Completed
              </p>
              <p className="text-base sm:text-lg font-black text-white">
                {stats ? stats.tasksCompleted : "Loading..."}
              </p>
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-sm rounded-xl border-2 border-orange-500/50 shadow-xl shadow-orange-500/20 p-4 sm:p-5 hover:scale-105 hover:-translate-y-2 transition-all duration-300 animate-scaleIn">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl mb-2">🔥</div>
              <p className="text-[10px] sm:text-xs font-black uppercase text-orange-400 mb-1">
                Current Streak
              </p>
              <p className="text-base sm:text-lg font-black text-white">
                {stats ? `${stats.currentStreak} days` : "Loading..."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
