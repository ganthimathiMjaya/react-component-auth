import axios from 'axios';
import { CALLSHEETTRANAPI_URL } from './baseUrls'; 
import { getAuthToken } from './TokenInterceptor';

const CallSheetTranClient = axios.create({
  baseURL: CALLSHEETTRANAPI_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
CallSheetTranClient.interceptors.request.use(
  (config) => {
    const token =getAuthToken(); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

CallSheetTranClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error) {
      console.error('Unauthorized! Handle logout or refresh token.');
    }
    return Promise.reject(error);
  }
);
 //Submit claims into Transaction API
 export const SubmitClaims = (callsheetclaimsdata,projectId) => CallSheetTranClient.post(`CallsheetTran/SubmitCallsheet?projectId=${projectId}`, callsheetclaimsdata);
 export const GetCallsheetdetails = (queryParams,projectId) => CallSheetTranClient.get(`CallsheetTran/GetCallsheetTrans?${queryParams.toString()}`);
 export const GetAutoSaveDetails = (flowAllocationId,projectId) => CallSheetTranClient.get(`CallsheetTran/GetAutoSaveDetails?${flowAllocationId}&projectId=${projectId}`);
 export const AutoSaveCallsheet = (projectId,userId,flowAllocationId,autoSaveData) => CallSheetTranClient.post(`CallsheetTran/AutoSaveCallsheet?projectId=${projectId}&userId=${userId}&flowAllocationId=${flowAllocationId}`,autoSaveData);
 export const SaveCallsheet = (callsheetclaimsdata,projectId) => CallSheetTranClient.post(`CallsheetTran/SaveCallsheet?projectId=${projectId}`, callsheetclaimsdata);
 export const HoldCallsheet = (callsheetclaimsdata,projectId) => CallSheetTranClient.post(`CallsheetTran/HoldCallsheet?projectId=${projectId}`, callsheetclaimsdata);
 export const GetHistoryDetails = (flowAllocationId,projectId) => CallSheetTranClient.post(`CallsheetTran/GetHistoryNotes/${projectId}`,flowAllocationId);
 export const GetAccountSummarryDetails = (flowTaskId,projectId) => CallSheetTranClient.post(`CallsheetTran/GetAccountSummary?projectId=${projectId}`,flowTaskId);
 export const CallerIdDataSave = (calleriddata,projectId) => CallSheetTranClient.post(`CallsheetTran/CallerIdDataSave?projectId=${projectId}`, calleriddata);
 //export const SubmitClaimsforQabot = (projectId,userId,flowAllocationId,callsheetclaimsdata,claimdetails) => CallSheetTranClient.post(`Qabot/QabotApiCall?projectId=${projectId}&userId=${userId}&flowAllocationId=${flowAllocationId}`, claimdetails,callsheetclaimsdata);
export const SubmitClaimsforQabot = (projectId, userId, flowTaskId, callsheetclaimsdata, claimdetails) => {
  const requestBody = [{
    "claimdetails": claimdetails,
    "flowTaskId": flowTaskId,
    "callsheetdetails": callsheetclaimsdata
  }];

  return CallSheetTranClient.post(`Qabot/QabotApiCall?projectId=${projectId}&userId=${userId}`, requestBody);
};

 export default {CallSheetTranClient};
