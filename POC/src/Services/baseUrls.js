// export const INBOXAPI_URL = "https://arcflowinboxapi.accesshealthcare.co/api/";
//  //export const INBOXAPI_URL = "https://localhost:7150/api/"
// export const MASTER_URL = "https://arcflowsetupapi.accesshealthcare.co/api/";
// export const CALLSHEETTRANAPI_URL = "https://arcflowinboxtranapi.accesshealthcare.co/api/";
//  //export const CALLSHEETTRANAPI_URL = "https://localhost:7133/api/";
// export const ONBOARDINGAPI_URL = "https://arcflowcustomeronboardingapi.accesshealthcare.co/";
// export const PAYERINFO_URL = "https://payerfetchapi.accesshealthcare.co/";  
// export const REACT_APP_IAMSERVICE="https://iamapi.accesshealthcare.com/api";  

export const INBOXAPI_URL = process.env.REACT_APP_ArcFlow_Inbox_API_URL+"api/";
export const MASTER_URL = process.env.REACT_APP_ArcFlow_Setup_API_URL+"api/";
export const CALLSHEETTRANAPI_URL = process.env.REACT_APP_CALLSHEETTRANAPI_URL+"api/";
export const ONBOARDINGAPI_URL = process.env.REACT_APP_ArcFlow_Customer_Onboarding_API_URL;
export const PAYERINFO_URL = process.env.REACT_APP_PAYERINFO_URL;  
export const REACT_APP_IAMSERVICE=process.env.REACT_APP_ArcFlow_IAM_API_URL+"api"; 
export const REACT_APP_API_URL_Knol=process.env.REACT_APP_API_URL_Knol; 
export const KNOLCONTEXTAPI_URL=process.env.REACT_APP_KNOLCONTEXT_API; 
