import './App.css';
import { NotificationProvider } from './Context/NotificationContext';
import { LoaderProvider } from './Context/LoaderContext';
import { SelectedValuesProvider } from './Context/SelectedValuesContext';
import { GridProvider } from './Context/GridContext';
import { GlobalProvider, useGlobalContext } from './Context/GlobalContext';
import AppRoutes from './pages/inbox/Route.js';
import { BrowserRouter } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { setAuthToken } from "./Services/TokenInterceptor.js";
import { checkSession } from 'iamdatabinder';
// import config from 'devextreme/core/config';
// import { licenseKey } from './devextreme-license';

// config({ licenseKey });
import config from 'devextreme/core/config';
import { licenseKey } from './devextreme-license';
config({ licenseKey });



function App() {
  const [token, setToken] = useState(null);
  const { globalDataStore, setGlobalDataStore } = useGlobalContext();
  useEffect(() => {
    const checkAndSetToken = async () => {
      try {
        const response = await checkSession('177a6739-0f7c-44cb-aa31-6715bd5cabd6');
        if (response) {
          setToken(response);
          setAuthToken(response);
          setGlobalDataStore(prev => ({ ...prev, UserToken: response }));
        } else {
          //   navigate("/login");
          window.open(process.env.REACT_APP_ARCLOGIN_URL, '_self' );
        }
      } catch (error) {
        console.error("Session check failed", error);
        // navigate("/login");
      }
    };

    checkAndSetToken();

  }, [token]);
  // useEffect(() => {
  //   if (!globalDataStore.UserToken) {
  //     GetToken();
  //   }
  // }, [globalDataStore.UserToken]);

  // const GetToken = async () => {
  //   try {
  //     const response = await axios.post('https://iamapi.accesshealthcare.co/api/IAM/GenerateUserAccessToken', {
  //       "userId": "gayathri.muruge@accesshealthcare.com",
  //       "password": "Accesstemp@#$54321",
  //       "appKey": "177a6739-0f7c-44cb-aa31-6715bd5cabd6"
  //     });
  //     //const newToken = response.data.Data.Token;
  //     //setAuthToken(newToken);
  //     //setGlobalDataStore(prev => ({ ...prev, UserToken: newToken }));
  //   } catch (error) {
  //     console.error('Error fetching token:', error);
  //   }
  // };

  if (!globalDataStore.UserToken) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {/* <NotificationProvider>
        <LoaderProvider>
        <SelectedValuesProvider>
          <GridProvider>
          <GlobalProvider>
         <ARFlow />
          </GlobalProvider>
          </GridProvider>
          </SelectedValuesProvider>
        </LoaderProvider>
      </NotificationProvider> */}
      {/* <AuthProvider>   
                <AppRoutepage />
                </AuthProvider>   */}
      {/* <Landingpage /> */}
      <GridProvider>
        <SelectedValuesProvider>
          <LoaderProvider>
            <NotificationProvider>
              <GlobalProvider>
                <BrowserRouter>

                  <AppRoutes />
                </BrowserRouter>
              </GlobalProvider>
            </NotificationProvider>
          </LoaderProvider>
        </SelectedValuesProvider>
      </GridProvider>

    </div>
  );
}

export default App;
