import axios from 'axios';
import { INBOXAPI_URL, PAYERINFO_URL,KNOLCONTEXTAPI_URL } from './baseUrls';
import { getAuthToken } from './TokenInterceptor';

const inboxClient = axios.create({
  baseURL: INBOXAPI_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
const payerInfoClient = axios.create({
  baseURL: PAYERINFO_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
const knolInfoClient = axios.create({
  baseURL: KNOLCONTEXTAPI_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
inboxClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

inboxClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error) {
      console.error('Unauthorized! Handle logout or refresh token.');
    }
    return Promise.reject(error);
  }
);
// payerInfoClient.interceptors.request.use(
//   (config) => {
//     const token = getAuthToken();
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// payerInfoClient.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     if (error) {
//       console.error('Unauthorized! Handle logout or refresh token.');
//     }
//     return Promise.reject(error);
//   }
// );
export const saveasFlagged = (projectId, flagdata) => inboxClient.post(`Inbox/SaveFlaggedClaims?projectId=${projectId}`, flagdata);
export const getInboxClaims = (projectId, userId, workspaceId, inboxIAMModuleId) => inboxClient.get(`Inbox/GetInboxClaims/${projectId}/${userId}/${workspaceId}/${inboxIAMModuleId}`);
export const getCompletedClaims = (projectId, userId, startDate, endDate, completedIAMModuleId) => inboxClient.get(`ProcessedClaims/GetCompletedClaims/${projectId}/${userId}/${startDate}/${endDate}/${completedIAMModuleId}`);
export const getPayerInfo = (payeriddata) => payerInfoClient.get(`get_payer_data_html/${payeriddata}`);
export const getPayerData = (payeriddata) => payerInfoClient.get(`get_payer_data/${payeriddata}`);
export const getKnolContextDetails = (projectId, knolcontextId) => knolInfoClient.post(`?projectId=${projectId}&contextId= ${knolcontextId}`);
export const getUserWorkspace = (projectId, userId) => inboxClient.get(`Inbox/GetUserWorkspace/${projectId}/${userId}`);
export default { inboxClient, payerInfoClient };