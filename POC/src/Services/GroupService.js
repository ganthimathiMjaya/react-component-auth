import axios from 'axios';
import { INBOXAPI_URL } from './baseUrls';
import { getAuthToken } from './TokenInterceptor';

const groupClient = axios.create({
  baseURL: INBOXAPI_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
groupClient.interceptors.request.use(
  (config) => {
    const token =getAuthToken(); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

groupClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error) {
      console.error('Unauthorized! Handle logout or refresh token.');
    }
    return Promise.reject(error);
  }
);
export const SaveGroup = (groupdata,projectId) => groupClient.post(`WorkGroup/SaveWorkflowClaimsGroup?projectId=${projectId}`, groupdata);
export const GetGroupwiseCount = (projectId, userId,iAMModuleId) => groupClient.get(`WorkGroup/GetGroupwiseCount/${projectId}/${userId}/${iAMModuleId}`);
export const DeleteGroup = (groupIdentity, userId,projectId) => groupClient.delete(`WorkGroup/DeleteWorkflowClaimsGroup/${groupIdentity}/${userId}/${projectId}`);
export const GetGropuTickets = (groupIdentity, projectId, userId,iAMModuleId) => groupClient.get(`WorkGroup/GetGroupTicketIds/${groupIdentity}/${projectId}/${userId}/${iAMModuleId}`);
export default groupClient;