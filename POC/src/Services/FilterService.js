import axios from 'axios';
import { INBOXAPI_URL } from './baseUrls';
import { getAuthToken } from './TokenInterceptor';

const filterClient = axios.create({
  baseURL: INBOXAPI_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
filterClient.interceptors.request.use(
  (config) => {
    const token =getAuthToken(); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

filterClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error) {
      console.error('Unauthorized! Handle logout or refresh token.');
    }
    return Promise.reject(error);
  }
);
export const GetTicketStatusWiseCount = (projectId, userId,iAMModuleId) => filterClient.get(`Inbox/GetTicketStatuswiseCount/${projectId}/${userId}/?iAMModuleId=${iAMModuleId}`);
export const GetWorkflowWiseCount = (projectId, userId) => filterClient.get(`Inbox/GetWorkflowWiseCount/${projectId}/${userId}`);
export const SaveWorkflowCustomerView = (customerViewdata,projectId,iAMModuleId) => filterClient.post(`WorkflowUsers/SaveWorkflowCustomerView?projectId=${projectId}&iAMModuleId=${iAMModuleId}`,customerViewdata);
export const GetuserCustomView  = (projectId, userId,iAMModuleId) => filterClient.get(`WorkflowUsers/GetuserCustomViews/${projectId}/${userId}/${iAMModuleId}`);

export default filterClient;