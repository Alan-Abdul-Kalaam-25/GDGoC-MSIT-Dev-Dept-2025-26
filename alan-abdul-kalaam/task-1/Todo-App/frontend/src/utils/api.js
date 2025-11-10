// API utility for making requests to backend
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  return response;
};

export default apiRequest;
