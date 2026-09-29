import axios from 'axios';
import { INBOXAPI_URL } from './baseUrls';
 
const auditinboxClient = axios.create({
  baseURL: INBOXAPI_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});


//export const getAuditInboxClaims = (projectId,userId,workspaceId,inboxIAMModuleId) => auditinboxClient.post(`Inbox/GetAuditInboxClaims/${projectId}/${userId}/${workspaceId}/${inboxIAMModuleId}`);
export const getAuditInboxClaims = (projectId, userId, workspaceId, inboxIAMModuleId) => {
  const requestData =  [0];

  return auditinboxClient.post(`Inbox/GetAuditInboxClaims/${projectId}/${userId}/${workspaceId}/${inboxIAMModuleId}`, requestData);
};
export default {auditinboxClient};