import axios from 'axios';
import { CALLSHEETTRANAPI_URL } from './baseUrls'; 
import { getAuthToken } from './TokenInterceptor';

const TransactionCallSheetTranClient = axios.create({
  baseURL: CALLSHEETTRANAPI_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
TransactionCallSheetTranClient.interceptors.request.use(
  (config) => {
    const token =getAuthToken(); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

TransactionCallSheetTranClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error) {
      console.error('Unauthorized! Handle logout or refresh token.');
    }
    return Promise.reject(error);
  }
);
 //Submit claims into Transaction API
 export const SubmitTransaction = (transactioncallsheetclaimsdata,projectId) => TransactionCallSheetTranClient.post(`CallsheetTran/SubmitTransactionCallsheet?projectId=${projectId}`, transactioncallsheetclaimsdata);
 export default {TransactionCallSheetTranClient};
