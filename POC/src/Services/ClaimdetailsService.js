import axios from 'axios';
import { INBOXAPI_URL,ONBOARDINGAPI_URL } from './baseUrls';
import { getAuthToken } from './TokenInterceptor';

const claimdetailsClient = axios.create({
  baseURL: INBOXAPI_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
const btcdetailsClient = axios.create({
  baseURL: ONBOARDINGAPI_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


claimdetailsClient.interceptors.request.use(
  (config) => {
    const token =getAuthToken(); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

claimdetailsClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error) {
      console.error('Unauthorized! Handle logout or refresh token.');
    }
    return Promise.reject(error);
  }
);
btcdetailsClient.interceptors.request.use(
  (config) => {
    const token =getAuthToken(); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

btcdetailsClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error) {
      console.error('Unauthorized! Handle logout or refresh token.');
    }
    return Promise.reject(error);
  }
);
   
export const GetClaimsDetails = (projectId,ticketIdnumbers) => claimdetailsClient.post(`Callsheet/GetClaimsDetails/${projectId}`,ticketIdnumbers);
export const GetbtcDetails = (projectId,ReferenceKey) => btcdetailsClient.get(`api/ProjectPreferenceMapping/LoadPayerDetailMaster?ProjectId=${projectId}&Action=loadall&ReferenceKey=${ReferenceKey}`);
export const GetClaimsValidity = (projectId,flowTaskIds) => claimdetailsClient.post(`Callsheet/GetClaimsDetails/${projectId}`,flowTaskIds);


export default {claimdetailsClient,btcdetailsClient};