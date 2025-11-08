import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname.includes('localhost')
    ? 'http://localhost:5000'
    : 'https://interactive-quiz-application-zupt.onrender.com');

// Log API configuration for debugging
console.log('🔧 API Configuration:', {
  baseURL,
  fullAPIBase: baseURL + '/api',
  envVar: import.meta.env.VITE_API_URL || 'not set (using default)'
});

export const api = axios.create({
  baseURL: baseURL + '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Request interceptor: Attach token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('qa_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    // Enhanced error logging for network issues
    if (!error.response) {
      // Network error - backend not reachable
      console.error('❌ Network Error:', {
        message: error.message,
        code: error.code,
        baseURL: error.config?.baseURL,
        url: error.config?.url,
        fullURL: error.config?.baseURL + error.config?.url
      });
      console.error('💡 Check if backend is running on:', baseURL);
    } else {
      // HTTP error response
      console.error('API Error:', error.response?.status, error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);



