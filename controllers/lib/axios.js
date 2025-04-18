import axios from "axios";
import { BOT_TOKEN } from "../../config/env.js";

const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

export const getAxiosInstance = () => {
  return {
    
    get(method, params) {
      return axios.get(`/${method}`, {
        baseURL: BASE_URL,
        params,
      })
    },

    post(method, data) {
      return axios({
        method: "post",
        baseURL: BASE_URL,
        url: `/${method}`,
        data,
      })
    }

  }
}
