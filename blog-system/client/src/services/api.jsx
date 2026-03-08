import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  verify: () => api.get('/auth/verify'),
};

export const configApi = {
  getConfig: () => api.get('/config'),
  updateConfig: (data) => api.put('/config', data),
  getCategories: () => api.get('/config/categories'),
  updateCategories: (data) => api.put('/config/categories', data),
};

export const postApi = {
  getPosts: () => api.get('/posts'),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (data) => api.post('/posts', data),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
};

export const uploadApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData);
  },
  getImages: () => api.get('/upload/images'),
  deleteImage: (filename) => api.delete(`/upload/images/${filename}`),
};

export const friendApi = {
  getFriends: () => api.get('/friends'),
  updateFriends: (data) => api.put('/friends', data),
};

export const githubPagesApi = {
  getConfig: () => api.get('/github-pages'),
  updateConfig: (data) => api.put('/github-pages', data),
  deploy: () => api.post('/github-pages/deploy'),
  getStatus: () => api.get('/github-pages/status'),
};

export default api;
