import axios from 'axios';
import { INBOXAPI_URL } from './baseUrls';
import { getAuthToken } from './TokenInterceptor';
 
const columnClient = axios.create({
  baseURL: INBOXAPI_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
columnClient.interceptors.request.use(
  (config) => {
    const token =getAuthToken(); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

columnClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error) {
      console.error('Unauthorized! Handle logout or refresh token.');
    }
    return Promise.reject(error);
  }
);
export const savecustomizecolumns = (projectId,columndata,iAMModuleId) => columnClient.post(`WorkflowUsers/SaveUserCustomizedColumns?projectId=${projectId}&iAMModuleId=${iAMModuleId}`,columndata)
export const getcustomizecolumns = (projectId,userId,iAMModuleId) => columnClient.get(`WorkflowUsers/GetUsersCustomizedColumn/${projectId}/${userId}/${iAMModuleId}`);
export default columnClient;