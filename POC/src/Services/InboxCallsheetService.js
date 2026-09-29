import axios from 'axios';
import { MASTER_URL,INBOXAPI_URL } from './baseUrls';
import { getAuthToken } from './TokenInterceptor';

const InboxCallSheetClient = axios.create({
  baseURL: MASTER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const inboxClient = axios.create({
  baseURL: INBOXAPI_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
InboxCallSheetClient.interceptors.request.use(
  (config) => {
    const token =getAuthToken(); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

InboxCallSheetClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error) {
      console.error('Unauthorized! Handle logout or refresh token.');
    }
    return Promise.reject(error);
  }
);
inboxClient.interceptors.request.use(
  (config) => {
    const token =getAuthToken(); 
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

// Get Call sheet page controls master data
export const GetCallType = (callTypeGUID,projectId) => InboxCallSheetClient.get(`MasterTypes/GetMasterTypeDataField/${callTypeGUID}/${projectId}`);
export const GetIssueCodeMaster = (relationshipTypeKey,projectid,parentResponseId) => InboxCallSheetClient.get(`MasterTypes/GetRelaionShipItems?relationshipTypeKey=${relationshipTypeKey}&projectid=${projectid}&parentResponseId=${parentResponseId}`);
export const GetActionCodeMaster = (relationshipTypeKey,projectid,parentResponseId) => InboxCallSheetClient.get(`MasterTypes/GetRelaionShipItems?relationshipTypeKey=${relationshipTypeKey}&projectid=${projectid}&parentResponseId=${parentResponseId}`);
export const GetMoveToActionMaster = (moveToactionGUID,projectId) => InboxCallSheetClient.get(`MasterTypes/GetMasterTypeDataField/${moveToactionGUID}/1`);
export const GetResolvedBy = (resolvedByGUID,projectId) => InboxCallSheetClient.get(`MasterTypes/GetMasterTypeDataField/${resolvedByGUID}/${projectId}`);
export const GetTicketStatusMaster = (ticketStatusGUID,projectId) => InboxCallSheetClient.get(`MasterTypes/GetMasterTypeDataField/${ticketStatusGUID}/1`);
export const GetIssueLogClassification = (issuelogclassificationGUID,projectId) => InboxCallSheetClient.get(`MasterTypes/GetMasterTypeDataField/${issuelogclassificationGUID}/${projectId}`);
//dataModelId ,projectId ,IAMComponentId,dataModelTableId
export const GetTableColumnsbyTableId = (dataModelId,projectId,iAMModuleId ) => InboxCallSheetClient.get(`DataModel/GetDataTableModelById/${iAMModuleId }/${projectId}/${dataModelId}`);
export const GetCannedNotesConverted = (cannedNotesId,flowEncounterId,projectId) => inboxClient.post(`Inbox/GetCannedNotesData?cannedNotesId=${cannedNotesId}&flowEncounterId=${flowEncounterId}&projectId=${projectId}`);
export const GetBindVariableConverted = (bindvariable,flowEncounterId,projectId) => inboxClient.post(`Inbox/GetBindVariableData?bindVariable=${bindvariable}&flowEncounterId=${flowEncounterId}&projectId=${projectId}`);
export const saveCallResponseFeedback = (projectId, callresponse) => inboxClient.post(`Callsheet/SaveCallResponseFeedback?projectId=${projectId}`, callresponse);
export const GetCallsheetControls = (projectId) => inboxClient.get(`Callsheet/GetCallsheetControls/${projectId}`);
export default {InboxCallSheetClient,inboxClient};
