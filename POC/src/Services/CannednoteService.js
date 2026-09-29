import axios from 'axios';
import { INBOXAPI_URL } from './baseUrls';
import { getAuthToken } from './TokenInterceptor';
 
const cannednoteClient = axios.create({
  baseURL: INBOXAPI_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
cannednoteClient.interceptors.request.use(
  (config) => {
    const token =getAuthToken(); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

cannednoteClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error) {
      console.error('Unauthorized! Handle logout or refresh token.');
    }
    return Promise.reject(error);
  }
);
export const savecannednote = (cannednotedata,projectId) => cannednoteClient.post(`WorkflowUsers/SaveUserCannedNote?projectId=${projectId}`,cannednotedata);
export const getcannednote = (projectId,userId) => cannednoteClient.get(`WorkflowUsers/GetUsersCannedNote/${projectId}/${userId}`);
export const deletecannednote = (userId,cannednotedeletedata,projectId) => {
  const requestData =  {
    data: cannednotedeletedata
  }

  return cannednoteClient.delete(`WorkflowUsers/DeleteUsersCannedNote?userId=${userId}&projectId=${projectId}`, requestData);
};
export const getCallSheetControlsforCannedNotes = (projectId) => cannednoteClient.get(`Callsheet/GetCallSheetControlsforCannedNotes/${projectId}`);
export const addfavoritecannednote = (userId,cannednotedeletedata,projectId) => cannednoteClient.post(`WorkflowUsers/TagUserFavoriteCannedNote/${projectId}/${userId}`,cannednotedeletedata);
export const removefavoritecannednoteservice = (userId,cannednotedeletedata,projectId) => {
  const requestData =  {
    data: cannednotedeletedata
  }

  return cannednoteClient.delete(`WorkflowUsers/RemoveUsersFavoriteCannedNotes/${projectId}/${userId}`, requestData);
};

export default cannednoteClient;