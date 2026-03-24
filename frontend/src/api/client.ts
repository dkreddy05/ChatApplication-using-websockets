import axios from 'axios';

const client = axios.create({
  baseURL: '',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if ((status === 401 || status === 403) && !error.config?.url?.includes('/login')) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
