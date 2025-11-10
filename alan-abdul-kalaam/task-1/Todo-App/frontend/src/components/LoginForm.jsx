import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../utils/api";

export default function LoginForm({ onAuth, initialMode = "login" }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode || "login");

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (mode === "signup") {
      // Name validation
      if (!firstName.trim()) {
        newErrors.firstName = "First name is required";
      } else if (!/^[a-zA-Z\s]+$/.test(firstName)) {
        newErrors.firstName = "First name must contain only letters";
      }

      if (middleName && !/^[a-zA-Z\s]+$/.test(middleName)) {
        newErrors.middleName = "Middle name must contain only letters";
      }

      if (!lastName.trim()) {
        newErrors.lastName = "Last name is required";
      } else if (!/^[a-zA-Z\s]+$/.test(lastName)) {
        newErrors.lastName = "Last name must contain only letters";
      }
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Re-password validation (only for signup)
    if (mode === "signup") {
      if (!rePassword) {
        newErrors.rePassword = "Please confirm your password";
      } else if (password !== rePassword) {
        newErrors.rePassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const body =
        mode === "login"
          ? { email, password }
          : {
              firstName: firstName.trim(),
              middleName: middleName.trim() || undefined,
              lastName: lastName.trim(),
              email,
              password,
            };

      const res = await apiRequest(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        onAuth(data);
        // Navigate to dashboard after successful auth
        navigate("/dashboard");
      } else {
        alert(data.message || "Authentication failed. Please try again.");
      }
    } catch (error) {
      console.error("Auth error:", error);
      alert(
        "Connection error. Please make sure the backend server is running."
      );
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {mode === "signup" && (
        <>
          {/* Name Fields - Horizontal Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-black uppercase tracking-wide text-cyan-400 mb-2">
                FIRST NAME *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className={`w-full px-4 py-4 border-2 ${
                  errors.firstName ? "border-red-500/50" : "border-cyan-500/50"
                } bg-black/40 rounded focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/30 text-white placeholder-cyan-300/50 font-medium transition-all`}
              />
              {errors.firstName && (
                <p className="text-red-400 text-xs mt-2 font-bold uppercase">
                  {errors.firstName}
                </p>
              )}
            </div>

            {/* Middle Name */}
            <div>
              <label className="block text-sm font-black uppercase tracking-wide text-cyan-400 mb-2">
                MIDDLE <span className="text-cyan-300/50 text-xs">(OPT)</span>
              </label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Michael"
                className={`w-full px-4 py-4 border-2 ${
                  errors.middleName ? "border-red-500/50" : "border-cyan-500/50"
                } bg-black/40 rounded focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/30 text-white placeholder-cyan-300/50 font-medium transition-all`}
              />
              {errors.middleName && (
                <p className="text-red-400 text-xs mt-2 font-bold uppercase">
                  {errors.middleName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-black uppercase tracking-wide text-cyan-400 mb-2">
                LAST NAME *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className={`w-full px-4 py-4 border-2 ${
                  errors.lastName ? "border-red-500/50" : "border-cyan-500/50"
                } bg-black/40 rounded focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/30 text-white placeholder-cyan-300/50 font-medium transition-all`}
              />
              {errors.lastName && (
                <p className="text-red-400 text-xs mt-2 font-bold uppercase">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Email */}
      <div>
        <label className="block text-sm font-black uppercase tracking-wide text-cyan-400 mb-2">
          EMAIL ADDRESS *
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className={`w-full px-5 py-4 border-2 ${
            errors.email ? "border-red-500/50" : "border-cyan-500/50"
          } bg-black/40 rounded focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/30 text-white placeholder-cyan-300/50 font-medium transition-all`}
        />
        {errors.email && (
          <p className="text-red-400 text-xs mt-2 font-bold uppercase">
            {errors.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-black uppercase tracking-wide text-cyan-400 mb-2">
          PASSWORD *
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={`w-full px-5 py-4 pr-14 border-2 ${
              errors.password ? "border-red-500/50" : "border-cyan-500/50"
            } bg-black/40 rounded focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/30 text-white placeholder-cyan-300/50 font-medium transition-all`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-400 text-xs mt-2 font-bold uppercase">
            {errors.password}
          </p>
        )}
      </div>

      {/* Re-enter Password (only for signup) */}
      {mode === "signup" && (
        <div>
          <label className="block text-sm font-black uppercase tracking-wide text-cyan-400 mb-2">
            CONFIRM PASSWORD *
          </label>
          <div className="relative">
            <input
              type={showRePassword ? "text" : "password"}
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-5 py-4 pr-14 border-2 ${
                errors.rePassword ? "border-red-500/50" : "border-cyan-500/50"
              } bg-black/40 rounded focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/30 text-white placeholder-cyan-300/50 font-medium transition-all`}
            />
            <button
              type="button"
              onClick={() => setShowRePassword(!showRePassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {showRePassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
          {errors.rePassword && (
            <p className="text-red-400 text-xs mt-2 font-bold uppercase">
              {errors.rePassword}
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-4 rounded font-black uppercase tracking-wide hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-500/50 border-2 border-cyan-400 transform hover:scale-105 transition-all mt-6"
      >
        {mode === "login" ? "▶ SIGN IN" : "▶ CREATE ACCOUNT"}
      </button>
    </form>
  );
}
