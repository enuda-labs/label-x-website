import axios from 'axios';
import {  ACCESS_TOKEN_KEY } from '../../constants/index';
import {  BASE_API_URL } from '../../constants/env-vars';


// Interface for an API key object
export interface ApiKey {
  id: number;
  name: string;
  key: string;
  created: string;
  lastUsed: string | null;
  status: 'active' | 'revoked';
}

// Helper to get token from localStorage
const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

// Axios instance with auth headers
const apiClient = axios.create({
  baseURL: BASE_API_URL,
});

// Add Authorization header to every request
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** ----- Fetch API Keys ----- **/
export const fetchApiKeys = async (): Promise<ApiKey[]> => {
  const response = await apiClient.get('/keys/');
  return response.data;
};

/** ----- Revoke an API Key ----- **/
export const revokeApiKey = async (keyId: number): Promise<void> => {
  await apiClient.post(`/keys/revoke/`, { id: keyId });
};
