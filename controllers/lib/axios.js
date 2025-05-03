import axios from "axios";
import { BOT_TOKEN } from "../../config/env.js";

const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

export const getAxiosInstance = () => {
  try {
    return {
      get(method, params) {
        return axios.get(`/${method}`, {
          baseURL: BASE_URL,
          params,
          timeout: 10000, // 10 seconds timeout
        });
      },
      post(method, data) {
        return axios({
          method: "post",
          baseURL: BASE_URL,
          url: `/${method}`,
          data,
          timeout: 10000, // 10 seconds timeout
        });
      }
    };
  } catch (err) {
    console.error('Failed to send Telegram message:', err.message);
  }
};
