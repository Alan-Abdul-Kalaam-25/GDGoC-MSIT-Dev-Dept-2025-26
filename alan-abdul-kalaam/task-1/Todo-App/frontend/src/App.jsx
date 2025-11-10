import { useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import MobileBottomNav from "./components/MobileBottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import AchievementsPage from "./pages/AchievementsPage";
import ProfilePage from "./pages/ProfilePage";
import AvatarPage from "./pages/AvatarPage";
import SettingsPage from "./pages/SettingsPage";
import TaskForm from "./components/TaskForm";
import TaskItem from "./components/TaskItem";
import TwistsPanel from "./components/TwistsPanel";
import LoginForm from "./components/LoginForm";
import apiRequest from "./utils/api";

function calcLevel(xp) {
  return Math.floor(Math.sqrt(xp / 10)) + 1;
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [lists, setLists] = useState([]);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [enabledTwists, setEnabledTwists] = useState({
    confetti: true,
    doubleXP: false,
  });
  const confettiRef = useRef(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // fetch tasks and lists when token changes
  useEffect(() => {
    if (!token) {
      setTasks([]);
      setLists([]);
      setUser(null);
      setIsAuthLoading(false);
      return;
    }

    // Verify token validity by fetching user profile first
    const verifyToken = async () => {
      try {
        const profileRes = await apiRequest("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!profileRes.ok) {
          // Token is invalid or expired, clear it
          console.error("Invalid token, clearing authentication");
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
          setTasks([]);
          setLists([]);
          setIsAuthLoading(false);
          return;
        }

        const profileData = await profileRes.json();

        // Parse token to get user info
        const payload = JSON.parse(atob(token.split(".")[1]));

        // Set user with both token data and profile data
        setUser({
          id: payload.id,
          firstName: payload.firstName,
          middleName: payload.middleName,
          lastName: payload.lastName,
          email: payload.email,
          avatar: profileData.avatar,
        });

        // Fetch tasks
        apiRequest("/api/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => {
            if (!r.ok) throw new Error("Failed to fetch tasks");
            return r.json();
          })
          .then((data) => setTasks(Array.isArray(data) ? data : []))
          .catch((err) => {
            console.error("Error fetching tasks:", err);
            setTasks([]);
          });

        // Fetch lists
        apiRequest("/api/lists", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => {
            if (!r.ok) throw new Error("Failed to fetch lists");
            return r.json();
          })
          .then((data) => setLists(Array.isArray(data) ? data : []))
          .catch((err) => {
            console.error("Error fetching lists:", err);
            setLists([]);
          });

        setIsAuthLoading(false);
      } catch (e) {
        console.error("Error verifying token:", e);
        // Clear invalid token
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        setTasks([]);
        setLists([]);
        setIsAuthLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const addTask = async (task, extraData = {}) => {
    if (!token) return alert("Please login");
    try {
      const res = await apiRequest("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: task,
          ...extraData,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks((t) => [data, ...t]);
      } else {
        console.error("Failed to add task");
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const editTask = async (id, text) => {
    try {
      const res = await apiRequest(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        setTasks((t) => t.map((it) => (it._id === id ? { ...it, text } : it)));
      }
    } catch (error) {
      console.error("Error editing task:", error);
    }
  };

  const deleteTask = async (id) => {
    if (!token) return;
    try {
      const res = await apiRequest(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTasks((t) => t.filter((it) => it._id !== id));
      } else {
        console.error("Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const toggleComplete = async (id) => {
    const existing = tasks.find((t) => t._id === id);
    if (!existing) return;
    const nowCompleted = !existing.completed;
    try {
      const res = await apiRequest(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: nowCompleted }),
      });
      if (res.ok) {
        setTasks((t) =>
          t.map((it) =>
            it._id === id ? { ...it, completed: nowCompleted } : it
          )
        );
        if (nowCompleted) {
          const base = enabledTwists.doubleXP ? 20 : 10;
          setXp((x) => x + base);
          setStreak((s) => s + 1);
          if (enabledTwists.confetti && confettiRef.current)
            confettiRef.current();
        }
      }
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  };

  const createList = async (name) => {
    if (!token) return alert("Please login");
    try {
      const res = await apiRequest("/api/lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const data = await res.json();
        setLists((l) => [...l, data]);
      } else {
        console.error("Failed to create list");
      }
    } catch (error) {
      console.error("Error creating list:", error);
    }
  };

  const deleteList = async (id) => {
    if (!token) return;
    try {
      const res = await apiRequest(`/api/lists/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setLists((l) => l.filter((list) => list._id !== id));
      } else {
        console.error("Failed to delete list");
      }
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };

  const toggleStar = async (taskId) => {
    if (!token) return;

    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    const res = await apiRequest(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ starred: !task.starred }),
    });

    if (res.ok) {
      const updatedTask = await res.json();
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === taskId ? updatedTask : t))
      );
    }
  };

  const level = calcLevel(xp);

  const onLogin = (authData) => {
    const t = typeof authData === "string" ? authData : authData.token;
    setToken(t);
    localStorage.setItem("token", t);
    if (authData && authData.user) {
      setUser(authData.user);
    }
  };

  const onLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    setTasks([]);
    setLists([]);
    setIsSidebarOpen(false);
  };

  const onUpdateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  function AppContent() {
    const location = useLocation();
    const isDashboardOrAchievements =
      location.pathname === "/dashboard" ||
      location.pathname === "/achievements";

    const showMobileNav =
      location.pathname === "/dashboard" ||
      location.pathname === "/achievements" ||
      location.pathname === "/profile";

    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };

    // Close sidebar when navigating away from dashboard/achievements
    useEffect(() => {
      if (
        location.pathname !== "/dashboard" &&
        location.pathname !== "/achievements"
      ) {
        setIsSidebarOpen(false);
      }
    }, [location.pathname]);

    return (
      <div className="min-h-screen bg-transparent text-white flex flex-col">
        <Navbar
          user={user}
          onLogout={onLogout}
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginPage onAuth={onLogin} />} />
            <Route path="/signup" element={<SignupPage onAuth={onLogin} />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute user={user} isLoading={isAuthLoading}>
                  <Dashboard
                    tasks={tasks}
                    lists={lists}
                    onAdd={addTask}
                    onEdit={editTask}
                    onDelete={deleteTask}
                    onToggle={toggleComplete}
                    onToggleStar={toggleStar}
                    onCreateList={createList}
                    onDeleteList={deleteList}
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/achievements"
              element={
                <ProtectedRoute user={user} isLoading={isAuthLoading}>
                  <AchievementsPage tasks={tasks} level={level} xp={xp} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute user={user} isLoading={isAuthLoading}>
                  <ProfilePage user={user} onUpdateUser={onUpdateUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/avatar"
              element={
                <ProtectedRoute user={user} isLoading={isAuthLoading}>
                  <AvatarPage user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute user={user} isLoading={isAuthLoading}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        {/* Hide footer on dashboard/achievements pages in mobile view */}
        <div
          className={`${isDashboardOrAchievements ? "hidden md:block" : ""}`}
        >
          <Footer />
        </div>
        {/* Show mobile bottom navigation on dashboard, achievements, and profile */}
        {showMobileNav && user && <MobileBottomNav />}
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
