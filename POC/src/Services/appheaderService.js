import axios from 'axios';
import { ONBOARDINGAPI_URL } from './baseUrls';
 
const AppHeaderClient = axios.create({
  baseURL: ONBOARDINGAPI_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
 export const GetProject = () => AppHeaderClient.get(`CustomerProjects/GetProjects?OrgId=1&CustomerId=0`);
 export default AppHeaderClient;