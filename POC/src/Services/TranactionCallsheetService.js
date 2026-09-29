import axios from 'axios';
import { MASTER_URL } from './baseUrls';
import { getAuthToken } from './TokenInterceptor';
 
const TransactionCallSheetClient = axios.create({
  baseURL: MASTER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
TransactionCallSheetClient.interceptors.request.use(
  (config) => {
    const token =getAuthToken(); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

TransactionCallSheetClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error) {
      console.error('Unauthorized! Handle logout or refresh token.');
    }
    return Promise.reject(error);
  }
);
// Get Call sheet page controls master data
 export const GetTransactionActionTypes= (callTypeGUID,projectId) => TransactionCallSheetClient.get(`MasterTypes/GetTransactionActionTypes/${callTypeGUID}/${projectId}`);
 export default {TransactionCallSheetClient};
