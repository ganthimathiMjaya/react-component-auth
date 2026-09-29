import axios from 'axios';
import { INBOXAPI_URL } from './baseUrls';
import { getAuthToken } from './TokenInterceptor';

const calldetailsClient = axios.create({
  baseURL: INBOXAPI_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
calldetailsClient.interceptors.request.use(
  (config) => {
    const token =getAuthToken(); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

calldetailsClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error) {
      console.error('Unauthorized! Handle logout or refresh token.');
    }
    return Promise.reject(error);
  }
);

   
export const GetCallrecordingDetails = (customerId,username,projectId) => calldetailsClient.get(`CallRecording/GetCallHistoryClaims/${customerId}/${username}/${projectId}`);
export const GetCallrecordingDetailsbyclaimno = (customerId,username,claimno,projectId) => calldetailsClient.get(`CallRecording/GetCallHistorybyClaimno/${customerId}/${username}/${claimno}/${projectId}`);


export default calldetailsClient;