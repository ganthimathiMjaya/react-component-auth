import axios from 'axios';
import { INBOXAPI_URL } from './baseUrls';
import { getAuthToken } from './TokenInterceptor';


const transactioninboxClient = axios.create({
  baseURL: INBOXAPI_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

transactioninboxClient.interceptors.request.use(
  (config) => {
    const token =getAuthToken(); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

transactioninboxClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error) {
      console.error('Unauthorized! Handle logout or refresh token.');
    }
    return Promise.reject(error);
  }
);


export const getTransactionInboxClaims = (projectId, userId, userType, iAMModuleId) => transactioninboxClient.get(`Inbox/GetTransactionClaims/${projectId}/${userId}?userType=${userType}&IAMModuleId=${iAMModuleId}`);
export default transactioninboxClient;