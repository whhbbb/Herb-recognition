const LOCAL_DEV_API = 'http://127.0.0.1:4000/api';
const PROD_DEFAULT_API = '/api';

const isLocalDevHost = (hostname: string) => {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
};

export const resolveApiBaseUrl = () => {
  const fromLocalStorage = window.localStorage.getItem('herbApiBaseUrl');
  if (fromLocalStorage?.trim()) {
    return fromLocalStorage.trim();
  }

  return isLocalDevHost(window.location.hostname) ? LOCAL_DEV_API : PROD_DEFAULT_API;
};

