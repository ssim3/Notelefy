import axios from "axios";
import { BOT_TOKEN } from "../../config/env.js";

const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Create an axios instance with default configuration
const telegramClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for logging
telegramClient.interceptors.request.use(config => {
  console.log(`Making ${config.method.toUpperCase()} request to Telegram API: ${config.url}`);
  return config;
});

// Add response interceptor for retries
let retryCount = 0;
const MAX_RETRIES = 3;

telegramClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // If we've already retried too many times, reject
    if (retryCount >= MAX_RETRIES) {
      retryCount = 0;
      return Promise.reject(error);
    }

    // Only retry on network errors or 5xx responses
    if (
      (error.code === 'ETIMEDOUT' || 
       error.code === 'ENETUNREACH' || 
       error.code === 'ECONNREFUSED' || 
       (error.response && error.response.status >= 500))
      && !originalRequest._retry
    ) {
      retryCount++;
      originalRequest._retry = true;
      
      // Exponential backoff
      const delay = retryCount * 1000;
      console.log(`Retrying request (${retryCount}/${MAX_RETRIES}) after ${delay}ms...`);
      
      return new Promise(resolve => {
        setTimeout(() => resolve(telegramClient(originalRequest)), delay);
      });
    }
    
    return Promise.reject(error);
  }
);

export const getAxiosInstance = () => {
  return {
    async get(method, params) {
      try {
        const response = await telegramClient.get(`/${method}`, { params });
        return response.data;
      } catch (err) {
        console.error(`Telegram API GET /${method} failed:`, err.message);
        if (err.response) {
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
        }
        throw err;
      }
    },
    
    async post(method, data) {
      try {
        const response = await telegramClient.post(`/${method}`, data);
        return response.data;
      } catch (err) {
        console.error(`Telegram API POST /${method} failed:`, err.message);
        if (err.response) {
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
        }
        throw err;
      }
    }
  };
};