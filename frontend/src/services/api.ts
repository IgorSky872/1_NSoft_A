import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// === ЛОГИРОВАНИЕ ЗАПРОСОВ ===
api.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');

  // Логируем исходящие запросы в режиме разработки
  if (process.env.NODE_ENV === 'development') {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, {
      hasToken: !!token,
      dataType: config.data instanceof FormData ? 'FormData' : typeof config.data,
      timestamp: new Date().toISOString(),
    });
  }

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// === ЛОГИРОВАНИЕ ОТВЕТОВ и ОШИБОК ===
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const { method, url } = response.config;
    const data = response.data;

    // Детальное логирование для ONNX-запросов
    if (url?.includes('/parse-onnx') && data) {
      console.group('🟢 ONNX API Response');
      console.log('Status:', response.status);
      console.log('Nodes:', data.nodes?.length || 0);
      console.log('Edges:', data.edges?.length || 0);
      console.log('Weights:', data.weights ? Object.keys(data.weights).length : 0);
      console.log('Model metadata:', data.model_metadata);
      console.groupEnd();
    }

    // Общее логирование в dev режиме
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${method?.toUpperCase()} ${url}`, {
        status: response.status,
        dataSize: JSON.stringify(data).length,
        hasData: !!data,
      });
    }

    return response;
  },
  (error: AxiosError) => {
    // === ЛОГИРОВАНИЕ ОШИБОК ===
    const { method, url } = error.config || {};
    console.error(`🔴 API Error: ${method?.toUpperCase()} ${url}`, {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      timestamp: new Date().toISOString(),
    });

    // Обработка 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;